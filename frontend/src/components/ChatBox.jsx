import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('detallado');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para enviar mensaje al backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Agregar mensaje del usuario al chat
    const userMessage = { type: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Enviar solicitud al backend
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, mode: mode }),
      });

      if (!response.ok) {
        throw new Error('Error en la comunicación con el servidor');
      }

      // Procesar respuesta
      const data = await response.json();
      
      // Agregar respuesta del asistente al chat
      const botMessage = { type: 'bot', content: data };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Mostrar mensaje de error en el chat
      const errorMessage = { type: 'bot', content: 'Lo siento, ha ocurrido un error al procesar tu solicitud.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>MathSolver AI</h2>
        </div>
        <div className="sidebar-content">
          <div className="history-section">
            <span className="section-title">NUEVO CHAT</span>
            <button className="new-chat-btn" onClick={() => setMessages([])}>
              <span>+</span> Nuevo Problema
            </button>
          </div>
          <div className="mode-section">
            <span className="section-title">MODO DE RESPUESTA</span>
            <div className="mode-options">
              <button 
                type="button" 
                className={mode === 'rápido' ? 'active' : ''} 
                onClick={() => setMode('rápido')}
              >
                ⚡ Rápido
              </button>
              <button 
                type="button" 
                className={mode === 'detallado' ? 'active' : ''} 
                onClick={() => setMode('detallado')}
              >
                📚 Detallado
              </button>
              <button 
                type="button" 
                className={mode === 'quiz' ? 'active' : ''} 
                onClick={() => setMode('quiz')}
              >
                🧠 Quiz
              </button>
            </div>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <span className="user-name">Usuario</span>
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header-mobile">
          <h2>MathSolver AI</h2>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-card">
                <h1>¿En qué puedo ayudarte hoy?</h1>
                <p>MathSolver AI utiliza inteligencia artificial para brindarte soluciones precisas y detalladas.</p>
                <div className="suggestion-grid">
                  <button onClick={() => setInput('¿Cómo resolver ecuaciones y problemas matemáticos?')}>
                    Resolver ecuaciones y problemas
                  </button>
                  <button onClick={() => setInput('¿Puedes explicarme conceptos de álgebra, cálculo y geometría?')}>
                    Explicar conceptos matemáticos
                  </button>
                  <button onClick={() => setInput('¿Me puedes dar un ejemplo paso a paso?')}>
                    Ejemplos paso a paso
                  </button>
                  <button onClick={() => setInput('¿Puedes explicarme teoremas y fórmulas matemáticas?')}>
                    Teoremas y fórmulas
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.type}`}>
                  <div className="message-icon">
                    {msg.type === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-bubble">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-wrapper bot">
                  <div className="message-icon">🤖</div>
                  <div className="message-bubble loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="input-section">
          <form className="input-wrapper" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta de matemáticas..."
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || input.trim() === ''}>
              {isLoading ? '...' : '→'}
            </button>
          </form>
          <p className="input-footer">MathSolver AI puede cometer errores. Verifica la información importante.</p>
        </div>
      </main>
    </div>
  );
};

export default ChatBox;