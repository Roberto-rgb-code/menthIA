import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';

// Cambia aquí si tu backend está en otro puerto/host.
// Por ejemplo: const API_URL = 'http://127.0.0.1:8000/api/chatbot'
const API_URL = process.env.NEXT_PUBLIC_MENTORAPP_API_URL
  ? `${process.env.NEXT_PUBLIC_MENTORAPP_API_URL}/api/chatbot`
  : 'https://mentorapp-api-llm-1.onrender.com/api/chatbot-ayuda';

const ChatbotPanel: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: string }[]>([
    { text: '¡Hola! Soy Grok, tu asistente en MentorApp. ¿En qué puedo ayudarte hoy? Puedo sugerirte servicios como asesorías, cursos, diagnósticos o el marketplace.', sender: 'assistant' },
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentChatInput, messages: chatMessages }),
      });

      // Intenta parsear respuesta incluso si falla
      let data = { reply: 'Lo siento, hubo un error inesperado.' };
      try {
        data = await response.json();
      } catch {}

      if (response.ok && data.reply) {
        setChatMessages((prev) => [...prev, { text: data.reply, sender: 'assistant' }]);
      } else {
        setChatMessages((prev) => [...prev, { text: data.reply ?? 'Lo siento, hubo un error al procesar tu mensaje. Intenta con algo diferente.', sender: 'assistant' }]);
      }
    } catch (error) {
      setChatMessages((prev) => [...prev, { text: 'Error al conectar con el chatbot. Intenta de nuevo más tarde.', sender: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Permitir Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && chatInput.trim() && !isLoading) {
      handleChatSubmit(e as any);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col h-[480px] border border-blue-200">
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-xl flex items-center gap-2">
        <FaRobot className="text-white text-xl" />
        <span className="font-semibold text-lg">Grok, Asistente MentorApp</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-blue-50 space-y-4">
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
                ${message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-blue-100'}
              `}
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
            <span className="inline-block p-3 rounded-lg rounded-bl-none bg-white text-gray-800 shadow-sm text-sm">
              Cargando<span className="animate-pulse">...</span>
            </span>
          </div>
        )}
        <div ref={chatMessagesEndRef} />
      </div>
      <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder={isLoading ? "Grok está escribiendo..." : "¿En qué puedo ayudarte?"}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
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
  );
};


export default ChatbotPanel;
