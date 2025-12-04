//models/Product.js

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  description: String,
  
  category: {
    type: String,
    enum: ['libros', 'cursos', 'talleres', 'merchandising', 'consultas'],
    index: true
  },
  
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'COP'
    }
  },
  
  stock: {
    type: Number,
    default: 0
  },
  
  url: String,
  
  images: [String],
  
  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
