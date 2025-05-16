// generate-sitemap.js
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");

const baseUrl = "https://task-chronos.vercel.app/"; // 🔁 Remplace par ton vrai domaine

// Routes publiques de ton app (pas celles protégées par session)
const routes = [
  "/", // racine
  "/auth",
  "/email-confirmation",
  "/PrivacyPolicy",
  "/PremiumPage",
  "/payment-status",
  "/faq",
  "/LegalNotice",
  "/InformationHubPage",
  "/profile", // attention : à protéger si tu veux exclure les pages "privées"
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: baseUrl });
  const writeStream = createWriteStream("./dist/sitemap.xml"); // sortie dans dist/

  sitemap.pipe(writeStream);

  for (const route of routes) {
    sitemap.write({ url: route, changefreq: "weekly", priority: 0.8 });
  }

  sitemap.end();

  await streamToPromise(sitemap);
  console.log("✅ Sitemap généré dans dist/sitemap.xml");
}

generateSitemap().catch((err) => {
  console.error("❌ Erreur lors de la génération du sitemap :", err);
});
