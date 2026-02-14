import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Generate unique ID
function generateId(): string {
    return "TND" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// Sample tender data for trial
const sampleTenders = [
    {
        title: "Construction of Primary Health Center Building",
        department: "Health",
        value: "Rs. 45,00,000",
        closingDate: "2026-03-15",
        description: "Construction of a new Primary Health Center (PHC) building with 10 beds capacity, OPD facility, pharmacy, and staff quarters. The work includes civil construction, electrical work, plumbing, and interior finishing. Contractor must have experience in healthcare facility construction."
    },
    {
        title: "Supply of Desktop Computers and Laptops",
        department: "IT",
        value: "Rs. 12,50,000",
        closingDate: "2026-02-28",
        description: "Supply and installation of 50 desktop computers and 25 laptops for government offices. Specifications: Intel Core i5 or equivalent, 16GB RAM, 512GB SSD, 21.5-inch monitors for desktops. 3-year warranty and on-site support required."
    },
    {
        title: "Road Repair and Maintenance Work - NH45",
        department: "PWD",
        value: "Rs. 1,25,00,000",
        closingDate: "2026-04-10",
        description: "Repair and maintenance of 25 km stretch of National Highway 45. Work includes pothole filling, resurfacing with bituminous concrete, road marking, and installation of reflective signage. Contractor must have Class A PWD registration."
    },
    {
        title: "Annual Maintenance Contract for CCTV Systems",
        department: "Security",
        value: "Rs. 8,75,000",
        closingDate: "2026-02-20",
        description: "Annual maintenance contract for 200+ CCTV cameras installed across government buildings. Includes quarterly preventive maintenance, repair/replacement of faulty equipment, 24x7 helpdesk support, and monthly health reports."
    },
    {
        title: "Supply of Laboratory Equipment for Science College",
        department: "Education",
        value: "Rs. 35,00,000",
        closingDate: "2026-03-30",
        description: "Supply and installation of laboratory equipment for Physics, Chemistry, and Biology departments. Includes microscopes, spectrophotometers, analytical balances, fume hoods, and other standard lab equipment. Installation and training required."
    },
    {
        title: "Catering Services for Government Training Institute",
        department: "Administration",
        value: "Rs. 18,00,000",
        closingDate: "2026-02-25",
        description: "Catering services for Government Training Institute for 12 months. Average 150-200 trainees per day. Includes breakfast, lunch, evening tea, and dinner. Caterer must have FSSAI license and experience in institutional catering."
    },
    {
        title: "Solar Panel Installation for Government Buildings",
        department: "Energy",
        value: "Rs. 75,00,000",
        closingDate: "2026-04-20",
        description: "Design, supply, installation, and commissioning of rooftop solar power plants totaling 500 kW capacity across 10 government buildings. Includes net metering arrangement, 5-year comprehensive warranty, and 25-year performance guarantee."
    },
    {
        title: "Development of E-Governance Mobile Application",
        department: "IT",
        value: "Rs. 28,00,000",
        closingDate: "2026-03-05",
        description: "Development of a citizen services mobile application for Android and iOS platforms. Features include service requests, complaint registration, document upload, payment gateway integration, push notifications, and multi-language support (English, Hindi, Regional)."
    }
];

export default async (req: Request, context: Context) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed. Use POST to seed data." }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const store = getStore("tenders");
        const seededTenders = [];

        for (const tenderData of sampleTenders) {
            const id = generateId();
            const tender = {
                id,
                ...tenderData,
                createdAt: new Date().toISOString()
            };

            await store.setJSON(`tender:${id}`, tender);
            seededTenders.push(tender);

            // Small delay to ensure unique IDs
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully seeded ${seededTenders.length} sample tenders`,
            tenders: seededTenders
        }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to seed tenders" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config: Config = {
    path: "/api/seed-tenders"
};
