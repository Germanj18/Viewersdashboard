import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import './AIChat.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '¡Hola! 👋 Soy tu asistente IA para el Dashboard de Métricas. Puedo ayudarte con:\n\n• Cálculos de viewers necesarios\n• Optimización de costos\n• Configuración de bloques\n• Análisis de métricas\n• Estrategias de crecimiento\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Aquí puedes cambiar por la API que prefieras
      const response = await callAIAPI(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta de IA:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callAIAPI = async (userInput: string): Promise<string> => {
    // Contexto específico del dashboard para la IA
    const systemContext = `
    Eres un asistente especializado en el Dashboard de Métricas para YouTube viewers. 
    
    INFORMACIÓN DEL SISTEMA:
    - Es un dashboard para comprar viewers de YouTube
    - Los servicios disponibles son:
      * Service ID 334: 1 hora - viewers temporales
      * Service ID 335: 1.5 horas - viewers temporales  
      * Service ID 336: 2 horas - viewers temporales
      * Service ID 337: 2.5 horas - viewers temporales
      * Service ID 338: 3 horas - viewers temporales
      * Service ID 459: 4 horas - viewers temporales
      * Service ID 460: 6 horas - viewers temporales
      * Service ID 657: 8 horas - viewers temporales
    - Los costos varían según la cantidad y duración
    - Los usuarios pueden configurar múltiples bloques para diferentes videos
    - El sistema rastrea métricas como tasa de éxito, costos totales, etc.
    
    INSTRUCCIONES:
    - Responde en español de manera amigable y profesional
    - Da consejos específicos y prácticos
    - Si preguntan sobre cálculos, proporciona ejemplos concretos
    - Si preguntan sobre estrategias, explica pros y contras
    - Mantén las respuestas concisas pero informativas
    - Usa emojis ocasionalmente para hacer la conversación más amigable
    `;

    // Opción 1: OpenAI API (reemplaza con tu API key)
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userInput }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      // Fallback: respuestas predefinidas si no hay API disponible
      return generateFallbackResponse(userInput);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('viewer') && (input.includes('cuanto') || input.includes('cantidad'))) {
      return `📊 Para calcular viewers necesarios, considera:

• **Meta de viewers**: Define tu objetivo (ej: 1000 viewers)
• **Duración**: Elige el servicio adecuado (1h-8h)
• **Presupuesto**: Los servicios más largos suelen ser más eficientes
• **Timing**: Programa las operaciones en horas pico

💡 **Ejemplo**: Para 1000 viewers en 2 horas, usa Service ID 336 con la cantidad deseada dividida entre los bloques que planees usar.

¿Tienes una meta específica en mente?`;
    }
    
    if (input.includes('costo') || input.includes('precio')) {
      return `💰 **Optimización de Costos**:

• **Servicios largos**: Mejor costo por viewer (6h-8h)
• **Servicios cortos**: Más flexibilidad pero mayor costo
• **Múltiples bloques**: Divide la carga para mejor gestión
• **Horarios**: Algunos momentos pueden tener mejor rendimiento

📈 Revisa el dashboard para ver tu "Costo por Viewer" actual y optimiza desde ahí.

¿Quieres que te ayude a calcular el costo para una campaña específica?`;
    }
    
    if (input.includes('bloque') || input.includes('configurar')) {
      return `⚙️ **Configuración de Bloques**:

1. **URL del video**: Asegúrate que sea pública
2. **Cantidad de viewers**: Divide entre bloques para mejor control
3. **Duración del servicio**: Elige según tu estrategia
4. **Timing**: Programa cuando tu audiencia esté más activa

💡 **Tip**: Usa múltiples bloques para distribuir la carga y tener mejor control sobre el proceso.

¿Necesitas ayuda con alguna configuración específica?`;
    }
    
    if (input.includes('estrategia') || input.includes('crecer')) {
      return `🚀 **Estrategias de Crecimiento**:

• **Consistencia**: Mejor varios videos con pocos viewers que uno con muchos
• **Timing**: Publica y promociona en horas pico de tu audiencia
• **Combinación**: Usa viewers + engagement orgánico real
• **Análisis**: Revisa las métricas del dashboard regularmente

📊 El dashboard te muestra patrones de éxito que puedes replicar.

¿Quieres que analicemos tu estrategia actual?`;
    }
    
    return `🤔 Entiendo tu consulta. Te puedo ayudar con:

• **Cálculos de viewers** y optimización de costos
• **Configuración de bloques** y mejores prácticas  
• **Análisis de métricas** y patrones de éxito
• **Estrategias de crecimiento** para YouTube

¿Podrías ser más específico sobre lo que necesitas? Por ejemplo:
- "¿Cuántos viewers necesito para llegar a X?"
- "¿Cómo optimizo mis costos?"
- "¿Cuál es la mejor estrategia para mi canal?"`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: '¡Chat reiniciado! 🔄 ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`ai-chat-button ${theme}`}
          title="Hablar con IA Assistant"
        >
          🤖
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className={`ai-chat-container ${theme}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-icon">🤖</span>
              <div>
                <h4>IA Assistant</h4>
                <span className="ai-status">En línea</span>
              </div>
            </div>
            <div className="ai-chat-controls">
              <button 
                onClick={clearChat} 
                className="ai-control-btn"
                title="Limpiar chat"
              >
                🗑️
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="ai-control-btn"
                title="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ${message.type}`}
              >
                <div className="ai-message-content">
                  <div className="ai-message-text">
                    {message.content.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="ai-message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="ai-message ai">
                <div className="ai-message-content">
                  <div className="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntame sobre viewers, costos, estrategias..."
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="ai-send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
