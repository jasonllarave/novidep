import express from "express";
import { Registration } from "../models/Registration.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, authorized } = req.body;

  if (!name || !phone || !authorized) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos o no autorizó el uso de datos."
    });
  }

  try {
    const reg = new Registration({ name, phone, authorized: true });
    await reg.save();

    return res.json({
      success: true,
      message: "Información registrada exitosamente"
    });

  } catch (error) {
    console.error("Error guardando registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno guardando los datos"
    });
  }
});

export default router;
