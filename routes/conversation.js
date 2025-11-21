import express from "express";
import { Registration } from "../models/Registration.js";

const router = express.Router();

// Memoria simple por sesión (si quieres luego la pasamos a Mongo)
const sessionState = {};

router.post("/", async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId) {
        return res.status(400).json({ reply: "Falta sessionId" });
    }

    if (!sessionState[sessionId]) {
        sessionState[sessionId] = {
            step: "welcome",
            name: null,
            phone: null
        };
    }

    const state = sessionState[sessionId];
    const msg = message.toLowerCase();

    // === PASO 1 — MENSAJE INICIAL ===
    if (state.step === "welcome") {
        state.step = "ask_participation";

        return res.json({
            reply: `
Hola, soy Novi, tu asistente virtual de Colombia Noviolenta.  
Actualmente contamos con talleres, conferencias y espacios de orientación en Noviolencia.  

¿Te gustaría participar en nuestros eventos?

<button class="btn-flow" data-option="yes">Sí, quiero participar</button>
<button class="btn-flow" data-option="no">No, gracias</button>
            `
        });
    }

    // === PASO 2 — RESPONDE SI o NO ===
    if (state.step === "ask_participation") {
        if (msg === "si" || msg === "sí" || msg === "yes") {
            state.step = "ask_name";
            return res.json({ reply: "¡Excelente! 😊<br>Por favor escribe tu nombre completo:" });
        }

        if (msg === "no") {
            state.step = "offer_info";

            return res.json({
                reply: `
¡Gracias por responder! 😊<br><br>
Aquí tienes nuestras plataformas y redes sociales:<br><br>
<a href="https://www.colombianoviolenta.org" target="_blank">Sitio Web</a><br>
<a href="https://www.instagram.com/colombianoviolenta" target="_blank">Instagram</a><br>
<a href="https://www.facebook.com/ColombiaNoviolenta" target="_blank">Facebook</a><br>
<a href="https://www.tiktok.com/@colombianoviolenta" target="_blank">TikTok</a><br>
<br><br>

¿Te gustaría conocer más sobre nuestros servicios?

<button class="btn-flow" data-option="yes_services">Sí, cuéntame más</button>
<button class="btn-flow" data-option="no_services">No, gracias</button>
                `
            });
        }
    }

    // === PASO 3 — SI DICE NO PERO QUIERE SABER MÁS SOBRE SERVICIOS ===
    if (state.step === "offer_info") {
        if (msg.includes("yes_services")) {
            state.step = "services_info";

            return res.json({
                reply: `
Perfecto 😊<br>
Actualmente contamos con:<br><br>
• Talleres de Noviolencia<br>
• Conferencias<br>
• Procesos pedagógicos<br>
• Actividades comunitarias<br><br>

¿Quieres participar en alguno de ellos?

<button class="btn-flow" data-option="yes_join">Sí quiero participar</button>
<button class="btn-flow" data-option="no_join">No por ahora</button>
                `
            });
        }

        if (msg.includes("no_services")) {
            return res.json({
                reply: `
¡Gracias por visitarnos! 😊<br>
Si en algún momento deseas más información estaré aquí para ayudarte.`
            });
        }
    }

    // === PASO 4 — SI DESPUÉS QUIERE PARTICIPAR ===
    if (state.step === "services_info") {
        if (msg.includes("yes_join")) {
            state.step = "ask_name";
            return res.json({ reply: "Genial 🙌<br>Por favor escribe tu nombre completo:" });
        }

        if (msg.includes("no_join")) {
            return res.json({
                reply: "¡Gracias! Estaré aquí si necesitas algo más 😊"
            });
        }
    }

    // === PASO 5 — NOMBRE ===
    if (state.step === "ask_name") {
        state.name = message;
        state.step = "ask_phone";

        return res.json({
            reply: "Perfecto 👍<br>Ahora escribe tu número de contacto:"
        });
    }

    // === PASO 6 — TELÉFONO ===
    if (state.step === "ask_phone") {
        state.phone = message;
        state.step = "ask_authorization";

        return res.json({
            reply: `
Para continuar, autoriza el uso de tus datos:

<label style="display:flex;align-items:center;gap:10px;margin-top:10px;">
    <input type="checkbox" id="authCheck"> Autorizo el uso de mis datos
</label>

<button class="btn-accept" onclick="sendAuthorization()">Enviar</button>
            `
        });
    }

    return res.json({ reply: "No entendí tu respuesta." });
});

// === GUARDAR AUTORIZACIÓN ===
router.post("/authorize", async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId || !sessionState[sessionId]) {
        return res.status(400).json({ success: false });
    }

    const data = sessionState[sessionId];

    try {
        await Registration.create({
            name: data.name,
            phone: data.phone,
            authorized: true
        });

        return res.json({
            success: true,
            reply: "¡Gracias! Tus datos fueron registrados. Muy pronto nos pondremos en contacto contigo."
        });
    } catch (err) {
        return res.json({ success: false, reply: "Hubo un error guardando tus datos." });
    }
});

export default router;
