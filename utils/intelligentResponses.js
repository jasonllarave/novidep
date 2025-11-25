// utils/intelligentResponses.js
import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Función principal que genera respuestas inteligentes del chatbot
 * @param {string} message - Mensaje del usuario o clave de contexto
 * @returns {Promise<string>} - Respuesta del chatbot en HTML
 */
export const getChatbotResponse = async (message, sessionContext = {}) => {
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

  // Buscar respuesta de contexto exacta
  if (contextResponses[msg]) {
    return contextResponses[msg];
  }

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

  if (serviceResponses[msg]) {
    return serviceResponses[msg];
  }

  // ===================================================
  // RESPUESTAS BASADAS EN PALABRAS CLAVE CON BOTONES
  // ===================================================

  // Conciertos / Eventos / Boletas
  if (msg.includes("concierto") || msg.includes("boleta") || msg.includes("evento") || msg.includes("show")) {
    return `🎵 Tenemos próximos conciertos y eventos culturales:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver eventos y boletas</button>`;
  }

  // Tienda / Compras / Productos
  if (msg.includes("tienda") || msg.includes("comprar") || msg.includes("producto") || msg.includes("merchandising")) {
    return `🛒 En nuestra tienda oficial encontrarás merchandising, libros y productos que apoyan la causa de la noviolencia:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`;
  }

  // Ubicación tienda física
  if ((msg.includes("donde") || msg.includes("dónde")) && (msg.includes("tienda") || msg.includes("queda"))) {
    return `📍 Puedes visitar nuestra tienda online:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Visitar tienda</button><br><br>
Para eventos presenciales, visita nuestros conciertos y ferias donde también vendemos productos.`;
  }

  // Talleres / Formación / Cursos
  if (msg.includes("taller") || msg.includes("formación") || msg.includes("formacion") || msg.includes("curso") || msg.includes("capacitación") || msg.includes("capacitacion")) {
    return `📚 Ofrecemos talleres y formaciones en cultura de paz, resolución de conflictos, comunicación noviolenta y manejo de emociones:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver servicios</button>`;
  }

  // Voluntariado / Ayudar / Colaborar
  if (msg.includes("voluntario") || msg.includes("ayudar") || msg.includes("colaborar") || msg.includes("unirme") || msg.includes("participar")) {
    return `🤝 ¡Nos encantaría contar contigo! Puedes unirte a nuestro equipo de voluntarios:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝 Inscribirme como voluntario</button>`;
  }

  // Donaciones / Apoyo / Contribuir
  if (msg.includes("donar") || msg.includes("donación") || msg.includes("donacion") || msg.includes("apoyar") || msg.includes("contribuir") || msg.includes("apoyo")) {
    return `💝 Tu apoyo es fundamental para continuar nuestro trabajo:<br><br>
<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Hacer una donación</button>`;
  }

  // Cartilla / Material educativo
  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("educativo") || msg.includes("guía") || msg.includes("guia") || msg.includes("recurso")) {
    return `📖 Nuestra cartilla educativa está disponible para descarga gratuita:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar cartilla</button>`;
  }

  // Contacto / Comunicación
  if (msg.includes("contacto") || msg.includes("comunicar") || msg.includes("hablar") || msg.includes("teléfono") || msg.includes("telefono") || msg.includes("correo") || msg.includes("email")) {
    return `📞 Puedes contactarnos a través de:<br><br>
<button class="quick-button" data-url="https://wa.me/573157902761">💬 WhatsApp</button>
<button class="quick-button" data-url="mailto:info@colombianoviolenta.org">📧 Email</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Sitio web</button>`;
  }

  // Links / URLs / Página
  if (msg.includes("link") || msg.includes("url") || msg.includes("página") || msg.includes("pagina") || msg.includes("sitio") || msg.includes("web")) {
    return `🌐 Nuestra página oficial es:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Visitar sitio web</button>`;
  }

  // Servicios generales
  if (msg.includes("servicio") || msg.includes("ofrece") || msg.includes("ofrecen") || msg.includes("hace") || msg.includes("hacen")) {
    return `🌟 Ofrecemos talleres de paz, formación en resolución de conflictos, eventos culturales, recursos educativos y más:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver todos los servicios</button>`;
  }

  // "cuales son" para servicios
  if ((msg.includes("cuales") || msg.includes("cuáles") || msg.includes("que")) && msg.includes("servicio")) {
    return `🌟 Ofrecemos varios servicios:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver servicios</button>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/talleres/">📚 Ver talleres</button>`;
  }

  // Horarios
  if (msg.includes("horario") || msg.includes("hora") || msg.includes("abierto") || msg.includes("atiende") || msg.includes("disponible")) {
    return `🕐 Nuestro horario de atención es:<br><br>
• <strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM<br>
• <strong>Sábados:</strong> 9:00 AM - 2:00 PM<br>
• <strong>Domingos:</strong> Cerrado<br><br>
💬 Este chat está disponible 24/7 para ayudarte.`;
  }

  // Ubicación / Dirección
  if ((msg.includes("ubicación") || msg.includes("ubicacion") || msg.includes("dirección") || msg.includes("direccion") || msg.includes("donde") || msg.includes("dónde") || msg.includes("quedan")) && !msg.includes("tienda")) {
    return `📍 Estamos ubicados en Bogotá, Colombia:<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/contacto/">📍 Ver ubicación</button><br><br>
Para conocer la dirección exacta de nuestros eventos y talleres, visita nuestra página web.`;
  }

  // Precios / Costos
  if (msg.includes("precio") || msg.includes("costo") || msg.includes("valor") || msg.includes("cuánto") || msg.includes("cuanto") || msg.includes("pagar")) {
    return `💰 Los precios varían según el servicio o producto:<br>
• Algunos talleres y recursos son <strong>gratuitos</strong><br>
• Consultas y cursos tienen tarifas accesibles<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">💰 Ver precios</button>`;
  }

  // Paz / Noviolencia
  if (msg.includes("paz") || msg.includes("noviolencia") || msg.includes("noviolenta") || msg.includes("violencia") || msg.includes("conflicto")) {
    return `🕊️ Colombia Noviolenta trabaja por la construcción de una cultura de paz a través de la educación, el arte y la transformación social.<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🕊️ Conocer más</button>`;
  }

  // Saludos
  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("buenas") || msg.includes("hey") || msg.includes("saludos")) {
    return "¡Hola! 👋 Bienvenido a Colombia Noviolenta. ¿En qué puedo ayudarte hoy?";
  }

  // Agradecimientos
  if (msg.includes("gracias") || msg.includes("thank") || msg.includes("agradezco")) {
    return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme.";
  }

  // Despedidas
  if (msg.includes("adiós") || msg.includes("adios") || msg.includes("chao") || msg.includes("hasta luego") || msg.includes("bye")) {
    return "¡Hasta pronto! 👋 La no violencia no es pasividad, es una fuerza activa que transforma sin destruir. Recuerda que siempre puedes volver si necesitas algo más.";
  }

  // Nombre de la organización
if (msg.includes("llama") || msg.includes("nombre") || msg.includes("organizacion") || msg.includes("organización") || msg.includes("quien") || msg.includes("quién")) {
  return `🌱 Somos <strong>Colombia Noviolenta</strong>, una organización dedicada a la construcción de paz y cultura noviolenta en Colombia a través de la educación, el arte y la transformación social.<br><br>
<button class="quick-button" data-url="https://www.colombianoviolenta.org">🌐 Conocer más sobre nosotros</button>`;
}

  // Ayuda
  if (msg.includes("ayuda") || msg.includes("help") || msg.includes("opciones") || msg.includes("qué puedes hacer") || msg.includes("que puedes hacer")) {
    return `¡Claro! Puedo ayudarte con:<br>
• 🎵 Información sobre talleres y eventos<br>
• 📋 Servicios de Colombia Noviolenta<br>
• 🤝 Voluntariado y donaciones<br>
• 📖 Recursos educativos<br>
• 📞 Contacto y ubicación<br><br>
¿Qué te interesa?`;
  }

  // Redes sociales
  if (msg.includes("redes") || msg.includes("social") || msg.includes("instagram") || msg.includes("facebook") || msg.includes("tiktok") || msg.includes("youtube")) {
    return `📱 Síguenos en nuestras redes sociales:<br><br>
<button class="quick-button" data-url="https://www.instagram.com/colombianoviolenta">📷 Instagram</button>
<button class="quick-button" data-url="https://www.facebook.com/ColombiaNoviolenta">📘 Facebook</button>
<button class="quick-button" data-url="https://www.tiktok.com/@colombianoviolenta">🎵 TikTok</button>
<button class="quick-button" data-url="https://www.youtube.com/@parrapapandi">📺 YouTube</button>`;
  }

   // ===================================================
  try {
    // Construir contexto del usuario
    let userContext = "";
    if (sessionContext.name) {
      userContext = `\n\nCONTEXTO DEL USUARIO:\n- Nombre: ${sessionContext.name}`;
      if (sessionContext.phone) {
        userContext += `\n- Teléfono: ${sessionContext.phone}`;
      }
      if (sessionContext.authorized) {
        userContext += `\n- Usuario registrado y autorizado`;
      }
      userContext += `\n\nUSA SU NOMBRE cuando sea natural en la conversación.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente virtual de Colombia Noviolenta, una organización dedicada a la construcción de paz en Colombia.

INFORMACIÓN CLAVE:
- Organización: Colombia Noviolenta
- Servicios: Talleres de paz, formación en resolución de conflictos, eventos culturales, voluntariado
- Sitio web: www.colombianoviolenta.org
- WhatsApp: +57 315 790 27 61
- Email: info@colombianoviolenta.org
- Tienda: www.colombianoviolenta.org/tienda/
- Conciertos: www.colombianoviolenta.org/conciertos/
- Donaciones: donorbox.org/colombianoviolenta
- Ubicación: Bogotá, Colombia

INSTRUCCIONES:
- Responde en español, amigable y breve (máximo 3-4 líneas)
- Incluye emojis apropiados
- Si mencionas URLs, usa botones HTML: <button class="quick-button" data-url="URL">TEXTO</button>
- Enfócate en paz, noviolencia y resolución de conflictos
- Si no sabes algo, recomienda contactar por WhatsApp o web${userContext}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error("Error con OpenAI:", error);

  // ===================================================
  // RESPUESTA POR DEFECTO
  // ===================================================
  
  return `Gracias por tu mensaje. 😊 Actualmente puedo ayudarte con información sobre:<br><br>
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