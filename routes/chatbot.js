import express from "express";
import { getChatbotResponse } from "../responses.js";

const router = express.Router();

router.post("/chatbot", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensaje faltante" });
  }

  const reply = getChatbotResponse(message);

  res.json({ reply });
});

export default router;
