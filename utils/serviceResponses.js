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
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/voluntariado/">🤝🏼 Inscribirme</button>`
  },
  donaciones: {
    text: "💏🏼 Tu generosidad hace la diferencia. Cada donación nos ayuda a seguir trabajando por la paz y la noviolencia en Colombia. ¡Gracias por tu apoyo!",
    button: `<button class="quick-button" data-url="https://donorbox.org/colombianoviolenta">💏🏼Donar ahora</button>`
  },
  cartilla: {
    text: "📖 Nuestra cartilla es una herramienta educativa sobre noviolencia y resolución pacífica de conflictos. Descárgala y compártela.",
    button: `<button class="quick-button" data-url="https://www.colombianoviolenta.org/cartilla/">📖 adquirir cartilla</button>`
  }
};

// Menú principal con opciones enumeradas
export function getMainMenu() {
  return `
<div style="background:#f8f9fa;padding:15px;border-radius:10px;margin:10px 0;">
  <h4 style="color:#555;margin:0;font-weight:normal;font-size:16px;">¡Perfecto! 👦🏻 ¿Qué te interesa?</h4>
</div>

<div  class="momento_calma">
  <button class="quick-button" data-option="momento_calma" ">
    0️⃣ Tu Momento de Calma 🧑🏻‍🤝‍🧑🏻
  </button>
</div>

<div style="background:white;padding:15px;border-radius:10px;border:1px solid #e0e0e0;">
  <strong>1.</strong> 🎵 Boletas concierto<br>
  <strong>2.</strong> 🛒 Tienda<br>
  <strong>3.</strong> 📋 Servicios<br>
  <strong>4.</strong> 📘 Donaciones<br>
  <strong>5.</strong> 📖 Comprar cartilla<br>
  <strong>6.</strong> 📞 Contacto<br><br>

  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <button class="quick-button" data-option="opcion_1">1️⃣ Boletas</button>
    <button class="quick-button" data-option="opcion_2">2️⃣ Tienda</button>
    <button class="quick-button" data-option="opcion_3">3️⃣ Servicios</button>
    <button class="quick-button" data-option="opcion_4">4️⃣ Donaciones</button>
    <button class="quick-button" data-option="opcion_5">5️⃣ Cartilla</button>
    <button class="quick-button" data-option="opcion_6">6️⃣ Contacto</button>
  </div>
  
  <p style="margin:10px 0 0 0;font-size:14px;color:#666;">✍🏻 También puedes escribir el número de la opción.</p>
</div>`;
}

// Función helper para generar respuesta con botón y opciones de continuación
export function generateServiceResponse(text, button) {
  return `${text}<br><br>
${button}<br><br>
¿Deseas explorar algo más?<br><br>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <button class="quick-button" data-option="explorar_si">🟢 Sí</button>
  <button class="quick-button" data-option="explorar_no">🔴 No</button>
</div>`;
}