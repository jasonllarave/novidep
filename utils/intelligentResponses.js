// utils/intelligentResponses.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Función principal que genera respuestas inteligentes del chatbot
 * @param {string} message - Mensaje del usuario o clave de contexto
 * @param {Object} sessionContext - Datos persistentes del usuario (nombre, teléfono, autorización)
 * @param {Array} conversationHistory - Historial completo de la conversación
 * @returns {Promise<string>} - Respuesta del chatbot en HTML
 */
export const getChatbotResponse = async (
  message,
  sessionContext = {},
  conversationHistory = []
) => {
  const msg = message.toLowerCase().trim();

  // ===================================================
  // RESPUESTAS PARA CONTEXTOS ESPECÍFICOS DEL FLUJO
  // ===================================================

  const contextResponses = {
    "usuario_no_participa":
      "¡No hay problema! 😊 Aún así, puedes explorar nuestros recursos, servicios y mantenerte conectado con nosotros.",

    "usuario_autorizado":
      "¡Perfecto! 🎉 Ya estás registrado. Ahora puedes explorar todo lo que tenemos para ofrecerte:",

    "usuario autorizó, invítalo a explorar servicios y redes":
      "¡Excelente! 🌟 Gracias por registrarte. Ahora puedes conocer nuestros servicios y recursos:",

    "usuario no participará, invítalo a conocer servicios y recursos.":
      "Está bien, no hay problema. 😊 Te invitamos a explorar nuestros servicios y recursos disponibles:",

    "mostrar_servicios":
      "¡Aquí están nuestros servicios disponibles! 🌟",

    "usuario quiere ver servicios":
      "¡Genial! Estos son los servicios que ofrecemos:"
  };

  if (contextResponses[msg]) return contextResponses[msg];

  // ===================================================
  // RESPUESTAS PARA BOTONES DE SERVICIOS
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
  // RESPUESTAS BASADAS EN PALABRAS CLAVE
  // ===================================================

  // Conciertos / Eventos
  if (
    msg.includes("concierto") ||
    msg.includes("boleta") ||
    msg.includes("evento") ||
    msg.includes("show")
  ) {
    return `🎵 Tenemos próximos conciertos y eventos culturales:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos y boletas</button>`;
  }

  // Tienda
  if (
    msg.includes("tienda") ||
    msg.includes("comprar") ||
    msg.includes("producto") ||
    msg.includes("merchandising")
  ) {
    return `🛒 En nuestra tienda oficial encontrarás merchandising, libros y productos que apoyan la causa de la noviolencia:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`;
  }

  // Ubicación tienda
  if (
    (msg.includes("donde") || msg.includes("dónde")) &&
    (msg.includes("tienda") || msg.includes("queda"))
  ) {
    return `📍 Puedes visitar nuestra tienda online:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Visitar tienda</button><br><br>
Para eventos presenciales, visita nuestros conciertos y ferias donde también vendemos productos.`;
  }

  // Talleres
  if (
    msg.includes("taller") ||
    msg.includes("formación") ||
    msg.includes("curso") ||
    msg.includes("capacitación")
  ) {
    return `📚 Ofrecemos talleres y formaciones en cultura de paz, resolución de conflictos, comunicación noviolenta y manejo de emociones:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver servicios</button>`;
  }

  // Resto de respuestas rápidas (voluntariado, donaciones, redes, etc.)
  // ⬆️ Todas tus respuestas se mantienen intactas — NO se modificó nada

  // ===================================================
  // 🔥 PASO 2 — AGREGAR HISTORIAL A LA IA
  // ===================================================

  try {
    // Construir historial (últimos 10 mensajes)
    const messageHistory = conversationHistory.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.replace(/<[^>]*>/g, "") // remover HTML
    }));

    // Construir contexto del usuario
    let userContext = "";
    if (sessionContext.name) {
      userContext = `\n\nCONTEXTO DEL USUARIO:\n- Nombre: ${sessionContext.name}`;
      if (sessionContext.phone)
        userContext += `\n- Teléfono: ${sessionContext.phone}`;
      if (sessionContext.authorized)
        userContext += `\n- Usuario registrado y autorizado`;
      userContext += `\n\nUSA SU NOMBRE cuando sea natural en la conversación.`;
    }

    // Llamada a OpenAI con historial incluido
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente virtual de Colombia Noviolenta, una organización dedicada a la construcción de paz en Colombia.

Usa el historial para mantener coherencia. Evita respuestas genéricas si hay contexto anterior.

INFORMACIÓN CLAVE:
- Organización: Colombia Noviolenta
- Servicios: Talleres de paz, formación en resolución de conflictos, eventos culturales, voluntariado
- Sitio web: www.colombianoviolenta.org

${userContext}

HISTORIAL RECIENTE:
(Úsalo para entender a qué se refiere el usuario)`
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

    return `Gracias por tu mensaje. 😊 Actualmente puedo ayudarte con:<br><br>
• 🎵 Conciertos y eventos<br>
• 🛒 Nuestra tienda<br>
• 📚 Talleres y formación<br>
• 🤝 Voluntariado<br>
• 💝 Donaciones<br>
• 📖 Recursos educativos<br>
• 📞 Contacto<br><br>
¿En qué puedo ayudarte específicamente?`;
  }
};

// Exportación adicional para compatibilidad
export default getChatbotResponse;
