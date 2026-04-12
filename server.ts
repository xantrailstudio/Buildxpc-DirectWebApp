import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { LRUCache } from "lru-cache";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs 
} from "firebase/firestore";

// Initialize Firebase Client SDK
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for product metadata and sitemaps (24 hours to reduce Firestore reads)
const cache = new LRUCache<string, any>({
  max: 2000,
  ttl: 1000 * 60 * 60 * 24,
});

// Circuit breaker for Firestore quota
let isFirestoreOverQuota = false;
let quotaResetTimeout: NodeJS.Timeout | null = null;

function handleFirestoreQuotaError(error: any) {
  if (error.message?.includes("RESOURCE_EXHAUSTED") || error.code === "resource-exhausted") {
    console.error("CRITICAL: Firestore Quota Exceeded. Suspending Firestore calls for 5 minutes.");
    isFirestoreOverQuota = true;
    if (quotaResetTimeout) clearTimeout(quotaResetTimeout);
    quotaResetTimeout = setTimeout(() => {
      isFirestoreOverQuota = false;
      console.log("Attempting to resume Firestore calls...");
    }, 1000 * 60 * 5); // 5 minute suspension
  }
}

async function startServer() {
  const serverApp = express();
  const PORT = 3000;

  // API routes
  serverApp.get("/api/health", (req, res) => {
    res.json({ status: "ok", firestoreStatus: isFirestoreOverQuota ? "over_quota" : "ok" });
  });

  // Sitemap Index
  serverApp.get("/sitemap.xml", (req, res) => {
    const sitemaps = ["cpu", "gpu", "ram", "other"];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(cat => `
  <sitemap>
    <loc>https://${req.get('host')}/sitemap-${cat}.xml</loc>
  </sitemap>`).join('')}
</sitemapindex>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // Category Sitemaps
  serverApp.get("/sitemap-:category.xml", async (req, res) => {
    const { category } = req.params;
    const cacheKey = `sitemap-${category}`;
    let xml = cache.get(cacheKey) as string;

    if (!xml) {
      if (isFirestoreOverQuota) {
        return res.status(503).send("Service temporarily unavailable due to high load. Please try again later.");
      }

      try {
        const productsRef = collection(db, "products");
        let q;
        if (category !== "other") {
          q = query(productsRef, where("category", "==", category.toUpperCase()), limit(5000));
        } else {
          q = query(productsRef, limit(5000));
        }
        
        const snapshot = await getDocs(q);
        const urls = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as any;
          return `
    <url>
      <loc>https://${req.get('host')}/product/${data.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
        }).join('');

        xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
        cache.set(cacheKey, xml);
      } catch (error: any) {
        handleFirestoreQuotaError(error);
        console.error(`Error generating sitemap for ${category}:`, error.message);
        return res.status(500).send("Error generating sitemap");
      }
    }

    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    serverApp.use(vite.middlewares);
  } else {
    serverApp.use(express.static(path.join(process.cwd(), "dist"), { index: false }));
  }

  // Dynamic Metadata and HTML Serving
  serverApp.get("*", async (req, res) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(
        path.resolve(process.cwd(), process.env.NODE_ENV === "production" ? "dist/index.html" : "index.html"),
        "utf-8"
      );

      if (process.env.NODE_ENV !== "production") {
        template = await vite.transformIndexHtml(url, template);
      }

      // Dynamic Metadata for Product Pages
      if (url.startsWith("/product/")) {
        const slug = url.split("/").pop();
        const cacheKey = `meta-${slug}`;
        let meta = cache.get(cacheKey) as any;

        if (!meta && slug && !isFirestoreOverQuota) {
          try {
            const docRef = doc(db, "products", slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              meta = {
                title: `${data?.name} - ${data?.category} Specs | BuildXpc`,
                description: `Technical specifications for ${data?.name}. ${data?.chipset || ''} ${data?.vram || ''} TDP: ${data?.tdp || ''}`,
                ogImage: `https://picsum.photos/seed/${slug}/1200/630`,
              };
              cache.set(cacheKey, meta);
            }
          } catch (error: any) {
            handleFirestoreQuotaError(error);
          }
        }

        if (meta) {
          // Replace Title
          template = template.replace(/<title>.*<\/title>/, `<title>${meta.title}</title>`);
          
          // Replace Description
          template = template.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${meta.description}" />`);
          
          // Replace OG Tags
          template = template.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${meta.title}" />`);
          template = template.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${meta.description}" />`);
          template = template.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${meta.ogImage}" />`);
          template = template.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="https://${req.get('host')}/product/${slug}" />`);

          // Replace Twitter Tags
          template = template.replace(/<meta property="twitter:title" content=".*?" \/>/, `<meta property="twitter:title" content="${meta.title}" />`);
          template = template.replace(/<meta property="twitter:description" content=".*?" \/>/, `<meta property="twitter:description" content="${meta.description}" />`);
          template = template.replace(/<meta property="twitter:image" content=".*?" \/>/, `<meta property="twitter:image" content="${meta.ogImage}" />`);
          template = template.replace(/<meta property="twitter:url" content=".*?" \/>/, `<meta property="twitter:url" content="https://${req.get('host')}/product/${slug}" />`);

          // Replace Canonical
          template = template.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="https://${req.get('host')}/product/${slug}" />`);
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      if (process.env.NODE_ENV !== "production") {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  serverApp.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
