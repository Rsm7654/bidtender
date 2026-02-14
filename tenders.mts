import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Generate unique ID
function generateId(): string {
    return "TND" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// Verify admin token
async function verifyAdminToken(token: string | null): Promise<boolean> {
    if (!token) return false;

    const sessionStore = getStore("sessions");
    const session = await sessionStore.get(`admin:${token}`, { type: "json" });
    return session && session.type === "admin";
}

export default async (req: Request, context: Context) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const tenderId = pathParts.length > 2 ? pathParts[2] : null;

    // GET - List all tenders
    if (req.method === "GET") {
        try {
            const store = getStore("tenders");
            const { blobs } = await store.list();

            const tenders = [];
            for (const blob of blobs) {
                const tender = await store.get(blob.key, { type: "json" });
                if (tender) {
                    tenders.push(tender);
                }
            }

            // Sort by creation date (newest first)
            tenders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return new Response(JSON.stringify({ tenders }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({ tenders: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // POST - Create new tender (admin only)
    if (req.method === "POST") {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        const isAdmin = await verifyAdminToken(token);
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            const body = await req.json();
            const { title, department, value, closingDate, description } = body;

            if (!title || !description || !closingDate) {
                return new Response(JSON.stringify({ error: "Title, description, and closing date are required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const id = generateId();
            const tender = {
                id,
                title,
                department: department || "",
                value: value || "",
                closingDate,
                description,
                createdAt: new Date().toISOString()
            };

            const store = getStore("tenders");
            await store.setJSON(`tender:${id}`, tender);

            return new Response(JSON.stringify({ success: true, tender }), {
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to create tender" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // DELETE - Delete tender (admin only)
    if (req.method === "DELETE" && tenderId) {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        const isAdmin = await verifyAdminToken(token);
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            const store = getStore("tenders");
            await store.delete(`tender:${tenderId}`);

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to delete tender" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
    });
};

export const config: Config = {
    path: ["/api/tenders", "/api/tenders/*"]
};
