// utils/intelligentResponses.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===================================================
// PROTOCOLOS DE ACOMPAÑAMIENTO PSICOLÓGICO
// ===================================================

const psychologicalProtocols = {
  suicidio: {
    keywords: ["suicidio", "suicidarme", "matarme", "morir", "acabar con mi vida", "no quiero vivir", "terminar con todo"],
    response: `
      <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:10px 0;">
        <strong>🤍 Paso 1 - Acogida humana</strong><br><br>
        Hola, gracias por confiar en este espacio. Sé que no es fácil decir lo que estás sintiendo, y valoro profundamente que estés aquí. 
        Cuando dices que quieres acabar con tu vida, eso me habla de un dolor inmenso. No estás sol@. 
        Cuéntame, ¿qué ha pasado últimamente que te hace sentir así?<br><br>
        
        <strong>💙 Paso 2 - Acompañamiento psicológico</strong><br><br>
        Gracias por abrir tu corazón. Lo que sientes es real y merece ser escuchado sin juicio. Vamos a hablarlo con calma. 
        ¿Has tenido estos pensamientos por mucho tiempo? ¿Ha pasado algo en estos días que te haya hecho sentir peor? Estoy aquí contigo.<br><br>
        
        <strong>🆘 Paso 3 - Derivación segura</strong><br><br>
        Quiero acompañarte, pero también deseo que estés a salvo. Tus pensamientos no definen tu valor. 
        Por favor comunícate <strong>ahora mismo</strong> con alguno de estos apoyos:<br><br>
        
        <button class="quick-button" data-url="tel:155">📞 Línea 155 - Policía Nacional</button>
        <button class="quick-button" data-url="tel:123">🚨 Línea 123 - Emergencias</button>
        <button class="quick-button" data-url="tel:106">💜 Línea 106 - Apoyo Psicosocial Bogotá</button>
        <button class="quick-button" data-url="https://wa.me/3007548933">💬 WhatsApp 106: 300 754 8933</button><br><br>
        
        <strong>Líneas especializadas:</strong><br>
        • Línea 122 – Fiscalía (si hay riesgo de terceros)<br>
        • Línea 01 8000 911 119 – Unidad de Víctimas<br>
        • Línea 141 – ICBF (menores de edad)<br><br>
        
        No tienes que atravesar esto sol@. 🤍
      </div>
    `
  },
  
  depresion: {
    keywords: ["depresión", "depresion", "triste", "tristeza", "solo", "sola", "vacío", "vacio", "sin ganas", "desesperanza"],
    response: `
      <div style="background:#e7f3ff;padding:15px;border-radius:8px;margin:10px 0;">
        <strong>🤍 Paso 1 - Acogida humana</strong><br><br>
        Gracias por compartir lo que sientes. La tristeza profunda no es debilidad, es una señal de que algo importante necesita atención. 
        Estás dando un paso valiente al hablar de esto. Cuéntame, ¿desde cuándo te sientes así?<br><br>
        
        <strong>💙 Paso 2 - Acompañamiento psicológico</strong><br><br>
        Lo que describes suena a una tristeza que ha estado contigo por un tiempo. Es importante que sepas que no estás sol@. 
        La depresión es real y tiene tratamiento. ¿Has podido hablar con alguien cercano sobre cómo te sientes?<br><br>
        
        <strong>🆘 Paso 3 - Apoyo profesional</strong><br><br>
        Te recomiendo buscar apoyo profesional. Aquí tienes algunas líneas:<br><br>
        
        <button class="quick-button" data-url="tel:106">💜 Línea 106 - Apoyo Psicosocial</button>
        <button class="quick-button" data-url="https://wa.me/3007548933">💬 WhatsApp 106: 300 754 8933</button>
        <button class="quick-button" data-url="https://wa.me/3117668666">🆘 Línea Salvavidas: 311 766 8666</button><br><br>
        
        <strong>Otras líneas especializadas:</strong><br>
        • Línea Púrpura (mujeres): 01 8000 112 137 / WhatsApp 300 755 1846<br>
        • Línea Diversa (LGBTI): WhatsApp 310 864 4214<br>
        • Línea 155 si necesitas apoyo inmediato<br><br>
        
        Mereces sentirte mejor. 💙
      </div>
    `
  },
  
  ira: {
    keywords: ["ira", "rabia", "enojo", "coraje", "furioso", "furiosa", "violento", "violenta", "explotar"],
    response: `
      <div style="background:#ffe7e7;padding:15px;border-radius:8px;margin:10px 0;">
        <strong>🤍 Paso 1 - Acogida humana</strong><br><br>
        Hola. Gracias por buscar apoyo. La ira suele aparecer cuando algo nos hiere, nos agota o sentimos una injusticia profunda. 
        Tu emoción es válida. Cuéntame, ¿qué está pasando que te está generando tanta rabia?<br><br>
        
        <strong>💙 Paso 2 - Acompañamiento psicológico</strong><br><br>
        Estoy contigo. La ira puede cubrir tristeza, frustración o cansancio emocional. 
        ¿Te has sentido así desde hace cuánto? ¿Qué situación te detonó hoy?<br><br>
        
        <strong>🆘 Paso 3 - Derivación segura</strong><br><br>
        Si la ira viene acompañada de violencia recibida o riesgo, por favor comunícate con:<br><br>
        
        <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
        <button class="quick-button" data-url="tel:122">⚖️ 122 - Fiscalía</button>
        <button class="quick-button" data-url="tel:018000112518">💼 Ministerio de Trabajo: 01 8000 112 518</button><br><br>
        
        Mereces protección y un espacio seguro. 🤍
      </div>
    `
  },
  
  miedo: {
    keywords: ["miedo", "temor", "pánico", "panico", "terror", "amenaza", "peligro", "asustado", "asustada"],
    response: `
      <div style="background:#fff8e7;padding:15px;border-radius:8px;margin:10px 0;">
        <strong>🤍 Paso 1 - Acogida humana</strong><br><br>
        Gracias por escribir. El miedo no es debilidad; es tu cuerpo intentando protegerte. 
        Aquí puedes hablar sin juicio. ¿Qué situación te ha generado este miedo tan fuerte?<br><br>
        
        <strong>💙 Paso 2 - Acompañamiento psicológico</strong><br><br>
        Entiendo. El miedo puede ser por amenazas, recuerdos dolorosos o situaciones inseguras. 
        ¿Este miedo viene de alguien, de algún lugar o de algo que te ha pasado últimamente?<br><br>
        
        <strong>🆘 Paso 3 - Derivación segura</strong><br><br>
        Si tu miedo está relacionado con un riesgo real, te recomiendo comunicarte con:<br><br>
        
        <button class="quick-button" data-url="tel:123">🚨 123 - Emergencias</button>
        <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
        <button class="quick-button" data-url="tel:018000911119">🛡️ Unidad de Víctimas: 01 8000 911 119</button><br><br>
        
        Tu seguridad es lo primero. 🤍
      </div>
    `
  },
  
  frustracion: {
    keywords: ["frustración", "frustracion", "frustrado", "frustrada", "impotencia", "cansado", "cansada", "agotado", "agotada"],
    response: `
      <div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:10px 0;">
        <strong>🤍 Paso 1 - Acogida humana</strong><br><br>
        Hola. Gracias por compartir lo que sientes. La frustración aparece cuando damos todo y aun así nada cambia. 
        No estás sol@. Cuéntame, ¿qué fue eso que te hizo sentir así hoy?<br><br>
        
        <strong>💙 Paso 2 - Acompañamiento psicológico</strong><br><br>
        Te entiendo. La frustración puede venir del trabajo, la familia, estudios o procesos personales. 
        ¿Sientes que has estado cargando demasiado?<br><br>
        
        <strong>🆘 Paso 3 - Derivación segura</strong><br><br>
        Si tu frustración está siendo causada por violencia laboral, psicológica o una vulneración de derechos, comunícate con:<br><br>
        
        <button class="quick-button" data-url="tel:018000112518">💼 Ministerio de Trabajo: 01 8000 112 518</button>
        <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
        <button class="quick-button" data-url="tel:122">⚖️ 122 - Fiscalía</button><br><br>
        
        Mereces apoyo real. 🤍
      </div>
    `
  }
};

// ===================================================
// FUNCIÓN PARA DETECTAR Y DAR APOYO PSICOLÓGICO
// ===================================================

function detectPsychologicalNeed(message) {
  const msg = message.toLowerCase();
  
  for (const [key, protocol] of Object.entries(psychologicalProtocols)) {
    if (protocol.keywords.some(keyword => msg.includes(keyword))) {
      return {
        detected: true,
        type: key,
        response: protocol.response
      };
    }
  }
  
  return { detected: false };
}

// ===================================================
// FUNCIÓN PRINCIPAL DE RESPUESTAS
// ===================================================

export const getChatbotResponse = async (
  message,
  sessionContext = {},
  conversationHistory = []
) => {
  const msg = message.toLowerCase().trim();

  // ===================================================
  // 🚨 PRIORIDAD: DETECTAR NECESIDAD PSICOLÓGICA
  // ===================================================
  
  const psychNeed = detectPsychologicalNeed(message);
  
  if (psychNeed.detected) {
    return `${psychNeed.response}<br><br>
<div style="margin-top:20px;padding:10px;background:#f9f9f9;border-radius:8px;">
  <strong>¿Qué deseas hacer ahora?</strong><br><br>
  <button class="quick-button" data-option="continuar_conversacion">💬 Continuar conversación</button>
  <button class="quick-button" data-option="finalizar_conversacion">✅ Finalizar y calificar</button>
</div>`;
  }

  // ===================================================
  // MANEJO DE OPCIONES POST-APOYO PSICOLÓGICO
  // ===================================================
  
  if (msg === "continuar_conversacion") {
    return `Perfecto 😊 ¿En qué más puedo ayudarte?<br><br>
<strong>1.</strong> 🎵 Talleres y eventos<br>
<strong>2.</strong> 📋 Servicios de Colombia Noviolenta<br>
<strong>3.</strong> 🤝 Voluntariado y donaciones<br>
<strong>4.</strong> 📖 Recursos educativos<br>
<strong>5.</strong> 📞 Contacto y ubicación<br><br>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <button class="quick-button" data-option="opcion_1">1️⃣ Talleres</button>
  <button class="quick-button" data-option="opcion_2">2️⃣ Servicios</button>
  <button class="quick-button" data-option="opcion_3">3️⃣ Voluntariado</button>
  <button class="quick-button" data-option="opcion_4">4️⃣ Recursos</button>
  <button class="quick-button" data-option="opcion_5">5️⃣ Contacto</button>
</div>`;
  }
  
  if (msg === "finalizar_conversacion") {
    return `Gracias por confiar en Colombia Noviolenta. 🤍<br><br>
Tu bienestar es importante. Recuerda que siempre puedes volver si necesitas apoyo.<br><br>
<strong>¿Cómo calificarías nuestra atención?</strong><br><br>
<div style="display:flex;gap:10px;">
  <button class="quick-button" data-option="calificar_excelente">⭐⭐⭐⭐⭐ Excelente</button>
  <button class="quick-button" data-option="calificar_buena">⭐⭐⭐⭐ Buena</button>
  <button class="quick-button" data-option="calificar_regular">⭐⭐⭐ Regular</button>
</div>`;
  }
  
  if (msg.includes("calificar_")) {
    const rating = msg.replace("calificar_", "");
    return `¡Gracias por tu calificación! (${rating}) 🌟<br><br>
Tu opinión nos ayuda a mejorar. La no violencia no es pasividad, es una fuerza activa que transforma sin destruir.<br><br>
¡Hasta pronto! 💚`;
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
  // BOTONES DE SERVICIOS
  // ===================================================

  const serviceResponses = {
    "boletas_concierto":
      "🎵 ¡Genial! Puedes adquirir tus boletas para nuestros conciertos haciendo clic en el botón. Encontrarás fechas, lugares y precios disponibles.",
    "compras_tienda":
      "🛒 ¡Excelente elección! En nuestra tienda encontrarás productos oficiales de Colombia Noviolenta. Cada compra apoya nuestra causa por la paz.",
    "adquirir_servicios":
      "📋 Ofrecemos diversos servicios de formación, talleres y acompañamiento en cultura de paz y resolución de conflictos. Explora nuestras opciones.",
    "voluntariado":
      "🤝 ¡Qué maravilloso que quieras ser parte del cambio! En nuestro programa de voluntariado podrás contribuir activamente a construir una Colombia más pacífica.",
    "donaciones":
      "💝 Tu generosidad hace la diferencia. Cada donación nos ayuda a seguir trabajando por la paz y la noviolencia en Colombia. ¡Gracias por tu apoyo!",
    "cartilla":
      "📖 Nuestra cartilla es una herramienta educativa sobre noviolencia y resolución pacífica de conflictos. Descárgala y compártela."
  };

  if (serviceResponses[msg]) return serviceResponses[msg];

  // ===================================================
  // OPCIONES NUMERADAS (MENÚ)
  // ===================================================

  if (
    msg.includes("ayuda") ||
    msg.includes("opciones") ||
    msg.includes("qué puedes") ||
    msg.includes("que puedes") ||
    msg.includes("menu") ||
    msg.includes("menú")
  ) {
    return `¡Claro! Puedo ayudarte con:<br><br>
<strong>1.</strong> 🎵 Talleres y eventos<br>
<strong>2.</strong> 📋 Servicios de Colombia Noviolenta<br>
<strong>3.</strong> 🤝 Voluntariado y donaciones<br>
<strong>4.</strong> 📖 Recursos educativos<br>
<strong>5.</strong> 📞 Contacto y ubicación<br><br>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <button class="quick-button" data-option="opcion_1">1️⃣ Talleres</button>
  <button class="quick-button" data-option="opcion_2">2️⃣ Servicios</button>
  <button class="quick-button" data-option="opcion_3">3️⃣ Voluntariado</button>
  <button class="quick-button" data-option="opcion_4">4️⃣ Recursos</button>
  <button class="quick-button" data-option="opcion_5">5️⃣ Contacto</button>
</div><br>
✍️ También puedes escribir el número de la opción.`;
  }

  // Manejo de opciones numéricas
  if (msg === "1" || msg === "opcion_1") {
    return `🎵 Tenemos próximos talleres y eventos culturales:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`;
  }

  if (msg === "2" || msg === "opcion_2") {
    return `📋 Ofrecemos varios servicios:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver todos los servicios</button>`;
  }

  if (msg === "3" || msg === "opcion_3") {
    return `🤝 ¡Nos encantaría contar contigo!<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝 Voluntariado</button>
<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Donar</button>`;
  }

  if (msg === "4" || msg === "opcion_4") {
    return `📖 Recursos educativos disponibles:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar cartilla</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`;
  }

  if (msg === "5" || msg === "opcion_5") {
    return `📞 Puedes contactarnos a través de:<br><br>
<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Sitio web</button>`;
  }

  // ===================================================
  // PALABRAS CLAVE ESPECÍFICAS
  // ===================================================

  if (msg.includes("concierto") || msg.includes("boleta") || msg.includes("evento")) {
    return `🎵 Tenemos próximos conciertos y eventos culturales:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos</button>`;
  }

  if (msg.includes("tienda") || msg.includes("comprar") || msg.includes("producto")) {
    return `🛒 En nuestra tienda oficial encontrarás productos que apoyan la causa:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`;
  }

  if (msg.includes("taller") || msg.includes("formación") || msg.includes("curso")) {
    return `📚 Ofrecemos talleres en cultura de paz y resolución de conflictos:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`;
  }

  if (msg.includes("voluntario") || msg.includes("ayudar") || msg.includes("colaborar")) {
    return `🤝 ¡Nos encantaría contar contigo!<br><br>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">🤝 Inscribirme</button>`;
  }

  if (msg.includes("donar") || msg.includes("donación") || msg.includes("apoyo")) {
    return `💝 Tu apoyo es fundamental:<br><br>
<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Donar ahora</button>`;
  }

  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("guía")) {
    return `📖 Nuestra cartilla educativa está disponible:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar</button>`;
  }

  if (msg.includes("contacto") || msg.includes("teléfono") || msg.includes("email")) {
    return `📞 Puedes contactarnos a través de:<br><br>
<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>`;
  }

  if ((msg.includes("donde") || msg.includes("ubicación") || msg.includes("dirección")) && !msg.includes("tienda")) {
    return `📍 Estamos ubicados en Medellín, Barrio Boston, Colombia:<br><br>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta/about">📍 Ver ubicación</button>`;
  }

  if (msg.includes("horario") || msg.includes("abierto") || msg.includes("atiende")) {
    return `🕐 Nuestro horario de atención es:<br>
- <strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM<br>
- <strong>Sábados:</strong> 9:00 AM - 2:00 PM<br>
- <strong>Domingos:</strong> Cerrado<br><br>
💬 Este chat está disponible 24/7.`;
  }

  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("hey")) {
    const greeting = sessionContext.name ? `¡Hola ${sessionContext.name}! 👋` : "¡Hola! 👋";
    return `${greeting} Bienvenido a Colombia Noviolenta. ¿En qué puedo ayudarte hoy?`;
  }

  if (msg.includes("recuerdas") && (msg.includes("nombre") || msg.includes("llamo"))) {
    if (sessionContext.name) {
      return `¡Claro que sí! Te llamas <strong>${sessionContext.name}</strong> 😊 ¿En qué puedo ayudarte?`;
    } else {
      return `Aún no me has dicho tu nombre 😊 ¿Cómo te gustaría que te llame?`;
    }
  }

  if (msg.includes("gracias")) {
    return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme.";
  }

  if (msg.includes("adiós") || msg.includes("adios") || msg.includes("chao") || msg.includes("hasta luego")) {
    return "¡Hasta pronto! 👋 Recuerda que siempre puedes volver si necesitas algo más.";
  }

  if (msg.includes("llama") || msg.includes("nombre") || msg.includes("organizacion") || msg.includes("quien")) {
    return `🌱 Somos <strong>Colombia Noviolenta</strong>, una organización dedicada a la construcción de paz:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Conocer más</button>`;
  }

  if (msg.includes("redes") || msg.includes("social") || msg.includes("instagram") || msg.includes("facebook")) {
    return `📱 Síguenos en nuestras redes:<br><br>
<button class="quick-button" data-url="https://www.instagram.com/colombianoviolenta">📷 Instagram</button>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">📘 Facebook</button>
<button class="quick-button" data-url="https://www.tiktok.com/@colombianoviolenta">🎵 TikTok</button>
<button class="quick-button" data-url="https://www.youtube.com/@parrapapandi">📺 YouTube</button>`;
  }

  // ===================================================
  // RESPUESTA CON IA + HISTORIAL
  // ===================================================

  try {
    const messageHistory = conversationHistory.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.replace(/<[^>]*>/g, "")
    }));

    let userContext = "";
    if (sessionContext.name) {
      userContext = `\n\nCONTEXTO DEL USUARIO:\n- Nombre: ${sessionContext.name}`;
      if (sessionContext.phone) userContext += `\n- Teléfono: ${sessionContext.phone}`;
      if (sessionContext.authorized) userContext += `\n- Usuario registrado`;
      userContext += `\n\nUSA SU NOMBRE cuando sea natural, NO en cada mensaje.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente de Colombia Noviolenta. 

REGLAS CRÍTICAS:
- NO saludes con "Hola [nombre]" si ya hay conversación en curso
- MANTÉN contexto de mensajes anteriores
- Si preguntan "¿cómo?" responde en base a tu mensaje ANTERIOR
- Responde en español, breve (máximo 3-4 líneas) y amigable
- Si mencionas URLs, usa botones: <button class="quick-button" data-url="URL">TEXTO</button>

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
      max_tokens: 300,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error con OpenAI:", error);
    return `Gracias por tu mensaje. 😊 ¿En qué puedo ayudarte específicamente?`;
  }
};

export default getChatbotResponse;