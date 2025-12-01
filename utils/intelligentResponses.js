// utils/intelligentResponses.js
import OpenAI from "openai";
import { detectPsychologicalNeed, psychologicalProtocols, getPsychologicalSupportMenu } from "./psychologicalProtocols.js";
import { serviceResponsesData, getMainMenu, generateServiceResponse } from "./serviceResponses.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===================================================
// FUNCIÓN PRINCIPAL DE RESPUESTAS
// ===================================================

export const getChatbotResponse = async (
  message,
  sessionContext = {},
  conversationHistory = []
) => {
  const msg = message.toLowerCase().trim();
  const userName = sessionContext.name || "";

  // ===================================================
  // 🚨 PRIORIDAD 1: DETECTAR NECESIDAD PSICOLÓGICA
  // ===================================================
  
  const psychNeed = detectPsychologicalNeed(message);
  
  if (psychNeed.detected) {
    const protocol = psychNeed.protocol;
    
    // Generar respuesta con IA usando contexto del protocolo
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Novi, un asistente con formación en apoyo psicológico de Colombia Noviolenta.

CONTEXTO DE LA SITUACIÓN: ${protocol.context}

INSTRUCCIONES:
- Responde como un psicólogo profesional, con empatía y calidez
- USA EL NOMBRE "${userName}" naturalmente en tu respuesta si está disponible
- Haz preguntas abiertas para que la persona se exprese
- Valida sus emociones sin juzgar
- Responde en 2-3 párrafos máximo
- Muestra comprensión profunda de lo que está viviendo
- NO menciones "Paso 1", "Paso 2", etc.

MENSAJE INICIAL SUGERIDO: ${protocol.initialResponse(userName)}

Basándote en esto, responde de forma natural y profesional.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      const aiResponse = completion.choices[0].message.content;

      return `
<div style="background:#f0f8ff;padding:15px;border-radius:8px;margin:10px 0;">
  ${aiResponse}
</div>

${protocol.supportLines}

<div style="margin-top:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
  <strong>¿Necesitas más asistencia?</strong><br><br>
  <button class="quick-button" data-option="asistencia_si">✅ Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">❌ No, estoy bien</button>
</div>`;

    } catch (error) {
      console.error("Error con OpenAI en protocolo psicológico:", error);
      
      // Fallback si falla la IA
      return `
<div style="background:#f0f8ff;padding:15px;border-radius:8px;margin:10px 0;">
  ${protocol.initialResponse(userName)}
</div>

${protocol.supportLines}

<div style="margin-top:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
  <strong>¿Necesitas más asistencia?</strong><br><br>
  <button class="quick-button" data-option="asistencia_si">✅ Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">❌ No, estoy bien</button>
</div>`;
    }
  }

  // ===================================================
  // MANEJO DE BOTONES DE APOYO PSICOLÓGICO ESPECÍFICO
  // ===================================================
  
  const apoyoButtons = {
    "apoyo_suicidio": "suicidio",
    "apoyo_depresion": "depresion",
    "apoyo_ira": "ira",
    "apoyo_miedo": "miedo",
    "apoyo_frustracion": "frustracion"
  };

  if (apoyoButtons[msg]) {
    const protocolKey = apoyoButtons[msg];
    const protocol = psychologicalProtocols[protocolKey];
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Novi, un asistente con formación en apoyo psicológico de Colombia Noviolenta.

CONTEXTO: ${protocol.context}

El usuario ha seleccionado apoyo para: ${protocol.category}

INSTRUCCIONES:
- Responde como un psicólogo profesional
- USA EL NOMBRE "${userName}" si está disponible
- Haz preguntas para entender su situación
- Valida sus emociones
- Muestra empatía profunda
- 2-3 párrafos máximo`
          },
          {
            role: "user",
            content: `Necesito ayuda con ${protocol.category}`
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      const aiResponse = completion.choices[0].message.content;

      return `
<div style="background:#f0f8ff;padding:15px;border-radius:8px;margin:10px 0;">
  ${aiResponse}
</div>

${protocol.supportLines}

<div style="margin-top:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
  <strong>¿Necesitas más asistencia?</strong><br><br>
  <button class="quick-button" data-option="asistencia_si">✅ Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">❌ No, estoy bien</button>
</div>`;

    } catch (error) {
      console.error("Error con OpenAI:", error);
      return `${protocol.initialResponse(userName)}<br><br>${protocol.supportLines}`;
    }
  }

  // ===================================================
  // FLUJO POST-APOYO PSICOLÓGICO
  // ===================================================
  
  if (msg === "asistencia_si") {
    const greeting = userName ? `${userName}, estoy` : "Estoy";
    return `${greeting} aquí para escucharte 💙<br><br>
Por favor, cuéntame más sobre tu situación. Escribe lo que sientes o lo que está pasando:`;
  }
  
  if (msg === "asistencia_no") {
    const greeting = userName ? `Me alegra ${userName}` : "Me alegra que te sientas mejor";
    return `${greeting} 🤍<br><br>
¿Deseas explorar nuestros servicios o tienes alguna pregunta?<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="explorar_servicios">🌟 Explorar servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍️ Hacer una pregunta</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar conversación</button>
</div>`;
  }

  // ===================================================
  // PALABRAS CLAVE QUE REQUIEREN MENÚ DE APOYO
  // ===================================================
  
  if (msg.includes("apoyo") && !msg.includes("apoyo_")) {
    return getPsychologicalSupportMenu();
  }

  // ===================================================
  // EXPLORAR SERVICIOS / PREGUNTA ESPECÍFICA
  // ===================================================
  
  if (msg === "explorar_servicios") {
    return getMainMenu();
  }
  
  if (msg === "pregunta_especifica") {
    const greeting = userName ? `Perfecto ${userName}` : "Perfecto";
    return `${greeting} 😊 Escribe tu pregunta y con gusto te ayudaré:`;
  }

  // ===================================================
  // MANEJO DE "EXPLORAR MÁS" (SÍ/NO) DESPUÉS DE SERVICIOS
  // ===================================================
  
  if (msg === "explorar_si") {
    return getMainMenu();
  }
  
  if (msg === "explorar_no") {
    return `No hay problema 😊<br><br>
¿Hay algo más en lo que pueda ayudarte?<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="pregunta_especifica">✍️ Hacer una pregunta</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar conversación</button>
</div>`;
  }

  // ===================================================
  // FINALIZAR CHAT Y CALIFICACIÓN
  // ===================================================
  
  if (msg === "finalizar_chat") {
    return `¡Gracias por usar nuestro servicio! 🌟<br><br>
La no violencia no es pasividad, es una fuerza activa que transforma sin destruir.<br><br>
<strong>¿Cómo calificarías nuestra atención?</strong><br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="calificar_excelente">⭐⭐⭐⭐⭐ Excelente</button>
  <button class="quick-button" data-option="calificar_buena">⭐⭐⭐⭐ Buena</button>
  <button class="quick-button" data-option="calificar_regular">⭐⭐⭐ Regular</button>
</div>`;
  }
  
  if (msg.includes("calificar_")) {
    const ratings = {
      "calificar_excelente": "⭐⭐⭐⭐⭐ Excelente",
      "calificar_buena": "⭐⭐⭐⭐ Buena",
      "calificar_regular": "⭐⭐⭐ Regular"
    };
    const rating = ratings[msg] || "tu calificación";
    return `¡Gracias por tu calificación: ${rating}! 🌟<br><br>
Tu opinión nos ayuda a mejorar cada día.<br><br>
<strong>¿Deseas iniciar una nueva conversación?</strong><br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="nueva_conversacion">🔄 Nueva conversación</button>
  <button class="quick-button" data-option="cerrar_definitivo">👋 Cerrar</button>
</div>`;
  }

  if (msg === "nueva_conversacion") {
    return getMainMenu();
  }

  if (msg === "cerrar_definitivo") {
    return `¡Hasta pronto! 👋💚<br><br>
Recuerda que siempre estamos aquí cuando nos necesites.<br><br>
🌱 <strong>Colombia Noviolenta</strong> - Transformando realidades con paz.`;
  }

  // ===================================================
  // CONTEXTOS ESPECÍFICOS DEL FLUJO
  // ===================================================

  const contextResponses = {
    "usuario_no_participa":
      "¡No hay problema! 😊 Aún así, puedes explorar nuestros recursos, servicios y mantenerte conectado con nosotros.",
    "usuario_autorizado":
      "¡Perfecto! 🎉 Ya estás registrado. Ahora puedes explorar todo lo que tenemos para ofrecerte:",
    "mostrar_servicios":
      "¡Aquí están nuestros servicios disponibles! 🌟"
  };

  if (contextResponses[msg]) return contextResponses[msg];

  // ===================================================
  // BOTONES DE SERVICIOS (CON FLUJO SÍ/NO)
  // ===================================================

  if (serviceResponsesData[msg]) {
    const service = serviceResponsesData[msg];
    return generateServiceResponse(service.text, service.button);
  }

  // ===================================================
  // OPCIONES NUMERADAS DEL MENÚ (1-6)
  // ===================================================

  const menuOptions = {
    "1": {
      text: "🎵 ¡Genial! Puedes adquirir tus boletas para nuestros conciertos haciendo clic en el botón. Encontrarás fechas, lugares y precios disponibles.",
      button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver boletas</button>`
    },
    "2": {
      text: "🛒 ¡Excelente elección! En nuestra tienda encontrarás productos oficiales de Colombia Noviolenta. Cada compra apoya nuestra causa por la paz.",
      button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`
    },
    "3": {
      text: "📋 Ofrecemos diversos servicios de formación, talleres y acompañamiento en cultura de paz y resolución de conflictos.",
      button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver servicios</button>`
    },
    "4": {
      text: "📘 ¡Síguenos en Facebook para mantenerte al día con nuestras actividades, eventos y contenido sobre cultura de paz!",
      button: `<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">📘 Ir a Facebook</button>`
    },
    "5": {
      text: "📖 Nuestra cartilla educativa sobre noviolencia está disponible para descarga gratuita. Es una herramienta valiosa para el aprendizaje.",
      button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar cartilla</button>`
    },
    "6": {
      text: "📞 Puedes contactarnos a través de cualquiera de estos medios:",
      button: `<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Sitio web</button>`
    }
  };

  // Manejo de opciones 1-6
  if (msg === "1" || msg === "opcion_1") return generateServiceResponse(menuOptions["1"].text, menuOptions["1"].button);
  if (msg === "2" || msg === "opcion_2") return generateServiceResponse(menuOptions["2"].text, menuOptions["2"].button);
  if (msg === "3" || msg === "opcion_3") return generateServiceResponse(menuOptions["3"].text, menuOptions["3"].button);
  if (msg === "4" || msg === "opcion_4") return generateServiceResponse(menuOptions["4"].text, menuOptions["4"].button);
  if (msg === "5" || msg === "opcion_5") return generateServiceResponse(menuOptions["5"].text, menuOptions["5"].button);
  if (msg === "6" || msg === "opcion_6") return generateServiceResponse(menuOptions["6"].text, menuOptions["6"].button);

  // ===================================================
  // MENÚ / AYUDA
  // ===================================================

  if (
    msg.includes("ayuda") ||
    msg.includes("opciones") ||
    msg.includes("qué puedes") ||
    msg.includes("que puedes") ||
    msg.includes("menu") ||
    msg.includes("menú")
  ) {
    return getMainMenu();
  }

  // ===================================================
  // PALABRAS CLAVE ESPECÍFICAS (CON FLUJO SÍ/NO)
  // ===================================================

  if (msg.includes("concierto") || msg.includes("boleta") || msg.includes("evento")) {
    return generateServiceResponse(
      "🎵 Tenemos próximos conciertos y eventos culturales:",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos</button>`
    );
  }

  if (msg.includes("tienda") || msg.includes("comprar") || msg.includes("producto")) {
    return generateServiceResponse(
      "🛒 En nuestra tienda oficial encontrarás productos que apoyan la causa:",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`
    );
  }

  if (msg.includes("taller") || msg.includes("formación") || msg.includes("curso")) {
    return generateServiceResponse(
      "📚 Ofrecemos talleres en cultura de paz y resolución de conflictos:",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`
    );
  }

  if (msg.includes("voluntario") || msg.includes("ayudar") || msg.includes("colaborar")) {
    return generateServiceResponse(
      "🤝 ¡Nos encantaría contar contigo!",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝 Inscribirme</button>`
    );
  }

  if (msg.includes("donar") || msg.includes("donación")) {
    return generateServiceResponse(
      "💝 Tu apoyo es fundamental:",
      `<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Donar ahora</button>`
    );
  }

  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("guía")) {
    return generateServiceResponse(
      "📖 Nuestra cartilla educativa está disponible:",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar</button>`
    );
  }

  if (msg.includes("contacto") || msg.includes("teléfono") || msg.includes("email")) {
    return generateServiceResponse(
      "📞 Puedes contactarnos a través de:",
      `<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>`
    );
  }

  if ((msg.includes("donde") || msg.includes("ubicación") || msg.includes("dirección")) && !msg.includes("tienda")) {
    return generateServiceResponse(
      "📍 Estamos ubicados en Medellín, Barrio Boston, Colombia:",
      `<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta/about">📍 Ver ubicación</button>`
    );
  }

  if (msg.includes("horario") || msg.includes("abierto") || msg.includes("atiende")) {
    return `🕐 Nuestro horario de atención es:<br>
- <strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM<br>
- <strong>Sábados:</strong> 9:00 AM - 2:00 PM<br>
- <strong>Domingos:</strong> Cerrado<br><br>
💬 Este chat está disponible 24/7.<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">🌟 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍️ Hacer pregunta</button>
</div>`;
  }

  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("hey")) {
    const greeting = userName ? `¡Hola ${userName}! 👋` : "¡Hola! 👋";
    return `${greeting} Bienvenido a Colombia Noviolenta. ¿En qué puedo ayudarte hoy?<br><br>${getMainMenu()}`;
  }

  if (msg.includes("recuerdas") && (msg.includes("nombre") || msg.includes("llamo"))) {
    if (userName) {
      return `¡Claro que sí! Te llamas <strong>${userName}</strong> 😊 ¿En qué puedo ayudarte?`;
    } else {
      return `Aún no me has dicho tu nombre 😊 ¿Cómo te gustaría que te llame?`;
    }
  }

  if (msg.includes("gracias")) {
    const response = userName ? `¡De nada ${userName}!` : "¡De nada!";
    return `${response} 😊 Estoy aquí para ayudarte.<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">🌟 Ver servicios</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar</button>
</div>`;
  }

  if (msg.includes("adiós") || msg.includes("adios") || msg.includes("chao") || msg.includes("hasta luego")) {
    return `¡Hasta pronto! 👋 Recuerda que siempre puedes volver si necesitas algo más.<br><br>
<strong>¿Deseas calificar nuestra atención antes de irte?</strong><br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="calificar_excelente">⭐⭐⭐⭐⭐</button>
  <button class="quick-button" data-option="calificar_buena">⭐⭐⭐⭐</button>
  <button class="quick-button" data-option="calificar_regular">⭐⭐⭐</button>
  <button class="quick-button" data-option="cerrar_definitivo">❌ No, gracias</button>
</div>`;
  }

  if (msg.includes("llama") || msg.includes("organizacion") || msg.includes("quien")) {
    return `🌱 Somos <strong>Colombia Noviolenta</strong>, una organización dedicada a la construcción de paz.<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Conocer más</button><br><br>
¿En qué más puedo ayudarte?<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">🌟 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍️ Hacer pregunta</button>
</div>`;
  }

  if (msg.includes("redes") || msg.includes("social") || msg.includes("instagram") || msg.includes("facebook")) {
    return `📱 Síguenos en nuestras redes:<br><br>
<button class="quick-button" data-url="https://www.instagram.com/colombianoviolenta">📷 Instagram</button>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">📘 Facebook</button>
<button class="quick-button" data-url="https://www.tiktok.com/@colombianoviolenta">🎵 TikTok</button>
<button class="quick-button" data-url="https://www.youtube.com/@parrapapandi">📺 YouTube</button><br><br>
¿Deseas explorar nuestros servicios?<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">✅ Sí</button>
  <button class="quick-button" data-option="explorar_no">❌ No</button>
</div>`;
  }

  // ===================================================
  // RESPUESTA CON IA + HISTORIAL + NOMBRE
  // ===================================================

  try {
    const messageHistory = conversationHistory.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.replace(/<[^>]*>/g, "")
    }));

    let userContext = "";
    if (userName) {
      userContext = `\n\nCONTEXTO DEL USUARIO:\n- Nombre: ${userName}`;
      if (sessionContext.phone) userContext += `\n- Teléfono: ${sessionContext.phone}`;
      if (sessionContext.authorized) userContext += `\n- Usuario registrado`;
      userContext += `\n\n⚠️ IMPORTANTE: USA SU NOMBRE "${userName}" de forma natural en tu respuesta, especialmente al inicio.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente de Colombia Noviolenta. 

REGLAS CRÍTICAS:
- MANTÉN el contexto del historial de conversación completo
- Si el usuario menciona algo previo (ej: "quise cortarle la cabeza a mi ganso"), RESPONDE basándote en ESO y en el historial
- USA EL NOMBRE "${userName}" de forma natural en tu respuesta si está disponible
- Sé empático, comprensivo y profesional
- Responde en español, breve (máximo 3-4 líneas) y amigable
- Si mencionas URLs, usa botones: <button class="quick-button" data-url="URL">TEXTO</button>
- SIEMPRE ofrece opciones de continuación al final
- Analiza el HISTORIAL COMPLETO antes de responder

INFORMACIÓN:
- Organización: Colombia Noviolenta
- Servicios: Talleres, eventos, voluntariado, donaciones
- Sitio: www.colombianoviolenta.org
- WhatsApp: +57 315 790 27 61

${userContext}`
        },
        ...messageHistory,
        { role: "user", content: message }
      ],
      max_tokens: 350,
      temperature: 0.8
    });

    const aiResponse = completion.choices[0].message.content;

    // Agregar opciones de continuación
    return `${aiResponse}<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="explorar_servicios">🌟 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍️ Otra pregunta</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar</button>
</div>`;

  } catch (error) {
    console.error("Error con OpenAI:", error);
    return `Gracias por tu mensaje. 😊 ¿En qué puedo ayudarte específicamente?<br><br>${getMainMenu()}`;
  }
};

export default getChatbotResponse;