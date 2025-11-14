import mongoose from 'mongoose';

const knowledgeSchema = new mongoose.Schema({
  // Categoría de la información
  category: {
    type: String,
    required: true,
    enum: [
      'productos', 
      'eventos', 
      'precios', 
      'links', 
      'horarios', 
      'contacto',
      'servicios',
      'talleres',
      'recursos'
    ],
    index: true
  },
  
  // Palabras clave que activan esta respuesta
  keywords: [{
    type: String,
    lowercase: true
  }],
  
  // Pregunta/Título
  question: {
    type: String,
    required: true
  },
  
  // Respuesta estructurada
  answer: {
    text: String,
    links: [{
      title: String,
      url: String
    }],
    images: [String],
    buttons: [{
      text: String,
      action: String
    }]
  },
  
  // Metadata
  priority: {
    type: Number,
    default: 0 // Mayor número = mayor prioridad
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índice de texto para búsqueda
knowledgeSchema.index({ 
  question: 'text', 
  keywords: 'text',
  'answer.text': 'text'
});

export const KnowledgeBase = mongoose.models.KnowledgeBase ||
 mongoose.model("KnowledgeBase", knowledgeSchema);