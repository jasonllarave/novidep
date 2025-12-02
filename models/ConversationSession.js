//models/ConversatioSession.js

import mongoose from 'mongoose';

const conversationSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'closed', 'escalated'],
    default: 'active'
  },
  escalatedTo: {
    type: String,
    default: null
  },
  escalationReason: {
    type: String,
    default: null
  },
  sentiment: {
    overall: {
      type: Number,
      default: 0
    },
    history: [{
      score: Number,
      timestamp: Date
    }]
  },
  metadata: {
    browser: String,
    device: String,
    location: String,
    referrer: String
  }
}, {
  timestamps: true
});


// Índices para mejorar rendimiento
conversationSessionSchema.index({ lastActivity: 1 });
conversationSessionSchema.index({ status: 1 });
conversationSessionSchema.index({ userId: 1, startTime: -1 });

// Método para agregar un mensaje
conversationSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata
  });
  this.lastActivity = new Date();
  return this.save();
};

// Método para actualizar sentimiento
conversationSessionSchema.methods.updateSentiment = function(score) {
  this.sentiment.history.push({
    score,
    timestamp: new Date()
  });
  
  // Calcular promedio de los últimos 5 mensajes
  const recentScores = this.sentiment.history
    .slice(-5)
    .map(h => h.score);
  
  this.sentiment.overall = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  
  return this.save();
};

// Método para escalar conversación
conversationSessionSchema.methods.escalate = function(reason, agentId = null) {
  this.status = 'escalated';
  this.escalationReason = reason;
  this.escalatedTo = agentId;
  this.lastActivity = new Date();
  return this.save();
};

// Método estático para limpiar sesiones antiguas
conversationSessionSchema.statics.cleanOldSessions = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    lastActivity: { $lt: cutoffDate },
    status: { $in: ['idle', 'closed'] }
  });
};

export const ConversationSession = mongoose.model('ConversationSession', conversationSessionSchema);