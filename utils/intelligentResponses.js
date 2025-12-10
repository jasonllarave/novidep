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
  //  PRIORIDAD 1: DETECTAR NECESIDAD PSICOLÓGICA
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
  <button class="quick-button" data-option="asistencia_si">🟢 Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">🔴 No, estoy bien</button>
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
  <button class="quick-button" data-option="asistencia_si">🟢 Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">🔴 No, estoy bien</button>
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
  <button class="quick-button" data-option="asistencia_si">🟢 Sí, quiero hablar más</button>
  <button class="quick-button" data-option="asistencia_no">🔴 No, estoy bien</button>
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
  <button class="quick-button" data-option="explorar_servicios">👨🏻‍💼 Explorar servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍🏻 Hacer una pregunta</button>
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
    return `${greeting} 🙆🏻‍♂️ Escribe tu pregunta y con gusto te ayudaré:`;
  }

  // ===================================================
  // MANEJO DE "EXPLORAR MÁS" (SÍ/NO) DESPUÉS DE SERVICIOS
  // ===================================================
  
  if (msg === "explorar_si") {
    return getMainMenu();
  }
  
  if (msg === "explorar_no") {
    return `No hay problema 🤷🏻‍♂️<br><br>
¿Hay algo más en lo que pueda ayudarte?<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="pregunta_especifica">✍🏻 Hacer una pregunta</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar conversación</button>
</div>`;
  }

  // ===================================================
  // FINALIZAR CHAT Y CALIFICACIÓN
  // ===================================================
  
  if (msg === "finalizar_chat") {
    return `¡Gracias por usar nuestro servicio! 👁‍🗨<br><br>
La no violencia no es pasividad, es una fuerza activa que transforma sin destruir.<br><br>
<strong>¿Cómo calificarías nuestra atención?</strong><br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="calificar_excelente">🏅🏅🏅🏅🏅 Excelente</button>
  <button class="quick-button" data-option="calificar_buena">🏅🏅🏅🏅 Buena</button>
  <button class="quick-button" data-option="calificar_regular">🏅🏅🏅 Regular</button>
</div>`;
  }
  
  if (msg.includes("calificar_")) {
    const ratings = {
      "calificar_excelente": "🏅🏅🏅🏅🏅 Excelente",
      "calificar_buena": "🏅🏅🏅🏅 Buena",
      "calificar_regular": "🏅🏅🏅 Regular"
    };
    const rating = ratings[msg] || "tu calificación";
    return `¡Gracias por tu calificación: ${rating}! 👨🏻‍💻<br><br>
Tu opinión nos ayuda a mejorar cada día.<br><br>
<strong>¿Deseas iniciar una nueva conversación?</strong><br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="nueva_conversacion">🔄 Nueva conversación</button>
  <button class="quick-button" data-option="cerrar_definitivo">🤏🏻 Cerrar</button>
</div>`;
  }

  if (msg === "nueva_conversacion") {
    return getMainMenu();
  }

  if (msg === "cerrar_definitivo") {
    return `¡Hasta pronto! 👋🏻💚<br><br>
Recuerda que siempre estamos aquí cuando nos necesites.<br><br>
🌱 <strong>La no violencia no es pasividad, es una fuerza activa que transforma sin destruir.</strong> - Colombia Noviolenta`;
  }

  // ===================================================
  // CONTEXTOS ESPECÍFICOS DEL FLUJO
  // ===================================================

  const contextResponses = {
    "usuario_no_participa":
      "¡No hay problema! 👨🏻 Aún así, puedes explorar nuestros recursos, servicios y mantenerte conectado con nosotros.",
    "usuario_autorizado":
      "¡Perfecto! 👏🏻 Ya estás registrado. Ahora puedes explorar todo lo que tenemos para ofrecerte:",
    "mostrar_servicios":
      "¡Aquí están nuestros servicios disponibles! 👁‍🗨"
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
      text: "📘 ¡Apóyanos con tu donación y ayúdanos a seguir impulsando nuestras iniciativas por la cultura de paz! Cada aporte, por pequeño que sea, fortalece nuestros proyectos y nos permite llegar a más comunidades. ¡Tu solidaridad hace la diferencia!",
      button: `<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">📘 Ir a Donaciones</button>`
    },
    "5": {
      text: "📖 Nuestra cartilla educativa sobre noviolencia está disponible para consulta. Es una herramienta valiosa para el aprendizaje.",
      button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 ver cartilla</button>`
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
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝🏼 Inscribirme</button>`
    );
  }

  if (msg.includes("donar") || msg.includes("donación")) {
    return generateServiceResponse(
      "💏🏼 Tu apoyo es fundamental:",
      `<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💏🏼 Donar ahora</button>`
    );
  }

  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("guía")) {
    return generateServiceResponse(
      "📖 Nuestra cartilla educativa está disponible:",
      `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 ver cartilla</button>`
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
    return `
<div style="background:#f0f8ff;padding:15px;border-radius:10px;margin:10px 0;">
  <h3 style="color:#2196F3;margin-top:0;">🕐 Horario de Atención</h3>
  
  <div style="margin:10px 0;">
    <p><strong>📅 Lunes a Viernes:</strong> 8:00 AM - 6:00 PM</p>
    <p><strong>📅 Sábados:</strong> 9:00 AM - 2:00 PM</p>
    <p><strong>📅 Domingos:</strong> Cerrado</p>
  </div>
  
  <p style="margin-top:15px;padding:10px;background:#e3f2fd;border-radius:5px;">
    💬 <strong>Este chat está disponible 24/7</strong> para ayudarte en cualquier momento.
  </p>
</div>

<div style="display:flex;gap:10px;margin-top:10px;">
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍🏻 Hacer pregunta</button>
</div>`;
  }

  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("hey")) {
    const greeting = userName ? `¡Hola ${userName}! 👋🏻` : "¡Hola! 👋🏻";
    return `${greeting} Bienvenido a Colombia Noviolenta. ¿En qué puedo ayudarte hoy?<br><br>${getMainMenu()}`;
  }

  if (msg.includes("recuerdas") && (msg.includes("nombre") || msg.includes("llamo"))) {
    if (userName) {
      return `¡Claro que sí! Te llamas <strong>${userName}</strong> 🙋🏻 ¿En qué puedo ayudarte?`;
    } else {
      return `Aún no me has dicho tu nombre 🙋🏻 ¿Cómo te gustaría que te llame?`;
    }
  }

  if (msg.includes("gracias")) {
    const response = userName ? `¡De nada ${userName}!` : "¡De nada!";
    return `${response} 🙋🏻 Estoy aquí para ayudarte.<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar</button>
</div>`;
  }

  if (msg.includes("adiós") || msg.includes("adios") || msg.includes("chao") || msg.includes("hasta luego")) {
    return `¡Hasta pronto! 💁🏻 Recuerda que siempre puedes volver si necesitas algo más.<br><br>
<strong>¿Deseas calificar nuestra atención antes de irte?</strong><br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="calificar_excelente">🏅🏅🏅🏅🏅</button>
  <button class="quick-button" data-option="calificar_buena">🏅🏅🏅🏅</button>
  <button class="quick-button" data-option="calificar_regular">🏅🏅🏅</button>
  <button class="quick-button" data-option="cerrar_definitivo">🔴 No, gracias</button>
</div>`;
  }

  if (msg.includes("llama") || msg.includes("organizacion") || msg.includes("quien")) {
    return `🌱 Somos <strong>Colombia Noviolenta</strong>, una organización dedicada a la construcción de paz.<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Conocer más</button><br><br>
¿En qué más puedo ayudarte?<br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍🏻 Hacer pregunta</button>
</div>`;
  }

  if (msg.includes("redes") || msg.includes("social") || msg.includes("instagram") || msg.includes("facebook")) {
    return `
<div style="background:#f0f8ff;padding:15px;border-radius:10px;margin:10px 0;">
  <h3 style="color:#E91E63;margin-top:0;">📱 Nuestras Redes Sociales</h3>
  <p>Síguenos para estar al día con nuestras actividades, eventos y contenido sobre cultura de paz:</p>
</div>

<div style="display:grid;gap:10px;margin:15px 0;">
  <button class="quick-button" data-url="https://www.instagram.com/colombianoviolenta" style="background:#E1306C;color:white;">📷 Instagram</button>
  <button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta" style="background:#1877F2;color:white;">📘 Facebook</button>
  <button class="quick-button" data-url="https://www.tiktok.com/@colombianoviolenta" style="background:#000000;color:white;">🎵 TikTok</button>
  <button class="quick-button" data-url="https://www.youtube.com/@parrapapandi" style="background:#FF0000;color:white;">📺 YouTube</button>
</div>

<div style="background:#fff8e7;padding:10px;border-radius:8px;margin:10px 0;">
  <p style="margin:0;">¿Deseas explorar nuestros servicios?</p>
</div>

<div style="display:flex;gap:10px;margin-top:10px;">
  <button class="quick-button" data-option="explorar_servicios">🟢 Sí</button>
  <button class="quick-button" data-option="explorar_no">🔴 No</button>
</div>`;
  }

  // ===================================================
  // BOTÓN "TU MOMENTO DE CALMA"
  // ===================================================

  if (msg === "momento_calma") {
    const greeting = userName ? `${userName}, ` : "";
    return `
<div style="background:linear-gradient(135deg, #e15461ad 0%, #55b5db 100%);padding:20px;border-radius:12px;color:white;margin:10px 0;">
  <h3 style="margin:0 0 10px 0;">🫸🏻 Tu Momento de Calma 🫷🏻</h3>
  <p style="margin:0;opacity:0.9;">Elige la opción que más resuene contigo en este momento:</p>
</div>

<div style="display:grid;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="conversar_ahora" style="background:#4CAF50;">💬 Conversar ahora</button>
  <button class="quick-button" data-option="tips_bienestar">🌸 Tips rápidos de bienestar</button>
  <button class="quick-button" data-option="ejercicios_relajacion">🧘🏻‍♂️ Ejercicios de relajación</button>
  <button class="quick-button" data-option="recursos_autocuidado">💆🏻‍♂️ Recursos de autocuidado</button>
  <button class="quick-button" data-option="practicas_gratitud">🙏🏻 Prácticas de gratitud</button>
  <button class="quick-button" data-option="rutinas_energia">⚡ Rutinas de energía positiva</button>
  <button class="quick-button" data-option="preguntas_frecuentes">❓ Preguntas frecuentes</button>
</div>`;
  }

  // Manejo de opciones del momento de calma
  if (msg === "conversar_ahora") {
    const greeting = userName ? `${userName}, ` : "";
    return `${greeting}estoy aquí para ti 💙<br><br>
Este es un espacio seguro donde puedes expresar lo que sientes sin juicio. ¿Qué te gustaría compartir en este momento?`;
  }

  if (msg === "tips_bienestar") {
    return `
<div style="background:#f0f8ff;padding:20px;border-radius:12px;margin:10px 0;">
  <h3 style="color:#667eea;margin-top:0;">🌸 Tips Rápidos de Bienestar</h3>
  
  <div style="margin:15px 0;">
    <h4 style="color:#4CAF50;margin:10px 0 5px 0;">🌊 Respira Conscientemente</h4>
    <p>Inhala profundamente por 4 segundos, mantén 4 segundos, exhala por 6 segundos. Repite 3 veces.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#4CAF50;margin:10px 0 5px 0;">🏃🏻‍➡️ Muévete un Poco</h4>
    <p>Estira tus brazos, rota tus hombros, camina 5 minutos. El movimiento libera tensión.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#4CAF50;margin:10px 0 5px 0;">💧 Hidrátate</h4>
    <p>Bebe un vaso de agua despacio. Observa cómo el agua refresca tu cuerpo.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#4CAF50;margin:10px 0 5px 0;">📱 Desconecta 10 Minutos</h4>
    <p>Aleja tu teléfono. Cierra los ojos. Solo respira y siente el presente.</p>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
</div>`;
  }

  if (msg === "ejercicios_relajacion") {
    return `
<div style="background:#fff8e7;padding:20px;border-radius:12px;margin:10px 0;">
  <h3 style="color:#f57c00;margin-top:0;">🧘🏻‍♂️ Ejercicios de Relajación</h3>
  
  <div style="margin:15px 0;">
    <h4 style="color:#ff6f00;margin:10px 0 5px 0;">🌬️ Respiración 4-7-8</h4>
    <p><strong>Paso 1:</strong> Inhala por la nariz contando hasta 4<br>
    <strong>Paso 2:</strong> Sostén el aire contando hasta 7<br>
    <strong>Paso 3:</strong> Exhala por la boca contando hasta 8<br>
    <em>Repite 4 veces. Calma el sistema nervioso.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#ff6f00;margin:10px 0 5px 0;">💆🏻‍♀️ Relajación Muscular Progresiva</h4>
    <p><strong>Paso 1:</strong> Tensa los músculos de los pies por 5 segundos<br>
    <strong>Paso 2:</strong> Suelta completamente y siente el alivio<br>
    <strong>Paso 3:</strong> Sube por piernas, abdomen, brazos, rostro<br>
    <em>Libera tensión acumulada en todo el cuerpo.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#ff6f00;margin:10px 0 5px 0;">🎵 Meditación de 5 Minutos</h4>
    <p><strong>Paso 1:</strong> Siéntate cómodamente, cierra los ojos<br>
    <strong>Paso 2:</strong> Enfócate en tu respiración natural<br>
    <strong>Paso 3:</strong> Cuando tu mente divague, vuelve a la respiración<br>
    <em>5 minutos pueden transformar tu día.</em></p>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
</div>`;
  }

  if (msg === "recursos_autocuidado") {
    const greeting = userName ? `¡Excelente decisión, ${userName}!` : "¡Excelente decisión!";
    return `
<div style="background:#f0f8ff;padding:15px;border-radius:10px;margin:10px 0;">
  <p>${greeting} Aquí te dejo algunas formas efectivas de autocuidado:</p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#4CAF50;margin:10px 0 5px 0;">🌱 Autocuidado Emocional</h4>
  <p><strong>Meditación:</strong> Dedica unos minutos al día para meditar y conectar contigo mismo.<br>
  <strong>Diario Personal:</strong> Escribe tus pensamientos y emociones. Esto ayuda a liberar tensiones y a conocerte mejor.</p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#2196F3;margin:10px 0 5px 0;">💪🏻 Autocuidado Físico</h4>
  <p><strong>Ejercicio Regular:</strong> Realiza actividades físicas que disfrutes (caminatas, yoga, danza).<br>
  <strong>Alimentación Saludable:</strong> Incorpora frutas y verduras en tu dieta. Esto aumenta tu energía y mejora tu estado de ánimo.</p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#7B1FA2;margin:10px 0 5px 0;">🧘🏻 Autocuidado Mental</h4>
  <p><strong>Leer un Libro:</strong> Dedica tiempo a la lectura de algo que te apasione.<br>
  <strong>Aprender Nuevas Habilidades:</strong> Inscríbete en cursos que te interesen. Esto estimula tu mente y te mantiene activo.</p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#FF6F00;margin:10px 0 5px 0;">🛁 Autocuidado de Rutina</h4>
  <p><strong>Mañana:</strong> Despierta 10 min antes, estírate, hidrátate.<br>
  <strong>Tarde:</strong> Pausa activa cada 2 horas, respira profundo.<br>
  <strong>Noche:</strong> Desconecta pantallas 1 hora antes de dormir.<br>
  <em>Los pequeños rituales diarios generan grandes cambios.</em></p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#E91E63;margin:10px 0 5px 0;">📖 Journaling Terapéutico</h4>
  <p><strong>Escribe 5 min cada día:</strong><br>
  ¿Cómo me siento hoy? • ¿Qué agradezco? • ¿Qué necesito?<br>
  <em>Escribir libera emociones guardadas y te ayuda a conocerte mejor.</em></p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#00BCD4;margin:10px 0 5px 0;">🎨 Actividades que Nutren el Alma</h4>
  <p>Leer • Dibujar • Cocinar • Caminar en naturaleza • Escuchar música • Ver una película<br>
  <em>Dedica tiempo a lo que te hace sentir vivo y conectado contigo.</em></p>
</div>

<div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
</div>`;
  }

  if (msg === "practicas_gratitud") {
    return `
<div style="background:#fff3e0;padding:20px;border-radius:12px;margin:10px 0;">
  <h3 style="color:#F57C00;margin-top:0;">🙏🏻 Prácticas de Gratitud</h3>
  
  <div style="margin:15px 0;">
    <h4 style="color:#E65100;margin:10px 0 5px 0;">📝 Diario de Gratitud</h4>
    <p><strong>Cada noche escribe:</strong><br>
    3 cosas por las que estás agradecido hoy<br>
    1 persona que te hizo sonreír<br>
    1 logro personal (por pequeño que sea)<br>
    <em>La gratitud transforma perspectivas.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#E65100;margin:10px 0 5px 0;">💌 Cartas de Aprecio</h4>
    <p><strong>Escribe una carta a:</strong><br>
    Alguien que te apoyó • Tu yo del pasado • Tu yo del futuro<br>
    <em>No hace falta enviarla, el acto de escribir sana.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#E65100;margin:10px 0 5px 0;">🧏🏻‍♂️ Momento de Apreciación</h4>
    <p><strong>Pausa y observa:</strong><br>
    La luz del sol • El sonido de la lluvia • Tu respiración<br>
    <em>La belleza está en los detalles.</em></p>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
</div>`;
  }

  if (msg === "rutinas_energia") {
    return `
<div style="background:#f3e5f5;padding:20px;border-radius:12px;margin:10px 0;">
  <h3 style="color:#7B1FA2;margin-top:0;">⚡ Rutinas de Energía Positiva</h3>
  
  <div style="margin:15px 0;">
    <h4 style="color:#6A1B9A;margin:10px 0 5px 0;">🌅 Ritual Matutino Energizante</h4>
    <p><strong>Al despertar:</strong><br>
    Estira todo el cuerpo 2 min • Bebe agua con limón<br>
    Afirmación positiva frente al espejo • Música que te active<br>
    <em>Los primeros 15 min marcan tu día.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#6A1B9A;margin:10px 0 5px 0;">💪🏻 Pausas Activas</h4>
    <p><strong>Cada 2 horas:</strong><br>
    Levántate • Estira brazos y piernas • Respira profundo 5 veces<br>
    Camina 3 min • Toma agua<br>
    <em>Recarga tu energía constantemente.</em></p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#6A1B9A;margin:10px 0 5px 0;">🎵 Playlist de Buen Humor</h4>
    <p><strong>Crea una lista con canciones que:</strong><br>
    Te hagan bailar • Te recuerden momentos felices<br>
    Te den energía • Te inspiren<br>
    <em>La música es medicina para el alma.</em></p>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
</div>`;
  }

  if (msg === "preguntas_frecuentes") {
    return `
<div style="background:#fce4ec;padding:20px;border-radius:12px;margin:10px 0;">
  <h3 style="color:#C2185B;margin-top:0;">❓ Preguntas Frecuentes sobre Bienestar</h3>
  
  <div style="margin:15px 0;">
    <h4 style="color:#AD1457;margin:10px 0 5px 0;">¿Cuánto tiempo necesito para ver cambios?</h4>
    <p>Los cambios pequeños y consistentes tienen más impacto que grandes esfuerzos esporádicos. En 21 días puedes crear un nuevo hábito.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#AD1457;margin:10px 0 5px 0;">¿Qué hago si no tengo tiempo?</h4>
    <p>Empieza con 5 minutos al día. La consistencia importa más que la duración. Integra pausas en tu rutina existente.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#AD1457;margin:10px 0 5px 0;">¿Es normal sentirse abrumado?</h4>
    <p>Totalmente normal. Elige UNA práctica. Domínala. Luego agrega otra. Avanza paso a paso, sin presión.</p>
  </div>
  
  <div style="margin:15px 0;">
    <h4 style="color:#AD1457;margin:10px 0 5px 0;">¿Cuándo buscar ayuda profesional?</h4>
    <p>Si sientes que no puedes solo, que la tristeza persiste por semanas, o si tienes pensamientos autodestructivos. No estás solo, hay apoyo disponible.</p>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:15px;">
  <button class="quick-button" data-option="momento_calma">🔙 Volver al menú</button>
  <button class="quick-button" data-option="conversar_ahora">💬 Conversar</button>
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
</div>`;
  }

  // ===================================================
  // RESPUESTA CON IA + HISTORIAL + NOMBRE + FORMATO MEJORADO
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
      userContext += `\n\n⚠️ IMPORTANTE: 
- USA SU NOMBRE "${userName}" de forma natural en tu respuesta
- Si el usuario responde "sí" o "si" en contexto de continuar conversación, NO pidas datos de nuevo
- MANTÉN la coherencia con el historial completo`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente de Colombia Noviolenta. 

REGLAS CRÍTICAS:
- MANTÉN el contexto del historial de conversación completo
- Si el usuario dice "sí" o "si" como confirmación, NO pidas datos que ya tienes
- Si ya sabes su nombre, NO lo pidas de nuevo
- Si el usuario menciona algo previo, RESPONDE basándote en ESO y en el historial
- USA EL NOMBRE "${userName}" de forma natural en tu respuesta si está disponible
- Sé empático, comprensivo y profesional
- Responde en español, breve (máximo 3-4 líneas) y amigable

FORMATO VISUAL OBLIGATORIO:
- SIEMPRE usa formato HTML visual bonito, incluso para respuestas cortas
- Envuelve tu respuesta principal en un div con fondo:
  <div style="background:#f0f8ff;padding:15px;border-radius:10px;margin:10px 0;">
    Tu respuesta aquí
  </div>

- Si das lista de pasos, técnicas o puntos, SIEMPRE usa este formato:
  <div style="margin:15px 0;">
    <h4 style="color:#4CAF50;margin:10px 0 5px 0;">🤳🏻 Título del Punto</h4>
    <p><strong>Paso 1:</strong> Descripción clara<br>
    <strong>Paso 2:</strong> Segunda acción<br>
    <em>Nota adicional en cursiva.</em></p>
  </div>

- NUNCA uses formato simple como "1.", "2.", "3."
- SIEMPRE usa títulos con emojis relevantes y colores
- Separa cada punto/sección en divs diferentes
- Usa <strong> para resaltar palabras clave
- Usa <em> para notas importantes o consejos
- Colores sugeridos: #4CAF50 (verde), #2196F3 (azul), #FF6F00 (naranja), #7B1FA2 (morado)

Ejemplo de respuesta correcta:
<div style="background:#f0f8ff;padding:15px;border-radius:10px;margin:10px 0;">
  <p>[Tu respuesta empática aquí]</p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#4CAF50;margin:10px 0 5px 0;">🌸 Primera Técnica</h4>
  <p><strong>Cómo hacerlo:</strong> Descripción paso a paso<br>
  <em>Beneficio: Por qué funciona</em></p>
</div>

<div style="margin:15px 0;">
  <h4 style="color:#2196F3;margin:10px 0 5px 0;">💡 Segunda Técnica</h4>
  <p><strong>Cómo hacerlo:</strong> Descripción paso a paso<br>
  <em>Beneficio: Por qué funciona</em></p>
</div>
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
      max_tokens: 400,
      temperature: 0.8
    });

    const aiResponse = completion.choices[0].message.content;

    // Agregar opciones de continuación
    return `${aiResponse}<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="explorar_servicios">👁‍🗨 Ver servicios</button>
  <button class="quick-button" data-option="pregunta_especifica">✍🏻 Otra pregunta</button>
  <button class="quick-button" data-option="finalizar_chat">🏁 Finalizar</button>
</div>`;

  } catch (error) {
    console.error("Error con OpenAI:", error);
    return `Gracias por tu mensaje. 💁🏻‍♂️ ¿En qué puedo ayudarte específicamente?<br><br>${getMainMenu()}`;
  }
};

export default getChatbotResponse;