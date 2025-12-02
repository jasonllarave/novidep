// routes/chatbot.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { getChatbotResponse } from "../utils/intelligentResponses.js";
import { ConversationSession } from "../models/ConversationSession.js";

const router = express.Router();

// Botones sociales
const socialButtons = [
  { label: "Instagram", url: "https://www.instagram.com/colombianoviolenta" },
  { label: "Facebook", url: "https://www.facebook.com/ColombiaNoviolenta" },
  { label: "TikTok", url: "https://www.tiktok.com/@colombianoviolenta" },
  { label: "X", url: "https://x.com/colnoviolenta" },
  { label: "YouTube", url: "https://www.youtube.com/@parrapapandi" },
  { label: "Spotify", url: "https://open.spotify.com/show/1V6DxlGw5fIN52HhYG2flu" }
];

// Función para generar HTML de botones
const generateButtonsHTML = (buttons) =>
  buttons.map(b => `<button class="quick-button" data-url="${b.url}">${b.label}</button>`).join(" ");

// === RUTA PRINCIPAL DEL CHATBOT ===
router.post("/chatbot", async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Mensaje faltante" });
  }

  const sid = sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

  // === Conversación ===
  let conversation = await ConversationSession.findOne({ sessionId: sid });
  if (!conversation) {
    conversation = await ConversationSession.create({
      sessionId: sid,
      userId: session.name || 'anonymous',
      messages: [],
      status: 'active'
    });
  }

  // Guardar mensaje del usuario
  await conversation.addMessage("user", message);

  const msg = message.trim().toLowerCase();

  const sessionContext = {
    name: session.name,
    phone: session.phone,
    authorized: session.authorized
  };

  try {
    // === MENSAJE INICIAL ===
    if (msg === "start" || session.step === "start") {
      session.step = "ask_participation";
      await session.save();

      const botReply = `¡Hola! Soy <strong>Novi</strong>, asistente virtual de Colombia Noviolenta. 🌱<br><br>
¿Te gustaría participar en uno de nuestros talleres o eventos?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="participar">✅ Sí, quiero participar</button>
<button class="quick-button" data-option="no_participar">❌ No, gracias</button>
</div>`;

      await conversation.addMessage("assistant", botReply);

      return res.json({ sessionId: sid, reply: botReply });
    }

    // === PARTICIPAR / NO PARTICIPAR ===
    if (session.step === "ask_participation") {
      if (["participar", "si", "sí"].includes(msg)) {
        // Solo pedir nombre si NO lo tenemos
        if (session.name) {
          session.step = "conversation_mode";
          await session.save();

          const botReply = `¡Perfecto ${session.name}! 🎉<br><br>
¿Te gustaría conocer nuestras redes sociales?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="socials_si">✅ Sí</button>
<button class="quick-button" data-option="socials_no">❌ No</button>
</div>`;

          await conversation.addMessage("assistant", botReply);
          return res.json({ sessionId: sid, reply: botReply });
        }

        session.step = "ask_name";
        await session.save();

        const botReply = "¡Excelente! 😊 ¿Cómo te gustaría que te llame?";
        await conversation.addMessage("assistant", botReply);
        return res.json({ sessionId: sid, reply: botReply });
      }
      
      if (["no_participar", "no"].includes(msg)) {
        session.step = "conversation_mode";
        await session.save();

        const aiText = await getChatbotResponse("usuario_no_participa", sessionContext, conversation.messages);

        const botReply = `${aiText}<br><br>¿Te gustaría conocer nuestras redes sociales?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="socials_si">✅ Sí</button>
<button class="quick-button" data-option="socials_no">❌ No</button>
</div>`;

        await conversation.addMessage("assistant", botReply);

        return res.json({ sessionId: sid, reply: botReply });
      }
    }

    // === PEDIR NOMBRE ===
    if (session.step === "ask_name") {
      if (!message || message.length < 2) {
        const botReply = "Por favor escribe un nombre válido 🙏";
        await conversation.addMessage("assistant", botReply);
        return res.json({ sessionId: sid, reply: botReply });
      }

      session.name = message.trim();
      session.step = "ask_phone";
      await session.save();

      const botReply = `Encantado, <strong>${session.name}</strong> 😊<br>Ahora escribe tu número de contacto (10 dígitos, empieza con 3):`;
      await conversation.addMessage("assistant", botReply);

      return res.json({ sessionId: sid, reply: botReply });
    }

    // === VALIDAR TELÉFONO ===
    if (session.step === "ask_phone") {
      const phone = message.replace(/\D/g, "");

      if (!/^3\d{9}$/.test(phone)) {
        const botReply = "Número inválido 😕 Debe ser de 10 dígitos y comenzar con 3. Ej: 3105223645";
        await conversation.addMessage("assistant", botReply);
        return res.json({ sessionId: sid, reply: botReply });
      }

      session.phone = phone;
      session.step = "ask_authorization";
      await session.save();

      const botReply = `Gracias ${session.name}! ❤️<br><br>
<label style="display:flex;align-items:center;gap:10px;">
<input type="checkbox" id="authCheck"> 
Autorizo el tratamiento de mis datos personales
</label><br>
<button class="quick-button" onclick="sendAuthorization()">✓ Confirmar autorización</button>`;

      await conversation.addMessage("assistant", botReply);

      return res.json({ sessionId: sid, reply: botReply });
    }

    // === REDES SOCIALES ===
    if (msg === "socials_si") {
      session.step = "conversation_mode";
      await session.save();

      const botReply = `¡Genial! 😄 Aquí están nuestras redes:<br><br>
${generateButtonsHTML(socialButtons)}<br><br>
¿Deseas explorar nuestros servicios?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="explorar_servicios">✅ Sí</button>
<button class="quick-button" data-option="explorar_no">❌ No</button>
</div>`;

      await conversation.addMessage("assistant", botReply);

      return res.json({ sessionId: sid, reply: botReply });
    }

    if (msg === "socials_no") {
      session.step = "conversation_mode";
      await session.save();

      const botReply = `No hay problema 😊<br><br>
¿Deseas explorar nuestros servicios?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="explorar_servicios">✅ Sí</button>
<button class="quick-button" data-option="explorar_no">❌ No</button>
</div>`;

      await conversation.addMessage("assistant", botReply);

      return res.json({ sessionId: sid, reply: botReply });
    }

    // === MODO CONVERSACIÓN LIBRE ===
    if (session.step === "conversation_mode" || session.step === "after_authorization") {
      const reply = await getChatbotResponse(message, sessionContext, conversation.messages);

      await conversation.addMessage("assistant", reply);

      return res.json({ sessionId: sid, reply });
    }

    // === MENSAJE GENERAL (FALLBACK) ===
    const reply = await getChatbotResponse(message, sessionContext, conversation.messages);

    await conversation.addMessage("assistant", reply);

    return res.json({ sessionId: sid, reply });

  } catch (err) {
    console.error("Error en chatbot:", err);

    const botReply = "Lo siento, ha ocurrido un error. Por favor intenta nuevamente.";

    await conversation.addMessage("assistant", botReply);

    return res.status(500).json({ error: botReply });
  }
});

// === RUTA DE AUTORIZACIÓN ===
router.post("/authorize", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "SessionId es requerido" });
    }

    const session = await Registration.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    session.authorized = true;
    session.step = "after_authorization";
    await session.save();

    let conversation = await ConversationSession.findOne({ sessionId });
    if (!conversation) {
      conversation = await ConversationSession.create({
        sessionId,
        userId: session.name || "anonymous",
        messages: [],
        status: "active"
      });
    }

    const sessionContext = {
      name: session.name,
      phone: session.phone,
      authorized: session.authorized
    };

    const aiText = await getChatbotResponse("usuario_autorizado", sessionContext, conversation.messages);

    const botReply = `${aiText}<br><br>
¿Te gustaría conocer nuestras redes sociales?<br><br>
<div style="display:flex;gap:10px;">
<button class="quick-button" data-option="socials_si">✅ Sí</button>
<button class="quick-button" data-option="socials_no">❌ No</button>
</div>`;

    await conversation.addMessage("assistant", botReply);

    return res.json({ reply: botReply });

  } catch (err) {
    console.error("Error en autorización:", err);
    return res.status(500).json({ error: "Error al procesar la autorización" });
  }
});

export default router;