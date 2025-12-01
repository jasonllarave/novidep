// utils/intelligentResponses.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const getChatbotResponse = async (
  message,
  sessionContext = {},
  conversationHistory = []
) => {
  const msg = message.toLowerCase().trim();

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
    msg.includes("qué tienes") ||
    msg.includes("que tienes") ||
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
  <button class="quick-button" data-option="opcion_3">3️⃣ Facebook</button>
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

  // Conciertos / Eventos
  if (msg.includes("concierto") || msg.includes("boleta") || msg.includes("evento")) {
    return `🎵 Tenemos próximos conciertos y eventos culturales:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos</button>`;
  }

  // Tienda
  if (msg.includes("tienda") || msg.includes("comprar") || msg.includes("producto")) {
    return `🛒 En nuestra tienda oficial encontrarás productos que apoyan la causa:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`;
  }

  // Talleres
  if (msg.includes("taller") || msg.includes("formación") || msg.includes("curso")) {
    return `📚 Ofrecemos talleres en cultura de paz y resolución de conflictos:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`;
  }

  // Voluntariado
  if (msg.includes("Contacto") || msg.includes("ayudar") || msg.includes("colaborar")) {
    return `🤝 ¡Nos encantaría contar contigo!<br><br>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta?rdid=dH7UXi7xJG4NMxVK&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17FZ34Egt8%2F">🤝 Inscribirme</button>`;
  }

  // Donaciones
  if (msg.includes("donar") || msg.includes("donación") || msg.includes("apoyo")) {
    return `💝 Tu apoyo es fundamental:<br><br>
<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Donar ahora</button>`;
  }

  // Cartilla
  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("guía")) {
    return `📖 Nuestra cartilla educativa está disponible:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar</button>`;
  }

  // Contacto
  if (msg.includes("contacto") || msg.includes("teléfono") || msg.includes("email")) {
    return `📞 Puedes contactarnos a través de:<br><br>
<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>`;
  }

  // Ubicación
  if ((msg.includes("donde") || msg.includes("ubicación") || msg.includes("dirección")) && !msg.includes("tienda")) {
    return `📍 Estamos ubicados en Medellín, Barrio Boston, Colombia:<br><br>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta/about">📍 Ver ubicación</button>`;
  }

  // Horarios
  if (msg.includes("horario") || msg.includes("abierto") || msg.includes("atiende")) {
    return `🕐 Nuestro horario de atención es:<br>
- <strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM<br>
- <strong>Sábados:</strong> 9:00 AM - 2:00 PM<br>
- <strong>Domingos:</strong> Cerrado<br><br>
💬 Este chat está disponible 24/7.`;
  }

  // Saludos
  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("hey")) {
    const greeting = sessionContext.name ? `¡Hola ${sessionContext.name}! 👋` : "¡Hola! 👋";
    return `${greeting} Bienvenido a Colombia Noviolenta. ¿En qué puedo ayudarte hoy?`;
  }

  // Recordar nombre
  if (msg.includes("recuerdas") && (msg.includes("nombre") || msg.includes("llamo"))) {
    if (sessionContext.name) {
      return `¡Claro que sí! Te llamas <strong>${sessionContext.name}</strong> 😊 ¿En qué puedo ayudarte?`;
    } else {
      return `Aún no me has dicho tu nombre 😊 ¿Cómo te gustaría que te llame?`;
    }
  }

  // Agradecimientos
  if (msg.includes("gracias")) {
    return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme.";
  }

  // Despedidas
  if (msg.includes("adiós") || msg.includes("adios") || msg.includes("chao") || msg.includes("hasta luego")) {
    return "¡Hasta pronto! 👋 Recuerda que siempre puedes volver si necesitas algo más.";
  }

  // Nombre organización
  if (msg.includes("llama") || msg.includes("nombre") || msg.includes("organizacion") || msg.includes("quien")) {
    return `🌱 Somos <strong>Colombia Noviolenta</strong>, una organización dedicada a la construcción de paz:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Conocer más</button>`;
  }

  // Redes sociales
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
      userContext += `\n\nUSA SU NOMBRE cuando sea natural.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente de Colombia Noviolenta. Usa el historial para mantener coherencia. Responde en español, breve (máximo 3 líneas) y amigable.

INFORMACIÓN CLAVE:
- Organización: Colombia Noviolenta
- Servicios: Talleres, eventos, contacto, donaciones
- Sitio: www.colombianoviolenta.org
- WhatsApp: +57 315 790 27 61

${userContext}

Si mencionas URLs, usa botones: <button class="quick-button" data-url="URL">TEXTO</button>`
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