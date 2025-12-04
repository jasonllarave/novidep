// models/Link.js

import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: "general"
  },
  source: {
    type: String,
    default: "manual" // puede ser "crawler" o "manual"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Link = mongoose.model("Link", linkSchema);
