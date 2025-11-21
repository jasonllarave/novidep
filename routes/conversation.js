// routes/conversation.js
import express from "express";
import { Registration } from "../models/Registration.js";

const router = express.Router();

/*  
   Cada sesión se registra en Mongo.
   Se identifica por sessionId.
*/

router.post("/", async (req, res) => {
  const { sessionId, message = "" } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });

  const msg = message.trim().toLowerCase();

  // Buscar sesión o crear una nueva
  let session = await Registration.findOne({ sessionId });

  if (!session) {
    session = await Registration.create({
      sessionId,
      step: "start",
      name: null,
      phone: null,
      authorized: false
    });
  }

  // === ESTADO INICIAL ===
  if (session.step === "start") {
    session.step = "ask_participation";
    await session.save();

    return res.json({
      reply: `
Hola, soy <strong>Novi</strong>, tu asistente virtual de Colombia Noviolenta.<br>
Actualmente contamos con talleres, conferencias y espacios de orientación en Noviolencia.<br><br>
¿Te gustaría participar en nuestros eventos?

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="participar">Participar</button>
  <button class="btn-flow" data-option="no_participar">No participar</button>
</div>
`
    });
  }

  // === PREGUNTA ¿QUIERES PARTICIPAR? ===
  if (session.step === "ask_participation") {
    if (msg === "participar" || msg === "si" || msg === "sí") {
      session.step = "ask_name";
      await session.save();

      return res.json({
        reply: `¡Excelente! 🙌<br>¿Cómo te gustaría que te llame?`
      });
    }

    if (msg === "no_participar" || msg === "no") {
      session.step = "ask_name_no";
      await session.save();

      return res.json({
        reply: `Perfecto 😊<br>¿Cómo te gustaría que te llame?`
      });
    }

    return res.json({
      reply: `Disculpa, no entendí. ¿Deseas participar?<br>Usa los botones 😊`
    });
  }

  // === NOMBRE SI NO PARTICIPA ===
  if (session.step === "ask_name_no") {
    session.name = message;
    session.step = "socials_no";
    await session.save();

    return res.json({
      reply: `
Perfecto, <strong>${session.name}</strong>.<br><br>
Te invito a seguirnos en nuestras redes sociales:<br><br>

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="open_instagram">Instagram</button>
  <button class="btn-flow" data-option="open_facebook">Facebook</button>
  <button class="btn-flow" data-option="open_tiktok">TikTok</button>
  <button class="btn-flow" data-option="open_x">X</button>
  <button class="btn-flow" data-option="open_youtube">YouTube</button>
  <button class="btn-flow" data-option="open_spotify">Spotify</button>
</div>

<br>
También puedes escribirme una pregunta en cualquier momento.
`
    });
  }

  // === FLUJO PARTICIPAR — NOMBRE ===
  if (session.step === "ask_name") {
    if (!message || message.length < 2) {
      return res.json({ reply: "Por favor escribe un nombre válido 🙏" });
    }

    session.name = message.trim();
    session.step = "ask_phone";
    await session.save();

    return res.json({
      reply: `Encantado, <strong>${session.name}</strong> 😊<br>Ahora escribe tu número de contacto (10 dígitos, empieza por 3):`
    });
  }

  // === FLUJO PARTICIPAR — TELÉFONO ===
  if (session.step === "ask_phone") {
    const phone = message.replace(/\D/g, "");
    const valid = /^3\d{9}$/.test(phone);

    if (!valid) {
      return res.json({
        reply: "Número inválido 😕<br>Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645"
      });
    }

    session.phone = phone;
    session.step = "ask_authorization";
    await session.save();

    return res.json({
      reply: `
Para continuar, autoriza el uso de tus datos personales:<br><br>

<label style="display:flex;align-items:center;gap:10px;">
  <input type="checkbox" id="authCheck"> Autorizo el uso de mis datos
</label>

<br>

<button class="btn-send-auth" onclick="sendAuthorization()">Enviar</button>
`
    });
  }

  // === MANEJO BOTONES DE REDES ===
  if (msg.startsWith("open_")) {
    const links = {
      open_instagram: "https://www.instagram.com/colombianoviolenta",
      open_facebook: "https://www.facebook.com/ColombiaNoviolenta",
      open_tiktok: "https://www.tiktok.com/@colombianoviolenta",
      open_x: "https://x.com/colnoviolenta",
      open_youtube: "https://www.youtube.com/@parrapapandi",
      open_spotify: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu"
    };

    const url = links[msg];
    if (url) return res.json({ reply: `OPEN_URL::${url}` });
  }

  return res.json({
    reply: "No entendí esa acción 😅<br>Usa los botones o escríbeme tu consulta."
  });
});

// =======================
//   AUTORIZACIÓN FINAL
// =======================
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body || {};

  const session = await Registration.findOne({ sessionId });
  if (!session) return res.status(400).json({ reply: "Sesión no encontrada" });

  if (!session.name || !session.phone) {
    return res.status(400).json({ reply: "Faltan datos para completar el registro" });
  }

  session.authorized = true;
  session.step = "registered";
  await session.save();

  return res.json({
    reply: `¡Gracias <strong>${session.name}</strong>! 🙌<br>Tus datos fueron registrados. Muy pronto nos pondremos en contacto contigo.`
  });
});

export default router;
