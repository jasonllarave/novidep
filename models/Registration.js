import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  authorized: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Registration = mongoose.model("Registration", registrationSchema);
