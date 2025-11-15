import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatbotRoutes from "./routes/chatbot.routes.js";
import morgan from 'morgan';
import connectDB from './config/database.js'; //  NUEVO
import cron from "node-cron";
import { exec } from "child_process";

import path from "path";

import authRoutes from "./routes/auth.js";
import linksRoutes from "./routes/links.js";
import metricsRoutes from "./routes/metrics.js";
import adminRoutes from "./routes/admin.js";


dotenv.config();

cron.schedule("0 3 * * *", () => { // todos los días a las 03:00 AM
  console.log(" Ejecutando crawler diario...");
  exec("node scripts/crawler.js", (err, stdout, stderr) => {
    if (err) console.error("Crawler cron error:", err);
    else console.log("Crawler stdout:", stdout);
    if (stderr) console.error("Crawler stderr:", stderr);
  });
});

const app = express();

// Conectar a MongoDB
connectDB(); //  NUEVO

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use("/api/admin", adminRoutes);

app.use("/api/chatbot", chatbotRoutes);


// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/metrics", metricsRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "Servidor del Chatbot activado ",
    database: "MongoDB conectada",
    endpoints: {
      chat: "POST /api/chatbot/chatbot",
      history: "GET /api/chatbot/history",
      stats: "GET /api/chatbot/stats",
      search: "GET /api/chatbot/search",
      session: "GET /api/chatbot/session/:sessionId"
    }
  });
});

//  Servir frontend desde carpeta "public"
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.use((err, req, res, next) => { 
  console.error(err.stack);
  res.status(500).json({ error: 'Algo no funciona', details: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor ejecutándose en puerto ${PORT}`);
  console.log(` http://localhost:${PORT}`);
});
