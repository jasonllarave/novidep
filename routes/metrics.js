// routes/metrics.js
// Endpoints para métricas básicas (usa Chatlog)

import express from "express";
import { Chatlog } from "../models/Chatlog.js"; // Asegúrate que el modelo se llame exactamente así y la mayúscula coincida

const router = express.Router();

// Resumen: total conversaciones, mensajes por día, top topics
router.get("/", async (req, res) => {
  try {
    // Total de mensajes
    const totalMessages = await Chatlog.countDocuments();

    // Total de conversaciones aproximado (por userId y rango temporal simple)
    const totalConversations = await Chatlog.distinct("userId").then(arr => arr.length);

    // Mensajes por día (últimos 30 días)
    const byDay = await Chatlog.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top topics
    const topTopics = await Chatlog.aggregate([
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalMessages,
      totalConversations,
      byDay,
      topTopics
    });

  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ error: "Error obteniendo métricas", details: err.message });
  }
});

export default router;
