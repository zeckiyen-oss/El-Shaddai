import { getStore } from "@netlify/blobs";

const ALLOWED_KEYS = ["formations", "medias", "siteSettings"];

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const body = await req.json();
    const { key, data } = body;

    if (!ALLOWED_KEYS.includes(key)) {
      return new Response(JSON.stringify({ error: "Invalid key" }), { status: 400 });
    }

    const store = getStore("elshaddai-content");
    await store.setJSON(key, data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: "/api/save-data" };
