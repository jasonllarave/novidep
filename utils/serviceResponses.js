// utils/serviceResponses.js

export const serviceResponsesData = {
  boletas_concierto: {
    text: "🎵 ¡Genial! Puedes adquirir tus boletas para nuestros conciertos haciendo clic en el botón. Encontrarás fechas, lugares y precios disponibles.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/conciertos/">🎵 Ver boletas</button>`
  },
  compras_tienda: {
    text: "🛒 ¡Excelente elección! En nuestra tienda encontrarás productos oficiales de Colombia Noviolenta. Cada compra apoya nuestra causa por la paz.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/tienda/">🛒 Ir a la tienda</button>`
  },
  adquirir_servicios: {
    text: "📋 Ofrecemos diversos servicios de formación, talleres y acompañamiento en cultura de paz y resolución de conflictos. Explora nuestras opciones.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/servicios/">📋 Ver servicios</button>`
  },
  voluntariado: {
    text: "🤝 ¡Qué maravilloso que quieras ser parte del cambio! En nuestro programa de voluntariado podrás contribuir activamente a construir una Colombia más pacífica.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝 Inscribirme</button>`
  },
  donaciones: {
    text: "💝 Tu generosidad hace la diferencia. Cada donación nos ayuda a seguir trabajando por la paz y la noviolencia en Colombia. ¡Gracias por tu apoyo!",
    button: `<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💝 Donar ahora</button>`
  },
  cartilla: {
    text: "📖 Nuestra cartilla es una herramienta educativa sobre noviolencia y resolución pacífica de conflictos. Descárgala y compártela.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 Descargar cartilla</button>`
  }
};

// Menú principal con opciones enumeradas
export function getMainMenu() {
  return `¡Perfecto! 😊 ¿Qué te interesa?<br><br>

<div style="margin-bottom:15px;">
  <button class="quick-button" data-option="momento_calma" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;width:100%;padding:12px;font-size:16px;">
    ✨ Tu Momento de Calma ✨
  </button>
</div>

<strong>1.</strong> 🎵 Boletas concierto<br>
<strong>2.</strong> 🛒 Tienda<br>
<strong>3.</strong> 📋 Servicios<br>
<strong>4.</strong> 📘 Facebook<br>
<strong>5.</strong> 📖 Comprar cartilla<br>
<strong>6.</strong> 📞 Contacto<br><br>

<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <button class="quick-button" data-option="opcion_1">1️⃣ Boletas</button>
  <button class="quick-button" data-option="opcion_2">2️⃣ Tienda</button>
  <button class="quick-button" data-option="opcion_3">3️⃣ Servicios</button>
  <button class="quick-button" data-option="opcion_4">4️⃣ Facebook</button>
  <button class="quick-button" data-option="opcion_5">5️⃣ Cartilla</button>
  <button class="quick-button" data-option="opcion_6">6️⃣ Contacto</button>
</div><br>
✍️ También puedes escribir el número de la opción.`;
}

// Función helper para generar respuesta con botón y opciones de continuación
export function generateServiceResponse(text, button) {
  return `${text}<br><br>
${button}<br><br>
¿Deseas explorar algo más?<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="explorar_si">✅ Sí</button>
  <button class="quick-button" data-option="explorar_no">❌ No</button>
</div>`;
}