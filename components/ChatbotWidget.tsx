// components/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaTimes, FaCommentDots } from 'react-icons/fa';

interface ChatbotWidgetProps {}

const API_URL = 'https://mentorapp-api-llm-1.onrender.com/api/chatbot'; // FastAPI endpoint

const ChatbotWidget: React.FC<ChatbotWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: string }[]>([
    {
      text: '¡Hola! Soy tu asistente en MentorIA. ¿En qué puedo ayudarte hoy? Puedo sugerirte servicios como asesorías, cursos, diagnósticos o el marketplace.',
      sender: 'assistant',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const currentChatInput = chatInput;
    const newMessage = { text: currentChatInput, sender: 'user' };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      // Llama directo al backend FastAPI
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentChatInput,
          messages: chatMessages,
        }),
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { text: data.reply, sender: 'assistant' },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { text: 'Lo siento, hubo un error al procesar tu mensaje. Intenta con algo diferente.', sender: 'assistant' },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { text: 'Error al conectar con el chatbot. Intenta de nuevo más tarde.', sender: 'assistant' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 z-50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar Chat" : "Abrir Chat"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
      </button>

      {/* Widget */}
      <div
        className={`fixed bottom-20 right-6 w-80 h-[450px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'}`}
      >
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <FaRobot className="mr-2" /> MentorIA, tu Asistente
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Cerrar Chat"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <FaRobot className="text-blue-500 text-xl mr-2 flex-shrink-0" />
              )}
              <span
                className={`inline-block p-3 rounded-lg max-w-[80%] break-words shadow-sm text-sm
                  ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
              >
                {message.text}
              </span>
              {message.sender === 'user' && (
                <FaUser className="text-gray-600 text-xl ml-2 flex-shrink-0" />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-center">
              <FaRobot className="text-blue-500 text-xl mr-2" />
              <span className="inline-block p-3 rounded-lg rounded-bl-none bg-gray-200 text-gray-800 shadow-sm text-sm">
                Cargando<span className="animate-pulse">...</span>
              </span>
            </div>
          )}
          <div ref={chatMessagesEndRef} />
        </div>
        {/* Formulario */}
        <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder={isLoading ? "Grok está escribiendo..." : "¿En qué puedo ayudarte?"}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={isLoading || !chatInput.trim()}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};


export default ChatbotWidget;
