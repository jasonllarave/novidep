// utils/psychologicalProtocols.js

export const psychologicalProtocols = {
  suicidio: {
    keywords: ["suicidio", "suicidarme", "matarme", "morir", "acabar con mi vida", "no quiero vivir", "terminar con todo", "quitarme la vida"],
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
    keywords: ["depresión", "depresion", "triste", "tristeza", "solo", "sola", "vacío", "vacio", "sin ganas", "desesperanza", "desesperado", "desesperada"],
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
    keywords: ["ira", "rabia", "enojo", "coraje", "furioso", "furiosa", "violento", "violenta", "explotar", "odio"],
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
    keywords: ["miedo", "temor", "pánico", "panico", "terror", "amenaza", "peligro", "asustado", "asustada", "ansiedad"],
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
    keywords: ["frustración", "frustracion", "frustrado", "frustrada", "impotencia", "cansado", "cansada", "agotado", "agotada", "rendido", "rendida"],
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

// Función para detectar necesidad psicológica
export function detectPsychologicalNeed(message) {
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