// routes/admin.js - MEJORADO CON TODAS LAS FUNCIONALIDADES

import express from "express";
import { KnowledgeBase } from "../models/KnowledgeBase.js";
import { Registration } from "../models/Registration.js";
import { ConversationSession } from "../models/ConversationSession.js";
import { spawn } from "child_process";
import { Parser as Json2csvParser } from "json2csv";
import ExcelJS from "exceljs";

const router = express.Router();

// =======================
//  LOGIN ADMIN BÁSICO
// =======================
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

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
    res.json(doc?.answer?.links || []);
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
//   MÉTRICAS COMPLETAS DEL SISTEMA
// =======================

router.get("/stats", async (req, res) => {
  try {
    // Total de conversaciones
    const totalConversaciones = await ConversationSession.countDocuments();
    
    // Total de registros
    const totalRegistros = await Registration.countDocuments();
    
    // Registros autorizados
    const registrosAutorizados = await Registration.countDocuments({ authorized: true });
    
    // Conversaciones activas
    const conversacionesActivas = await ConversationSession.countDocuments({ status: "active" });
    
    // Promedio de mensajes por conversación
    const avgMessages = await ConversationSession.aggregate([
      {
        $project: {
          messageCount: { $size: "$messages" }
        }
      },
      {
        $group: {
          _id: null,
          avgCount: { $avg: "$messageCount" }
        }
      }
    ]);

    // Conversaciones por día (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const conversacionesPorDia = await ConversationSession.aggregate([
      {
        $match: {
          startTime: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Registros por día (últimos 7 días)
    const registrosPorDia = await Registration.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Distribución de estados de conversaciones
    const statusDistribution = await ConversationSession.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Top 10 conversaciones más largas (por cantidad de mensajes)
    const topConversations = await ConversationSession.aggregate([
      {
        $project: {
          sessionId: 1,
          userId: 1,
          messageCount: { $size: "$messages" },
          startTime: 1,
          status: 1
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalConversaciones,
      totalRegistros,
      registrosAutorizados,
      conversacionesActivas,
      promedioMensajes: avgMessages[0]?.avgCount || 0,
      conversacionesPorDia,
      registrosPorDia,
      statusDistribution,
      topConversations
    });
  } catch (err) {
    console.error("Error en stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   HISTORIAL DE CONVERSACIONES
// =======================

router.get("/history", async (req, res) => {
  try {
    const { limit = 50, skip = 0, sessionId } = req.query;

    const query = sessionId ? { sessionId } : {};

    const conversations = await ConversationSession.find(query)
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Formatear para el frontend
    const formatted = conversations.map(conv => ({
      sessionId: conv.sessionId,
      userId: conv.userId,
      startTime: conv.startTime,
      lastActivity: conv.lastActivity,
      messageCount: conv.messages.length,
      status: conv.status,
      messages: conv.messages.map(msg => ({
        role: msg.role,
        content: msg.content.substring(0, 100), // Limitar longitud
        timestamp: msg.timestamp
      }))
    }));

    const total = await ConversationSession.countDocuments(query);

    res.json({
      conversations: formatted,
      total,
      page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error("Error en history:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   DETALLE DE CONVERSACIÓN
// =======================

router.get("/conversation/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversation = await ConversationSession.findOne({ sessionId }).lean();
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    // Obtener también el registro si existe
    const registration = await Registration.findOne({ sessionId }).lean();

    res.json({
      conversation,
      registration
    });
  } catch (err) {
    console.error("Error obteniendo conversación:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   LISTAR REGISTROS
// =======================

router.get("/registros", async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const list = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Registration.countDocuments();

    res.json({
      registros: list,
      total,
      page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error("Error en registros:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
//   EXPORTAR REGISTROS CSV
// =======================

router.get("/registros/export/csv", async (req, res) => {
  try {
    const registros = await Registration.find().lean();

    if (!registros || registros.length === 0) {
      return res.status(404).json({ error: "No hay registros para exportar" });
    }

    const data = registros.map(r => ({
      Nombre: r.name || "N/A",
      Teléfono: r.phone || "N/A",
      Autorizado: r.authorized ? "Sí" : "No",
      Paso: r.step || "N/A",
      FechaCreación: r.createdAt ? new Date(r.createdAt).toLocaleString("es-CO") : "N/A",
      SessionID: r.sessionId || "N/A"
    }));

    const fields = ["Nombre", "Teléfono", "Autorizado", "Paso", "FechaCreación", "SessionID"];
    const json2csv = new Json2csvParser({ fields });
    const csv = json2csv.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`registros_${Date.now()}.csv`);
    return res.send("\uFEFF" + csv); // BOM para UTF-8
  } catch (err) {
    console.error("Error generando CSV:", err);
    res.status(500).json({ error: "Error generando CSV" });
  }
});

// =======================
//   EXPORTAR REGISTROS EXCEL
// =======================

router.get("/registros/export/excel", async (req, res) => {
  try {
    const registros = await Registration.find().lean();

    if (!registros || registros.length === 0) {
      return res.status(404).json({ error: "No hay registros para exportar" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registros");

    // Estilos para encabezados
    worksheet.columns = [
      { header: "Nombre", key: "name", width: 25 },
      { header: "Teléfono", key: "phone", width: 15 },
      { header: "Autorizado", key: "authorized", width: 12 },
      { header: "Paso Actual", key: "step", width: 20 },
      { header: "Fecha Registro", key: "createdAt", width: 20 },
      { header: "Session ID", key: "sessionId", width: 30 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" }
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // Agregar datos
    registros.forEach(item => {
      worksheet.addRow({
        name: item.name || "N/A",
        phone: item.phone || "N/A",
        authorized: item.authorized ? "Sí" : "No",
        step: item.step || "N/A",
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString("es-CO") : "N/A",
        sessionId: item.sessionId || "N/A"
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registros_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando Excel:", err);
    res.status(500).json({ error: "Error generando Excel" });
  }
});

// =======================
//   RESUMEN DEL DASHBOARD
// =======================

router.get("/dashboard", async (req, res) => {
  try {
    const totalRegistros = await Registration.countDocuments();
    const autorizados = await Registration.countDocuments({ authorized: true });
    const totalConversaciones = await ConversationSession.countDocuments();
    const conversacionesActivas = await ConversationSession.countDocuments({ status: "active" });

    // Últimos 5 registros
    const ultimosRegistros = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Conversaciones recientes
    const conversacionesRecientes = await ConversationSession.find()
      .sort({ lastActivity: -1 })
      .limit(5)
      .lean();

    res.json({
      resumen: {
        totalRegistros,
        autorizados,
        noAutorizados: totalRegistros - autorizados,
        totalConversaciones,
        conversacionesActivas
      },
      ultimosRegistros: ultimosRegistros.map(r => ({
        nombre: r.name,
        telefono: r.phone,
        autorizado: r.authorized,
        fecha: r.createdAt
      })),
      conversacionesRecientes: conversacionesRecientes.map(c => ({
        sessionId: c.sessionId,
        userId: c.userId,
        mensajes: c.messages.length,
        ultimaActividad: c.lastActivity,
        estado: c.status
      }))
    });
  } catch (err) {
    console.error("Error en dashboard:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;