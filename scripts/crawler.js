// scripts/crawler.js
import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { KnowledgeBase } from "../models/KnowledgeBase.js"; 

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });


const SITE = "https://www.colombianoviolenta.org"; // usa la versión correcta
const KEYWORDS = [
  "tienda", "donaciones", "donación", "cartilla", "servicios",
  "taller", "talleres", "evento", "eventos", "curso", "recursos","concierto","concierto",
  "contacto", "donor", "donorbox"
];

function normalizeHref(href) {
  if (!href) return null;
  if (href.startsWith("http") || href.startsWith("https")) return href;
  // Manejar rutas relativas, saltando anchors y javascript:
  if (href.startsWith("#") || href.startsWith("javascript:")) return null;
  if (href.startsWith("/")) return `${SITE}${href}`;
  return `${SITE}/${href}`;
}

async function crawlHome() {
  try {
    const res = await axios.get(SITE, { timeout: 15000 });
    const $ = cheerio.load(res.data);
    const found = {};

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      const text = ($(el).text() || "").trim().toLowerCase();
      const hrefLower = (href || "").toLowerCase();

      // Buscar coincidencia por texto o por href
      for (const kw of KEYWORDS) {
        if ((text && text.includes(kw)) || (hrefLower && hrefLower.includes(kw))) {
          const url = normalizeHref(href);
          if (url) {
            // preferir texto si es descriptivo
            const title = text || url;
            found[title] = url;
          }
        }
      }
    });

    // También intentar visitar links encontrados y extraer más (opcional)
    // (Descomenta el bloque siguiente si quieres seguir enlaces y buscar más)
    /*
    const extra = {};
    for (const url of Object.values(found)) {
      try {
        const r = await axios.get(url, { timeout: 10000 });
        const $$ = cheerio.load(r.data);
        $$("a").each((_, el) => {
          const h = $$(el).attr("href");
          const t = ($$(el).text() || "").trim().toLowerCase();
          for (const kw of KEYWORDS) {
            if ((t && t.includes(kw)) || (h && h.toLowerCase().includes(kw))) {
              const nu = normalizeHref(h);
              if (nu) extra[t || nu] = nu;
            }
          }
        });
      } catch (e) {
        // no detener por errores parciales
      }
    }
    Object.assign(found, extra);
    */

    // Convertir a array único
    const links = Object.keys(found).map(k => ({ title: k, url: found[k] }));

    return links;
  } catch (err) {
    console.error("Crawler: error descargando sitio:", err.message || err);
    return [];
  }
}

async function updateKnowledgeBase(links) {
  if (!Array.isArray(links) || links.length === 0) {
    console.log("No se encontraron links relevantes.");
    return;
  }

  // Forma del documento que queremos guardar:
  // category: 'links'
  // answer: { text: 'Links extraídos...', links: [{title,url}, ...] }
  const query = { category: "links" };
  const update = {
    $set: {
      question: "Enlaces extraídos automáticamente",
      "answer.text": "Enlaces principales del sitio (actualizado por crawler)",
      "answer.links": links,
      isActive: true,
      priority: 100
    }
  };

  const opts = { upsert: true, new: true };
  const result = await KnowledgeBase.findOneAndUpdate(query, update, opts);
  console.log("KnowledgeBase actualizado. _id:", result._id, "links:", links.length);
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      // usar opciones por defecto de mongoose actual
    });
    console.log(" Conectado a MongoDB");

    const links = await crawlHome();
    console.log("Links encontrados:", links.length);
    if (links.length > 0) {
      await updateKnowledgeBase(links);
    } else {
      console.log("No se actualizó KnowledgeBase (sin links detectados).");
    }

    await mongoose.disconnect();
    console.log("Desconectado de MongoDB - terminado");
    process.exit(0);
  } catch (err) {
    console.error("Error en crawler main:", err);
    process.exit(1);
  }
}

main();
