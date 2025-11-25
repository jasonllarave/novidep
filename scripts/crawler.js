// scripts/crawler.js
import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { KnowledgeBase } from "../models/KnowledgeBase.js";

import path from "path";
import { fileURLToPath } from "url";

// Fix ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const SITE = "https://www.colombianoviolenta.org";

const KEYWORDS = [
  "tienda", "donaciones", "donación", "cartilla",
  "servicios", "taller", "talleres", "evento",
  "eventos", "curso", "recursos", "concierto", "contacto",
  "donor", "donorbox"
];

/**
 * Normaliza los enlaces encontrados en el sitio
 */
function normalizeHref(href) {
  if (!href) return null;
  if (href.startsWith("#") || href.startsWith("javascript:")) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;

  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${SITE}${href}`;

  return `${SITE}/${href}`;
}

/**
 * Extrae links principales desde la página principal
 */
async function crawlHome() {
  try {
    const res = await axios.get(SITE, { timeout: 15000 });
    const $ = cheerio.load(res.data);

    const found = {};

    $("a").each((_, el) => {
      const rawHref = $(el).attr("href");
      const href = rawHref ? rawHref.toLowerCase() : "";
      const text = ($(el).text() || "").trim().toLowerCase();

      for (const kw of KEYWORDS) {
        if (text.includes(kw) || href.includes(kw)) {
          const normalized = normalizeHref(rawHref);
          if (normalized) {
            const title = text || normalized;
            found[title] = normalized;
          }
        }
      }
    });

    const links = Object.keys(found).map(key => ({
      title: key,
      url: found[key]
    }));

    return links;

  } catch (err) {
    console.error("Crawler: error descargando sitio:", err.message);
    return [];
  }
}

/**
 * Actualiza KnowledgeBase.category = "links"
 */
async function updateKnowledgeBase(links) {
  try {
    if (!Array.isArray(links) || links.length === 0) {
      console.log("No se encontraron links relevantes.");
      return;
    }

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

    const result = await KnowledgeBase.findOneAndUpdate(query, update, {
      upsert: true,
      new: true
    });

    console.log("KnowledgeBase actualizado:", result._id);

  } catch (e) {
    console.error("Error actualizando KnowledgeBase:", e.message);
  }
}

/**
 * Proceso principal
 */
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");

    const links = await crawlHome();
    console.log("Links encontrados:", links.length);

    if (links.length > 0) {
      await updateKnowledgeBase(links);
    } else {
      console.log("Sin links detectados.");
    }

    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");

  } catch (err) {
    console.error("Error en crawler:", err);
  }

  process.exit(0);
}

main();
