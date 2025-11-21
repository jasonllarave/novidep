// routes/conversation.js
import express from "express";
import { Registration } from "../models/Registration.js";

const router = express.Router();

// Estado por sesión en memoria (si quieres persistirlo luego lo movemos a Mongo)
const sessionState = {};

/**
 * POST /api/conversation
 * body: { sessionId, message }
 */
router.post("/", async (req, res) => {
  const { sessionId, message = "" } = req.body || {};

  if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });

  // crear estado si no existe
  if (!sessionState[sessionId]) {
    sessionState[sessionId] = {
      step: "start",
      name: null,
      phone: null
    };
  }

  const state = sessionState[sessionId];
  const msg = (message || "").toString().trim().toLowerCase();

  // --- START: enviar mensaje inicial con botones ---
  if (state.step === "start") {
    state.step = "ask_participation";
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

  // --- ASK PARTICIPATION ---
  if (state.step === "ask_participation") {
    if (msg === "participar" || msg === "si" || msg === "sí" || msg === "yes") {
      state.step = "ask_name";
      return res.json({ reply: `¡Excelente! 🙌<br>¿Cómo te gustaría que te llame?` });
    }

    if (msg === "no_participar" || msg === "no") {
      // preguntar cómo le gustaría que lo llamemos y luego redes
      state.step = "ask_name_no_participa";
      return res.json({
        reply: `
Perfecto 😊<br>Antes de continuar, ¿cómo te gustaría que te llame?`
      });
    }

    // si el usuario escribió texto libre que equivale a "sí/no"
    if (msg === "sí" || msg === "si" || msg === "yes") {
      state.step = "ask_name";
      return res.json({ reply: `¡Excelente! 🙌<br>¿Cómo te gustaría que te llame?` });
    }
    if (msg === "no") {
      state.step = "ask_name_no_participa";
      return res.json({ reply: `Perfecto 😊<br>¿Cómo te gustaría que te llame?` });
    }

    return res.json({ reply: "Disculpa, no entendí. ¿Deseas participar? (usa los botones)" });
  }

  // --- NAME WHEN USER SAID NO TO PARTICIPATE (we don't register) ---
  if (state.step === "ask_name_no_participa") {
    state.name = message;
    state.step = "offer_socials_no_participa";
    return res.json({
      reply: `
Perfecto, <strong>${state.name}</strong>.<br><br>
Te invito a seguirnos en nuestras redes sociales. ¿Cuál te gustaría abrir?

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="open_instagram">Instagram</button>
  <button class="btn-flow" data-option="open_facebook">Facebook</button>
  <button class="btn-flow" data-option="open_tiktok">TikTok</button>
  <button class="btn-flow" data-option="open_x">X</button>
  <button class="btn-flow" data-option="open_youtube">YouTube</button>
  <button class="btn-flow" data-option="open_spotify">Spotify</button>
</div>

<br>
También puedes escribir una pregunta o elegir una de las opciones rápidas cuando quieras.
      `
    });
  }

  // --- USER CHOSE TO PARTICIPATE FLOW: ASK NAME ---
  if (state.step === "ask_name") {
    // guardamos el nombre
    if (!message || message.trim().length < 2) {
      return res.json({ reply: "Por favor escribe tu nombre para que pueda dirigirme a ti." });
    }
    state.name = message.trim();
    state.step = "ask_phone";
    return res.json({ reply: `Encantado, <strong>${state.name}</strong>! Ahora por favor escribe tu número de contacto (10 dígitos, empieza con 3).` });
  }

  // --- ASK PHONE ---
  if (state.step === "ask_phone") {
    // validar formato colombiano: 10 dígitos y empieza por 3
    const phone = message.replace(/\D/g, ""); // limpiar
    const phoneValid = /^3\d{9}$/.test(phone);

    if (!phoneValid) {
      return res.json({ reply: "El número parece inválido. Debe tener 10 dígitos y comenzar por 3. Ej: 3105223645. Intenta otra vez." });
    }

    state.phone = phone;
    state.step = "ask_authorization";

    // enviar checkbox + botón (frontend ejecuta el `sendAuthorization`)
    return res.json({
      reply: `
Para continuar, autoriza el uso de tus datos personales:<br><br>
<label style="display:flex;align-items:center;gap:10px;">
  <input type="checkbox" id="authCheck"> Autorizo el uso de mis datos
</label>
<br>
<button class="btn-send-auth" onclick="sendAuthorization()">Enviar y finalizar</button>
      `
    });
  }

  // --- OTHER BUTTON ACTIONS & NAVIGATION ---
  // map known options (buttons send option strings)
  if (msg.startsWith("open_")) {
    // devolver la url para abrir (frontend abrirá en nueva pestaña)
    const map = {
      open_instagram: "https://www.instagram.com/colombianoviolenta",
      open_facebook: "https://www.facebook.com/ColombiaNoviolenta",
      open_tiktok: "https://www.tiktok.com/@colombianoviolenta",
      open_x: "https://x.com/colnoviolenta",
      open_youtube: "https://www.youtube.com/@parrapapandi",
      open_spotify: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu"
    };
    const url = map[msg] || null;
    if (url) {
      return res.json({ reply: `OPEN_URL::${url}` });
    }
  }

  // opciones inteligentes que aparecerán después de registrar
  if (msg === "boletas" || msg.includes("boletas") || msg === "boletas concierto") {
    return res.json({
      reply: `
🎫 Las boletas para el concierto/conferencia las puedes adquirir en nuestra sección de conciertos:
<a href="https://www.colombianoviolenta.org/conciertos-2/" target="_blank">https://www.colombianoviolenta.org/conciertos-2/</a>

<br><br>¿Te puedo ayudar en algo más?
<div style="margin-top:10px;">
  <button class="btn-flow" data-option="more_yes">Sí</button>
  <button class="btn-flow" data-option="more_no">No</button>
</div>
      `
    });
  }

  if (msg === "compras" || msg.includes("compras") || msg.includes("tienda")) {
    return res.json({
      reply: `
🛍️ En nuestra tienda puedes ver productos, libros y kits. Visítala aquí:
<a href="https://www.colombianoviolenta.org/tienda" target="_blank">Tienda Online</a>

<br><br>¿Te puedo ayudar en algo más?
<div style="margin-top:10px;">
  <button class="btn-flow" data-option="more_yes">Sí</button>
  <button class="btn-flow" data-option="more_no">No</button>
</div>
      `
    });
  }

  // more_yes -> show the main dynamic options again
  if (msg === "more_yes") {
    return res.json({
      reply: `
Listo ${state.name || ""}! Ahora puedes escoger una opción o hacer una pregunta mediante texto. ¿Qué te gustaría saber?

<div style="margin-top:10px;">
  <button class="btn-flow" data-option="boletas">Boletas concierto</button>
  <button class="btn-flow" data-option="compras">Compras tienda</button>
  <button class="btn-flow" data-option="servicios">Adquirir servicios</button>
  <button class="btn-flow" data-option="voluntariado">Voluntariado y participación</button>
  <button class="btn-flow" data-option="donaciones">Donaciones</button>
</div>
      `
    });
  }

  if (msg === "more_no") {
    return res.json({ reply: "Perfecto. Si necesitas algo más, escríbeme cuando quieras." });
  }

  // default fallback (consulta a IA o respuestas básicas)
  return res.json({ reply: "Lo siento, no entendí esa acción. Puedes usar los botones o escribir tu pregunta." });
});

/**
 * POST /api/conversation/authorize
 * Body: { sessionId }
 * Guarda en la colección Registration los datos de la sesión actual
 */
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ success: false, message: "Falta sessionId" });
  const state = sessionState[sessionId];
  if (!state || !state.name || !state.phone) {
    return res.status(400).json({ success: false, message: "Faltan datos para registrar" });
  }

  try {
    await Registration.create({
      name: state.name,
      phone: state.phone,
      authorized: true
    });

    // opcional: reset del estado (pero conservamos nombre por UX)
    state.step = "registered";

    return res.json({ success: true, reply: `¡Gracias ${state.name}! Tus datos fueron registrados. Muy pronto nos contactaremos.` });
  } catch (err) {
    console.error("Error guardando registro:", err);
    return res.status(500).json({ success: false, message: "Error guardando en DB" });
  }
});

export default router;
