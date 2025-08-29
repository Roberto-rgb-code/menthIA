// pages/dashboard/diagnostico/profundo.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import { useAuth } from "../../../contexts/AuthContext";

/*
  Chatbot UX para el "Diagnóstico Profundo".
  Actualizado para:
  - Mantener el flujo conversacional.
  - Bloquear el envío (análisis) hasta que el usuario pague.
  - Redirigir al flujo de pago embebido (/pay/diagnostico) con Product Overview + tarjeta.
*/

// ===== Tipos =====

type Likert = "" | "1" | "2" | "3" | "4" | "5";

interface DiagnosticoProfundoData {
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
  // Dirección General y Planeación
  dg_misionVisionValores: Likert;
  dg_objetivosClaros: Likert;
  dg_planEstrategicoDocumentado: Likert;
  dg_revisionAvancePlan: Likert;
  dg_factoresExternos: Likert;
  dg_impideCumplirMetas: string;
  dg_capacidadAdaptacion: Likert;
  dg_comoSeTomanDecisiones: string;
  dg_colaboradoresParticipan: Likert;
  dg_porQueNoParticipan: string;
  // Finanzas y Administración
  fa_margenGanancia: Likert;
  fa_estadosFinancierosActualizados: Likert;
  fa_presupuestosAnuales: Likert;
  fa_liquidezCubreObligaciones: Likert;
  fa_gastosControlados: Likert;
  fa_causaProblemasFinancieros: string;
  fa_indicadoresFinancieros: Likert;
  fa_analizanEstadosFinancieros: Likert;
  fa_porQueNoSeAnalizan: string;
  fa_herramientasSoftwareFinanciero: Likert;
  fa_situacionFinancieraGeneral: Likert;
  // Operaciones / Prestación del Servicio
  op_capacidadProductivaCubreDemanda: Likert;
  op_porQueNoCubreDemanda: string;
  op_procesosDocumentados: Likert;
  op_estandaresCalidadCumplen: Likert;
  op_controlesErrores: Likert;
  op_tiemposEntregaCumplen: Likert;
  op_porQueNoCumplen: string;
  op_eficienciaProcesosOptima: Likert;
  op_personalConoceProcedimientos: Likert;
  op_porQueNoConocen: string;
  op_indicadoresOperativos: Likert;
  // Marketing y Ventas
  mv_clienteIdealNecesidades: Likert;
  mv_planEstrategiasMarketing: Likert;
  mv_impactoCanalesVenta: string;
  mv_canalesVentaActuales: string;
  mv_marcaReconocida: Likert;
  mv_estudiosSatisfaccionCliente: Likert;
  mv_porQueNoHaceEstudios: string;
  mv_indicadoresDesempenoComercial: Likert;
  mv_equipoVentasCapacitado: Likert;
  mv_politicasDescuentosPromociones: Likert;
  // Recursos Humanos
  rh_organigramaFuncionesClaras: Likert;
  rh_personalCapacitado: Likert;
  rh_climaLaboralFavoreceProductividad: Likert;
  rh_programasMotivacion: Likert;
  rh_causaClimaLaboralComplejo: string;
  rh_evaluacionesDesempeno: Likert;
  rh_indicadoresRotacionPersonal: Likert;
  rh_liderazgoJefesIntermedios: Likert;
  rh_cuantasPersonasTrabajan: string;
  // Logística y Cadena de Suministro
  lcs_proveedoresCumplen: Likert;
  lcs_entregasClientesPuntuales: Likert;
  lcs_costosLogisticosCompetitivos: Likert;
  lcs_problemasLogisticosPunto: string;
  lcs_poderNegociacionProveedores: Likert;
  lcs_indicadoresLogisticos: Likert;
  // Habilidades del Empresario
  he_liderInspiraEquipo: Likert;
  he_tomaDecisionesDatos: Likert;
  he_resilienteDificultades: Likert;
  he_invierteDesarrolloPropio: Likert;
  he_porQueNoInvierte: string;
  he_visionNegocioClara: Likert;
  he_apoyoAsesoresMentores: Likert;
  // Cultura de Innovación
  ci_mejoranProductosServicios: Likert;
  ci_recogeImplementaIdeasPersonal: Likert;
  ci_invierteTecnologiaInnovacion: Likert;
  ci_dispuestoAsumirRiesgos: Likert;
  ci_porQueNoInnova: string;
  ci_protegePropiedadIntelectual: Likert;
  ci_fomentaCulturaCambio: Likert;
  // Retos y Aspiraciones
  ra_mayorReto: string;
  ra_queMotiva: string;
  ra_cambiosPersonalesNecesarios: string;
  ra_lograrEn5Anos: string;
  ra_queEnorgullece: string;
  ra_quePreocupa: string;
  ra_principalProblematica: string;
  ra_habilidadesFortalecer: string;
  ra_tanSatisfechoRolActual: Likert;
  ra_referenteParaEquipo: Likert;
  ra_situacionFinancieraGeneral: Likert;
  createdAt: string;
}

type Pri = "P1" | "P2" | "P3";

interface DomainRow {
  dominio: string;
  nombre: string;
  score: number;
  severidad: "Crítico" | "Alto" | "Medio" | "Bajo" | string;
  prioridad: Pri | string;
}

interface DomainDetail {
  diagnostico: string;
  causas_raiz: string[];
  recomendaciones_30_60_90: { "30": string[]; "60": string[]; "90": string[] };
  kpis: { nombre: string; meta: string }[];
  riesgos: { riesgo: string; mitigacion: string }[];
  quick_wins: string[];
}

interface EstructuraConsultiva {
  resumen_ejecutivo: string;
  tabla_dominios: DomainRow[];
  dominios: Record<string, DomainDetail>;
}

interface LLMAnalysisResult {
  analisis_detallado: string;
  oportunidades_estrategicas: string[];
  riesgos_identificados: string[];
  plan_accion_sugerido: string[];
  indicadores_clave_rendimiento: string[];
  estructura_consultiva?: EstructuraConsultiva;
}

// ===== UI Helpers =====

const LikertChips: React.FC<{ value: Likert; onSelect: (v: Likert) => void }>
= ({ value, onSelect }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {["1", "2", "3", "4", "5"].map((v) => (
      <button
        key={v}
        type="button"
        className={`px-4 py-2 rounded-xl border text-sm font-semibold transition
          ${value === v
            ? "bg-indigo-600 text-white border-indigo-700 shadow"
            : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"}`}
        onClick={() => onSelect(v as Likert)}
      >{v}</button>
    ))}
  </div>
);

const TypingDots = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]"></span>
    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
  </div>
);

const Bubble: React.FC<{ from: "bot" | "user"; children: React.ReactNode }>
= ({ from, children }) => (
  <div className={`w-full flex ${from === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow
      ${from === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-gray-800 border rounded-bl-sm"}`}
    >
      {children}
    </div>
  </div>
);

const SevBadge: React.FC<{ sev: string }> = ({ sev }) => {
  const map: Record<string, string> = {
    "Crítico": "bg-red-100 text-red-700 border-red-200",
    "Alto": "bg-orange-100 text-orange-700 border-orange-200",
    "Medio": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Bajo": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const cls = map[sev] || "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{sev}</span>;
};
const PriBadge: React.FC<{ pri: string }> = ({ pri }) => {
  const map: Record<string, string> = {
    "P1": "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    "P2": "bg-sky-100 text-sky-700 border-sky-200",
    "P3": "bg-gray-100 text-gray-700 border-gray-200",
  };
  const cls = map[pri] || "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{pri}</span>;
};

// ===== Mapeo del flujo conversacional =====

type StepType =
  | { kind: "intro" }
  | { kind: "text"; field: keyof DiagnosticoProfundoData; prompt: string; required?: boolean; textarea?: boolean }
  | { kind: "likert"; field: keyof DiagnosticoProfundoData; prompt: string; required?: boolean }
  | { kind: "select"; field: keyof DiagnosticoProfundoData; prompt: string; options: { value: string; label: string }[]; required?: boolean }
  | { kind: "section"; title: string; icon?: string }
  | { kind: "outro" };

const specialLikertOptions = [
  { value: "1", label: "Muy inestable" },
  { value: "2", label: "Inestable" },
  { value: "3", label: "Regular" },
  { value: "4", label: "Estable" },
  { value: "5", label: "Muy estable" },
];

const steps: StepType[] = [
  { kind: "intro" },

  { kind: "section", title: "Datos Generales" },
  { kind: "text", field: "nombreSolicitante", prompt: "¿Cuál es tu nombre?", required: true },
  { kind: "text", field: "puestoSolicitante", prompt: "¿Cuál es tu puesto?", required: true },
  { kind: "text", field: "nombreEmpresa", prompt: "Nombre de la empresa", required: true },
  { kind: "text", field: "rfcEmpresa", prompt: "RFC (opcional)", required: false },
  { kind: "text", field: "giroIndustria", prompt: "Giro o industria", required: true },
  { kind: "text", field: "numeroEmpleados", prompt: "Número de empleados", required: true },
  { kind: "text", field: "antiguedadEmpresa", prompt: "Antigüedad de la empresa (años)", required: true },
  { kind: "text", field: "ubicacion", prompt: "Ubicación (ciudad y estado)", required: true },
  { kind: "text", field: "telefonoContacto", prompt: "Teléfono de contacto", required: true },
  { kind: "text", field: "correoElectronico", prompt: "Correo electrónico", required: true },
  { kind: "text", field: "sitioWebRedes", prompt: "Sitio web o redes (opcional)", required: false },

  { kind: "section", title: "Problemática" },
  { kind: "text", field: "areaMayorProblema", prompt: "¿Área con mayores problemas actualmente?", required: true },
  { kind: "text", field: "problematicaEspecifica", prompt: "Describe la problemática específica", required: true, textarea: true },
  { kind: "text", field: "principalPrioridad", prompt: "Principal prioridad a corto plazo", required: true, textarea: true },

  { kind: "section", title: "Dirección General y Planeación" },
  { kind: "likert", field: "dg_misionVisionValores", prompt: "¿Misión/visión/valores claros y conocidos?", required: true },
  { kind: "likert", field: "dg_objetivosClaros", prompt: "¿Metas anuales claras y medibles?", required: true },
  { kind: "likert", field: "dg_planEstrategicoDocumentado", prompt: "¿Plan estratégico documentado?", required: true },
  { kind: "likert", field: "dg_revisionAvancePlan", prompt: "¿Revisión periódica del plan?", required: true },
  { kind: "likert", field: "dg_factoresExternos", prompt: "¿Identifican factores externos?", required: true },
  { kind: "text", field: "dg_impideCumplirMetas", prompt: "Si no se cumplen metas, ¿qué lo impide?", required: true, textarea: true },
  { kind: "likert", field: "dg_capacidadAdaptacion", prompt: "Capacidad de adaptación a cambios", required: true },
  { kind: "text", field: "dg_comoSeTomanDecisiones", prompt: "¿Cómo se toman las decisiones estratégicas?", required: true, textarea: true },
  { kind: "likert", field: "dg_colaboradoresParticipan", prompt: "¿Colaboradores participan en objetivos?", required: true },
  { kind: "text", field: "dg_porQueNoParticipan", prompt: "Si no participan, ¿por qué?", required: true, textarea: true },

  { kind: "section", title: "Finanzas y Administración" },
  { kind: "likert", field: "fa_margenGanancia", prompt: "¿Conoces el margen de ganancia?", required: true },
  { kind: "likert", field: "fa_estadosFinancierosActualizados", prompt: "¿Estados financieros actualizados?", required: true },
  { kind: "likert", field: "fa_presupuestosAnuales", prompt: "¿Presupuestos anuales?", required: true },
  { kind: "likert", field: "fa_liquidezCubreObligaciones", prompt: "¿Liquidez cubre obligaciones inmediatas?", required: true },
  { kind: "likert", field: "fa_gastosControlados", prompt: "¿Gastos controlados?", required: true },
  { kind: "text", field: "fa_causaProblemasFinancieros", prompt: "Si hay problemas financieros, causa principal", required: true, textarea: true },
  { kind: "likert", field: "fa_indicadoresFinancieros", prompt: "¿Indicadores financieros (rentabilidad/flujo/deuda)?", required: true },
  { kind: "likert", field: "fa_analizanEstadosFinancieros", prompt: "¿Analizan estados financieros para decidir?", required: true },
  { kind: "text", field: "fa_porQueNoSeAnalizan", prompt: "Si no se analizan, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "fa_herramientasSoftwareFinanciero", prompt: "¿Usan herramientas/software financiero?", required: true },
  { kind: "select", field: "fa_situacionFinancieraGeneral", prompt: "Situación financiera general", options: specialLikertOptions, required: true },

  { kind: "section", title: "Operaciones / Servicio" },
  { kind: "likert", field: "op_capacidadProductivaCubreDemanda", prompt: "¿Capacidad productiva cubre demanda?", required: true },
  { kind: "text", field: "op_porQueNoCubreDemanda", prompt: "Si no cubre, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "op_procesosDocumentados", prompt: "¿Procesos documentados?", required: true },
  { kind: "likert", field: "op_estandaresCalidadCumplen", prompt: "¿Se cumplen estándares de calidad?", required: true },
  { kind: "likert", field: "op_controlesErrores", prompt: "¿Controles para detectar/corregir errores?", required: true },
  { kind: "likert", field: "op_tiemposEntregaCumplen", prompt: "¿Tiempos de entrega cumplen?", required: true },
  { kind: "text", field: "op_porQueNoCumplen", prompt: "Si no cumplen, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "op_eficienciaProcesosOptima", prompt: "¿Eficiencia de procesos óptima?", required: true },
  { kind: "likert", field: "op_personalConoceProcedimientos", prompt: "¿Personal conoce los procedimientos?", required: true },
  { kind: "text", field: "op_porQueNoConocen", prompt: "Si no conocen, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "op_indicadoresOperativos", prompt: "¿Usan indicadores operativos?", required: true },

  { kind: "section", title: "Marketing y Ventas" },
  { kind: "likert", field: "mv_clienteIdealNecesidades", prompt: "¿Conoces al cliente ideal y sus necesidades?", required: true },
  { kind: "likert", field: "mv_planEstrategiasMarketing", prompt: "¿Plan/estrategias de marketing?", required: true },
  { kind: "text", field: "mv_impactoCanalesVenta", prompt: "Impacto de los canales de venta", required: true, textarea: true },
  { kind: "text", field: "mv_canalesVentaActuales", prompt: "Canales de venta actuales", required: true, textarea: true },
  { kind: "likert", field: "mv_marcaReconocida", prompt: "¿Marca reconocida frente a competencia?", required: true },
  { kind: "likert", field: "mv_estudiosSatisfaccionCliente", prompt: "¿Estudios de satisfacción?", required: true },
  { kind: "text", field: "mv_porQueNoHaceEstudios", prompt: "Si no, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "mv_indicadoresDesempenoComercial", prompt: "¿Indicadores de desempeño comercial?", required: true },
  { kind: "likert", field: "mv_equipoVentasCapacitado", prompt: "¿Equipo de ventas capacitado?", required: true },
  { kind: "likert", field: "mv_politicasDescuentosPromociones", prompt: "¿Políticas de descuentos/promos?", required: true },

  { kind: "section", title: "Recursos Humanos" },
  { kind: "likert", field: "rh_organigramaFuncionesClaras", prompt: "¿Organigrama y descripciones claras?", required: true },
  { kind: "likert", field: "rh_personalCapacitado", prompt: "¿Personal capacitado?", required: true },
  { kind: "likert", field: "rh_climaLaboralFavoreceProductividad", prompt: "¿Clima que favorece productividad?", required: true },
  { kind: "likert", field: "rh_programasMotivacion", prompt: "¿Programas de motivación?", required: true },
  { kind: "text", field: "rh_causaClimaLaboralComplejo", prompt: "Si el clima es complejo, ¿qué lo provoca?", required: true, textarea: true },
  { kind: "likert", field: "rh_evaluacionesDesempeno", prompt: "¿Evaluaciones periódicas de desempeño?", required: true },
  { kind: "likert", field: "rh_indicadoresRotacionPersonal", prompt: "¿Indicadores de rotación?", required: true },
  { kind: "likert", field: "rh_liderazgoJefesIntermedios", prompt: "¿Liderazgo adecuado de jefes intermedios?", required: true },
  { kind: "text", field: "rh_cuantasPersonasTrabajan", prompt: "¿Cuántas personas trabajan (incluyéndote)?", required: true },

  { kind: "section", title: "Logística y Cadena de Suministro" },
  { kind: "likert", field: "lcs_proveedoresCumplen", prompt: "¿Proveedores cumplen a tiempo y calidad?", required: true },
  { kind: "likert", field: "lcs_entregasClientesPuntuales", prompt: "¿Entregas a clientes puntuales?", required: true },
  { kind: "likert", field: "lcs_costosLogisticosCompetitivos", prompt: "¿Costos logísticos competitivos?", required: true },
  { kind: "text", field: "lcs_problemasLogisticosPunto", prompt: "Si hay problemas, ¿en qué punto ocurren?", required: true, textarea: true },
  { kind: "likert", field: "lcs_poderNegociacionProveedores", prompt: "¿Tienes poder de negociación?", required: true },
  { kind: "likert", field: "lcs_indicadoresLogisticos", prompt: "¿Indicadores logísticos?", required: true },

  { kind: "section", title: "Habilidades del Empresario" },
  { kind: "likert", field: "he_liderInspiraEquipo", prompt: "¿Líder que inspira al equipo?", required: true },
  { kind: "likert", field: "he_tomaDecisionesDatos", prompt: "¿Decisiones basadas en datos?", required: true },
  { kind: "likert", field: "he_resilienteDificultades", prompt: "¿Resiliente ante dificultades?", required: true },
  { kind: "likert", field: "he_invierteDesarrolloPropio", prompt: "¿Inviertes en tu desarrollo?", required: true },
  { kind: "text", field: "he_porQueNoInvierte", prompt: "Si no inviertes, ¿qué lo impide?", required: true, textarea: true },
  { kind: "likert", field: "he_visionNegocioClara", prompt: "¿Visión del negocio clara y bien transmitida?", required: true },
  { kind: "likert", field: "he_apoyoAsesoresMentores", prompt: "¿Te apoyas en asesores/mentores?", required: true },

  { kind: "section", title: "Cultura de Innovación" },
  { kind: "likert", field: "ci_mejoranProductosServicios", prompt: "¿Mejoras constantes de productos/servicios?", required: true },
  { kind: "likert", field: "ci_recogeImplementaIdeasPersonal", prompt: "¿Recoges/implementas ideas del personal?", required: true },
  { kind: "likert", field: "ci_invierteTecnologiaInnovacion", prompt: "¿Inviertes en tecnología/innovación?", required: true },
  { kind: "likert", field: "ci_dispuestoAsumirRiesgos", prompt: "¿Dispuesto a riesgos calculados para innovar?", required: true },
  { kind: "text", field: "ci_porQueNoInnova", prompt: "Si no innovas, ¿por qué?", required: true, textarea: true },
  { kind: "likert", field: "ci_protegePropiedadIntelectual", prompt: "¿Proteges propiedad intelectual?", required: true },
  { kind: "likert", field: "ci_fomentaCulturaCambio", prompt: "¿Fomentas cultura abierta al cambio?", required: true },

  { kind: "section", title: "Retos y Aspiraciones" },
  { kind: "text", field: "ra_mayorReto", prompt: "¿Tu mayor reto hoy?", required: true, textarea: true },
  { kind: "text", field: "ra_queMotiva", prompt: "¿Qué te motiva a seguir?", required: true, textarea: true },
  { kind: "text", field: "ra_cambiosPersonalesNecesarios", prompt: "Cambios personales necesarios", required: true, textarea: true },
  { kind: "text", field: "ra_lograrEn5Anos", prompt: "¿Qué quieres lograr en 5 años?", required: true, textarea: true },
  { kind: "text", field: "ra_queEnorgullece", prompt: "¿Qué te enorgullece de tu empresa?", required: true, textarea: true },
  { kind: "text", field: "ra_quePreocupa", prompt: "¿Qué te preocupa actualmente?", required: true, textarea: true },
  { kind: "text", field: "ra_principalProblematica", prompt: "Principal problemática actual", required: true, textarea: true },
  { kind: "text", field: "ra_habilidadesFortalecer", prompt: "Habilidades personales a fortalecer", required: true, textarea: true },
  { kind: "select", field: "ra_tanSatisfechoRolActual", prompt: "¿Qué tan satisfecho con tu rol actual?", options: [
    { value: "1", label: "Muy insatisfecho" },
    { value: "2", label: "Insatisfecho" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Satisfecho" },
    { value: "5", label: "Muy satisfecho" },
  ], required: true },
  { kind: "likert", field: "ra_referenteParaEquipo", prompt: "¿Te consideras referente para tu equipo?", required: true },
  { kind: "select", field: "ra_situacionFinancieraGeneral", prompt: "Situación financiera general (otra vez)", options: specialLikertOptions, required: true },

  { kind: "outro" },
];

// ===== Estado inicial =====

const emptyData = (userId = ""): DiagnosticoProfundoData => ({
  userId,
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
  dg_misionVisionValores: "",
  dg_objetivosClaros: "",
  dg_planEstrategicoDocumentado: "",
  dg_revisionAvancePlan: "",
  dg_factoresExternos: "",
  dg_impideCumplirMetas: "",
  dg_capacidadAdaptacion: "",
  dg_comoSeTomanDecisiones: "",
  dg_colaboradoresParticipan: "",
  dg_porQueNoParticipan: "",
  fa_margenGanancia: "",
  fa_estadosFinancierosActualizados: "",
  fa_presupuestosAnuales: "",
  fa_liquidezCubreObligaciones: "",
  fa_gastosControlados: "",
  fa_causaProblemasFinancieros: "",
  fa_indicadoresFinancieros: "",
  fa_analizanEstadosFinancieros: "",
  fa_porQueNoSeAnalizan: "",
  fa_herramientasSoftwareFinanciero: "",
  fa_situacionFinancieraGeneral: "",
  op_capacidadProductivaCubreDemanda: "",
  op_porQueNoCubreDemanda: "",
  op_procesosDocumentados: "",
  op_estandaresCalidadCumplen: "",
  op_controlesErrores: "",
  op_tiemposEntregaCumplen: "",
  op_porQueNoCumplen: "",
  op_eficienciaProcesosOptima: "",
  op_personalConoceProcedimientos: "",
  op_porQueNoConocen: "",
  op_indicadoresOperativos: "",
  mv_clienteIdealNecesidades: "",
  mv_planEstrategiasMarketing: "",
  mv_impactoCanalesVenta: "",
  mv_canalesVentaActuales: "",
  mv_marcaReconocida: "",
  mv_estudiosSatisfaccionCliente: "",
  mv_porQueNoHaceEstudios: "",
  mv_indicadoresDesempenoComercial: "",
  mv_equipoVentasCapacitado: "",
  mv_politicasDescuentosPromociones: "",
  rh_organigramaFuncionesClaras: "",
  rh_personalCapacitado: "",
  rh_climaLaboralFavoreceProductividad: "",
  rh_programasMotivacion: "",
  rh_causaClimaLaboralComplejo: "",
  rh_evaluacionesDesempeno: "",
  rh_indicadoresRotacionPersonal: "",
  rh_liderazgoJefesIntermedios: "",
  rh_cuantasPersonasTrabajan: "",
  lcs_proveedoresCumplen: "",
  lcs_entregasClientesPuntuales: "",
  lcs_costosLogisticosCompetitivos: "",
  lcs_problemasLogisticosPunto: "",
  lcs_poderNegociacionProveedores: "",
  lcs_indicadoresLogisticos: "",
  he_liderInspiraEquipo: "",
  he_tomaDecisionesDatos: "",
  he_resilienteDificultades: "",
  he_invierteDesarrolloPropio: "",
  he_porQueNoInvierte: "",
  he_visionNegocioClara: "",
  he_apoyoAsesoresMentores: "",
  ci_mejoranProductosServicios: "",
  ci_recogeImplementaIdeasPersonal: "",
  ci_invierteTecnologiaInnovacion: "",
  ci_dispuestoAsumirRiesgos: "",
  ci_porQueNoInnova: "",
  ci_protegePropiedadIntelectual: "",
  ci_fomentaCulturaCambio: "",
  ra_mayorReto: "",
  ra_queMotiva: "",
  ra_cambiosPersonalesNecesarios: "",
  ra_lograrEn5Anos: "",
  ra_queEnorgullece: "",
  ra_quePreocupa: "",
  ra_principalProblematica: "",
  ra_habilidadesFortalecer: "",
  ra_tanSatisfechoRolActual: "",
  ra_referenteParaEquipo: "",
  ra_situacionFinancieraGeneral: "",
  createdAt: new Date().toISOString(),
});

// ===== Validación obligatorios =====

const requiredFields = new Set(
  steps
    .filter((s) => ("required" in s ? s.required : false))
    .map((s) => ("field" in s ? (s.field as string) : ""))
    .filter(Boolean)
);

function hasMissingRequired(data: DiagnosticoProfundoData): string[] {
  const missing: string[] = [];
  requiredFields.forEach((f) => {
    // @ts-ignore
    if (!data[f]) missing.push(f);
  });
  return missing;
}

// ===== Componente principal =====

const ChatbotDiagnostico: React.FC = () => {
  const { user } = useAuth(); // ya estás bajo PrivateLayout, así que debería existir user
  const router = useRouter();

  const [data, setData] = useState<DiagnosticoProfundoData>(emptyData(user?.uid || ""));
  const [idx, setIdx] = useState(0); // índice de paso actual
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: React.ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Gate de pago
  const [hasAccess, setHasAccess] = useState(false);

  // persistencia local
  useEffect(() => {
    const saved = localStorage.getItem("diag_profundo_chatbot");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.data) setData(parsed.data);
        if (typeof parsed?.idx === "number") setIdx(parsed.idx);
        if (Array.isArray(parsed?.messages)) {
          const safeMsgs = parsed.messages.map((m: any) => ({
            from: m.from === "user" ? "user" : "bot",
            text: typeof m.text === "string" ? m.text : "",
          }));
          setMessages(safeMsgs);
        } else {
          boot();
        }
      } catch {
        boot();
      }
    } else {
      boot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // marcar acceso cuando regresa con ?paid=1
  useEffect(() => {
    const q = router.query?.paid;
    if (q === "1") {
      try {
        localStorage.setItem("diag_profundo_paid", "1");
      } catch {}
    }
    const paid = typeof window !== "undefined" && localStorage.getItem("diag_profundo_paid") === "1";
    setHasAccess(!!paid);
  }, [router.query?.paid]);

  useEffect(() => {
    const serializableMessages = messages.map((m) => ({
      from: m.from,
      text: typeof m.text === "string" ? m.text : "",
    }));
    localStorage.setItem(
      "diag_profundo_chatbot",
      JSON.stringify({ data, idx, messages: serializableMessages })
    );
  }, [data, idx, messages]);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (user?.uid && !data.userId) setData((d) => ({ ...d, userId: user.uid }));
  }, [user, data.userId]);

  const progressPct = useMemo(() => Math.round(((idx + 1) / steps.length) * 100), [idx]);

  function boot() {
    setMessages([
      { from: "bot", text: <><b>Diagnóstico Profundo Empresarial</b><br/>Te haré preguntas breves (96 en total) por áreas. Responde con texto o usa los botones cuando aparezcan. Empezamos 👇</> },
    ]);
    setIdx(0);
  }

  function nextBotPrompt(nextIndex: number) {
    const s = steps[nextIndex];
    if (!s) return;

    if (s.kind === "intro") {
      setMessages((m) => [...m, { from: "bot", text: "Primero, algunos datos generales." }]);
      setIdx(nextIndex + 1);
      return;
    }

    if (s.kind === "section") {
      setMessages((m) => [...m, { from: "bot", text: <b>{s.title}</b> }]);
      setIdx(nextIndex + 1);
      return;
    }

    if (s.kind === "text") {
      setMessages((m) => [...m, { from: "bot", text: s.prompt + (s.required ? " *" : "") }]);
      return;
    }

    if (s.kind === "likert") {
      setMessages((m) => [...m, { from: "bot", text: (
        <div>
          <div>{s.prompt} *</div>
          <LikertChips value={(data[s.field] as Likert) || ""} onSelect={(v) => handleLikertAnswer(s.field, v)} />
        </div>
      ) }]);
      return;
    }

    if (s.kind === "select") {
      setMessages((m) => [...m, { from: "bot", text: (
        <div>
          <div>{s.prompt} *</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {s.options.map((op) => (
              <button key={op.value} className="px-3 py-2 rounded-xl border bg-white hover:bg-indigo-50"
                onClick={() => handleSelectAnswer(s.field, op.value)}
              >{op.value} — {op.label}</button>
            ))}
          </div>
        </div>
      ) }]);
      return;
    }

    if (s.kind === "outro") {
      const missing = hasMissingRequired(data);
      if (missing.length) {
        setMessages((m) => [...m, { from: "bot", text: (
          <div>
            Me faltan respuestas obligatorias (<b>{missing.length}</b>). ¿Quieres{" "}
            <button className="underline" onClick={() => jumpToField(missing[0] as keyof DiagnosticoProfundoData)}>completar la primera pendiente</button>{" "}
            o{" "}
            {hasAccess ? (
              <button className="underline" onClick={sendAll}>enviar de todos modos</button>
            ) : (
              <button className="underline" onClick={goToCheckoutDiagnostico}>pagar y enviar</button>
            )}
            ?
          </div>
        ) }]);
      } else {
        setMessages((m) => [...m, { from: "bot", text: (
          <div>
            ¡Listo! ¿Enviamos tus respuestas para el análisis con IA?
            <div className="flex gap-2 mt-2">
              {hasAccess ? (
                <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={sendAll}>Enviar ahora</button>
              ) : (
                <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={goToCheckoutDiagnostico}>Pagar y enviar</button>
              )}
              <button className="px-4 py-2 rounded-xl border" onClick={() => setIdx(0)}>Revisar</button>
            </div>
          </div>
        ) }]);
      }
      return;
    }
  }

  useEffect(() => {
    nextBotPrompt(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function handleUserSend(text: string) {
    const s = steps[idx];
    if (!s) return;

    if (s.kind === "text") {
      setMessages((m) => [...m, { from: "user", text }]);
      setData((d) => ({ ...d, [s.field]: text } as any));
      setIdx(idx + 1);
      setInput("");
      return;
    }

    if (s.kind !== "text" && text.trim()) {
      setMessages((m) => [...m, { from: "user", text }]);
      if ("field" in s) setData((d) => ({ ...d, [s.field]: text } as any));
      setIdx(idx + 1);
      setInput("");
    }
  }

  function handleLikertAnswer(field: keyof DiagnosticoProfundoData, v: Likert) {
    setMessages((m) => [...m, { from: "user", text: `Respuesta: ${v}` }]);
    setData((d) => ({ ...d, [field]: v } as any));
    setIdx(idx + 1);
  }

  function handleSelectAnswer(field: keyof DiagnosticoProfundoData, v: string) {
    setMessages((m) => [...m, { from: "user", text: `Seleccionaste: ${v}` }]);
    setData((d) => ({ ...d, [field]: v } as any));
    setIdx(idx + 1);
  }

  function jumpToField(field: keyof DiagnosticoProfundoData) {
    const target = steps.findIndex((s) => "field" in s && (s as any).field === field);
    if (target >= 0) setIdx(target);
  }

  // Redirige al flujo de pago embebido
  function goToCheckoutDiagnostico() {
  try {
    const serializableMessages = messages.map((m) => ({ from: m.from, text: typeof m.text === "string" ? m.text : "" }));
    localStorage.setItem("diag_profundo_chatbot", JSON.stringify({ data, idx, messages: serializableMessages }));
  } catch {}
  const ret = encodeURIComponent("/dashboard/diagnostico/profundo");
  const name = encodeURIComponent("Diagnóstico Profundo Empresarial");
  const image = encodeURIComponent("/img/diagnostico.png"); // opcional
  const sku = "diagnostico_profundo";
  const type = "diagnostico";
  const price = 199900; // $1,999.00 en centavos
  const qty = 1;
  window.location.href = `http://localhost:3000/cart?sku=${sku}&type=${type}&name=${name}&price=${price}&image=${image}&qty=${qty}&ret=${ret}`;
}


  async function sendAll() {
    if (!hasAccess) {
      setMessages((m) => [...m, { from: "bot", text: (
        <div>
          Para enviar el análisis necesitas completar el pago.{" "}
          <button className="underline" onClick={goToCheckoutDiagnostico}>Ir a pagar</button>
        </div>
      ) }]);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = { ...data, userId: data.userId || "", createdAt: new Date().toISOString() };
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backend}/api/diagnostico/profundo/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Error al procesar el diagnóstico profundo");
      }
      const result: LLMAnalysisResult = await res.json();
      setAnalysis(result);
      setMessages((m) => [...m, { from: "bot", text: "¡Análisis listo! Abajo verás el resumen y el plan de acción." }]);
    } catch (e: any) {
      setError(e.message || "Error desconocido");
      setMessages((m) => [...m, { from: "bot", text: `Hubo un problema: ${e.message || "Error"}` }]);
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setData(emptyData(user?.uid || ""));
    setIdx(0);
    setMessages([]);
    setAnalysis(null);
    setError(null);
    localStorage.removeItem("diag_profundo_chatbot");
    boot();
  }

  const downloadJSON = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostico-profundo-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyJSON = async () => {
    if (!analysis) return;
    await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    alert("Resultado copiado al portapapeles.");
  };
  const printPDF = () => {
    window.print();
  };

  const priOrder: Record<string, number> = { P1: 0, P2: 1, P3: 2 };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-3 md:px-6">
        {/* Banner de pago si no tiene acceso */}
        {!hasAccess && (
          <div className="w-full max-w-5xl mb-4 p-3 rounded-xl border bg-indigo-50 text-indigo-900">
            Este diagnóstico avanzado requiere pago para enviar y obtener el análisis con IA.{" "}
            <button className="underline font-semibold" onClick={goToCheckoutDiagnostico}>Pagar ahora</button>
          </div>
        )}

        {/* Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">AI</div>
            <div>
              <div className="text-lg font-bold text-indigo-800">Diagnóstico Profundo — Chatbot</div>
              <div className="text-xs text-gray-500">Flujo conversacional · {progressPct}%</div>
            </div>
          </div>
          <div className="flex gap-2">
            {!hasAccess && (
              <button className="px-3 py-2 text-sm rounded-xl bg-indigo-600 text-white" onClick={goToCheckoutDiagnostico}>
                Pagar
              </button>
            )}
            <button className="px-3 py-2 text-sm rounded-xl border" onClick={() => setIdx(Math.max(0, idx - 1))}>⟵ Atrás</button>
            <button className="px-3 py-2 text-sm rounded-xl border" onClick={() => setIdx(Math.min(steps.length - 1, idx + 1))}>Siguiente ⟶</button>
            <button className="px-3 py-2 text-sm rounded-xl border" onClick={resetAll}>Reiniciar</button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full max-w-5xl h-2 bg-white border rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-600" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Chat viewport */}
        <div ref={viewportRef} className="w-full max-w-5xl bg-white border rounded-2xl shadow p-4 md:p-6 h-[60vh] md:h-[70vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="mb-3">
              <Bubble from={m.from}>{m.text}</Bubble>
            </div>
          ))}
          {loading && (
            <div className="mb-3">
              <Bubble from="bot"><TypingDots /></Bubble>
            </div>
          )}
        </div>

        {/* Input composer */}
        <div className="w-full max-w-5xl mt-3 flex gap-2">
          {(() => {
            const s = steps[idx];
            if (!s) return null;
            if (s.kind === "text") {
              return (
                <>
                  <input
                    className="flex-1 px-4 py-3 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={s.prompt + (s.required ? " *" : "")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleUserSend(input.trim()); }}
                  />
                  <button
                    className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
                    onClick={() => input.trim() && handleUserSend(input.trim())}
                    disabled={!input.trim()}
                  >Enviar</button>
                </>
              );
            }
            if (s.kind === "likert") {
              return (
                <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-2">
                  <div className="text-sm text-gray-600">Elige 1–5</div>
                  <LikertChips value={(data[s.field] as Likert) || ""} onSelect={(v) => handleLikertAnswer(s.field, v)} />
                </div>
              );
            }
            if (s.kind === "select") {
              return (
                <div className="w-full flex flex-wrap gap-2">
                  {s.options.map((op) => (
                    <button key={op.value} className="px-4 py-2 rounded-2xl border bg-white hover:bg-indigo-50"
                      onClick={() => handleSelectAnswer(s.field, op.value)}
                    >{op.value} — {op.label}</button>
                  ))}
                </div>
              );
            }
            if (s.kind === "section" || s.kind === "intro") {
              return (
                <button className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold" onClick={() => setIdx(idx + 1)}>Continuar</button>
              );
            }
            if (s.kind === "outro") {
              return (
                <div className="flex gap-2">
                  {hasAccess ? (
                    <button className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold" onClick={sendAll}>Enviar</button>
                  ) : (
                    <button className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold" onClick={goToCheckoutDiagnostico}>Pagar y enviar</button>
                  )}
                  <button className="px-5 py-3 rounded-2xl border" onClick={() => setIdx(0)}>Revisar</button>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Resultado IA */}
        {analysis && (
          <div className="w-full max-w-5xl mt-6 bg-white border rounded-2xl shadow p-6 print:border-0 print:shadow-none print:p-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold text-indigo-800 mb-2">Resultados del Diagnóstico Profundo</div>
                <div className="text-sm text-gray-500">Generado automáticamente con análisis consultivo por dominios</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 text-sm rounded-lg border" onClick={downloadJSON}>Descargar JSON</button>
                <button className="px-3 py-2 text-sm rounded-lg border" onClick={copyJSON}>Copiar</button>
                <button className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white" onClick={printPDF}>Imprimir / PDF</button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-4">
                <div className="text-lg font-semibold text-indigo-700">Análisis detallado</div>
                <div className="mt-1 p-3 bg-indigo-50 border rounded whitespace-pre-wrap">{analysis.analisis_detallado}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-semibold text-indigo-700">Oportunidades estratégicas</div>
                  <ul className="mt-1 list-disc list-inside p-3 bg-indigo-50 border rounded">
                    {analysis.oportunidades_estrategicas.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-lg font-semibold text-indigo-700">Riesgos identificados</div>
                  <ul className="mt-1 list-disc list-inside p-3 bg-indigo-50 border rounded">
                    {analysis.riesgos_identificados.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-indigo-50 border rounded md:col-span-2">
                  <div className="text-lg font-semibold text-indigo-700">Plan de acción sugerido</div>
                  <ol className="mt-1 list-decimal list-inside">
                    {analysis.plan_accion_sugerido.map((p, i) => <li key={i}>{p}</li>)}
                  </ol>
                </div>
                <div className="p-3 bg-indigo-50 border rounded md:col-span-2">
                  <div className="text-lg font-semibold text-indigo-700">KPIs recomendados</div>
                  <ul className="mt-1 list-disc list-inside">
                    {analysis.indicadores_clave_rendimiento.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {analysis.estructura_consultiva && (
              <div className="mt-8">
                <div className="text-xl font-bold text-indigo-800">Resumen ejecutivo</div>
                <div className="mt-2 p-3 bg-white border rounded">{analysis.estructura_consultiva.resumen_ejecutivo}</div>

                <div className="mt-6">
                  <div className="text-lg font-semibold text-gray-800 mb-2">Matriz de dominios (priorización)</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 border">Dominio</th>
                          <th className="text-left px-3 py-2 border">Score</th>
                          <th className="text-left px-3 py-2 border">Severidad</th>
                          <th className="text-left px-3 py-2 border">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.estructura_consultiva.tabla_dominios
                          .slice()
                          .sort((a, b) => (priOrder[a.prioridad] ?? 9) - (priOrder[b.prioridad] ?? 9) || a.score - b.score)
                          .map((r, i) => (
                            <tr key={`${r.dominio}-${i}`} className="odd:bg-white even:bg-gray-50">
                              <td className="px-3 py-2 border">{r.nombre}</td>
                              <td className="px-3 py-2 border">{(r.score as any)?.toFixed?.(2) ?? r.score}</td>
                              <td className="px-3 py-2 border"><SevBadge sev={r.severidad} /></td>
                              <td className="px-3 py-2 border"><PriBadge pri={r.prioridad} /></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {analysis.estructura_consultiva.tabla_dominios
                    .slice()
                    .sort((a, b) => (priOrder[a.prioridad] ?? 9) - (priOrder[b.prioridad] ?? 9))
                    .map((r, i) => {
                      const det = analysis.estructura_consultiva!.dominios[r.dominio];
                      if (!det) return null;
                      return (
                        <details key={`${r.dominio}-${i}`} className="group bg-white border rounded-xl">
                          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                            <div className="font-semibold">{r.nombre}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Score {(r.score as any)?.toFixed?.(2) ?? r.score}</span>
                              <SevBadge sev={r.severidad} />
                              <PriBadge pri={r.prioridad} />
                              <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                            </div>
                          </summary>
                          <div className="px-4 pb-4 space-y-4">
                            <div>
                              <div className="font-medium text-gray-800">Diagnóstico</div>
                              <div className="mt-1 p-3 bg-gray-50 border rounded whitespace-pre-wrap">{det.diagnostico}</div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="font-medium text-gray-800">Causas raíz</div>
                                <ul className="mt-1 list-disc list-inside p-3 bg-gray-50 border rounded">
                                  {det.causas_raiz.map((x, i2) => <li key={i2}>{x}</li>)}
                                </ul>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">Quick wins</div>
                                <ul className="mt-1 list-disc list-inside p-3 bg-gray-50 border rounded">
                                  {det.quick_wins.map((x, i2) => <li key={i2}>{x}</li>)}
                                </ul>
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 border rounded">
                              <div className="font-medium text-gray-800">Plan 30-60-90</div>
                              <div className="mt-2 grid md:grid-cols-3 gap-3">
                                <div>
                                  <div className="text-xs font-semibold text-gray-500">30 días</div>
                                  <ul className="mt-1 list-disc list-inside">
                                    {det.recomendaciones_30_60_90["30"].map((x, i2) => <li key={i2}>{x}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-500">60 días</div>
                                  <ul className="mt-1 list-disc list-inside">
                                    {det.recomendaciones_30_60_90["60"].map((x, i2) => <li key={i2}>{x}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-500">90 días</div>
                                  <ul className="mt-1 list-disc list-inside">
                                    {det.recomendaciones_30_60_90["90"].map((x, i2) => <li key={i2}>{x}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 border rounded">
                                <div className="font-medium text-gray-800">KPIs</div>
                                <ul className="mt-1 list-disc list-inside">
                                  {det.kpis.map((k, i2) => <li key={i2}><b>{k.nombre}:</b> {k.meta}</li>)}
                                </ul>
                              </div>
                              <div className="p-3 bg-gray-50 border rounded">
                                <div className="font-medium text-gray-800">Riesgos y mitigación</div>
                                <ul className="mt-1 list-disc list-inside">
                                  {det.riesgos.map((r2, i2) => <li key={i2}><b>{r2.riesgo}:</b> {r2.mitigacion}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="w-full max-w-5xl mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Footer acciones */}
        <div className="w-full max-w-5xl mt-6 flex flex-wrap gap-2 justify-end">
          {!hasAccess && (
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={goToCheckoutDiagnostico}>
              Pagar diagnóstico
            </button>
          )}
          <button className="px-4 py-2 rounded-xl border" onClick={() => router.push("/dashboard/diagnostico/profundo")}>
            Ver formulario clásico
          </button>
          {hasAccess ? (
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={sendAll}>
              Enviar para análisis
            </button>
          ) : (
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={goToCheckoutDiagnostico}>
              Pagar y enviar
            </button>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default ChatbotDiagnostico;
