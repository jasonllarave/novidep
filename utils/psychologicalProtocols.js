// utils/psychologicalProtocols.js

export const psychologicalProtocols = {
  suicidio: {
    keywords: ["suicidio", "suicidarme", "matarme", "morir", "acabar con mi vida", "no quiero vivir", "terminar con todo", "quitarme la vida"],
    category: "🆘 Pensamientos suicidas",
    context: "La persona está expresando ideación suicida. Necesita contención emocional inmediata y derivación a servicios de emergencia.",
    initialResponse: (name) => `${name ? name + ', ' : ''}gracias por confiar en este espacio. Sé que no es fácil decir lo que estás sintiendo, y valoro profundamente que estés aquí. Cuando dices que quieres acabar con tu vida, eso me habla de un dolor inmenso. No estás sol@.`,
    supportLines: `
<div style="background:#fff3cd;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>🆘 Necesitas comunicarte AHORA con apoyo profesional</strong><br><br>
  
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
    keywords: ["depresión", "depresion", "triste", "tristeza", "solo", "sola", "vacío", "vacio", "sin ganas", "desesperanza", "desesperado", "desesperada"],
    category: "💙 Depresión y tristeza",
    context: "La persona muestra signos de depresión o tristeza profunda. Requiere validación emocional y orientación hacia apoyo profesional.",
    initialResponse: (name) => `${name ? name + ', ' : ''}gracias por compartir lo que sientes. La tristeza profunda no es debilidad, es una señal de que algo importante necesita atención. Estás dando un paso valiente al hablar de esto.`,
    supportLines: `
<div style="background:#e7f3ff;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>💙 Te recomiendo buscar apoyo profesional</strong><br><br>
  
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
    keywords: ["ira", "rabia", "enojo", "coraje", "furioso", "furiosa", "violento", "violenta", "explotar", "odio"],
    category: "🔥 Ira y rabia",
    context: "La persona está experimentando ira intensa. Necesita validación de su emoción y estrategias de manejo, además de evaluación de riesgo.",
    initialResponse: (name) => `${name ? name + ', ' : ''}gracias por buscar apoyo. La ira suele aparecer cuando algo nos hiere, nos agota o sentimos una injusticia profunda. Tu emoción es válida.`,
    supportLines: `
<div style="background:#ffe7e7;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>🔥 Si la ira viene con violencia o riesgo, comunícate con:</strong><br><br>
  
  <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
  <button class="quick-button" data-url="tel:122">⚖️ 122 - Fiscalía</button>
  <button class="quick-button" data-url="tel:018000112518">💼 Ministerio de Trabajo: 01 8000 112 518</button><br><br>
  
  Mereces protección y un espacio seguro. 🤍
</div>
    `
  },
  
  miedo: {
    keywords: ["miedo", "temor", "pánico", "panico", "terror", "amenaza", "peligro", "asustado", "asustada", "ansiedad"],
    category: "😰 Miedo y ansiedad",
    context: "La persona experimenta miedo o ansiedad intensa. Requiere contención y evaluación de riesgo real vs percibido.",
    initialResponse: (name) => `${name ? name + ', ' : ''}gracias por escribir. El miedo no es debilidad; es tu cuerpo intentando protegerte. Aquí puedes hablar sin juicio.`,
    supportLines: `
<div style="background:#fff8e7;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>😰 Si tu miedo está relacionado con un riesgo real:</strong><br><br>
  
  <button class="quick-button" data-url="tel:123">🚨 123 - Emergencias</button>
  <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
  <button class="quick-button" data-url="tel:018000911119">🛡️ Unidad de Víctimas: 01 8000 911 119</button><br><br>
  
  Tu seguridad es lo primero. 🤍
</div>
    `
  },
  
  frustracion: {
    keywords: ["frustración", "frustracion", "frustrado", "frustrada", "impotencia", "cansado", "cansada", "agotado", "agotada", "rendido", "rendida"],
    category: "😔 Frustración y agotamiento",
    context: "La persona siente frustración o agotamiento emocional. Necesita validación y exploración de fuentes de estrés.",
    initialResponse: (name) => `${name ? name + ', ' : ''}gracias por compartir lo que sientes. La frustración aparece cuando damos todo y aun así nada cambia. No estás sol@.`,
    supportLines: `
<div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>😔 Si tu frustración viene de violencia o vulneración de derechos:</strong><br><br>
  
  <button class="quick-button" data-url="tel:018000112518">💼 Ministerio de Trabajo: 01 8000 112 518</button>
  <button class="quick-button" data-url="tel:155">📞 155 - Policía Nacional</button>
  <button class="quick-button" data-url="tel:122">⚖️ 122 - Fiscalía</button><br><br>
  
  Mereces apoyo real. 🤍
</div>
    `
  }
};

// Función para detectar necesidad psicológica
export function detectPsychologicalNeed(message) {
  const msg = message.toLowerCase();
  
  for (const [key, protocol] of Object.entries(psychologicalProtocols)) {
    if (protocol.keywords.some(keyword => msg.includes(keyword))) {
      return {
        detected: true,
        type: key,
        protocol: protocol
      };
    }
  }
  
  return { detected: false };
}

// Función para generar menú de categorías de apoyo
export function getPsychologicalSupportMenu() {
  return `
<div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:10px 0;">
  <strong>Si tú o alguien que conoces está pasando por un momento difícil, hay apoyo disponible.</strong><br><br>
  
  Selecciona el tipo de apoyo que necesitas:<br><br>
  
  <button class="quick-button" data-option="apoyo_suicidio">🆘 Pensamientos suicidas</button>
  <button class="quick-button" data-option="apoyo_depresion">💙 Depresión y tristeza</button>
  <button class="quick-button" data-option="apoyo_ira">🔥 Ira y rabia</button>
  <button class="quick-button" data-option="apoyo_miedo">😰 Miedo y ansiedad</button>
  <button class="quick-button" data-option="apoyo_frustracion">😔 Frustración</button>
</div>
  `;
}