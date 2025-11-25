// routes/chatbot.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

// Redes sociales
const socialButtons = [
  { label: "Instagram", url: "https://www.instagram.com/colombianoviolenta" },
  { label: "Facebook", url: "https://www.facebook.com/ColombiaNoviolenta" },
  { label: "TikTok", url: "https://www.tiktok.com/@colombianoviolenta" },
  { label: "X", url: "https://x.com/colnoviolenta" },
  { label: "YouTube", url: "https://www.youtube.com/@parrapapandi" },
  { label: "Spotify", url: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu" }
];

// Servicios
const serviceButtons = [
  { label: "🎵 Boletas concierto", key: "boletas_concierto", url: "https://www.colombianoviolenta.org/conciertos/" },
  { label: "🛒 Compras tienda", key: "compras_tienda", url: "https://www.colombianoviolenta.org/tienda/" },
  { label: "📋 Servicios", key: "adquirir_servicios", url: "https://www.colombianoviolenta.org/servicios/" },
  { label: "🤝 Voluntariado", key: "voluntariado", url: "https://www.colombianoviolenta.org/voluntariado/" },
  { label: "💝 Donaciones", key: "donaciones", url: "https://donorbox.org/colombianoviolenta" },
  { label: "📖 Cartilla", key: "cartilla", url: "https://www.colombianoviolenta.org/cartilla/" }
];

// Función para generar botones HTML
const generateButtonsHTML = (buttons, useOptionKey = false) =>
  buttons.map(b => useOptionKey
    ? `<button class="quick-button" data-option="${b.key}" data-url="${b.url}">${b.label}</button>`
    : `<button class="quick-button" data-url="${b.url}">${b.label}</button>`
  ).join(" ");

router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje faltante" });

  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  let session = await Registration.findOne({ sessionId: sid });

  if (!session) {
    session = await Registration.create({ sessionId: sid, step: "start", name: null, phone: null, authorized: false });
  }

  const msg = message.trim().toLowerCase();

  try {
    // === INICIO ===
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
        session.step = "ask_socials_no";
        await session.save();
        const aiText = await getChatbotResponse("Usuario no participará, invítalo a conocer servicios y recursos.");
        return res.json({
          sessionId: sid,
          reply: `${aiText}<br><br>¿Te gustaría conocer nuestras redes sociales?<br>
<div>
<button class="quick-button" data-option="socials_si">Sí</button>
<button class="quick-button" data-option="socials_no">No</button>
</div>`
        });
      }
    }

    // === PEDIR NOMBRE ===
    if (session.step === "ask_name") {
      if (!message || message.length < 2) return res.json({ sessionId: sid, reply: "Por favor escribe un nombre válido 🙏" });
      session.name = message.trim();
      session.step = "ask_phone";
      await session.save();
      return res.json({ sessionId: sid, reply: `Encantado, <strong>${session.name}</strong> 😊<br>Ahora escribe tu número de contacto (10 dígitos, empieza con 3):` });
    }

    // === PEDIR TELÉFONO ===
    if (session.step === "ask_phone") {
      const phone = message.replace(/\D/g,"");
      if (!/^3\d{9}$/.test(phone)) return res.json({ sessionId: sid, reply: "Número inválido 😕 Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645" });
      session.phone = phone;
      session.step = "ask_authorization";
      await session.save();
      return res.json({ sessionId: sid, reply: `Gracias ${session.name}! ❤️<br>
<label>
<input type="checkbox" id="authCheck"> Autorizo el tratamiento de mis datos personales
</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>` });
    }

    // === DESPUÉS DE AUTORIZACIÓN ===
    if (session.step === "show_options") {
      session.step = "ask_socials"; // siguiente paso
      await session.save();
      const aiText = await getChatbotResponse("Usuario autorizado, invítalo a explorar servicios y redes");
      return res.json({
        sessionId: sid,
        reply: `${aiText}<br><br>${generateButtonsHTML(serviceButtons,true)}<br><br>¿Te gustaría conocer nuestras redes sociales?<br>
<div>
<button class="quick-button" data-option="socials_si">Sí</button>
<button class="quick-button" data-option="socials_no">No</button>
</div>`
      });
    }

    // === REDES SOCIALES ===
    if (msg === "socials_si") {
      session.step = "util_feedback";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Genial! 😄 Aquí están nuestras redes:<br><br>${generateButtonsHTML(socialButtons)}<br><br>¿Te fue útil esta información?<br>
<div>
<button class="quick-button" data-option="util_si">Sí</button>
<button class="quick-button" data-option="util_no">No</button>
</div>`
      });
    }

    if (msg === "socials_no" || msg === "util_no") {
      session.step = "ask_services";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `No hay problema 😊<br>¿Deseas conocer nuestros servicios y recursos?<br>
<div>
<button class="quick-button" data-option="servicios_si">Sí</button>
<button class="quick-button" data-option="servicios_no">No</button>
</div>`
      });
    }

    if (msg === "util_si") {
      session.step = "ask_services";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Perfecto! 😄<br>¿Deseas conocer nuestros servicios y recursos?<br>
<div>
<button class="quick-button" data-option="servicios_si">Sí</button>
<button class="quick-button" data-option="servicios_no">No</button>
</div>`
      });
    }

    // === SERVICIOS ===
    if (msg === "servicios_si") {
      session.step = "services_done";
      await session.save();
      const aiText = await getChatbotResponse("Usuario quiere ver servicios");
      return res.json({
        sessionId: sid,
        reply: `${aiText}<br><br>${generateButtonsHTML(serviceButtons,true)}<br><br>¿Satisfecho con nuestra atención?<br>
<div>
<button class="quick-button" data-option="satisfecho_si">Sí</button>
<button class="quick-button" data-option="satisfecho_no">No</button>
</div>`
      });
    }

    if (msg === "servicios_no") {
      session.step = "ask_message";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¿Hay algo en específico que quieras consultar? Escribe tu pregunta:`
      });
    }

    // === SATISFACCIÓN ===
    if (msg === "satisfecho_si") {
      session.step = "rating";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Genial! 😊 Por favor califica nuestra atención del 1 al 5 estrellas:`
      });
    }

    if (msg === "satisfecho_no") {
      session.step = "ask_message";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `Lamentamos no haber cumplido tus expectativas 😔. Por favor escribe tu consulta o sugerencia y con gusto te ayudaremos:`
      });
    }

    // === CALIFICACIÓN FINAL ===
    const rating = parseInt(msg);
    if (session.step === "rating" && rating >=1 && rating <=5) {
      session.step = "end";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `¡Gracias por tu calificación de ${rating} ⭐! 🙌<br>Si tienes más preguntas o consultas, siempre puedes escribirlas y con gusto te atenderemos.`
      });
    }

    // === CONSULTA ESPECÍFICA ===
    if (session.step === "ask_message") {
      session.step = "ask_satisfaction";
      await session.save();
      return res.json({
        sessionId: sid,
        reply: `Gracias por tu consulta. ¿Satisfecho con nuestra atención?<br>
<div>
<button class="quick-button" data-option="satisfecho_si">Sí</button>
<button class="quick-button" data-option="satisfecho_no">No</button>
</div>`
      });
    }

    // === BOTONES DE SERVICIOS GENERALES ===
    const buttonActions = serviceButtons.map(b => b.key);
    if (buttonActions.includes(msg)) {
      const reply = await getChatbotResponse(msg);
      return res.json({
        sessionId: sid,
        reply: `${reply}<br><br>¿Deseas explorar algo más?<br>${generateButtonsHTML(serviceButtons,true)}`
      });
    }

    // === MENSAJE GENERAL ===
    const reply = await getChatbotResponse(message);
    res.json({ sessionId: sid, reply });

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
