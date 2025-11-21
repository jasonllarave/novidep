// controllers/conversationController.js
import { ConversationSession } from "../models/ConversationSession.js";

export const handleConversation = async (req, res) => {
    const { sessionId, message } = req.body;
    const msg = message.toLowerCase().trim();

    let session = await ConversationSession.findOne({ sessionId });

    if (!session) {
        session = await ConversationSession.create({ sessionId });
    }

    // ------------------------- FLUJO -------------------------

    // PASO 1: mensaje inicial (welcome)
    if (session.step === "welcome") {
        if (msg === "si" || msg === "sí") {
            session.step = "askName";
            await session.save();
            return res.json({
                reply: "¡Excelente! 😊 ¿Cómo te gustaría que te llame?"
            });
        }

        if (msg === "no") {
            session.step = "completed";
            await session.save();
            return res.json({
                reply: `
Perfecto 👍  
Aquí tienes nuestras redes sociales, ¿cuál te gustaría visitar?

👉 <button class="btn-flow" data-option="instagram">Instagram</button>  
👉 <button class="btn-flow" data-option="facebook">Facebook</button>  
👉 <button class="btn-flow" data-option="tiktok">TikTok</button>  
👉 <button class="btn-flow" data-option="x">X / Twitter</button>  
👉 <button class="btn-flow" data-option="youtube">YouTube</button>  
👉 <button class="btn-flow" data-option="spotify">Spotify</button>

También puedes escribirme cualquier pregunta 😊  
                `
            });
        }

        return res.json({
            reply: "Por favor responde <strong>sí</strong> o <strong>no</strong> 🙏"
        });
    }

    // PASO 2: pedir nombre
    if (session.step === "askName") {
        session.name = message;
        session.step = "askPhone";
        await session.save();
        return res.json({
            reply: `¡Perfecto ${session.name}! 😊 Ahora dime tu número de contacto.`
        });
    }

    // PASO 3: validar teléfono
    if (session.step === "askPhone") {
        const phoneRegex = /^(3\d{9})$/;

        if (!phoneRegex.test(message)) {
            return res.json({
                reply: "Número no válido ❌. El formato debe ser como: 3105223645"
            });
        }

        session.phone = message;
        session.step = "askAuth";
        await session.save();

        return res.json({
            reply: `
Gracias ${session.name}! ❤️  
Antes de continuar necesito tu autorización:

<button onclick="sendAuthorization()" class="btn-flow" data-option="auth">
✔ Autorizo el tratamiento de datos
</button>
            `
        });
    }

    // PASO 4: autorización
    if (session.step === "askAuth") {
        return res.json({
            reply: "Por favor presiona el botón ✔ Autorizo para continuar."
        });
    }

    // PASO 5: completado
    if (session.step === "completed") {
        return res.json({
            reply: `Listo ${session.name}! 🎉 Puedes escoger una opción o hacer una pregunta.`
        });
    }

    return res.json({ reply: "No entendí, ¿podrías repetirlo? 😅" });
};



// ---------- AUTORIZACIÓN ----------
export const authorizeData = async (req, res) => {
    const { sessionId } = req.body;

    const session = await ConversationSession.findOne({ sessionId });

    if (!session) {
        return res.json({ reply: "No se encontró sesión activa." });
    }

    session.authorized = true;
    session.step = "completed";
    await session.save();

    return res.json({
        reply: `
¡Gracias ${session.name}! Tus datos fueron registrados correctamente.  
Ahora puedes escoger una opción o hacer una pregunta 😊  
        `
    });
};
