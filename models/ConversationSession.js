import mongoose from "mongoose";

const ConversationSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    authorized: { type: Boolean, default: false },

    // Estado del flujo
    step: { 
        type: String, 
        enum: ["welcome", "askName", "askPhone", "askAuth", "completed"], 
        default: "welcome" 
    },

    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export const ConversationSession = mongoose.model("ConversationSession", ConversationSessionSchema);
