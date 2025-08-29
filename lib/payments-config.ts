// lib/payments-config.ts

export type ServiceKind =
  | "membresia_basica"
  | "mentoria_jr"
  | "mentoria_sr"
  | "curso"
  | "marketplace"
  | "diagnostico_avanzado";

type SplitRule = {
  // porcentaje de descuento de introducción (si aplica)
  introDiscountPct?: number; // 0..100
  // split principal plataforma vs consultor (sobre el neto cobrado)
  platformPct: number; // 0..100
  consultantPct: number; // 0..100
  // flags especiales
  firstConsultAllToConsultant?: boolean; // “Primer Consulta: íntegro para consultor”
  // si manejas referido en este producto
  referralPctForConsultantSide?: number; // ej. cuando hay código de referido
};

type ProductRule = {
  kind: ServiceKind;
  title: string;
  currency: "mxn" | "usd";
  // precio “real” (centavos) — si prefieres, conecta a Stripe Price ID
  unitAmount: number; // en centavos
  // descuento de introducción (se aplica al precio mostrado en checkout)
  introDiscountPct?: number;
  // definición de split
  split: SplitRule;
  // notas / beneficios
  perks?: string[];
  frequency?: "one_time" | "monthly";
};

export const PAYMENT_RULES: Record<ServiceKind, ProductRule> = {
  membresia_basica: {
    kind: "membresia_basica",
    title: "Membresía básica",
    currency: "mxn",
    unitAmount: 14900, // $149.00 MXN
    introDiscountPct: 50, // “Costo Introducción”
    frequency: "monthly",
    split: {
      // de tu hoja: Menthia 97.5% / Consultor-Referido 2.5% (ajústalo si es al revés)
      platformPct: 97.5,
      consultantPct: 2.5,
    },
    perks: [
      "2 diagnósticos básicos al mes",
      "Charlas con expertos gratuitas",
      "2 de emergencia, 50% en su primera consulta 1-1, 5% descuento en marketplace seleccionados",
    ],
  },

  mentoria_jr: {
    kind: "mentoria_jr",
    title: "Mentoría Jr.",
    currency: "mxn",
    unitAmount: 50000, // $500.00 MXN
    introDiscountPct: 50,
    frequency: "one_time",
    split: {
      platformPct: 50,
      consultantPct: 50, // en tu tabla pones 80% consultor — si es así, cambia a 80
      // Si tu regla real es 80% consultor, deja: platformPct: 20, consultantPct: 80
      firstConsultAllToConsultant: true,
    },
    perks: ["1 hora con el asesor a elegir"],
  },

  mentoria_sr: {
    kind: "mentoria_sr",
    title: "Mentoría Sr.",
    currency: "mxn",
    unitAmount: 100000, // $1,000.00 MXN
    introDiscountPct: 50,
    frequency: "one_time",
    split: {
      platformPct: 20,
      consultantPct: 80,
      firstConsultAllToConsultant: true,
    },
    perks: ["1 hora con el asesor Sr."],
  },

  curso: {
    kind: "curso",
    title: "Cursos",
    currency: "mxn",
    unitAmount: 0, // “A definir” -> pásalo desde UI o usa Precio Stripe
    frequency: "one_time",
    split: {
      platformPct: 9.9,
      consultantPct: 90.1,
    },
    perks: ["Curso a elegir de por vida solo en la plataforma, no descargable"],
  },

  marketplace: {
    kind: "marketplace",
    title: "Marketplace",
    currency: "mxn",
    unitAmount: 0, // “A definir”
    frequency: "one_time",
    split: {
      platformPct: 9.9,
      consultantPct: 90.1,
    },
    perks: ["Producto o servicio a elegir"],
  },

  diagnostico_avanzado: {
    kind: "diagnostico_avanzado",
    title: "Diagnóstico Avanzado",
    currency: "mxn",
    unitAmount: 350000, // $3,500.00 MXN
    introDiscountPct: 40,
    frequency: "one_time",
    split: {
      platformPct: 20,
      consultantPct: 80,
    },
    perks: ["Incluye diagnóstico avanzado IA + 2h 1:1 con asesor Sr."],
  },
};

// util para aplicar descuento de introducción
export function applyIntro(amountCents: number, pct?: number) {
  if (!pct) return amountCents;
  const factor = Math.max(0, Math.min(100, pct)) / 100;
  return Math.round(amountCents * (1 - factor));
}
