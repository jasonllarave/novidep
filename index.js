import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrationRoutes from "./routes/registration.js";
import chatbotRoutes from "./routes/chatbot.js";
import morgan from "morgan";
import connectDB from "./config/database.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { exec } from "child_process";

import path from "path";
import { fileURLToPath } from "url";

// FIX para ESModules (Render lo requiere)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas
import conversationRoutes from "./routes/conversation.js";
import authRoutes from "./routes/auth.js";
import linksRoutes from "./routes/links.js";
import metricsRoutes from "./routes/metrics.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// Conectar a MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rutas
app.use("/api/admin", adminRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/metrics", metricsRoutes);

// Estado del servidor
app.get("/api/status", (req, res) => {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    message: "Servidor del Chatbot activado",
    database: stateMap[state] || `unknown(${state})`,
    endpoints: {
      chat: "POST /api/chatbot/chatbot"
    }
  });
});

// Servir frontend desde /public
app.use(express.static(path.join(__dirname, "public")));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error("ERROR EXPRESS:", err.stack);
  res.status(500).json({ error: "Algo no funciona", details: err.message });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);

  // El cron SOLO se inicia después del listen
  cron.schedule("0 3 * * *", () => {
    console.log("Ejecutando crawler diario...");
    exec("node scripts/crawler.js", (err, stdout, stderr) => {
      if (err) console.error("Crawler cron error:", err);
      else console.log("Crawler stdout:", stdout);
      if (stderr) console.error("Crawler stderr:", stderr);
    });
  });
});
