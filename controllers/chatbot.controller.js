//  Importaciones necesarias
import { getChatbotResponse } from '../utils/responses.js';
import { Message } from '../models/Message.js';
import { 
  classifyQuery, 
  searchKnowledgeBase,
  searchProducts,
  searchEvents,
  formatProductResponse,
  formatEventResponse,
  generateAIResponse,
  needsHumanAgent
} from '../utils/intelligentResponse.js';
import mongoose from 'mongoose';


//  Procesa y guarda un mensaje individual
export const handleMessage = async (req, res) => {
  const { message, userId = 'anonymous', sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No se recibió ningún mensaje" });
  }

  try {
    // 1️ Clasificar la consulta
    const queryType = classifyQuery(message) || "unknown";
    console.log(' Tipo de consulta:', queryType);

    let response = '';
    let sources = [];
    let needsHuman = { escalate: false };

    // 2️ Buscar en base de conocimiento (KB)
    const kbResult = await searchKnowledgeBase(message);

    if (kbResult) {
      response = kbResult.answer.text;

      if (kbResult.answer.links?.length > 0) {
        response += '\n\n **Enlaces útiles:**\n';
        kbResult.answer.links.forEach(link => {
          response += `• [${link.title}](${link.url})\n`;
        });
      }
      sources.push({ type: 'knowledge_base', id: kbResult._id });
    } 
    else {
      // 3️ Buscar información específica
      switch (queryType) {
        case 'productos':
          const products = await searchProducts(message);
          if (products.length > 0) {
            response = formatProductResponse(products);
            sources.push({ type: 'products', count: products.length });
          }
          break;

        case 'eventos':
          const events = await searchEvents();
          response = formatEventResponse(events);
          sources.push({ type: 'events', count: events.length });
          break;

        case 'ayuda_emocional':
          needsHuman = needsHumanAgent(message);
          if (needsHuman.escalate) {
            response = " **Atención Prioritaria**\n\n" +
                      "Noto que necesitas apoyo urgente. Un especialista se pondrá en contacto contigo de inmediato.\n\n" +
                      "**Mientras tanto:**\n" +
                      "• Línea de crisis 24/7: 106\n" +
                      "• Emergencias: 123\n" +
                      "• WhatsApp: +57 123 456 7890\n\n" +
                      "No estás solo/a. Estamos aquí para ti.";
            sources.push({ type: 'escalated', priority: needsHuman.priority });
          }
          break;
      }

      // 4 Si no hay respuesta específica, usar IA o fallback
      if (!response) {
        const context = {
          queryType,
          hasProducts: queryType === 'productos',
          hasEvents: queryType === 'eventos'
        };

        const aiResponse = await generateAIResponse(message, context);
        if (aiResponse) {
          response = aiResponse;
          sources.push({ type: 'ai_generated' });
        } else {
          response = getChatbotResponse(message);
          sources.push({ type: 'fallback' });
        }
      }
    }

    // 5️ Asignar o generar una sesión si no existe
    let assignedSessionId = sessionId;
    if (!assignedSessionId) {
      assignedSessionId = new mongoose.Types.ObjectId().toString();
    }

    // 6️ Guardar mensaje en MongoDB con todos los metadatos
    const newMessage = new Message({
      userId,
      userMessage: message,
      botResponse: response,
      sessionId: assignedSessionId,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        queryType,
        sources: JSON.stringify(sources),
        escalated: needsHuman.escalate,
        responseLength: response?.length || 0 //  agregado para métricas
      }
    });

    await newMessage.save();

    // 7️ Responder al cliente
    res.json({
      reply: response,
      queryType,
      sources,
      needsHumanAgent: needsHuman.escalate,
      messageId: newMessage._id,
      sessionId: assignedSessionId
    });

  } catch (error) {
    console.error(' Error procesando mensaje:', error);
    res.json({
      reply: "Disculpa, tuve un problema técnico. ¿Podrías reformular tu pregunta?",
      error: true
    });
  }
};



//  Historial completo
export const getHistory = async (req, res) => {
  try {
    const history = await Message.find().sort({ createdAt: -1 }).limit(500);
    res.json({ total: history.length, history });
  } catch (error) {
    console.error(' Error obteniendo historial:', error);
    res.status(500).json({ error: "No se pudo obtener el historial" });
  }
};



//  Mensajes por sesión
export const getSessionMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ sessionId, total: messages.length, messages });
  } catch (error) {
    console.error(' Error obteniendo mensajes de sesión:', error);
    res.status(500).json({ error: "No se pudo obtener la sesión" });
  }
};



//  Estadísticas completas para admin panel
export const getStats = async (req, res) => {
  try {
    // Totales
    const totalMessages = await Message.countDocuments();
    const sessionsArray = await Message.distinct('sessionId');
    const totalSessions = sessionsArray.length;

    // Promedio de longitud
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(50);
    const avgResponseLength = recentMessages.length
      ? (recentMessages.reduce((sum, m) => sum + (m.botResponse?.length || 0), 0) / recentMessages.length).toFixed(1)
      : 0;

    // Agrupado por tipo de consulta
    const topicStats = await Message.aggregate([
      {
        $group: {
          _id: "$metadata.queryType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topTopics = topicStats.map(t => ({
      topic: t._id || 'unknown',
      total: t.count
    }));

    res.json({
      totalMessages,
      totalSessions,
      avgResponseLength,
      topTopics
    });
  } catch (error) {
    console.error(' Error obteniendo estadísticas:', error);
    res.status(500).json({ error: "No se pudieron obtener estadísticas" });
  }
};



//  Buscar mensajes
export const searchMessages = async (req, res) => {
  const { query } = req.query;
  try {
    const results = await Message.find({
      $or: [
        { userMessage: { $regex: query, $options: 'i' } },
        { botResponse: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    res.json({ total: results.length, results });
  } catch (error) {
    console.error(' Error buscando mensajes:', error);
    res.status(500).json({ error: "No se pudo realizar la búsqueda" });
  }
};



//  Finalizar sesión
export const endSession = async (req, res) => {
  const { sessionId } = req.body;
  try {
    if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });

    await Message.updateMany({ sessionId }, { $set: { resolved: true } });
    res.json({ message: "Sesión finalizada correctamente", sessionId });
  } catch (error) {
    console.error(' Error finalizando sesión:', error);
    res.status(500).json({ error: "No se pudo finalizar la sesión" });
  }
};



