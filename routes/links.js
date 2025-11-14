// routes/links.js
// CRUD mínimo para enlaces + endpoint para ejecutar crawler (si lo tienes)

import express from "express";
import { Link } from "../models/Link.js";
import { exec } from "child_process";
import path from "path";

const router = express.Router();

// Listar todos los enlaces
router.get("/", async (req, res) => {
  const links = await Link.find().sort({ createdAt: -1 });
  res.json(links);
});

// Crear un enlace nuevo (manual)
router.post("/", async (req, res) => {
  const { title, url } = req.body || {};
  if (!title || !url) return res.status(400).json({ success: false, message: "Falta title o url" });

  const l = new Link({ title, url });
  await l.save();
  res.json({ success: true, link: l });
});

// Eliminar enlace por id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Link.findByIdAndDelete(id);
  res.json({ success: true });
});

// Ejecutar crawler (si existe scripts/crawler.js). Devuelve stdout o error.
router.post("/crawl", (req, res) => {
  const script = path.resolve("./scripts/crawler.js");
  exec(`node ${script}`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ success: false, error: stderr || err.message });
    // Si tu crawler escribe directamente en KnowledgeBase, aquí solo devolvemos salida.
    return res.json({ success: true, output: stdout });
  });
});

export default router;
