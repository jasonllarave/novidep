import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";

const router = express.Router();

router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensaje faltante" });
  }

  // Si no hay sessionId, crear uno
  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const msg = message.trim().toLowerCase();

    // Buscar o crear sesión
    let session = await Registration.findOne({ sessionId: sid });

    if (!session) {
      session = await Registration.create({
        sessionId: sid,
        step: "start",
        name: null,
        phone: null,
        authorized: false
      });
    }

    // === FLUJO CONVERSACIONAL ===

    // PASO 1: Mensaje inicial
    if (msg === "start" || session.step === "start") {
      session.step = "ask_participation";
      await session.save();

      return res.json({
        sessionId: sid,
        reply: `¡Hola! Soy <strong>Novi</strong>, el asistente virtual de Colombia Noviolenta. 🌱<br><br>
Estoy aquí para ayudarte. Actualmente nuestra organización hace talleres, eventos y recursos para promover la cultura de la Noviolencia.<br><br>
¿Te gustaría participar en uno de ellos?<br><br>
<div style="margin-top:10px;">
  <button class="quick-button" data-option="participar">Sí, quiero participar</button>
  <button class="quick-button" data-option="no_participar">No, gracias</button>
</div>`
      });
    }

    // PASO 2: ¿Quieres participar?
    if (session.step === "ask_participation") {
      if (msg === "participar" || msg === "si" || msg === "sí") {
        session.step = "ask_name";
        await session.save();

        return res.json({
          sessionId: sid,
          reply: "¡Excelente! 😊 ¿Cómo te gustaría que te llame?"
        });
      }

      if (msg === "no_participar" || msg === "no") {
        session.step = "show_socials";
        await session.save();

        return res.json({
          sessionId: sid,
          reply: `Perfecto 👍<br><br>
Te invito a seguirnos en nuestras redes sociales:<br><br>
<div style="margin-top:10px;">
  <button class="quick-button" data-option="open_instagram">Instagram</button>
  <button class="quick-button" data-option="open_facebook">Facebook</button>
  <button class="quick-button" data-option="open_tiktok">TikTok</button>
  <button class="quick-button" data-option="open_x">X</button>
  <button class="quick-button" data-option="open_youtube">YouTube</button>
  <button class="quick-button" data-option="open_spotify">Spotify</button>
</div><br>
¿Te fue útil esta información?<br><br>
<button class="quick-button" data-option="util_si">Sí</button>
<button class="quick-button" data-option="util_no">No</button>`
        });
      }

      return res.json({
        sessionId: sid,
        reply: "Por favor, usa los botones para responder 😊"
      });
    }

    // PASO 3: Pedir nombre
    if (session.step === "ask_name") {
      if (!message || message.length < 2) {
        return res.json({
          sessionId: sid,
          reply: "Por favor escribe un nombre válido 🙏"
        });
      }

      session.name = message.trim();
      session.step = "ask_phone";
      await session.save();

      return res.json({
        sessionId: sid,
        reply: `Encantado, <strong>${session.name}</strong> 😊<br>Ahora escribe tu número de contacto (10 dígitos, empieza con 3):`
      });
    }

    // PASO 4: Validar teléfono
    if (session.step === "ask_phone") {
      const phone = message.replace(/\D/g, "");
      const valid = /^3\d{9}$/.test(phone);

      if (!valid) {
        return res.json({
          sessionId: sid,
          reply: "Número inválido 😕<br>Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645"
        });
      }

      session.phone = phone;
      session.step = "ask_authorization";
      await session.save();

      return res.json({
        sessionId: sid,
        reply: `Gracias ${session.name}! ❤️<br><br>
Antes de continuar, necesito tu autorización:<br><br>
<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
  <input type="checkbox" id="authCheck" style="width:20px;height:20px;"> 
  <span>Autorizo el tratamiento de mis datos personales</span>
</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>`
      });
    }

    // PASO 5: Después de autorización → mostrar botones inteligentes
    if (session.step === "completed") {
      return res.json({
        sessionId: sid,
        reply: `¡Listo ${session.name}! 🎉<br><br>
Escribe tu pregunta o también puedes consultar sobre:<br><br>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
  <button class="quick-button" data-option="boletas_concierto">🎵 Boletas concierto</button>
  <button class="quick-button" data-option="compras_tienda">🛒 Compras tienda</button>
  <button class="quick-button" data-option="adquirir_servicios">📋 Adquirir servicios</button>
  <button class="quick-button" data-option="voluntariado">🤝 Voluntariado</button>
  <button class="quick-button" data-option="donaciones">💝 Donaciones</button>
  <button class="quick-button" data-option="cartilla">📖 Cartilla</button>
</div>`
      });
    }

    // MANEJO DE REDES SOCIALES
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
      if (url) {
        return res.json({
          sessionId: sid,
          reply: `OPEN_URL::${url}`,
          continueWith: `¿Te fue útil esta información?<br><br>
<button class="quick-button" data-option="util_si">Sí</button>
<button class="quick-button" data-option="util_no">No</button>`
        });
      }
    }

    // MANEJO DE "¿FUE ÚTIL?"
    if (msg === "util_si") {
      session.step = "ask_services";
      await session.save();

      return res.json({
        sessionId: sid,
        reply: `¡Qué bueno! 😊<br><br>¿Te gustaría conocer nuestros servicios?<br><br>
<button class="quick-button" data-option="servicios_si">Sí</button>
<button class="quick-button" data-option="servicios_no">No</button>`
      });
    }

    if (msg === "util_no" || msg === "servicios_no") {
  session.step = "open_chat";
  await session.save();

  return res.json({
    sessionId: sid,
    reply: `De acuerdo 😊<br><br>Escribe tu pregunta o también puedes consultar sobre:<br><br>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
  <button class="quick-button" data-option="boletas_concierto">🎵 Boletas concierto</button>
  <button class="quick-button" data-option="compras_tienda">🛒 Compras tienda</button>
  <button class="quick-button" data-option="adquirir_servicios">📋 Servicios</button>
  <button class="quick-button" data-option="voluntariado">🤝 Voluntariado</button>
  <button class="quick-button" data-option="donaciones">💝 Donaciones</button>
  <button class="quick-button" data-option="cartilla">📖 Cartilla</button>
</div>`
  });
}

    if (msg === "servicios_si") {
      const reply = await getChatbotResponse("servicios");
      return res.json({ sessionId: sid, reply });
    }

    // MANEJO DE BOTONES INTELIGENTES
    const buttonActions = {
      boletas_concierto: "información sobre boletas para conciertos",
      compras_tienda: "tienda",
      adquirir_servicios: "servicios",
      voluntariado: "voluntariado",
      donaciones: "donaciones",
      cartilla: "cartilla"
    };

    if (buttonActions[msg]) {
      const reply = await getChatbotResponse(buttonActions[msg]);
      return res.json({ sessionId: sid, reply });
    }

    // CONSULTA GENERAL (usando IA)
    const reply = await getChatbotResponse(message);
    res.json({ sessionId: sid, reply });

  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ error: "Error procesando mensaje" });
  }
});

// Endpoint para autorización
router.post("/authorize", async (req, res) => {
  const { sessionId } = req.body;

  const session = await Registration.findOne({ sessionId });
  if (!session) {
    return res.status(400).json({ reply: "Sesión no encontrada" });
  }

  session.authorized = true;
  session.step = "completed";
  await session.save();

  return res.json({
    reply: `¡Gracias <strong>${session.name}</strong>! 🙌<br>Tus datos fueron registrados correctamente.<br><br>
Ahora puedes hacer tu consulta o explorar nuestras opciones.`
  });
});

export default router;