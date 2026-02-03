# MathSolver AI: Mi Asistente Matemático Personal

MathSolver AI no es solo un chat; es una herramienta diseñada para transformar cómo interactúo con las matemáticas. Desde resolver una derivada compleja hasta guiarme paso a paso como un tutor, este proyecto nació de la necesidad de tener precisión técnica y claridad pedagógica en un solo lugar.

## ✨ Nueva Interfaz Moderna (v2)

### Vista de Inicio
![Vista de Inicio](./frontend/public/vistainicio.png)

### Respuesta Detallada
![Vista Detallada](./frontend/public/Vistadetallada.png)

### Estado de Carga
![Vista de Carga](./frontend/public/vistacarga.png)

## 📸 Nueva Funcionalidad: OCR y Análisis de Imágenes

### Vista de Inicio OCR
![Vista de Inicio con OCR](./frontend/public/vistainicioOCR.png)

### Respuesta desde Imagen
![Vista de Respuesta OCR](./frontend/public/VistarespuestaOCR.png)

### Estado de Carga OCR
![Vista de Carga OCR](./frontend/public/vistacargaOCR.png)

## 🌐 Soporte Multi-idioma (Español / Inglés)

He añadido un sistema de localización que permite cambiar la experiencia de usuario entre español e inglés con un solo clic.

### Selector de Idioma
![Vista Multi-idioma](./frontend/public/vistamultiidioma.png)

### Respuesta en Inglés
![Respuesta Multi-idioma](./frontend/public/respuestamultiidioma.png)

---

## 📊 Tablas y Formateo GFM (GitHub Flavored Markdown)

Para una mejor organización de la información, el sistema ahora soporta tablas profesionales y formateo avanzado.

*   **Renderizado de Tablas:** Utilizo `remark-gfm` para que las comparaciones y clasificaciones se muestren en tablas limpias y legibles.
*   **Estilo Premium:** Las tablas están adaptadas al tema oscuro con bordes sutiles y resaltado de encabezados.

---

---

## 🚀 Flujo de Usuario y Lógica

He diseñado el sistema para que sea intuitivo y potente. Aquí detallo cómo fluye la información desde que entro a la web hasta que obtengo mi resultado.

### Flujo de Interacción (User Flow)

Este diagrama muestra mi experiencia como usuario y cómo el sistema reacciona a mis acciones:

```mermaid
sequenceDiagram
    participant U as Yo (Usuario)
    participant F as Frontend (Vite)
    participant B as Backend (Express)
    participant AI as Google Gemini

    U->>F: Entro a la web
    F-->>U: Presenta opciones y ejemplos
    U->>F: Elijo modo (Rápido/Detallado/Quiz) y envío duda
    F->>F: Activa cargando y prepara la petición
    F->>B: Envía mensaje + modo
    B->>AI: Consulta con prompt adaptado al modo
    AI-->>B: Devuelve solución matemática
    B-->>F: Respuesta lista
    F->>F: Renderiza con KaTeX (Formato profesional)
    F-->>U: ¡Listo! Veo mi respuesta perfecta
```

### Lógica Interna (System Flowchart)

Así es como el "cerebro" de la app decide cómo responder:

```mermaid
graph TD
    A[Recibo mensaje en Backend] --> B{¿Qué modo eligió el usuario?}
    B -->|Rápido| C[Instrucción: Solo respuesta final]
    B -->|Detallado| D[Instrucción: Pasos + Teoremas]
    B -->|Quiz| E[Instrucción: No des la respuesta, guía con preguntas]
    C --> F[Consultar Gemini API]
    D --> F
    E --> F
    F --> G[Procesar respuesta de IA]
    G --> H[Renderizar fórmulas matemáticas con KaTeX]
```

---

## 🤖 Ingeniería de Prompts (Prompt Engineering)

El corazón de la inteligencia de MathSolver AI reside en cómo nos comunicamos con el modelo. He aplicado técnicas avanzadas de **Prompt Engineering** para asegurar que las respuestas sean precisas y útiles.

### 1. System Prompt (Personalidad y Reglas)

He definido un "System Prompt" robusto que actúa como la constitución del asistente. Establece:

* **Rol:** "Tutor Experto en Matemáticas".
* **Proceso de Pensamiento:** Antes de responder, el modelo debe internamente categorizar el problema y detectar el nivel del usuario.
* **Reglas Estrictas:** Solo responder sobre matemáticas. Si el usuario pregunta algo fuera de este dominio, el asistente declina educadamente con un mensaje predefinido.
* **Formateo Literario:** Obligatoriedad de usar delimitadores LaTeX `$ ... $` y `$$ ... $$` para que el frontend pueda renderizarlos.

### 2. Instrucciones Dinámicas (Few-Shot & Role-Play)

Dependiendo del modo seleccionado, el backend inyecta una instrucción específica al principio de la consulta:

* **Modo Rápido:** *Constraint Prompting* para forzar una respuesta mínima y directa.
* **Modo Detallado:** *Chain-of-Thought (CoT)* inducido, pidiendo explícitamente el paso a paso y la mención de teoremas.
* **Modo Quiz:** *Socratic Prompting*, prohibiendo dar la respuesta y obligando al modelo a guiar al usuario con preguntas estratégicas.

---

## 📸 OCR y Análisis Multimodal

Una de las características más poderosas de MathSolver AI es su capacidad para **analizar imágenes** de problemas matemáticos, ya sea escritos a mano o impresos en libros, cuadernos o pizarras.

### Implementación Técnica

* **Multer para Subida de Archivos:** Implementé `multer` en el backend para manejar archivos de forma segura. Los archivos se almacenan en memoria (no en disco), se convierten a base64 y se envían directamente a Gemini.
* **Gemini Multimodal:** Utilizo las capacidades nativas de visión de Gemini 1.5 Flash. No necesité bibliotecas externas de OCR como Tesseract, ya que Gemini procesa directamente las imágenes y extrae tanto texto como expresiones matemáticas.
* **Endpoint Dedicado:** Creé `/api/chat-with-file` que acepta `FormData` con el archivo adjunto y el modo de respuesta seleccionado.

### ¿Por qué Gemini en lugar de OCR tradicional?

Las soluciones tradicionales de OCR (como Tesseract) funcionan bien con texto plano, pero **fallan con notación matemática compleja** (fracciones, integrales, matrices). Gemini, al ser un modelo multimodal:

* Reconoce símbolos matemáticos con alta precisión.
* Comprende el **contexto** del problema (no solo transcribe, sino que entiende qué se está preguntando).
* Preserva la estructura de las ecuaciones para poder responder según el modo elegido (Rápido/Detallado/Quiz).

### Flujo de Análisis de Imágenes

1. Usuario adjunta una imagen usando el botón 📎.
2. El frontend genera un preview y la envía como `FormData`.
3. El backend convierte la imagen a base64.
4. Gemini recibe un mensaje con dos partes: texto (instrucción de modo) e imagen (datos inline).
5. La IA analiza la imagen, identifica el problema y responde según el modo seleccionado.

---

## 🧠 Decisiones y Arquitectura: "El Porqué de las Cosas"

### ¿Por qué tres modos de respuesta?

Me di cuenta de que no siempre busco lo mismo. A veces solo quiero confirmar un resultado (**Rápido**), otras necesito estudiar para un examen (**Detallado**) y otras quiero que me pongan a prueba (**Quiz**). Al separar estos "prompts" en el backend, logro que la IA se comporte exactamente como necesito sin que yo tenga que escribir instrucciones largas cada vez.

### ¿Por qué KaTeX y ReactMarkdown?

Nada me frustra más que ver fórmulas en texto plano como `x^2/sqrt(y)`. Quería que las expresiones se vieran como en un libro de texto. Elegí KaTeX por su velocidad y lo integré con Markdown para poder tener explicaciones ricas en texto combinadas con matemáticas impecables.

### Decisiones Técnicas

* Vite: Para un desarrollo instantáneo y una build ligera.
* Express: Para tener un puente seguro y escalable hacia la API de Google Gemini.
* Google Gemini (Flash): Por su increíble balance entre velocidad y razonamiento lógico-matemático.

---

## ⏱️ Gestión de Tiempos y Prioridades

No me enfoqué solo en "features", sino en **valor**.

1. **Prioridad 1 (Core):** Asegurar que la lógica matemática fuera sólida. No sirve de nada una interfaz bonita si el resultado es incorrecto.
2. **Prioridad 2 (UX):** El selector de modos. Sabía que esto me ahorraría tiempo a largo plazo al interactuar con la IA.
3. **Prioridad 3 (Estética):** El renderizado de KaTeX. Es el "toque final" que hace que el proyecto se sienta profesional.

*Si hubiera tenido menos tiempo, habría sacrificado los estilos avanzados antes que la precisión de la IA.*

---

## 🔄 Retrospectiva: Si empezara de nuevo

Si tuviera que reconstruir MathSolver AI desde cero, cambiaría un par de cosas:

* **Base de Datos:** Implementaría un historial de chats (MongoDB o similar) para no perder mis sesiones al refrescar.
* **Autenticación:** Añadiría un sistema de usuarios desde el día uno para personalizar aún más la experiencia de aprendizaje.
* **Subida de Imágenes:** Integraría visión artificial para poder enviarle una foto de mi cuaderno en lugar de escribir la ecuación.

---

## 🛠️ Detrás del Código: Mi Narrativa

Cuando programé el backend, mi reto fue hacer que el `SYSTEM_PROMPT` fuera lo suficientemente estricto para que la IA no se saliera del mundo de las matemáticas. Lo configuré para que actuara como un tutor experto, no solo como una calculadora. En el frontend, luché un poco con el CSS para que el chat se sintiera fluido en móviles, porque sé que muchas veces consultaré mis dudas desde el teléfono mientras estudio en mi escritorio.

---

## 🔧 Instalación y Despliegue

1. Clonar: `git clone https://github.com/lozadandres/MathSolver_AI.git`
2. Backend:
    * `npm install`
    * Crear `.env` con `OPENAI_API_KEY` (usamos Gemini, pero la variable mantiene el nombre por compatibilidad).
    * `node app.js`
3. Frontend:
    * `cd frontend && npm install && npm run dev`

---

## 📝 Licencia

Este proyecto es libre de uso bajo la licencia MIT.
