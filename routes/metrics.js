// routes/metrics.js
// Endpoints para métricas básicas (usa ChatLog)

import express from "express";
import { Chatlog } from "../models/Chatlog.js";


const router = express.Router();

// Resumen: total conversaciones, mensajes por día, top topics
router.get("/", async (req, res) => {
  // total de mensajes
  const totalMessages = await ChatLog.countDocuments();

  // total de conversaciones aproximado (por userId y rango temporal simple)
  const totalConversations = await ChatLog.distinct("userId").then(arr => arr.length);

  // mensajes por día (últimos 30 días)
  const byDay = await ChatLog.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24*60*60*1000) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // top topics
  const topTopics = await ChatLog.aggregate([
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
});

export default router;
