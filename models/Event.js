import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  type: {
    type: String,
    enum: ['taller', 'conferencia', 'webinar', 'grupo_apoyo', 'feria'],
    index: true
  },
  
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  location: {
    type: String,
    enum: ['presencial', 'virtual', 'hibrido']
  },
  
  address: String,
  
  price: {
    amount: Number,
    isFree: Boolean
  },
  
  capacity: Number,
  registered: {
    type: Number,
    default: 0
  },
  
  registrationUrl: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Event = mongoose.model('Event', eventSchema);