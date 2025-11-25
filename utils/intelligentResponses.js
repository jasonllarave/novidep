import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { Product } from '../models/Product.js';
import { Event } from '../models/Event.js';
import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const getChatbotResponse = async (message) => {
  try {
    const msg = message.toLowerCase();

    // Respuestas directas con IA
    const responses = {
      'boletas_concierto': {
        prompt: 'El usuario pregunta por boletas de conciertos. Responde de manera amigable invitándolo a ver los próximos eventos.',
        button: { text: '🎵 Ver Conciertos', url: 'https://www.colombianoviolenta.org/conciertos/' }
      },
      'compras_tienda': {
        prompt: 'El usuario quiere comprar en la tienda. Responde invitándolo a conocer nuestros productos de noviolencia.',
        button: { text: '🛒 Ir a la Tienda', url: 'https://www.colombianoviolenta.org/tienda/' }
      },
      'adquirir_servicios': {
        prompt: 'El usuario pregunta por servicios. Responde mencionando talleres, consultas y recursos de noviolencia.',
        button: { text: '📋 Ver Servicios', url: 'https://www.colombianoviolenta.org/servicios/' }
      },
      'voluntariado': {
        prompt: 'El usuario quiere ser voluntario. Responde animándolo a unirse al movimiento de noviolencia.',
        button: { text: '🤝 Únete como Voluntario', url: 'https://www.colombianoviolenta.org/voluntariado/' }
      },
      'donaciones': {
        prompt: 'El usuario quiere donar. Agradece su apoyo y explica cómo las donaciones ayudan.',
        button: { text: '💝 Donar Ahora', url: 'https://donorbox.org/colombianoviolenta' }
      },
      'cartilla': {
        prompt: 'El usuario quiere la cartilla educativa. Responde invitándolo a descargarla.',
        button: { text: '📖 Descargar Cartilla', url: 'https://www.colombianoviolenta.org/cartilla/' }
      }
    };

    // Verificar si es una opción directa
    if (responses[msg]) {
      const option = responses[msg];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Novi, asistente de Colombia Noviolenta. Sé breve (máximo 2 oraciones), amigable y directo.`
          },
          {
            role: "user",
            content: option.prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const aiText = completion.choices[0].message.content;
      return `${aiText}<br><br><button class="quick-button" onclick="window.open('${option.button.url}', '_blank')">${option.button.text}</button>`;
    }

    // Para cualquier otra pregunta, usar IA general
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente virtual de Colombia Noviolenta. 
Somos una organización que promueve la cultura de la Noviolencia.
Ofrecemos: talleres, eventos, tienda, voluntariado, donaciones y recursos educativos.
Responde de manera breve, amigable y profesional.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Error en getChatbotResponse:', error);
    return "Disculpa, tuve un problema. ¿Podrías reformular tu pregunta?";
  }
};