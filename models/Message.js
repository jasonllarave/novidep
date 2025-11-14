import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Información del usuario
  userId: {
    type: String,
    default: 'anonymous', 
    index: true,
    required: true
  },
  
  // Contenido de la conversación
  userMessage: {
    type: String,
    required: true,
    trim: true
  },
  
  botResponse: {
    type: String,
    required: true
  },
  
  // Información de sesión
  sessionId: {
    type: String,
    index: true
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Metadata adicional
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    language: String,
    referrer: String
  },
  
  // Análisis de sentimiento (opcional)
  sentiment: {
    score: Number,
    label: String, // 'positive', 'negative', 'neutral'
  },
  
  // Flags útiles
  resolved: {
    type: Boolean,
    default: false
  },
  
  escalated: {
    type: Boolean,
    default: false
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices compuestos para consultas rápidas
messageSchema.index({ userId: 1, timestamp: -1 });
messageSchema.index({ sessionId: 1, timestamp: -1 });

export const Message = mongoose.model('Message', messageSchema);