// pages/dashboard/diagnostico/emergencia.tsx
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css";
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
  TruckIcon,
  LightBulbIcon,
  HandRaisedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

// Interfaz para los datos del formulario de Diagnóstico de Emergencia
interface DiagnosticoEmergenciaData {
  userId: string;
  nombreSolicitante: string;
  puestoSolicitante: string;
  nombreEmpresa: string;
  rfcEmpresa: string;
  giroIndustria: string;
  numeroEmpleados: string;
  antiguedadEmpresa: string;
  ubicacion: string;
  telefonoContacto: string;
  correoElectronico: string;
  sitioWebRedes: string;
  areaMayorProblema: string;
  problematicaEspecifica: string;
  principalPrioridad: string;
  problemaMasUrgente: string;
  impactoDelProblema: string;
  continuidadNegocio: "1" | "2" | "3" | "4" | "5" | "";
  flujoEfectivo: "Si" | "No" | "Parcialmente" | "";
  ventasDisminuido: "Si" | "No" | "No lo sé" | "";
  personalAfectado: "Si" | "No" | "No aplica" | "";
  operacionesCalidadTiempo: "Si" | "No" | "Parcialmente" | "";
  suministroMateriales: "Si" | "No" | "Parcialmente" | "";
  capacidadAdaptarse: "1" | "2" | "3" | "4" | "5" | "";
  apoyoExterno: "Si" | "No" | "Estoy buscando" | "";
  createdAt: string;
}

// Interfaz para el resultado del análisis del LLM (IA)
interface LLMAnalysisResult {
  diagnostico_rapido: string;
  acciones_inmediatas: string[];
  riesgo_general: "bajo" | "moderado" | "alto" | "critico";
  recomendaciones_clave: string[];
}

// Componente del Loader (Uiverse.io CSS)
const UiverseLoader = () => (
    <>
      <style jsx>{`
        .boxes {
          --size: 32px;
          --duration: 800ms;
          height: var(--size);
          width: calc(var(--size) * 4);
          position: relative;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
        }
        .boxes .box {
          width: var(--size);
          height: var(--size);
          top: 0;
          left: 0;
          position: absolute;
          transform-style: preserve-3d;
        }
        .boxes .box:nth-child(1) {
          transform: translate(100%, 0);
          animation: box1 var(--duration) linear infinite;
        }
        .boxes .box:nth-child(2) {
          transform: translate(0, 100%);
          animation: box2 var(--duration) linear infinite;
        }
        .boxes .box:nth-child(3) {
          transform: translate(100%, 100%);
          animation: box3 var(--duration) linear infinite;
        }
        .boxes .box:nth-child(4) {
          transform: translate(200%, 0);
          animation: box4 var(--duration) linear infinite;
        }
        .boxes .box > div {
          --background: #EF4444;
          --top: auto;
          --right: auto;
          --bottom: auto;
          --left: auto;
          --translateZ: calc(var(--size) / 2);
          --rotateY: 0deg;
          --rotateX: 0deg;
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--background);
          top: var(--top);
          right: var(--right);
          bottom: var(--bottom);
          left: var(--left);
          transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
        }
        .boxes .box > div:nth-child(1) {
          --top: 0;
          --left: 0;
          --translateZ: calc(var(--size) / 2);
        }
        .boxes .box > div:nth-child(2) {
          --background: #DC2626;
          --right: 0;
          --rotateY: 90deg;
          --translateZ: calc(var(--size) / 2);
        }
        .boxes .box > div:nth-child(3) {
          --background: #B91C1C;
          --bottom: 0;
          --rotateX: 90deg;
          --translateZ: calc(var(--size) / 2);
        }
        .boxes .box > div:nth-child(4) {
          --background: #991B1B;
          --left: 0;
          --rotateY: -90deg;
          --translateZ: calc(var(--size) / 2);
        }
        .boxes .box > div:nth-child(5) {
          --background: #7F1D1D;
          --top: 0;
          --left: 0;
          --translateZ: calc(var(--size) / -2);
        }
        .boxes .box > div:nth-child(6) {
          --background: #FEF2F2;
          --top: 0;
          --left: 0;
          --rotateX: -90deg;
          --translateZ: calc(var(--size) / 2);
        }
        @keyframes box1 {
          0%,
          50% { transform: translate(100%, 0); }
          100% { transform: translate(200%, 0); }
        }
        @keyframes box2 {
          0% { transform: translate(0, 100%); }
          50% { transform: translate(0, 0); }
          100% { transform: translate(100%, 0); }
        }
        @keyframes box3 {
          0%,
          50% { transform: translate(100%, 100%); }
          100% { transform: translate(0, 100%); }
        }
        @keyframes box4 {
          0% { transform: translate(200%, 0); }
          50% { transform: translate(200%, 100%); }
          100% { transform: translate(100%, 100%); }
        }
      `}</style>
      <div className="boxes">
        <div className="box">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
        <div className="box">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
        <div className="box">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
        <div className="box">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
    </>
);

// Componente para las burbujas del chatbot
interface ChatBubbleProps {
  message: string | React.ReactNode;
  isUser?: boolean;
  isLoader?: boolean;
}

const ChatBubble = ({ message, isUser = false, isLoader = false }: ChatBubbleProps) => {
  const alignClass = isUser ? "justify-end" : "justify-start";
  const bubbleClass = isUser
    ? "bg-red-600 text-white rounded-br-none"
    : "bg-gray-200 text-gray-800 rounded-bl-none";

  return (
    <div className={`flex mb-4 animate__animated animate__fadeIn ${alignClass}`}>
      <div className={`max-w-xs lg:max-w-md p-4 rounded-xl shadow-md ${bubbleClass}`}>
        {isLoader ? <UiverseLoader /> : message}
      </div>
    </div>
  );
};

// Array de preguntas del chatbot
const chatQuestions = [
  {
    key: "intro1",
    message: "El diagnóstico de emergencia te ayudará a identificar con rapidez las situaciones más críticas que enfrenta tu empresa, para que puedas tomar decisiones inmediatas y definir prioridades claras. Toda la información será tratada con confidencialidad y servirá únicamente para apoyarte en este momento crítico.",
    component: null, // Mensaje inicial
  },
  {
    key: "intro2",
    message: "¿Listo? A continuación, por favor complete la siguiente información general para contextualizar su diagnóstico:",
    component: null, // Mensaje inicial
  },
  // Datos Generales
  {
    key: "nombreSolicitante",
    message: "1/11. ¿Cuál es su nombre, por favor? ✍️",
    component: (props: any) => <input {...props} type="text" placeholder="Su nombre" />,
    dataKey: "nombreSolicitante",
  },
  {
    key: "puestoSolicitante",
    message: "2/11. ¿Cuál es su puesto en la empresa? 💼",
    component: (props: any) => <input {...props} type="text" placeholder="Puesto en la empresa" />,
    dataKey: "puestoSolicitante",
  },
  {
    key: "nombreEmpresa",
    message: "3/11. ¿Cómo se llama su empresa? 🏢",
    component: (props: any) => <input {...props} type="text" placeholder="Nombre de la empresa" />,
    dataKey: "nombreEmpresa",
  },
  {
    key: "rfcEmpresa",
    message: "4/11. Por favor, escriba el RFC de la empresa (si aplica).",
    component: (props: any) => <input {...props} type="text" placeholder="RFC de la empresa (opcional)" />,
    dataKey: "rfcEmpresa",
  },
  {
    key: "giroIndustria",
    message: "5/11. ¿A qué giro o industria pertenece su empresa? 🏭",
    component: (props: any) => <input {...props} type="text" placeholder="Giro o industria" />,
    dataKey: "giroIndustria",
  },
  {
    key: "numeroEmpleados",
    message: "6/11. ¿Cuántos empleados tiene actualmente? 👥",
    component: (props: any) => <input {...props} type="text" placeholder="Número de empleados" />,
    dataKey: "numeroEmpleados",
  },
  {
    key: "antiguedadEmpresa",
    message: "7/11. ¿Cuál es la antigüedad de la empresa en años? ⏳",
    component: (props: any) => <input {...props} type="text" placeholder="Antigüedad en años" />,
    dataKey: "antiguedadEmpresa",
  },
  {
    key: "ubicacion",
    message: "8/11. ¿En qué ciudad y estado se ubican? 📍",
    component: (props: any) => <input {...props} type="text" placeholder="Ej: Guadalajara, Jalisco" />,
    dataKey: "ubicacion",
  },
  {
    key: "telefonoContacto",
    message: "9/11. ¿Cuál es su número de teléfono de contacto? 📞",
    component: (props: any) => <input {...props} type="tel" placeholder="Número de teléfono" />,
    dataKey: "telefonoContacto",
  },
  {
    key: "correoElectronico",
    message: "10/11. ¿Cuál es su correo electrónico? 📧",
    component: (props: any) => <input {...props} type="email" placeholder="Correo electrónico" />,
    dataKey: "correoElectronico",
  },
  {
    key: "sitioWebRedes",
    message: "11/11. Por último, ¿tiene sitio web o redes sociales? 🌐",
    component: (props: any) => <input {...props} type="text" placeholder="URL o nombre de usuario (opcional)" />,
    dataKey: "sitioWebRedes",
  },
  // Problemática
  {
    key: "areaMayorProblema",
    message: "¿Cuál considera que es el área de la empresa en la que enfrenta mayores problemas actualmente? (Ej: Ventas, Finanzas, Operaciones...) 🚨",
    component: (props: any) => <input {...props} type="text" placeholder="Área principal" />,
    dataKey: "areaMayorProblema",
  },
  {
    key: "problematicaEspecifica",
    message: "¿Qué problemática específica siente que está afectando más a su empresa en este momento? 🤯",
    component: (props: any) => <textarea {...props} rows={3} placeholder="Describa la problemática" />,
    dataKey: "problematicaEspecifica",
  },
  {
    key: "principalPrioridad",
    message: "¿Cuál considera que es la principal prioridad para mejorar la situación de su empresa a corto plazo? 🎯",
    component: (props: any) => <textarea {...props} rows={2} placeholder="Describa su prioridad" />,
    dataKey: "principalPrioridad",
  },
  // Principal problema actual
  {
    key: "problemaMasUrgente",
    message: "En una frase, ¿cuál es el problema más urgente que enfrenta su empresa HOY? 💥",
    component: (props: any) => <textarea {...props} rows={2} placeholder="Problema más urgente" />,
    dataKey: "problemaMasUrgente",
  },
  {
    key: "impactoDelProblema",
    message: "¿Este problema afecta principalmente a las finanzas, a la operación, a los clientes o al personal? 📉",
    component: (props: any) => <textarea {...props} rows={2} placeholder="Impacto del problema" />,
    dataKey: "impactoDelProblema",
  },
  // Evaluación rápida de impacto
  {
    key: "continuidadNegocio",
    message: "En una escala del 1 al 5, ¿qué tan cerca está la empresa de detener operaciones por esta situación? (1 = sin impacto, 3 = riesgo moderado, 5 = riesgo inminente) 🛑",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    ),
    dataKey: "continuidadNegocio",
  },
  {
    key: "flujoEfectivo",
    message: "¿Cuenta con los recursos suficientes para cubrir gastos básicos (nómina, proveedores) por al menos un mes? 💰",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="Parcialmente">Parcialmente</option>
      </select>
    ),
    dataKey: "flujoEfectivo",
  },
  {
    key: "ventasDisminuido",
    message: "¿Las ventas han disminuido significativamente en los últimos 3 meses? 📉",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="No lo sé">No lo sé</option>
      </select>
    ),
    dataKey: "ventasDisminuido",
  },
  {
    key: "personalAfectado",
    message: "¿Ha tenido conflictos, ausencias o rotación de personal por esta situación? 😟",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="No aplica">No aplica</option>
      </select>
    ),
    dataKey: "personalAfectado",
  },
  {
    key: "operacionesCalidadTiempo",
    message: "¿La empresa puede seguir entregando productos o servicios con la calidad y en los tiempos que el cliente espera? ⚙️",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="Parcialmente">Parcialmente</option>
      </select>
    ),
    dataKey: "operacionesCalidadTiempo",
  },
  {
    key: "suministroMateriales",
    message: "¿Tiene asegurado el suministro de materiales e insumos críticos para seguir operando en las próximas semanas? 📦",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="Parcialmente">Parcialmente</option>
      </select>
    ),
    dataKey: "suministroMateriales",
  },
  {
    key: "capacidadAdaptarse",
    message: "En una escala del 1 al 5, ¿qué tan preparado(a) se siente para tomar decisiones rápidas y enfrentar esta situación? 🧠",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    ),
    dataKey: "capacidadAdaptarse",
  },
  {
    key: "apoyoExterno",
    message: "¿Cuenta con algún apoyo externo (consultores, asesores, asociaciones) para superar esta situación? 🤝",
    component: (props: any) => (
      <select {...props} className="w-full">
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="Estoy buscando">Estoy buscando</option>
      </select>
    ),
    dataKey: "apoyoExterno",
  },
];

const DiagnosticoEmergencia = () => {
  const { user } = useAuth();
  const router = useRouter();
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Estados para el chatbot
  const [step, setStep] = useState(0);
  const [datos, setDatos] = useState<DiagnosticoEmergenciaData>({
    userId: user?.uid || "",
    nombreSolicitante: "",
    puestoSolicitante: "",
    nombreEmpresa: "",
    rfcEmpresa: "",
    giroIndustria: "",
    numeroEmpleados: "",
    antiguedadEmpresa: "",
    ubicacion: "",
    telefonoContacto: "",
    correoElectronico: "",
    sitioWebRedes: "",
    areaMayorProblema: "",
    problematicaEspecifica: "",
    principalPrioridad: "",
    problemaMasUrgente: "",
    impactoDelProblema: "",
    continuidadNegocio: "",
    flujoEfectivo: "",
    ventasDisminuido: "",
    personalAfectado: "",
    operacionesCalidadTiempo: "",
    suministroMateriales: "",
    capacidadAdaptarse: "",
    apoyoExterno: "",
    createdAt: new Date().toISOString(),
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analisis, setAnalisis] = useState<LLMAnalysisResult | null>(null);

  // Efecto para asegurar que userId esté siempre actualizado
  useEffect(() => {
    if (user?.uid && datos.userId === "") {
      setDatos((prev) => ({ ...prev, userId: user.uid }));
    }
  }, [user, datos.userId]);

  // Efecto para inicializar la conversación del chatbot
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        { type: "bot", message: chatQuestions[0].message },
        { type: "bot", message: chatQuestions[1].message },
        { type: "bot", message: chatQuestions[2].message },
      ]);
    }
  }, []);

  // Efecto para hacer scroll al final de la conversación
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleNextStep = async () => {
    if (!currentAnswer && chatQuestions[step + 2].dataKey) {
      return; // No avanza si no hay respuesta y el campo es requerido
    }
    
    // Almacenar la respuesta del usuario
    const updatedDatos = { ...datos, [chatQuestions[step + 2].dataKey]: currentAnswer };
    setDatos(updatedDatos);
    
    // Agregar la respuesta del usuario al historial
    setChatHistory((prev) => [
      ...prev,
      { type: "user", message: currentAnswer },
    ]);
    setCurrentAnswer("");

    // Si es el último paso, enviar el formulario a la API
    if (step + 3 > chatQuestions.length) {
      await handleSubmit(updatedDatos);
      return;
    }

    // Añadir la siguiente pregunta del bot después de un pequeño retraso
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", message: chatQuestions[step + 3].message },
      ]);
      setStep(step + 1);
    }, 500);
  };

  const handleSubmit = async (finalDatos: DiagnosticoEmergenciaData) => {
    setIsLoading(true);
    setChatHistory((prev) => [
      ...prev,
      { type: "bot", message: "Analizando tus respuestas...", isLoader: true },
    ]);

    try {
      const response = await fetch('https://mentorapp-api-llm-1.onrender.com/api/diagnostico/emergencia/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalDatos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el diagnóstico.');
      }

      const result: LLMAnalysisResult = await response.json();
      setAnalisis(result);

      // Agregar los resultados del análisis al historial de chat
      setChatHistory((prev) => [
        ...prev.filter(item => !item.isLoader), // Remover el loader
        {
          type: "bot", message: (
            <>
              <h3 className="font-bold text-lg text-red-700">Diagnóstico Rápido:</h3>
              <p className="mt-2">{result.diagnostico_rapido}</p>
              <h3 className="font-bold text-lg text-red-700 mt-4">Acciones Inmediatas:</h3>
              <ul className="list-disc list-inside mt-2">
                {result.acciones_inmediatas.map((accion, index) => (
                  <li key={index}>{accion}</li>
                ))}
              </ul>
              <h3 className="font-bold text-lg mt-4">Riesgo General: <span className={getRiesgoColor(result.riesgo_general)}>{result.riesgo_general.toUpperCase()}</span></h3>
              <p className="mt-2 text-gray-700">Un consultor se pondrá en contacto contigo en breve para explicarte los resultados y acompañarte en los próximos pasos.</p>
            </>
          )
        }
      ]);

    } catch (error: any) {
      console.error("Error en el diagnóstico de emergencia:", error);
      setChatHistory((prev) => [
        ...prev.filter(item => !item.isLoader), // Remover el loader
        { type: "bot", message: `Ocurrió un error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiesgoColor = (riesgo: LLMAnalysisResult['riesgo_general']) => {
    switch (riesgo) {
      case 'bajo': return 'text-green-600';
      case 'moderado': return 'text-yellow-600';
      case 'alto': return 'text-orange-600';
      case 'critico': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderCurrentQuestion = () => {
    const currentQuestion = chatQuestions[step + 2];
    if (!currentQuestion || analisis) return null;

    const InputComponent = currentQuestion.component;
    return (
      <div className="flex items-center space-x-4 mt-4 animate__animated animate__fadeInUp">
        {InputComponent && (
          <>
            {/* Campo de texto o selección */}
            {currentQuestion.dataKey && (
              <InputComponent
                name={currentQuestion.dataKey}
                value={currentAnswer}
                onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                  setCurrentAnswer(e.target.value);
                }}
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            )}
          </>
        )}
        <button
          onClick={handleNextStep}
          disabled={isLoading || !currentAnswer}
          className={`p-3 rounded-full ${isLoading || !currentAnswer ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors duration-200`}
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>
      </div>
    );
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full bg-white p-8 rounded-xl shadow-lg animate__animated animate__fadeInDown border border-red-200">
          <h1 className="text-4xl font-extrabold text-center text-red-800 mb-4">
            Diagnóstico de Emergencia Empresarial
          </h1>
          <div ref={chatWindowRef} className="h-[60vh] overflow-y-auto p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
            {chatHistory.map((chat, index) => (
              <ChatBubble key={index} message={chat.message} isUser={chat.type === "user"} isLoader={chat.isLoader} />
            ))}
          </div>
          {!analisis && !isLoading && (
            <div className="animate__animated animate__fadeInUp">
              {renderCurrentQuestion()}
            </div>
          )}
          {analisis && (
            <div className="mt-8 text-center animate__animated animate__fadeIn">
              <p className="text-xl text-gray-700">¡Diagnóstico completo! Un consultor se pondrá en contacto contigo.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoEmergencia;