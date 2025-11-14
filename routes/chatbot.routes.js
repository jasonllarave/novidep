import { Router } from "express";
import { 
  handleMessage, 
  getHistory, 
  getSessionMessages,
  getStats,
  searchMessages,
  endSession
} from "../controllers/chatbot.controller.js";

const router = Router();

// Rutas principales
router.post("/chatbot", handleMessage);
router.get("/history", getHistory);
router.get("/session/:sessionId", getSessionMessages);
router.get("/stats", getStats);
router.get("/search", searchMessages);
router.post("/end-session", endSession);

export default router;
