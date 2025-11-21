import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    authorized: {
        type: Boolean,
        required: true,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Para evitar errores de modelo duplicado en hot reload
export const Registration =
    mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
