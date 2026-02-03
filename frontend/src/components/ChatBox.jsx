import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import '../styles/ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('detallado');
  const [language, setLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para manejar la selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview si es imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Función para cancelar archivo seleccionado
  const handleCancelFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para enviar mensaje al backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' && !selectedFile) return;

    // Agregar mensaje del usuario al chat
    const userMessage = { 
      type: 'user', 
      content: input || '(Archivo adjunto)',
      file: selectedFile ? { name: selectedFile.name, preview: previewUrl } : null
    };
    setMessages([...messages, userMessage]);
    
    const messageText = input;
    const fileToSend = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      let response;
      
      // Si hay archivo, usar FormData
      if (fileToSend) {
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('mode', mode);
        formData.append('lang', language);
        formData.append('file', fileToSend);
        
        response = await fetch('http://localhost:3000/api/chat-with-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Sin archivo, usar JSON
        response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: messageText, mode: mode, lang: language }),
        });
      }

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
                className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`} 
                onClick={() => setMode('quiz')}
              >
                <span className="mode-icon">🧠</span> Quiz
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">IDIOMA / LANGUAGE</h3>
            <div className="lang-selector">
              <button 
                className={`lang-btn ${language === 'es' ? 'active' : ''}`} 
                onClick={() => setLanguage('es')}
              >
                🇪🇸 ES
              </button>
              <button 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
                onClick={() => setLanguage('en')}
              >
                🇺🇸 EN
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
                      remarkPlugins={[remarkMath, remarkGfm]} 
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
          {selectedFile && (
            <div className="file-preview-container">
              <div className="file-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <div className="file-icon">📄</div>
                )}
                <span className="file-name">{selectedFile.name}</span>
                <button type="button" className="remove-file-btn" onClick={handleCancelFile}>
                  ✕
                </button>
              </div>
            </div>
          )}
          <form className="input-wrapper" onSubmit={sendMessage}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              📎
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta de matemáticas..."
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || (input.trim() === '' && !selectedFile)}>
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