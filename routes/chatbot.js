// routes/chatbot.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

const socialButtons = [
  { label: "Instagram", url: "https://www.instagram.com/colombianoviolenta" },
  { label: "Facebook", url: "https://www.facebook.com/ColombiaNoviolenta" },
  { label: "TikTok", url: "https://www.tiktok.com/@colombianoviolenta" },
  { label: "X", url: "https://x.com/colnoviolenta" },
  { label: "YouTube", url: "https://www.youtube.com/@parrapapandi" },
  { label: "Spotify", url: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu" }
];

const serviceButtons = [
  { label: "🎵 Boletas concierto", key: "boletas_concierto", url: "https://www.colombianoviolenta.org/conciertos/" },
  { label: "🛒 Compras tienda", key: "compras_tienda", url: "https://www.colombianoviolenta.org/tienda/" },
  { label: "📋 Servicios", key: "adquirir_servicios", url: "https://www.colombianoviolenta.org/servicios/" },
  { label: "🤝 Voluntariado", key: "voluntariado", url: "https://www.colombianoviolenta.org/voluntariado/" },
  { label: "💝 Donaciones", key: "donaciones", url: "https://donorbox.org/colombianoviolenta" },
  { label: "📖 Cartilla", key: "cartilla", url: "https://www.colombianoviolenta.org/cartilla/" }
];

const generateButtonsHTML = (buttons, useOptionKey = false) =>
  buttons.map(b => useOptionKey
    ? `<button class="quick-button" data-option="${b.key}" data-url="${b.url}">${b.label}</button>`
    : `<button class="quick-button" data-url="${b.url}">${b.label}</button>`
  ).join(" ");

router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje faltante" });

  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  let session = await Registration.findOne({ sessionId: sid });

  if (!session) {
    session = await Registration.create({ sessionId: sid, step: "start", name: null, phone: null, authorized: false });
  }

  const msg = message.trim().toLowerCase();

  try {
    // === MENSAJE INICIAL ===
    if (msg === "start" || session.step === "start") {
      session.step = "ask_participation";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Hola! Soy <strong>Novi</strong>, asistente virtual de Colombia Noviolenta. 🌱<br>
¿Te gustaría participar en uno de nuestros talleres o eventos?<br><br>
<div>
<button class="quick-button" data-option="participar">Sí, quiero participar</button>
<button class="quick-button" data-option="no_participar">No, gracias</button>
</div>`
      });
    }

    // === PARTICIPAR / NO PARTICIPAR ===
    if (session.step === "ask_participation") {
      if (msg === "participar" || msg === "si" || msg === "sí") {
        session.step = "ask_name";
        await session.save();
        return res.json({ sessionId: sid, reply: "¡Excelente! 😊 ¿Cómo te gustaría que te llame?" });
      }
      if (msg === "no_participar" || msg === "no") {
        session.step = "no_participate_socials";
        await session.save();
        const aiText = await getChatbotResponse("Usuario no participará, invítalo a conocer servicios y recursos.");
        return res.json({ sessionId: sid, reply: `${aiText}<br><br>¿Te gustaría conocer nuestras redes sociales?<br>
<div>
<button class="quick-button" data-option="socials_si">Sí</button>
<button class="quick-button" data-option="socials_no">No</button>
</div>` });
      }
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
      return res.json({ sessionId: sid, reply: `Gracias ${session.name}! ❤️<br>
<label>
<input type="checkbox" id="authCheck"> 
Autorizo el tratamiento de mis datos personales
</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>` });
    }

    // === DESPUÉS DE AUTORIZACIÓN ===
    if (session.step === "show_options") {
      const aiText = await getChatbotResponse("Usuario autorizado, invítalo a explorar servicios y redes");
      session.step = "ask_socials";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `${aiText}<br><br>${generateButtonsHTML(serviceButtons, true)}<br><br>¿Te gustaría conocer nuestras redes sociales?<br>
<div>
<button class="quick-button" data-option="socials_si">Sí</button>
<button class="quick-button" data-option="socials_no">No</button>
</div>`
      });
    }

    // === REDES SOCIALES (SI) ===
    if (msg === "socials_si") {
      session.step = "socials_followup";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Genial! 😄 Aquí están nuestras redes:<br><br>${generateButtonsHTML(socialButtons)}
<br><br>¿Te fue útil esta información, ${session.name}?<br>
<div>
<button class="quick-button" data-option="util_si">Sí</button>
<button class="quick-button" data-option="util_no">No</button>
</div>`
      });
    }

    // === REDES SOCIALES (NO) ===
    if (msg === "socials_no") {
      session.step = "ask_services";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `No hay problema 😊<br>${session.name}, ¿deseas conocer nuestros servicios y recursos?<br>
<div>
<button class="quick-button" data-option="servicios_si">Sí</button>
<button class="quick-button" data-option="servicios_no">No</button>
</div>`
      });
    }

    // === UTILIDAD REDES SOCIALES ===
    if (msg === "util_si") {
      session.step = "ask_services";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `${session.name}, ¿deseas conocer nuestros servicios y recursos?<br>
<div>
<button class="quick-button" data-option="servicios_si">Sí</button>
<button class="quick-button" data-option="servicios_no">No</button>
</div>`
      });
    }

    if (msg === "util_no") {
      session.step = "ask_message";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `${session.name}, no hay problema. Por favor escribe tu consulta y con gusto te ayudaré 😊`
      });
    }

    // === SERVICIOS ===
    if (msg === "servicios_si") {
      const aiText = await getChatbotResponse("Usuario quiere ver servicios");
      session.step = "after_services";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `${aiText}<br><br>${generateButtonsHTML(serviceButtons, true)}`
      });
    }

    if (msg === "servicios_no") {
      session.step = "ask_message";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `${session.name}, perfecto. Por favor escribe tu consulta y con gusto te ayudaré 😊`
      });
    }

    // === CONSULTA / MENSAJE ===
    if (session.step === "ask_message") {
      // Aquí el usuario escribe su consulta libre
      return res.json({ sessionId: sid, reply: `Gracias ${session.name}, hemos recibido tu consulta: "${message}". Te responderemos pronto 😊` });
    }

    // === BOTONES INTELIGENTES GENERALES (SERVICIOS) ===
    const buttonActions = ["boletas_concierto","compras_tienda","adquirir_servicios","voluntariado","donaciones","cartilla"];
    if (buttonActions.includes(msg)) {
      const reply = await getChatbotResponse(msg);
      return res.json({
        sessionId: sid,
        reply: `${reply}<br><br>¿Deseas explorar algo más?<br>${generateButtonsHTML(serviceButtons,true)}`
      });
    }

    // === MENSAJE GENERAL ===
    const reply = await getChatbotResponse(message);
    res.json({ sessionId: sid, reply: reply });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Error procesando mensaje" });
  }
});

// === AUTORIZACIÓN ===
router.post("/authorize", async (req,res) => {
  const { sessionId } = req.body;
  const session = await Registration.findOne({ sessionId });
  if (!session) return res.status(400).json({ reply: "Sesión no encontrada" });

  session.authorized = true;
  session.step = "show_options";
  await session.save();

  const aiText = await getChatbotResponse("Usuario autorizó, invítalo a explorar servicios y redes");
  return res.json({
    reply: `${aiText}<br><br>${generateButtonsHTML(serviceButtons,true)}<br><br>¿Te gustaría conocer nuestras redes sociales?<br>
<div>
<button class="quick-button" data-option="socials_si">Sí</button>
<button class="quick-button" data-option="socials_no">No</button>
</div>`
  });
});

export default router;
