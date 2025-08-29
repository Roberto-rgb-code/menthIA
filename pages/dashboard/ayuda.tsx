import PrivateLayout from '../../components/layout/PrivateLayout'; // Cambiado a PrivateLayout
import ChatbotPanel from '../../components/ChatbotPanel';
import { FaQuestionCircle, FaBookOpen, FaEnvelopeOpenText } from 'react-icons/fa';

const FAQS = [
  {
    question: "¿Qué es MentorApp?",
    answer: "MentorApp es una plataforma para conectar a empresarios y emprendedores con mentores expertos, acceso a cursos, diagnósticos empresariales y un marketplace de soluciones."
  },
  {
    question: "¿Cómo puedo recibir una asesoría?",
    answer: "Solo crea tu perfil, responde el diagnóstico y navega al directorio de mentores. Puedes filtrar y contactar al mentor que mejor se adapte a tus necesidades."
  },
  {
    question: "¿Qué servicios ofrece la plataforma?",
    answer: "Ofrecemos asesorías personalizadas, cursos en línea, diagnósticos empresariales inteligentes, eventos y acceso a un marketplace de soluciones para tu negocio."
  },
  {
    question: "¿El registro es gratuito?",
    answer: "¡Sí! Puedes crear una cuenta gratis. Algunos servicios premium o asesorías especializadas pueden tener costo, pero explorar la plataforma no tiene costo."
  },
  {
    question: "¿Cómo puedo contactar soporte?",
    answer: "Si tienes dudas o problemas técnicos, utiliza el chat inteligente de esta página o escríbenos a soporte@mentorapp.com."
  },
];

const Ayuda = () => {
  return (
    <PrivateLayout> {/* Cambiado a PrivateLayout */}
      {/* Hero */}
      <section className="text-center py-12 bg-blue-50">
        <h1 className="text-4xl font-bold text-blue-900 flex items-center justify-center gap-2">
          <FaQuestionCircle className="text-blue-700" /> Centro de Ayuda MentorApp
        </h1>
        <p className="mt-4 text-lg text-blue-700">
          ¿Tienes dudas? Encuentra respuestas rápidas o chatea con Grok, nuestro asistente inteligente.
        </p>
      </section>

      {/* Preguntas Frecuentes */}
      <section className="py-12">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <FaBookOpen className="text-green-600" /> Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-blue-700">{faq.question}</h3>
                <p className="mt-2 text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Fijo y Centrado */}
      <section className="py-12 bg-blue-50 flex justify-center">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Ayuda instantánea</h2>
          <ChatbotPanel />
        </div>
      </section>

      {/* Contacto Directo */}
      <section className="py-12">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaEnvelopeOpenText className="text-pink-600" /> ¿Necesitas más ayuda?
          </h2>
          <p className="mb-4 text-gray-600">Si tu duda persiste, puedes contactarnos directamente:</p>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-700"><b>Email:</b> soporte@mentorapp.com</p>
            <p className="text-gray-700"><b>WhatsApp:</b> +52 123 456 7890</p>
          </div>
        </div>
      </section>
    </PrivateLayout>
  );
};

export default Ayuda;
