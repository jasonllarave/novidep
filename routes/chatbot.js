import express from "express";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

// ✅ Agregar async aquí
router.post("/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensaje faltante" });
  }

  try {
    // ✅ Agregar await aquí
    const reply = await getChatbotResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error('Error en ruta chatbot:', error);
    res.status(500).json({ error: "Error procesando mensaje" });
  }
});

export default router;