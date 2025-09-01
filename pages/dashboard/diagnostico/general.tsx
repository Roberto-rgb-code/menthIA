// pages/dashboard/diagnostico/general.tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css"; // Asegúrate de que animate.css esté importado

// Iconos para el chatbot (opcional, para visualización de mensajes)
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

// Interfaz para los datos del formulario de Diagnostico General
interface DiagnosticoGeneralData {
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
  // Problemática
  areaMayorProblema: string;
  problematicaEspecifica: string;
  principalPrioridad: string;
  // Área 1: Dirección General
  dg_misionVisionValores: "1" | "2" | "3" | "4" | "5" | "";
  dg_objetivosClaros: "1" | "2" | "3" | "4" | "5" | "";
  dg_analisisFoda: "1" | "2" | "3" | "4" | "5" | "";
  dg_situacionGeneralEmpresa: string;
  dg_principalProblemaActual: string;
  // Área 2: Finanzas y Administración
  fa_margenGanancia: "1" | "2" | "3" | "4" | "5" | "";
  fa_estadosFinancierosActualizados: "1" | "2" | "3" | "4" | "5" | "";
  fa_liquidezSuficiente: "1" | "2" | "3" | "4" | "5" | "";
  fa_razonBajaLiquidez: string;
  fa_gastosIdentificadosControlados: "1" | "2" | "3" | "4" | "5" | "";
  // Área 3: Operaciones / Producción
  op_capacidadCubreDemanda: "1" | "2" | "3" | "4" | "5" | "";
  op_procesosDocumentadosFacilesSeguir: "1" | "2" | "3" | "4" | "5" | "";
  op_calidadProductosServicios: "1" | "2" | "3" | "4" | "5" | "";
  op_factorBajaCalidad: string;
  op_inventariosControladosRotacionAdecuada: "1" | "2" | "3" | "4" | "5" | "";
  // Área 4: Marketing y Ventas
  mv_clienteIdealValora: "1" | "2" | "3" | "4" | "5" | "";
  mv_planMarketingDocumentado: "1" | "2" | "3" | "4" | "5" | "";
  mv_canalesVentaAdecuados: "1" | "2" | "3" | "4" | "5" | "";
  mv_canalExplorar: string;
  mv_marcaReconocidaValorada: "1" | "2" | "3" | "4" | "5" | "";
  // Área 5: Recursos Humanos
  rh_organigramaClaroFuncionesDefinidas: "1" | "2" | "3" | "4" | "5" | "";
  rh_personalCapacitado: "1" | "2" | "3" | "4" | "5" | "";
  rh_climaLaboralProductividad: "1" | "2" | "3" | "4" | "5" | "";
  rh_factorAfectaClimaLaboral: string;
  rh_sistemaRemuneracionCompetitivoJusto: "1" | "2" | "3" | "4" | "5" | "";
  // Área 6: Logística y Cadena de Suministro
  lc_proveedoresCumplenTiempoForma: "1" | "2" | "3" | "4" | "5" | "";
  lc_procesosAseguranEntregasTiempo: "1" | "2" | "3" | "4" | "5" | "";
  lc_costosLogisticosControladosCompetitivos: "1" | "2" | "3" | "4" | "5" | "";
  lc_principalObstaculoCadenaSuministro: string;
  lc_areaMayorAtencionOperacion: string;

  createdAt: string;
}

// Interfaz para el resultado del análisis del LLM (IA) para Diagnóstico General
interface LLMAnalysisResult {
  resumen_ejecutivo: string;
  areas_oportunidad: string[];
  recomendaciones_clave: string[];
  puntuacion_madurez_promedio: number;
  nivel_madurez_general: "muy_bajo" | "bajo" | "medio" | "alto" | "muy_alto";
}

// Definición de tipos de mensajes para el chat
interface ChatMessage {
  sender: "bot" | "user";
  text: string | React.ReactNode; // Can be text or React components for questions
  questionId?: keyof DiagnosticoGeneralData | string; // questionId can be a key or a generic string for info messages
  type?: "open" | "likert" | "info"; // Type of input expected/provided
  area?: string; // To group questions
}

// Definición de las preguntas del diagnóstico
// Se han mapeado las preguntas del prompt a IDs descriptivos
const questions = [
  // Introducción
  { id: "intro1", type: "info", text: "¡Hola! Soy tu asistente para el diagnóstico empresarial general. Este diagnóstico te ayudará a comprender mejor la situación actual de tu empresa, identificando fortalezas y áreas de oportunidad para tomar decisiones más informadas.", area: "Introducción" },
  { id: "intro2", type: "info", text: "A través de preguntas organizadas por áreas clave, podrás reflexionar sobre distintos aspectos de tu negocio. Sabemos que algunas respuestas pueden ser incómodas, pero son esenciales para tener una visión honesta y clara.", area: "Introducción" },
  { id: "intro3", type: "info", text: "Toda la información será tratada con confidencialidad y servirá únicamente para apoyarte en el desarrollo de tu empresa. Al finalizar, un consultor te contactará para explicarte los resultados y orientarte en los siguientes pasos.", area: "Introducción" },
  { id: "intro4", type: "info", text: "Las preguntas en este diagnóstico utilizan dos formatos complementarios: **Preguntas abiertas** (para que puedas expresarte con libertad) y **Preguntas con escala de Likert** (del 1 al 5, para obtener datos más precisos).", area: "Introducción" },
  { id: "intro5", type: "info", text: "Para las preguntas de Likert, la interpretación de cada nivel es la siguiente:\n\n**1️⃣: Difuso, poco claro, no desarrollado; no se cumplen los objetivos; no se percibe valor.**\n**2️⃣: Se realiza de manera ocasional e informal; a veces se cumplen los objetivos; se percibe poco valor.**\n**3️⃣: Se realiza regularmente, pero sin procesos definidos y de forma perceptiva; se cumplen los objetivos; se percibe valor principalmente a nivel regional.**\n**4️⃣: Se realiza correctamente, con seguimiento y mediciones básicas; se cumplen los objetivos con procesos estandarizados; se reconoce su alto valor a nivel nacional.**\n**5️⃣: Se realiza de manera excelente, automatizada y con indicadores de desempeño; se cumplen los objetivos con altos estándares; es reconocido a nivel internacional.**", area: "Introducción" },
  { id: "intro6", type: "info", text: "¿Listo para comenzar?", area: "Introducción" },

  // Área 0: Formato Básico del Empresario - Datos Generales (Open)
  { id: "nombreSolicitante", type: "open", text: "Para empezar, por favor, dime tu **Nombre Completo**.", area: "Datos Generales" },
  { id: "puestoSolicitante", type: "open", text: "Ahora, ¿cuál es tu **Puesto** en la empresa?", area: "Datos Generales" },
  { id: "nombreEmpresa", type: "open", text: "¿Cuál es el **Nombre de tu Empresa**?", area: "Datos Generales" },
  { id: "rfcEmpresa", type: "open", text: "¿Podrías proporcionar el **RFC de la empresa**? (Opcional)", area: "Datos Generales" },
  { id: "giroIndustria", type: "open", text: "¿A qué **Giro o Industria** pertenece tu empresa?", area: "Datos Generales" },
  { id: "numeroEmpleados", type: "open", text: "¿Cuántos **empleados** tienen actualmente?", area: "Datos Generales" },
  { id: "antiguedadEmpresa", type: "open", text: "¿Cuántos **años de antigüedad** tiene la empresa?", area: "Datos Generales" },
  { id: "ubicacion", type: "open", text: "¿En qué **ciudad y estado** se ubica la empresa?", area: "Datos Generales" },
  { id: "telefonoContacto", type: "open", text: "¿Cuál es tu **teléfono de contacto**?", area: "Datos Generales" },
  { id: "correoElectronico", type: "open", text: "Y tu **correo electrónico**?", area: "Datos Generales" },
  { id: "sitioWebRedes", type: "open", text: "¿Tienes un **sitio web o redes sociales** de la empresa? (Opcional)", area: "Datos Generales" },

  // Área 0: Formato Básico del Empresario - Problemática (Open)
  { id: "areaMayorProblema", type: "open", text: "Ahora, hablemos de los desafíos. ¿Cuál considera que es el **área de la empresa en la que enfrentas mayores problemas** actualmente?", area: "Problemática" },
  { id: "problematicaEspecifica", type: "open", text: "¿Qué **problemática específica** sientes que está afectando más a tu empresa en este momento?", area: "Problemática" },
  { id: "principalPrioridad", type: "open", text: "¿Cuál considera que es la **principal prioridad para mejorar la situación** de tu empresa a corto plazo?", area: "Problemática" },

  // Área 1: Dirección General y Planeación (Likert 1-5)
  { id: "dg_misionVisionValores", type: "likert", text: "1. ¿La empresa tiene misión, visión y valores claros y conocidos por el equipo? (por ejemplo: “Ser la mejor panadería del barrio”)", area: "Dirección General" },
  { id: "dg_objetivosClaros", type: "likert", text: "2. ¿La alta dirección define objetivos claros y medibles para la empresa? (por ejemplo: aumentar ventas 20%, abrir una nueva sucursal)", area: "Dirección General" },
  { id: "dg_analisisFoda", type: "likert", text: "3. ¿Se realiza un análisis FODA periódicamente (fortalezas, oportunidades, debilidades y amenazas)?", area: "Dirección General" },
  { id: "dg_situacionGeneralEmpresa", type: "open", text: "4. ¿Cómo describirías la situación general de la empresa hoy? (por ejemplo: estable, en crisis, en crecimiento, estancada)", area: "Dirección General" },
  { id: "dg_principalProblemaActual", type: "open", text: "5. ¿Cuál consideras que es el principal problema actual que enfrenta la empresa? (por ejemplo: pocas ventas, mala organización, falta de personal)", area: "Dirección General" },

  // Área 2: Finanzas y Administración (Likert 1-5)
  { id: "fa_margenGanancia", type: "likert", text: "6. ¿Conoces el margen de ganancia de tus productos o servicios? (por ejemplo: por cada 100 pesos que vendo, me quedan 20 de ganancia)", area: "Finanzas y Administración" },
  { id: "fa_estadosFinancierosActualizados", type: "likert", text: "7. ¿La empresa cuenta con estados financieros actualizados y revisados regularmente?", area: "Finanzas y Administración" },
  { id: "fa_liquidezSuficiente", type: "likert", text: "8. ¿Tu empresa tiene liquidez suficiente para cubrir sus gastos a corto plazo?", area: "Finanzas y Administración" },
  { id: "fa_razonBajaLiquidez", type: "open", text: "9. Si la respuesta anterior fue baja, ¿a qué lo atribuyes? (por ejemplo: muchas deudas, pocas ventas, gastos elevados)", area: "Finanzas y Administración" },
  { id: "fa_gastosIdentificadosControlados", type: "likert", text: "10. ¿Los gastos fijos y variables están identificados y controlados?", area: "Finanzas y Administración" },

  // Área 3: Operaciones / Producción (Likert 1-5)
  { id: "op_capacidadCubreDemanda", type: "likert", text: "11. ¿Tu capacidad actual de producción o servicio cubre la demanda? (por ejemplo: puedes atender todos los pedidos sin retrasos)", area: "Operaciones / Producción" },
  { id: "op_procesosDocumentadosFacilesSeguir", type: "likert", text: "12. ¿Los procesos clave están documentados y son fáciles de seguir? (por ejemplo: manuales o instrucciones claras para todos)", area: "Operaciones / Producción" },
  { id: "op_calidadProductosServicios", type: "likert", text: "13. ¿Cómo calificas la calidad de tus productos o servicios? (por ejemplo: cumplen con lo prometido y sin fallas)", area: "Operaciones / Producción" },
  { id: "op_factorBajaCalidad", type: "open", text: "14. Si la calidad es baja, ¿qué factor lo provoca? (por ejemplo: proveedores, personal no capacitado, materiales)", area: "Operaciones / Producción" },
  { id: "op_inventariosControladosRotacionAdecuada", type: "likert", text: "15. ¿Tus inventarios están controlados y tienen una rotación adecuada?", area: "Operaciones / Producción" },

  // Área 4: Marketing y Ventas (Likert 1-5)
  { id: "mv_clienteIdealValora", type: "likert", text: "16. ¿Conoces claramente a tu cliente ideal y qué valora más? (por ejemplo: mujeres jóvenes que buscan moda económica, clientes que valoran rapidez)", area: "Marketing y Ventas" },
  { id: "mv_planMarketingDocumentado", type: "likert", text: "17. ¿Cuentas con un plan de marketing definido y documentado? (por ejemplo: sabes qué canales usar, qué promociones hacer y cuándo)", area: "Marketing y Ventas" },
  { id: "mv_canalesVentaAdecuados", type: "likert", text: "18. ¿Los canales de venta que utilizas son adecuados para llegar a tus clientes? (por ejemplo: tienda física, redes sociales, distribuidores)", area: "Marketing y Ventas" },
  { id: "mv_canalExplorar", type: "open", text: "19. Si respondiste bajo en la anterior, ¿qué canal crees que deberías explorar? (por ejemplo: venta online, alianzas, más puntos de venta)", area: "Marketing y Ventas" },
  { id: "mv_marcaReconocidaValorada", type: "likert", text: "20. ¿Tu marca es reconocida y bien valorada frente a tus competidores? (por ejemplo: prefieren tu producto sobre otros similares)", area: "Marketing y Ventas" },

  // Área 5: Recursos Humanos (Likert 1-5)
  { id: "rh_organigramaClaroFuncionesDefinidas", type: "likert", text: "21. ¿La empresa tiene un organigrama claro con funciones definidas?", area: "Recursos Humanos" },
  { id: "rh_personalCapacitado", type: "likert", text: "22. ¿El personal está capacitado para desempeñar sus funciones correctamente? (por ejemplo: saben usar la maquinaria, vender, atender clientes)", area: "Recursos Humanos" },
  { id: "rh_climaLaboralProductividad", type: "likert", text: "23. ¿El clima laboral favorece la productividad? (por ejemplo: buena comunicación, buen trato, ambiente sano)", area: "Recursos Humanos" },
  { id: "rh_factorAfectaClimaLaboral", type: "open", text: "24. Si el clima es malo, ¿qué factor lo afecta más? (por ejemplo: conflictos personales, exceso de trabajo, falta de liderazgo)", area: "Recursos Humanos" },
  { id: "rh_sistemaRemuneracionCompetitivoJusto", type: "likert", text: "25. ¿El sistema de remuneración es competitivo y justo para los empleados?", area: "Recursos Humanos" },

  // Área 6: Logística y Cadena de Suministro (Likert 1-5)
  { id: "lc_proveedoresCumplenTiempoForma", type: "likert", text: "26. ¿Tus proveedores cumplen en tiempo y forma? (por ejemplo: entregan a tiempo y con la calidad requerida)", area: "Logística y Cadena de Suministro" },
  { id: "lc_procesosAseguranEntregasTiempo", type: "likert", text: "27. ¿La empresa cuenta con procesos para asegurar entregas a clientes a tiempo? (por ejemplo: planeación de rutas, monitoreo de pedidos)", area: "Logística y Cadena de Suministro" },
  { id: "lc_costosLogisticosControladosCompetitivos", type: "likert", text: "28. ¿Los costos logísticos están controlados y son competitivos?", area: "Logística y Cadena de Suministro" },
  { id: "lc_principalObstaculoCadenaSuministro", type: "open", text: "29. Si tu cadena de suministro presenta problemas, ¿dónde está el principal obstáculo? (por ejemplo: proveedores, transporte, almacén, personal)", area: "Logística y Cadena de Suministro" },
  { id: "lc_areaMayorAtencionOperacion", type: "open", text: "30. ¿Qué área crees que necesita mayor atención para mejorar toda la operación? (por ejemplo: ventas, finanzas, producción, personal, logística)", area: "Logística y Cadena de Suministro" },
];


// Componente del Loader de Uiverse.io (reutilizado)
const UiverseLoader = () => (
  <>
    <style jsx>{`
      /* CSS for the Uiverse.io Boxes Loader */
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
        --background: #4F46E5; /* Tailwind indigo-600 for general theme */
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
        --background: #4338CA; /* Tailwind indigo-700 */
        --right: 0;
        --rotateY: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(3) {
        --background: #3730A3; /* Tailwind indigo-800 */
        --bottom: 0;
        --rotateX: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(4) {
        --background: #312E81; /* Tailwind indigo-900 */
        --left: 0;
        --rotateY: -90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(5) {
        --background: #EEF2FF; /* Tailwind indigo-50 */
        --top: 0;
        --left: 0;
        --translateZ: calc(var(--size) / -2);
      }

      .boxes .box > div:nth-child(6) {
        --background: #C7D2FE; /* Tailwind indigo-200 */
        --top: 0;
        --left: 0;
        --rotateX: -90deg;
        --translateZ: calc(var(--size) / 2);
      }

      @keyframes box1 {
        0%,
        50% {
          transform: translate(100%, 0);
        }

        100% {
          transform: translate(200%, 0);
        }
      }

      @keyframes box2 {
        0%{
          transform: translate(0, 100%);
        }

        50% {
          transform: translate(0, 0);
        }

        100% {
          transform: translate(100%, 0);
        }
      }

      @keyframes box3 {
        0%,
        50% {
          transform: translate(100%, 100%);
        }

        100% {
          transform: translate(0, 100%);
        }
      }

      @keyframes box4 {
        0%{
          transform: translate(200%, 0);
        }

        50% {
          transform: translate(200%, 100%);
        }

        100% {
          transform: translate(100%, 100%);
        }
      }
    `}</style>
    <div className="boxes">
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </>
);

const DiagnosticoGeneralChatbot = () => {
  const { user } = useAuth();
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initialData: DiagnosticoGeneralData = {
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
    // Área 1: Dirección General
    dg_misionVisionValores: "",
    dg_objetivosClaros: "",
    dg_analisisFoda: "",
    dg_situacionGeneralEmpresa: "",
    dg_principalProblemaActual: "",
    // Área 2: Finanzas y Administración
    fa_margenGanancia: "",
    fa_estadosFinancierosActualizados: "",
    fa_liquidezSuficiente: "",
    fa_razonBajaLiquidez: "",
    fa_gastosIdentificadosControlados: "",
    // Área 3: Operaciones / Producción
    op_capacidadCubreDemanda: "",
    op_procesosDocumentadosFacilesSeguir: "",
    op_calidadProductosServicios: "",
    op_factorBajaCalidad: "",
    op_inventariosControladosRotacionAdecuada: "",
    // Área 4: Marketing y Ventas
    mv_clienteIdealValora: "",
    mv_planMarketingDocumentado: "",
    mv_canalesVentaAdecuados: "",
    mv_canalExplorar: "",
    mv_marcaReconocidaValorada: "",
    // Área 5: Recursos Humanos
    rh_organigramaClaroFuncionesDefinidas: "",
    rh_personalCapacitado: "",
    rh_climaLaboralProductividad: "",
    rh_factorAfectaClimaLaboral: "",
    rh_sistemaRemuneracionCompetitivoJusto: "",
    // Área 6: Logística y Cadena de Suministro
    lc_proveedoresCumplenTiempoForma: "",
    lc_procesosAseguranEntregasTiempo: "",
    lc_costosLogisticosControladosCompetitivos: "",
    lc_principalObstaculoCadenaSuministro: "",
    lc_areaMayorAtencionOperacion: "",
    createdAt: new Date().toISOString(),
  };

  const [answers, setAnswers] = useState<DiagnosticoGeneralData>(initialData);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LLMAnalysisResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Effect to set userId and trigger the bot to ask the next question
  useEffect(() => {
    if (user?.uid && answers.userId === "") {
      setAnswers((prev) => ({ ...prev, userId: user.uid }));
    }

    if (currentQuestionIndex < questions.length && !showSummary) {
      setIsTyping(true);
      setTimeout(() => {
        const questionToAsk = questions[currentQuestionIndex];
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: questionToAsk.text,
            questionId: questionToAsk.id as keyof DiagnosticoGeneralData,
            type: questionToAsk.type as "open" | "likert" | "info",
            area: questionToAsk.area,
          },
        ]);
        // If it's an actionable question, pre-fill input if answer exists
        if (questionToAsk.type !== "info") {
          setInputValue(answers[questionToAsk.id as keyof DiagnosticoGeneralData]?.toString() || "");
        } else {
          setInputValue(""); // Clear input for info messages
        }
        setIsTyping(false);
      }, 1000); // Simulate typing delay
    } else if (currentQuestionIndex === questions.length && !showSummary) {
      // All questions asked, transition to summary
      setShowSummary(true);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "¡Hemos terminado con las preguntas! Aquí tienes un resumen de tus respuestas." },
        { sender: "bot", text: "Puedes revisar tus respuestas y enviarlas para el análisis." },
      ]);
    }
  }, [currentQuestionIndex, showSummary, user]); // Depend on currentQuestionIndex to trigger next question

  const handleUserResponse = async (value: string) => {
    if (isLoading || isTyping) return;

    const currentQuestion = questions[currentQuestionIndex]; // This is the question the bot *just* asked
    if (!currentQuestion || currentQuestion.type === "info") return; // Should not happen if UI is correct

    // Validate input for open questions
    if (currentQuestion.type === "open" && !value.trim()) {
      setError("Por favor, ingresa una respuesta.");
      return;
    } else {
      setError(null);
    }

    // Add user's message to chat
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: value, questionId: currentQuestion.id as keyof DiagnosticoGeneralData },
    ]);

    // Update answers state
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    } as DiagnosticoGeneralData));

    setInputValue(""); // Clear input

    // Move to next question
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleLikertSelect = (value: string) => {
    handleUserResponse(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserResponse(inputValue);
    }
  };

  const handleContinue = () => {
    if (isLoading || isTyping) return;
    setError(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = questions[currentQuestionIndex - 1]; // The question we are going back *to*

      // Remove the current bot message (the question that was just asked)
      let newMessages = messages.slice(0, messages.length - 1);

      // If the previous question was an actionable one, also remove the user's answer
      // This means the user's answer is the second-to-last message
      if (prevQuestion && prevQuestion.type !== "info") {
        newMessages = newMessages.slice(0, newMessages.length - 1);
      }
      setMessages(newMessages);

      setCurrentQuestionIndex((prev) => prev - 1);
      setShowSummary(false); // If going back from summary
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Debes iniciar sesión para realizar el diagnóstico.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('https://mentorapp-api-llm-1.onrender.com/api/diagnostico/general-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...answers, userId: user.uid, createdAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el diagnóstico general.');
      }

      const result: LLMAnalysisResult = await response.json();
      setAnalysisResult(result);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "¡Análisis completado! Aquí están los resultados:" },
      ]);
    } catch (err: any) {
      console.error("Error submitting general diagnosis:", err);
      setError(err.message || "Ocurrió un error al procesar tu diagnóstico general.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine the color of the maturity level
  const getNivelMadurezColor = (nivel: LLMAnalysisResult['nivel_madurez_general']) => {
    switch (nivel) {
      case 'muy_bajo': return 'text-red-600';
      case 'bajo': return 'text-orange-600';
      case 'medio': return 'text-yellow-600';
      case 'alto': return 'text-blue-600';
      case 'muy_alto': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
            <div className="flex flex-col items-center">
              <UiverseLoader />
              <p className="mt-4 text-white text-lg font-semibold text-center">
                Analizando tu diagnóstico con IA... <br /> ¡Un momento por favor!
              </p>
            </div>
          </div>
        )}

        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg flex flex-col h-[80vh] animate__animated animate__fadeInDown border border-indigo-200">
          <div className="p-6 bg-indigo-600 text-white rounded-t-xl flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <ChatBubbleLeftRightIcon className="h-7 w-7 mr-2" />
              Diagnóstico General Chat
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-indigo-100 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>

          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-indigo-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm animate__animated animate__fadeIn ${
                    msg.sender === "bot"
                      ? "bg-indigo-200 text-indigo-900 rounded-bl-none"
                      : "bg-indigo-500 text-white rounded-br-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-indigo-200 text-indigo-900 rounded-bl-none">
                  <div className="typing-indicator flex space-x-1">
                    <span className="dot animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                    <span className="dot animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="dot animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                  </div>
                </div>
              </div>
            )}
            {/* CSS for typing indicator */}
            <style jsx>{`
              .typing-indicator .dot {
                animation-duration: 1s;
                animation-iteration-count: infinite;
                font-size: 1.5em;
                line-height: 0.5;
              }
            `}</style>
          </div>

          {/* Input/Controls Area */}
          <div className="p-4 border-t border-indigo-200 bg-white">
            {error && (
              <p className="text-red-500 text-sm mb-2 animate__animated animate__shakeX">{error}</p>
            )}

            {showSummary && !analysisResult ? (
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-indigo-700 mb-4">Resumen de tus respuestas:</h3>
                <div className="max-h-48 overflow-y-auto w-full bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-4 text-sm text-gray-800">
                  {Object.entries(answers).map(([key, value]) => {
                    // Skip userId and createdAt for display, and also skip empty values
                    if (key === "userId" || key === "createdAt" || value === "") return null;

                    // Find the original question text, handling new descriptive IDs
                    const question = questions.find(q => q.id === key);
                    let questionText = question ? question.text : key;
                    // Clean question number for display if it starts with a number and a dot
                    questionText = questionText.replace(/^\d+\.\s*/, '');

                    return (
                      <p key={key} className="mb-1">
                        <strong className="text-indigo-700">{questionText}:</strong> {value?.toString()}
                      </p>
                    );
                  })}
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar para Análisis"}
                </button>
                <button
                  onClick={goToPreviousQuestion}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Volver a la última pregunta
                </button>
              </div>
            ) : analysisResult ? (
              <div className="mt-4 p-4 bg-indigo-100 rounded-lg border border-indigo-300 animate__animated animate__fadeInUp">
                <h3 className="text-xl font-semibold text-indigo-700 mb-3">Resultados del Análisis:</h3>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-indigo-600">Resumen Ejecutivo:</h4>
                  <p className="text-gray-800">{analysisResult.resumen_ejecutivo}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-indigo-600">Áreas de Oportunidad:</h4>
                  <ul className="list-disc list-inside text-gray-800">
                    {analysisResult.areas_oportunidad.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-indigo-600">Recomendaciones Clave:</h4>
                  <ul className="list-disc list-inside text-gray-800">
                    {analysisResult.recomendaciones_clave.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-indigo-600">Puntuación de Madurez Promedio:</h4>
                  <p className="text-2xl font-bold text-indigo-600">{analysisResult.puntuacion_madurez_promedio.toFixed(2)}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-indigo-600">Nivel de Madurez General:</h4>
                  <p className={`text-2xl font-bold ${getNivelMadurezColor(analysisResult.nivel_madurez_general)}`}>
                    {analysisResult.nivel_madurez_general.toUpperCase().replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                >
                  Volver al Dashboard
                </button>
              </div>
            ) : (
              <>
                {/* Conditional rendering for input/buttons based on current question type */}
                {currentQuestion?.type === "open" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu respuesta aquí..."
                      className="flex-1 p-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => handleUserResponse(inputValue)}
                      className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                      disabled={isTyping || !inputValue.trim()}
                    >
                      <PaperAirplaneIcon className="h-6 w-6 transform rotate-90" />
                    </button>
                  </div>
                )}
                {currentQuestion?.type === "likert" && (
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleLikertSelect(num.toString())}
                        className={`px-4 py-2 rounded-lg border text-lg font-bold transition-all duration-200
                          ${answers[currentQuestion.id as keyof DiagnosticoGeneralData] === num.toString()
                            ? "bg-indigo-600 text-white shadow-md scale-105 border-indigo-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100 hover:border-indigo-400"
                          }`}
                        disabled={isTyping}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
                {currentQuestion?.type === "info" && (
                    <div className="flex justify-end w-full"> {/* Align to right */}
                        <button
                            onClick={handleContinue}
                            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            disabled={isTyping}
                        >
                            Continuar
                            <ArrowRightIcon className="h-5 w-5 ml-1" />
                        </button>
                    </div>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    onClick={goToPreviousQuestion}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    disabled={currentQuestionIndex === 0 || isTyping}
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Anterior
                  </button>
                  {/* The "Siguiente" button is now context-specific (send for open, selecting for likert, continue for info) */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoGeneralChatbot;
