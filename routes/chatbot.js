// routes/chatbot.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

const optionsButtons = [
  { label: "🎵 Boletas concierto", key: "boletas_concierto", url: "https://www.colombianoviolenta.org/conciertos/" },
  { label: "🛒 Compras tienda", key: "compras_tienda", url: "https://www.colombianoviolenta.org/tienda/" },
  { label: "📋 Servicios", key: "adquirir_servicios", url: "https://www.colombianoviolenta.org/servicios/" },
  { label: "🤝 Voluntariado", key: "voluntariado", url: "https://www.colombianoviolenta.org/voluntariado/" },
  { label: "💝 Donaciones", key: "donaciones", url: "https://donorbox.org/colombianoviolenta" },
  { label: "📖 Cartilla", key: "cartilla", url: "https://www.colombianoviolenta.org/cartilla/" }
];

const generateButtonsHTML = () =>
  optionsButtons.map(o => `<button class="quick-button" data-option="${o.key}" data-url="${o.url}">${o.label}</button>`).join(" ");

router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje faltante" });

  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    const msg = message.trim().toLowerCase();
    let session = await Registration.findOne({ sessionId: sid });

    if (!session) {
      session = await Registration.create({ sessionId: sid, step: "start", name: null, phone: null, authorized: false });
    }

    // === MENSAJE INICIAL ===
    if (msg === "start" || session.step === "start") {
      session.step = "ask_participation";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Hola! Soy <strong>Novi</strong>, el asistente virtual de Colombia Noviolenta. 🌱<br><br>
¿Te gustaría participar en uno de nuestros talleres o eventos?<br><br>
<div style="margin-top:10px;">
  <button class="quick-button" data-option="participar">Sí, quiero participar</button>
  <button class="quick-button" data-option="no_participar">No, gracias</button>
</div>`
      });
    }

    // === PARTICIPACIÓN ===
    if (session.step === "ask_participation") {
      if (msg === "participar" || msg === "si" || msg === "sí") {
        session.step = "ask_name";
        await session.save();
        return res.json({ sessionId: sid, reply: "¡Excelente! 😊 ¿Cómo te gustaría que te llame?" });
      }
      if (msg === "no_participar" || msg === "no") {
        session.step = "show_options";
        await session.save();
        const aiText = await getChatbotResponse("Usuario no quiere participar, invítalo a conocer servicios y recursos");
        return res.json({ sessionId: sid, reply: `${aiText}<br><br>${generateButtonsHTML()}` });
      }
      return res.json({ sessionId: sid, reply: "Por favor usa los botones para responder 😊" });
    }

    // === PEDIR NOMBRE ===
    if (session.step === "ask_name") {
      if (!message || message.length < 2) {
        return res.json({ sessionId: sid, reply: "Por favor escribe un nombre válido 🙏" });
      }
      session.name = message.trim();
      session.step = "ask_phone";
      await session.save();
      return res.json({ sessionId: sid, reply: `Encantado, <strong>${session.name}</strong> 😊<br>Ahora escribe tu número de contacto (10 dígitos, empieza con 3):` });
    }

    // === VALIDAR TELÉFONO ===
    if (session.step === "ask_phone") {
      const phone = message.replace(/\D/g, "");
      if (!/^3\d{9}$/.test(phone)) {
        return res.json({ sessionId: sid, reply: "Número inválido 😕 Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645" });
      }
      session.phone = phone;
      session.step = "ask_authorization";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `Gracias ${session.name}! ❤️<br><br>
<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
  <input type="checkbox" id="authCheck" style="width:20px;height:20px;"> 
  <span>Autorizo el tratamiento de mis datos personales</span>
</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>`
      });
    }

    // === DESPUÉS DE AUTORIZACIÓN O NO PARTICIPAR ===
    if (session.step === "show_options") {
      const aiText = await getChatbotResponse("Usuario quiere explorar servicios y recursos, sugiere opciones y enlaces");
      return res.json({ sessionId: sid, reply: `${aiText}<br><br>${generateButtonsHTML()}` });
    }

    // === BOTONES INTELIGENTES ===
    const buttonActions = {
      boletas_concierto: "boletas_concierto",
      compras_tienda: "compras_tienda",
      adquirir_servicios: "adquirir_servicios",
      voluntariado: "voluntariado",
      donaciones: "donaciones",
      cartilla: "cartilla"
    };
    if (buttonActions[msg]) {
      const reply = await getChatbotResponse(msg);
      return res.json({ sessionId: sid, reply: `${reply}<br><br>¿Quieres explorar algo más?<br><br>${generateButtonsHTML()}` });
    }

    // === CONSULTA GENERAL ===
    const reply = await getChatbotResponse(message);
    res.json({ sessionId: sid, reply: `${reply}<br><br>¿Quieres explorar algo más?<br><br>${generateButtonsHTML()}` });

  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ error: "Error procesando mensaje" });
  }
});

// === ENDPOINT AUTORIZACIÓN ===
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body;
  const session = await Registration.findOne({ sessionId });
  if (!session) return res.status(400).json({ reply: "Sesión no encontrada" });

  session.authorized = true;
  session.step = "show_options";
  await session.save();

  const aiText = await getChatbotResponse("Usuario autorizó, invítalo a explorar servicios y recursos");
  return res.json({ reply: `${aiText}<br><br>${generateButtonsHTML()}` });
});

export default router;
