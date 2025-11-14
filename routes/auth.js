// routes/auth.js
// Rutas para login básico del panel admin (sin JWT por ahora)

import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Ruta de login sencillo que compara con ADMIN_USER/ADMIN_PASS del .env
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  if (username === adminUser && password === adminPass) {
    // Respuesta simple: el frontend decide almacenar sesión en localStorage
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
});

export default router;
