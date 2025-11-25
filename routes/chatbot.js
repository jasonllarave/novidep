// routes/chatbot.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

// Mapeo de botones con links reales
const buttonsMap = {
  boletas_concierto: { text: "🎵 Ver Conciertos", url: "https://www.colombianoviolenta.org/conciertos/" },
  compras_tienda: { text: "🛒 Ir a la Tienda", url: "https://www.colombianoviolenta.org/tienda/" },
  adquirir_servicios: { text: "📋 Ver Servicios", url: "https://www.colombianoviolenta.org/servicios/" },
  voluntariado: { text: "🤝 Únete como Voluntario", url: "https://www.colombianoviolenta.org/voluntariado/" },
  donaciones: { text: "💝 Donar Ahora", url: "https://donorbox.org/colombianoviolenta" },
  cartilla: { text: "📖 Descargar Cartilla", url: "https://www.colombianoviolenta.org/cartilla/" }
};

const buttonActions = Object.keys(buttonsMap);

router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) return res.status(400).json({ error: "Mensaje faltante" });

  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const msg = message.trim().toLowerCase();

    let session = await Registration.findOne({ sessionId: sid });

    if (!session) {
      session = await Registration.create({
        sessionId: sid,
        step: "start",
        name: null,
        phone: null,
        authorized: false,
        shownButtons: []
      });
    }

    // === INICIO ===
    if (msg === "start" || session.step === "start") {
      session.step = "ask_participation";
      await session.save();

      return res.json({
        sessionId: sid,
        reply: `¡Hola! Soy <strong>Novi</strong>, el asistente virtual de Colombia Noviolenta. 🌱<br>
¿Te gustaría participar en uno de nuestros talleres o eventos?<br><br>
<button class="quick-button" data-option="participar">Sí, quiero participar</button>
<button class="quick-button" data-option="no_participar">No, gracias</button>`
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
        session.step = "ask_useful_no_participation";
        await session.save();
        return res.json({
          sessionId: sid,
          reply: `Perfecto 👍<br>Te invito a seguirnos en nuestras redes:<br><br>
<button class="quick-button" data-url="https://www.instagram.com/colombianoviolenta">Instagram</button>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">Facebook</button>`
        });
      }

      return res.json({ sessionId: sid, reply: "Por favor, usa los botones para responder 😊" });
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
        return res.json({ sessionId: sid, reply: "Número inválido 😕<br>Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645" });
      }

      session.phone = phone;
      session.step = "ask_authorization";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `Gracias ${session.name}! ❤️<br>
<label><input type="checkbox" id="authCheck"> Autorizo el tratamiento de mis datos personales</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>`
      });
    }

    // === BOTONES CON LINK REAL ===
    if (buttonActions.includes(msg)) {
      if (!session.shownButtons) session.shownButtons = [];

      if (!session.shownButtons.includes(msg)) {
        session.shownButtons.push(msg);
        await session.save();

        const aiText = await getChatbotResponse(msg);
        const btnHTML = `<br><br><button class="quick-button" data-url="${buttonsMap[msg].url}">${buttonsMap[msg].text}</button>`;
        return res.json({ sessionId: sid, reply: aiText + btnHTML });
      } else {
        const aiText = await getChatbotResponse(msg);
        return res.json({ sessionId: sid, reply: aiText });
      }
    }

    // === CONSULTA GENERAL ===
    const reply = await getChatbotResponse(message);
    res.json({ sessionId: sid, reply });
  } catch (err) {
    console.error("Error en chatbot:", err);
    res.status(500).json({ error: "Error procesando mensaje" });
  }
});

// === AUTORIZACIÓN ===
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body;
  const session = await Registration.findOne({ sessionId });
  if (!session) return res.status(400).json({ reply: "Sesión no encontrada" });

  session.authorized = true;
  session.step = "show_options";
  await session.save();

  return res.json({
    reply: `¡Gracias <strong>${session.name}</strong>! 🙌<br>Tus datos fueron registrados.<br>
Escribe tu pregunta o consulta nuestros servicios.<br>`
  });
});

export default router;
