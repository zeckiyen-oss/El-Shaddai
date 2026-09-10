import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore("elshaddai-content");
    const [formations, medias, siteSettings] = await Promise.all([
      store.get("formations", { type: "json" }),
      store.get("medias", { type: "json" }),
      store.get("siteSettings", { type: "json" })
    ]);

    return new Response(JSON.stringify({ formations, medias, siteSettings }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: "/api/get-data" };
