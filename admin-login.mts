import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Simple hash function for password (for demo purposes)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Generate simple token
function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Default admin credentials (in production, use environment variables)
const DEFAULT_ADMIN = {
    username: "admin",
    password: "admin123"
};

export default async (req: Request, context: Context) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: "Username and password are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check against environment variables first, then default
        const adminUsername = Netlify.env.get("ADMIN_USERNAME") || DEFAULT_ADMIN.username;
        const adminPassword = Netlify.env.get("ADMIN_PASSWORD") || DEFAULT_ADMIN.password;

        if (username !== adminUsername || password !== adminPassword) {
            return new Response(JSON.stringify({ error: "Invalid admin credentials" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const token = generateToken();

        // Store admin session
        const sessionStore = getStore("sessions");
        await sessionStore.setJSON(`admin:${token}`, {
            username,
            type: "admin",
            createdAt: new Date().toISOString()
        });

        return new Response(JSON.stringify({
            success: true,
            token,
            username
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config: Config = {
    path: "/api/admin/login"
};
