// types/commerce.ts
export type ProductKind = "curso" | "mentoria" | "servicio" | "diagnostico";

export interface Product {
  id: string;                 // único por tipo
  name: string;
  priceCents: number;         // entero en centavos
  currency?: string;          // default "mxn"
  image?: string;
  kind: ProductKind;
  metadata?: Record<string, any>;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CreateIntentPayload {
  amountCents: number;
  currency: string;
  items: Array<{ id: string; kind: ProductKind; qty: number; priceCents: number }>;
  // si quieres amarrarlo al usuario:
  userId?: string;
}
