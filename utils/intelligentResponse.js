import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { Product } from '../models/Product.js';
import { Event } from '../models/Event.js';
import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// Clasificar el tipo de consulta
export const classifyQuery = (message) => {
  const msg = message.toLowerCase();
  
  const patterns = {
    productos: /producto|comprar|tienda|precio|costo|vender|libro|curso/i,
    eventos: /evento|taller|conferencia|cuando|fecha|próximo|actividad/i,
    horarios: /horario|abierto|cerrado|cuando atienden|hora/i,
    contacto: /contacto|teléfono|email|ubicación|dirección|whatsapp/i,
    ayuda_emocional: /triste|ansioso|deprimido|ayuda|crisis|mal|suicidio/i,
    ira: /ira|enojo|rabia|furioso|controlar/i,
    recursos: /recurso|material|descarga|guía|documento/i
  };
  
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(msg)) {
      return category;
    }
  }
  
  return 'general';
};

// Buscar en Knowledge Base
export const searchKnowledgeBase = async (message) => {
  try {
    const results = await KnowledgeBase
      .find(
        { $text: { $search: message }, isActive: true },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" }, priority: -1 })
      .limit(3);
    
    if (results.length > 0) {
      await KnowledgeBase.updateOne({ _id: results[0]._id },
        { $inc: { views: 1 } }
      );
      return results[0];
    }
    
    const words = message.toLowerCase().split(' ');
    const keywordMatch = await KnowledgeBase.findOne({
      keywords: { $in: words },
      isActive: true
    }).sort({ priority: -1 });
    
    return keywordMatch;
  } catch (error) {
    console.error('Error buscando en Knowledge Base:', error);
    return null;
  }
};

// Buscar productos
export const searchProducts = async (query) => {
  try {
    const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [query.toLowerCase()] } }
        ],
        isActive: true,
        stock: { $gt: 0 }
      })
      .limit(5);
    
    return products;
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
};

// Buscar eventos próximos
export const searchEvents = async () => {
  try {
    const events = await Event
      .find({
        date: { $gte: new Date() },
        isActive: true
      })
      .sort({ date: 1 })
      .limit(5);
    
    return events;
  } catch (error) {
    console.error('Error buscando eventos:', error);
    return [];
  }
};

// Formatear respuesta de productos
export const formatProductResponse = (products) => {
  if (products.length === 0) {
    return "No encontré productos con esa descripción. ¿Puedes ser más específico?";
  }
  
  let response = "**Productos disponibles:**\n\n";
  
  products.forEach((product, index) => {
    response += `${index + 1}. **${product.name}**\n`;
    if (product.description) {
      response += `   ${product.description.substring(0, 100)}...\n`;
    }
    response += `    Precio: $${product.price.amount.toLocaleString()} ${product.price.currency}\n`;
    if (product.url) {
      response += `    [Ver más](${product.url})\n`;
    }
    response += '\n';
  });
  
  response += "¿Te gustaría más información sobre alguno?";
  
  return response;
};

// Formatear respuesta de eventos
export const formatEventResponse = (events) => {
  if (events.length === 0) {
    return "No hay eventos programados próximamente. Te avisaremos cuando tengamos novedades.";
  }
  
  let response = " **Próximos Eventos:**\n\n";
  
  events.forEach((event, index) => {
    const date = new Date(event.date);
    const dateStr = date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    response += `${index + 1}. **${event.title}**\n`;
    response += `    ${dateStr}\n`;
    response += `    ${event.location === 'virtual' ? 'Virtual' : event.address}\n`;
    
    if (event.price.isFree) {
      response += `    Gratis\n`;
    } else {
      response += `    $${event.price.amount.toLocaleString()}\n`;
    }
    
    if (event.registrationUrl) {
      response += `    [Registrarse](${event.registrationUrl})\n`;
    }
    
    response += '\n';
  });
  
  return response;
};


//  NUEVO: Construir contexto enriquecido con enlaces de la base de conocimiento, Si pregunta por "tienda" etc.. este hace que tome los link del admin con crowler busca en KB (Si no encuentra nada  trae el documento de category: "links") 
export const buildEnrichedContext = async (message) => {
  let kbMatch = await searchKnowledgeBase(message);

  // Si no hay match, traer TODOS los links del admin
  if (!kbMatch) {
    kbMatch = await KnowledgeBase.findOne({ category: "links", isActive: true });
  }

  if (!kbMatch || !kbMatch.answer?.links?.length) {
    return {
      knowledge: null,
      links: "No hay links disponibles"
    };
  }

  const kbLinks = kbMatch.answer.links;

  return {
    knowledge: kbMatch.answer?.text || null,
    links: kbLinks.map(l => `${l.title}: ${l.url}`).join('\n')
  };
};


// Generar respuesta con IA (GPT)
export const generateAIResponse = async (message, context = {}) => {
  try {
    const enrichedContext = await buildEnrichedContext(message);

    const systemPrompt = `Eres Novi, el asistente virtual de Colombia Noviolenta, una organización dedicada a promover la cultura de la Noviolencia.
                          si hay informacion adicional en la base de conocimiento o enlaces, integrala naturalmente.
                          si hay productos o eventos relevantes, mencionalos con su titulo y URL.

Tu personalidad:
- Empático y comprensivo
- Profesional pero cercano
- Enfocado en ayudar
- Promueves la Noviolencia

Contexto de la organización:
- Ofrecemos talleres de como hacer Noviolencia
- Tenemos una tienda con libros, prendas y recursos pedagogicos
- Promovemos marchas comunitarias de la Noviolencia
- Organizamos eventos como conciertos, charlas y campamentos

Usa el contexto de manera natural. si hay links disponibles, muestralos claramente.


**Informacion Importante de la Base de Datos:**
${enrichedContext.knowledge ? enrichedContext.knowledge : ''}

**Datos Importantes**
${enrichedContext.links ? enrichedContext.links : 'No hay links disponibles'}

Información disponible:
${JSON.stringify(context, null, 2)}

IMPORTANTE:
-usa los links existentes si estan disponibles
- Si hay información específica en el contexto (productos, eventos, links), úsala
- Si no tienes información, di por el momento no dispongo de esta información ¿que otra consulta tienes?
- Nunca inventes precios o fechas
- Siempre ofrece alternativas útiles`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error con IA:', error);
    return null;
  }
};


// Detectar si necesita agente humano
export const needsHumanAgent = (message, sentiment) => {
  const criticalKeywords = [
    'Donaciones', 'eventos', 'pedagogia', 'comunidades', 
    'paz interior', 'charlas informativas', 'marchas',
    'video conferencias', 'filosofia'
  ];
  
  const msg = message.toLowerCase();
  
  if (criticalKeywords.some(word => msg.includes(word))) {
    return {
      escalate: true,
      priority: 'urgent',
      reason: 'critical_keywords'
    };
  }
  
  if (sentiment && sentiment.score < -5) {
    return {
      escalate: true,
      priority: 'high',
      reason: 'negative_sentiment'
    };
  }
  
  return { escalate: false };
};
