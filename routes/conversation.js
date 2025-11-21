// routes/conversation.js
import express from "express";
import { ConversationSession } from "../models/ConversationSession.js";
import { Registration } from "../models/Registration.js";

const router = express.Router();

/* ----------------------------------------------------------
   📌 Función auxiliar: obtener o crear sesión en MongoDB
----------------------------------------------------------- */
async function getSession(sessionId) {
  let session = await ConversationSession.findOne({ sessionId });

  if (!session) {
    session = await ConversationSession.create({
      sessionId,
      step: "welcome"
    });
  }

  return session;
}

/* ----------------------------------------------------------
   📌 Conversación principal
----------------------------------------------------------- */
router.post("/", async (req, res) => {
  const { sessionId, message = "" } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ reply: "Falta sessionId en la petición." });
  }

  const msg = message.toLowerCase().trim();
  const session = await getSession(sessionId);

  /* ----------------------------------------------------------
     PASO 1 — MENSAJE INICIAL
  ----------------------------------------------------------- */
  if (session.step === "welcome") {
    session.step = "ask_participation";
    await session.save();

    return res.json({
      reply: `
Hola, soy <strong>Novi</strong>, tu asistente virtual de Colombia Noviolenta.  
Actualmente contamos con talleres, conferencias y espacios de orientación en Noviolencia.  
¿Te gustaría participar en nuestros eventos?

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="participar">Participar</button>
  <button class="btn-flow" data-option="no_participar">No participar</button>
</div>
`
    });
  }

  /* ----------------------------------------------------------
     PASO 2 — ¿Desea participar?
  ----------------------------------------------------------- */
  if (session.step === "ask_participation") {
    // SI participa
    if (
      msg === "participar" ||
      msg === "si" ||
      msg === "sí" ||
      msg === "yes"
    ) {
      session.step = "ask_name";
      await session.save();
      return res.json({
        reply: `¡Excelente! 🙌<br>¿Cómo te gustaría que te llame?`
      });
    }

    // NO participa
    if (msg === "no" || msg === "no_participar") {
      session.step = "ask_name_no_participa";
      await session.save();
      return res.json({
        reply: `
Perfecto 😊<br>¿Cómo te gustaría que te llame?
      `
      });
    }

    return res.json({
      reply: "No entendí 😅 ¿Deseas participar? Usa los botones."
    });
  }

  /* ----------------------------------------------------------
     PASO 3 — NOMBRE cuando dijo NO participar
  ----------------------------------------------------------- */
  if (session.step === "ask_name_no_participa") {
    session.name = message.trim();
    session.step = "social_no_participa";
    await session.save();

    return res.json({
      reply: `
Perfecto <strong>${session.name}</strong> 😊  
Aquí tienes nuestras redes sociales. ¿Cuál te gustaría abrir?

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="open_instagram">Instagram</button>
  <button class="btn-flow" data-option="open_facebook">Facebook</button>
  <button class="btn-flow" data-option="open_tiktok">TikTok</button>
  <button class="btn-flow" data-option="open_x">X</button>
  <button class="btn-flow" data-option="open_youtube">YouTube</button>
  <button class="btn-flow" data-option="open_spotify">Spotify</button>
</div>

<br>Puedes escribirme cualquier consulta cuando quieras 😊
`
    });
  }

  /* ----------------------------------------------------------
     PASO 4 — Pedir nombre cuando SÍ participará
  ----------------------------------------------------------- */
  if (session.step === "ask_name") {
    if (!message || message.length < 2) {
      return res.json({
        reply: "Por favor escribe un nombre válido 🙏"
      });
    }

    session.name = message.trim();
    session.step = "ask_phone";
    await session.save();

    return res.json({
      reply: `Encantado, <strong>${session.name}</strong> 😊  
Ahora escribe tu número de contacto (10 dígitos y empieza con 3).`
    });
  }

  /* ----------------------------------------------------------
     PASO 5 — Teléfono
  ----------------------------------------------------------- */
  if (session.step === "ask_phone") {
    const phone = message.replace(/\D/g, "");
    const valid = /^3\d{9}$/.test(phone);

    if (!valid) {
      return res.json({
        reply: "El número es inválido ❌. Ejemplo correcto: 3105223645"
      });
    }

    session.phone = phone;
    session.step = "ask_authorization";
    await session.save();

    return res.json({
      reply: `
Gracias ${session.name} ❤️  
Antes de continuar necesito tu autorización:

<button class="btn-flow" onclick="sendAuthorization()">✔ Autorizo el tratamiento de mis datos</button>
`
    });
  }

  /* ----------------------------------------------------------
     PASO 6 — Redes sociales (cuando NO participa)
  ----------------------------------------------------------- */
  if (session.step === "social_no_participa") {
    const urls = {
      open_instagram: "https://www.instagram.com/colombianoviolenta",
      open_facebook: "https://www.facebook.com/ColombiaNoviolenta",
      open_tiktok: "https://www.tiktok.com/@colombianoviolenta",
      open_x: "https://x.com/colnoviolenta",
      open_youtube: "https://www.youtube.com/@parrapapandi",
      open_spotify: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu"
    };

    if (urls[msg]) {
      return res.json({ reply: `OPEN_URL::${urls[msg]}` });
    }

    // consulta normal
    return res.json({
      reply: `Gracias por tu mensaje 😊 ¿En qué más puedo ayudarte?`
    });
  }

  /* ----------------------------------------------------------
     PREGUNTAS RÁPIDAS una vez registrado
  ----------------------------------------------------------- */
  if (session.step === "completed") {
    const n = session.name || "";

    if (msg.includes("boletas")) {
      return res.json({
        reply: `
🎫 Las boletas del concierto las puedes adquirir aquí:<br>
<a href="https://www.colombianoviolenta.org/conciertos-2/" target="_blank">Ver boletas</a>

<br><br>¿Quieres saber algo más?
<button class="btn-flow" data-option="more_yes">Sí</button>
<button class="btn-flow" data-option="more_no">No</button>
`
      });
    }

    if (msg.includes("compras") || msg.includes("tienda")) {
      return res.json({
        reply: `
🛍️ Nuestra tienda está aquí:<br>
<a href="https://www.colombianoviolenta.org/tienda" target="_blank">Tienda Colombia Noviolenta</a>

<br>¿Deseas algo más?
<button class="btn-flow" data-option="more_yes">Sí</button>
<button class="btn-flow" data-option="more_no">No</button>
`
      });
    }

    if (msg === "more_yes") {
      return res.json({
        reply: `
Listo ${n}! ¿Qué te gustaría saber?

<button class="btn-flow" data-option="boletas">Boletas concierto</button>
<button class="btn-flow" data-option="compras">Compras tienda</button>
<button class="btn-flow" data-option="servicios">Servicios</button>
<button class="btn-flow" data-option="voluntariado">Voluntariado</button>
<button class="btn-flow" data-option="donaciones">Donaciones</button>
`
      });
    }

    if (msg === "more_no") {
      return res.json({ reply: "Perfecto 😊 Aquí estaré si me necesitas." });
    }

    return res.json({
      reply: `No entendí muy bien 😅 ¿puedes intentar de nuevo?`
    });
  }

  /* ----------------------------------------------------------
     Cualquier otro caso
  ----------------------------------------------------------- */
  return res.json({
    reply: "No entendí ese mensaje 😅"
  });
});

/* ----------------------------------------------------------
   AUTORIZACIÓN del uso de datos
----------------------------------------------------------- */
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Falta sessionId" });
  }

  const session = await ConversationSession.findOne({ sessionId });

  if (!session || !session.name || !session.phone) {
    return res.status(400).json({
      success: false,
      message: "La sesión no tiene datos suficientes."
    });
  }

  try {
    await Registration.create({
      name: session.name,
      phone: session.phone,
      authorized: true
    });

    session.authorized = true;
    session.step = "completed";
    await session.save();

    return res.json({
      success: true,
      reply: `
¡Gracias ${session.name}! 🎉  
Tus datos fueron registrados correctamente.  
Ahora puedes escoger una opción o hacer una consulta 😊
      `
    });

  } catch (err) {
    console.error("Error guardando registro", err);
    return res.status(500).json({
      success: false,
      message: "Error guardando en la base de datos."
    });
  }
});

export default router;
