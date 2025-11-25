// utils/intelligentResponses.js

/**
 * Función principal que genera respuestas inteligentes del chatbot
 * @param {string} message - Mensaje del usuario o clave de contexto
 * @returns {Promise<string>} - Respuesta del chatbot en HTML
 */
export const getChatbotResponse = async (message) => {
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
  // RESPUESTAS BASADAS EN PALABRAS CLAVE
  // ===================================================

  // Conciertos / Eventos / Boletas
  if (msg.includes("concierto") || msg.includes("boleta") || msg.includes("evento") || msg.includes("show")) {
    return "🎵 Tenemos próximos conciertos y eventos culturales. Puedes ver las fechas y adquirir boletas en nuestra página oficial. ¡Te esperamos!";
  }

  // Tienda / Compras / Productos
  if (msg.includes("tienda") || msg.includes("comprar") || msg.includes("producto") || msg.includes("merchandising")) {
    return "🛒 En nuestra tienda oficial encontrarás merchandising, libros y productos que apoyan la causa de la noviolencia. ¡Cada compra hace la diferencia!";
  }

  // Talleres / Formación / Cursos
  if (msg.includes("taller") || msg.includes("formación") || msg.includes("formacion") || msg.includes("curso") || msg.includes("capacitación") || msg.includes("capacitacion")) {
    return "📚 Ofrecemos talleres y formaciones en cultura de paz, resolución de conflictos, comunicación noviolenta y manejo de emociones. ¿Te gustaría conocer más?";
  }

  // Voluntariado / Ayudar / Colaborar
  if (msg.includes("voluntario") || msg.includes("ayudar") || msg.includes("colaborar") || msg.includes("unirme") || msg.includes("participar")) {
    return "🤝 ¡Nos encantaría contar contigo! Puedes unirte a nuestro equipo de voluntarios y ser parte activa del cambio hacia una Colombia más pacífica.";
  }

  // Donaciones / Apoyo / Contribuir
  if (msg.includes("donar") || msg.includes("donación") || msg.includes("donacion") || msg.includes("apoyar") || msg.includes("contribuir") || msg.includes("apoyo")) {
    return "💝 Tu apoyo es fundamental para continuar nuestro trabajo. Puedes hacer una donación segura que nos ayude a seguir construyendo paz en Colombia. ¡Gracias!";
  }

  // Cartilla / Material educativo
  if (msg.includes("cartilla") || msg.includes("material") || msg.includes("educativo") || msg.includes("guía") || msg.includes("guia") || msg.includes("recurso")) {
    return "📖 Nuestra cartilla educativa está disponible para descarga gratuita. Es un recurso valioso sobre noviolencia, resolución pacífica de conflictos y construcción de paz.";
  }

  // Contacto / Comunicación
  if (msg.includes("contacto") || msg.includes("comunicar") || msg.includes("hablar") || msg.includes("teléfono") || msg.includes("telefono") || msg.includes("correo") || msg.includes("email")) {
    return "📞 Puedes contactarnos a través de:<br>• WhatsApp: +57 315 790 27 61<br>• Email: info@colombianoviolenta.org<br>• Redes sociales<br>• Web: www.colombianoviolenta.org";
  }

  // Servicios generales
  if (msg.includes("servicio") || msg.includes("ofrece") || msg.includes("ofrecen") || msg.includes("hace") || msg.includes("hacen")) {
    return "🌟 Ofrecemos talleres de paz, formación en resolución de conflictos, eventos culturales, recursos educativos, espacios de voluntariado y mucho más. ¿Qué te interesa conocer?";
  }

  // Horarios
  if (msg.includes("horario") || msg.includes("hora") || msg.includes("abierto") || msg.includes("atiende") || msg.includes("disponible")) {
    return "🕐 Nuestro horario de atención es:<br>• Lunes a Viernes: 8:00 AM - 6:00 PM<br>• Sábados: 9:00 AM - 2:00 PM<br>• Domingos: Cerrado<br><br>Este chat está disponible 24/7 para ayudarte.";
  }

  // Ubicación / Dirección
  if (msg.includes("ubicación") || msg.includes("ubicacion") || msg.includes("dirección") || msg.includes("direccion") || msg.includes("donde") || msg.includes("dónde") || msg.includes("quedan")) {
    return "📍 Estamos ubicados en Bogotá, Colombia. Para conocer la dirección exacta de nuestros eventos y talleres, visita nuestra página web o contáctanos directamente.";
  }

  // Precios / Costos
  if (msg.includes("precio") || msg.includes("costo") || msg.includes("valor") || msg.includes("cuánto") || msg.includes("cuanto") || msg.includes("pagar")) {
    return "💰 Los precios varían según el servicio o producto:<br>• Algunos talleres y recursos son gratuitos<br>• Consultas y cursos tienen tarifas accesibles<br>• Visita nuestra tienda para ver precios específicos";
  }

  // Paz / Noviolencia
  if (msg.includes("paz") || msg.includes("noviolencia") || msg.includes("noviolenta") || msg.includes("violencia") || msg.includes("conflicto")) {
    return "🕊️ Colombia Noviolenta trabaja por la construcción de una cultura de paz a través de la educación, el arte y la transformación social. Creemos en resolver los conflictos sin violencia.";
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
    return "¡Hasta pronto! 👋 Que tengas un excelente día. Recuerda que siempre puedes volver si necesitas algo más.";
  }

  // Ayuda
  if (msg.includes("ayuda") || msg.includes("help") || msg.includes("opciones") || msg.includes("qué puedes hacer") || msg.includes("que puedes hacer")) {
    return "¡Claro! Puedo ayudarte con:<br>• Información sobre talleres y eventos<br>• Servicios de Colombia Noviolenta<br>• Voluntariado y donaciones<br>• Recursos educativos<br>• Contacto y ubicación<br><br>¿Qué te interesa?";
  }

  // ===================================================
  // RESPUESTA POR DEFECTO
  // ===================================================
  
  return `Gracias por tu mensaje. 😊 Actualmente puedo ayudarte con información sobre:<br>
• 🎵 Conciertos y eventos<br>
• 🛒 Nuestra tienda<br>
• 📚 Talleres y formación<br>
• 🤝 Voluntariado<br>
• 💝 Donaciones<br>
• 📖 Recursos educativos<br>
• 📞 Contacto<br><br>
¿En qué puedo ayudarte específicamente?`;
};

// Exportación adicional para compatibilidad
export default getChatbotResponse;