import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import cors from "cors";

dotenv.config();

// Inicializa el API de Google Gemini enviando la clave
const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Inicializa el historial de conversación en el formato requerido por Gemini
// Gemini usa 'user' y 'model' en lugar de 'user' e 'assistant'
let chatSession = model.startChat({
    history: [
        {
            role: "user",
            parts: [{ text: `
                # SYSTEM_PROMPT: Expert Mathematics Tutor

                You are an advanced virtual assistant specializing in mathematics. Your goal is to provide exceptionally clear, pedagogical, and accurate mathematical guidance.

                ## I. CORE PRINCIPLES & THINKING PROCESS
                Before responding, you MUST analyze the query internally.
                1. Clarification: Is the query ambiguous? 
                2. Categorization: Identify the mathematical branch.
                3. Level Detection: Adapt tone (Basic, Intermediate, Advanced).

                ## II. BEHAVIORAL RULES
                - Only answer mathematics-related questions.
                - Explain "Why" not just "How".
                - STRICT RULE: Do NOT answer questions outside the mathematical domain.
                - If the query is NOT mathematical, respond EXACTLY with: "Lo siento, pero mi especialidad es exclusivamente la resolución y explicación de problemas matemáticos. ¿Hay algún tema o ejercicio de matemáticas en el que pueda ayudarte?"

                ## III. RESPONSE ARCHITECTURE
                - Step-by-Step Resolution: Use standard numbered steps.
                - Mathematical Notation: You MUST use standard LaTeX delimiters:
                    - Use $ ... $ for inline formulas (e.g., $x^2 + y^2 = r^2$).
                    - Use $$ ... $$ for block/centered formulas (e.g., $$\int_{a}^{b} f(x)dx$$).
                - Structural Formatting: Use Markdown headers (##, ###) for sections and bold text (**) for key concepts.
                - Verification: Include a final "Check" step.
            ` }],
        },
        {
            role: "model",
            parts: [{ text: "Entendido. Soy tu tutor experto en matemáticas. ¿En qué puedo ayudarte hoy?" }],
        },
    ],
});

// Inicializa el servidor Express
const app = express();

// Configura middleware
app.use(cors());
app.use(express.json());

// Función para obtener la respuesta a una pregunta dada utilizando Google Gemini
async function obtenerRespuesta(pregunta, modo = 'detallado') {
    try {
        // Instrucciones específicas según el modo
        let instruccionModo = "";
        switch (modo) {
            case 'rápido':
                instruccionModo = "[MODO RÁPIDO: Responde ÚNICAMENTE con la solución final. Sin pasos, sin explicaciones, de la forma más directa posible (ej: '$x = 5$').] ";
                break;
            case 'quiz':
                instruccionModo = "[MODO QUIZ: Estás en modo tutor interactivo. NO des la solución. Identifica el primer paso, explica el concepto brevemente y haz una pregunta específica al usuario para que él mismo avance en la resolución. Mantén al usuario comprometido.] ";
                break;
            case 'detallado':
            default:
                instruccionModo = "[MODO DETALLADO: Proporciona una explicación paso a paso, clara y exhaustiva. Incluye definiciones, teoremas o reglas aplicadas (ej: Regla de la cadena, Teorema de Pitágoras) para que el razonamiento sea impecable.] ";
                break;
        }

        const result = await chatSession.sendMessage(instruccionModo + pregunta);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Error al obtener la respuesta de Gemini: " + error.message;
    }
}

// Ruta para manejar las solicitudes de chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, mode } = req.body;
        const respuesta = await obtenerRespuesta(message, mode);
        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});