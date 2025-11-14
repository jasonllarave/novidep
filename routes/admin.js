import express from "express";
import mongoose from "mongoose";
import { KnowledgeBase } from "../models/KnowledgeBase.js";
import { spawn } from "child_process";

const router = express.Router();

// ======== CONFIG LOGIN BÁSICO ========
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234"; // cámbialo por algo más seguro

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ======== CRUD DE LINKS ========

// Obtener todos los enlaces guardados
router.get("/links", async (req, res) => {
  try {
    const doc = await KnowledgeBase.findOne({ category: "links" });
    res.json(doc?.answer?.links || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar un enlace nuevo
router.post("/links", async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) return res.status(400).json({ error: "Faltan datos" });

  try {
    const doc = await KnowledgeBase.findOneAndUpdate(
      { category: "links" },
      { $push: { "answer.links": { title, url } } },
      { new: true, upsert: true }
    );
    res.json(doc.answer.links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar enlace por título
router.delete("/links/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const doc = await KnowledgeBase.findOneAndUpdate(
      { category: "links" },
      { $pull: { "answer.links": { title } } },
      { new: true }
    );
    res.json(doc.answer.links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======== EJECUTAR CRAWLER ========
router.post("/crawl", (req, res) => {
  try {
    const crawler = spawn("node", ["./scripts/crawler.js"], { stdio: "inherit" });
    crawler.on("close", (code) => {
      console.log(`Crawler finalizado con código ${code}`);
    });
    res.json({ success: true, message: "Crawler iniciado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======== MÉTRICAS ========
router.get("/stats", async (req, res) => {
  try {
    const messages = mongoose.connection.collection("messages"); // si guardas tus chats aquí
    const total = await messages.countDocuments();

    // Agrupa por tema (si tienes campo "topic" o "intent" en tus mensajes)
    const topTemas = await messages
      .aggregate([
        { $group: { _id: "$topic", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
      .toArray();

    res.json({ total, topTemas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
