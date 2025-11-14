import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  userId: {
    type: String,
    default: 'anonymous',
    index: true
  },
  
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: Date,
  
  messageCount: {
    type: Number,
    default: 0
  },
  
  duration: Number, // en segundos
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  metadata: {
    device: String,
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

export const Session = mongoose.model('Session', sessionSchema);