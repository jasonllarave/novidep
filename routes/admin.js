import express from "express";
import mongoose from "mongoose";
import { KnowledgeBase } from "../models/KnowledgeBase.js";
import { Registration } from "../models/Registration.js";
import { ConversationSession } from "../models/ConversationSession.js";
import { spawn } from "child_process";

const router = express.Router();

// =======================
//  LOGIN ADMIN BÁSICO
// =======================
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// =======================
// CRUD DE LINKS
// =======================

router.get("/links", async (req, res) => {
  try {
    const doc = await KnowledgeBase.findOne({ category: "links" });
    res.json(doc?.answer?.links || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// =======================
//  EJECUTAR CRAWLER
// =======================

router.post("/crawl", (req, res) => {
  try {
    const crawler = spawn("node", ["./scripts/crawler.js"], { stdio: "inherit" });
    crawler.on("close", code => {
      console.log(`Crawler finalizado con código ${code}`);
    });
    res.json({ success: true, message: "Crawler iniciado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   MÉTRICAS DEL SISTEMA
// =======================

router.get("/stats", async (req, res) => {
  try {
    const totalConversaciones = await ConversationSession.countDocuments();
    const totalRegistros = await Registration.countDocuments();

    res.json({
      totalConversaciones,
      totalRegistros
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   RESUMEN DEL ADMIN
// =======================

router.get("/summary", async (req, res) => {
  try {
    const totalRegistros = await Registration.countDocuments();
    const autorizados = await Registration.countDocuments({ authorized: true });

    res.json({
      totalRegistros,
      autorizados
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   LISTAR REGISTROS
// =======================

router.get("/registros", async (req, res) => {
  try {
    const list = await Registration.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
