// utils/intelligentResponses.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getChatbotResponse = async (message) => {
  try {
    const msg = message.toLowerCase();

    // Opciones con respuesta específica y link
    const responses = {
      'boletas_concierto': {
        prompt: 'El usuario pregunta por boletas de conciertos. Responde de manera breve, amigable, y menciona próximos eventos de Colombia Noviolenta.',
        url: 'https://www.colombianoviolenta.org/conciertos/'
      },
      'compras_tienda': {
        prompt: 'El usuario quiere comprar en la tienda. Responde invitando a conocer productos de noviolencia.',
        url: 'https://www.colombianoviolenta.org/tienda/'
      },
      'adquirir_servicios': {
        prompt: 'El usuario pregunta por servicios. Menciona talleres, consultas y recursos de noviolencia.',
        url: 'https://www.colombianoviolenta.org/servicios/'
      },
      'contacto': {
        prompt: 'El usuario quiere ser voluntario. Anímalo a unirse al movimiento de noviolencia.',
        url: 'https://www.colombianoviolenta.org/contacto/'
      },
      'donaciones': {
        prompt: 'El usuario quiere donar. Agradece su apoyo y explica brevemente cómo ayuda.',
        url: 'https://donorbox.org/colombianoviolenta'
      },
      'cartilla': {
        prompt: 'El usuario quiere la cartilla educativa. Invítalo a descargarla.',
        url: 'https://www.colombianoviolenta.org/cartilla/'
      }
    };

    // Si es una opción directa, generamos texto + link
    if (responses[msg]) {
      const option = responses[msg];
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Novi, asistente virtual de Colombia Noviolenta. Sé breve, amigable y profesional (2 frases máximo).`
          },
          { role: "user", content: option.prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const aiText = completion.choices[0].message.content;
      return `${aiText}<br><br><button class="quick-button" data-url="${option.url}">Ir al enlace</button>`;
    }

    // Para cualquier otro mensaje, respuesta general
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Novi, asistente virtual de Colombia Noviolenta. 
Ofrece información breve, amigable y profesional sobre talleres, eventos, voluntariado, donaciones y recursos educativos.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;

  } catch (err) {
    console.error("Error en getChatbotResponse:", err);
    return "Disculpa, tuve un problema. ¿Podrías reformular tu pregunta?";
  }
};
