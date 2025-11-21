// models/Registration.js
import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
      unique: true
    },

    name: {
      type: String,
      default: null
    },

    phone: {
      type: String,
      default: null
    },

    authorized: {
      type: Boolean,
      default: false
    },

    step: {
      type: String,
      default: "start" // start → ask_participation → ask_name → ask_phone → ask_authorization → registered
    }
  },
  {
    timestamps: true
  }
);

export const Registration = mongoose.model("Registration", RegistrationSchema);
