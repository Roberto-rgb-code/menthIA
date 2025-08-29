// contexts/CartContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartKind = "curso" | "mentoria" | "servicio" | "diagnostico";

export interface CartItem {
  id: string;                 // id único del ítem (p.ej. courseId, serviceId, etc.)
  kind: CartKind;             // tipo
  title: string;              // nombre mostrado
  priceCents: number;         // precio en centavos (MXN)
  quantity: number;           // cantidad
  image?: string | null;      // opcional
  meta?: Record<string, any>; // opcional (duración, instructor, etc.)
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;

  itemCount: number;       // total de unidades
  distinctCount: number;   // total de líneas
  subtotalCents: number;
  subtotalFormatted: string;

  // Totales extendidos para el checkout
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountCents: number;
  taxesCents: number;
  shippingCents: number;
  totalCents: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "mentorapp_cart_v1";
const STORAGE_COUPON = "mentorapp_cart_coupon_v1";
const CURRENCY = "MXN";

function formatMoneyFromCents(value: number, curr: string = CURRENCY) {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(value / 100);
  } catch {
    return `$${(value / 100).toFixed(2)}`;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCodeState] = useState<string>("");

  // Cargar del localStorage (cliente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const coup = localStorage.getItem(STORAGE_COUPON);
      if (coup) setDiscountCodeState(coup);
    } catch {}
  }, []);

  // Persistir carrito y cupón
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_COUPON, discountCode);
    } catch {}
  }, [discountCode]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const qty = Math.max(1, item.quantity ?? 1);
        const idx = prev.findIndex((x) => x.id === item.id);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + qty };
          return clone;
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateQty = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, quantity: Math.max(1, quantity) } : x))
        .filter((x) => x.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { itemCount, distinctCount, subtotalCents } = useMemo(() => {
    const distinct = items.length;
    const count = items.reduce((acc, x) => acc + x.quantity, 0);
    const subtotal = items.reduce((acc, x) => acc + x.priceCents * x.quantity, 0);
    return { itemCount: count, distinctCount: distinct, subtotalCents: subtotal };
  }, [items]);

  // Reglas simples de ejemplo:
  // - Cupón "CHEAPSKATE" = -8% del subtotal.
  // - Impuestos 12% sobre (subtotal - descuento)
  // - Envío 0 para productos digitales.
  const discountCents = useMemo(() => {
    return discountCode.trim().toUpperCase() === "CHEAPSKATE"
      ? Math.round(subtotalCents * 0.08)
      : 0;
  }, [discountCode, subtotalCents]);

  const taxesCents = useMemo(() => {
    const base = Math.max(0, subtotalCents - discountCents);
    return Math.round(base * 0.12);
  }, [subtotalCents, discountCents]);

  const shippingCents = 0;

  const totalCents = Math.max(0, subtotalCents - discountCents + taxesCents + shippingCents);

  const value: CartContextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQty,
      clear,
      itemCount,
      distinctCount,
      subtotalCents,
      subtotalFormatted: formatMoneyFromCents(subtotalCents),

      discountCode,
      setDiscountCode: (c) => setDiscountCodeState(c),
      discountCents,
      taxesCents,
      shippingCents,
      totalCents,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQty,
      clear,
      itemCount,
      distinctCount,
      subtotalCents,
      discountCode,
      discountCents,
      taxesCents,
      shippingCents,
      totalCents,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return ctx;
}

// Helpers exportables
export const money = (cents: number, currency: string = CURRENCY) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);
