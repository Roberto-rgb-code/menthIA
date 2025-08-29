// pages/cart.tsx
import React, { useEffect, useMemo, useState } from "react";
import PrivateLayout from "../components/layout/PrivateLayout";
import { useCart, money } from "../contexts/CartContext";
import { useAuth } from "../hooks/useAuth";
import { FaSpinner, FaTrash, FaMinus, FaPlus, FaLock } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

const kindLabel: Record<string, string> = {
  curso: "Curso",
  mentoria: "Mentoría",
  servicio: "Marketplace",
  diagnostico: "Diagnóstico",
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "mt-1 w-full rounded-xl border px-3 py-2",
      "bg-white placeholder:text-gray-400",
      "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
      props.className || "",
    ].join(" ")}
  />
);

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...rest }) => (
  <label {...rest} className={["block text-sm font-medium text-gray-700", className || ""].join(" ")}>
    {children}
  </label>
);

const CartPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    subtotalCents,
    discountCode,
    setDiscountCode,
    discountCents,
    taxesCents,
    shippingCents,
    totalCents,
  } = useCart();

  // Permite agregar por query: ?sku=&type=&name=&price=&image=&qty=&ret=
  const { sku, type, name, price, image, qty, ret } = router.query;

  useEffect(() => {
    if (!sku || !type || !name || !price) return;
    const id = String(sku);
    const kind = String(type) as any;
    const title = decodeURIComponent(String(name));
    const priceCents = Number(price);
    const quantity = Number(qty || 1);
    const img = image ? decodeURIComponent(String(image)) : undefined;

    addItem({ id, kind, title, priceCents, quantity, image: img || null });

    // Limpia la URL dejando sólo ?ret= para evitar duplicados
    const clean = { pathname: router.pathname, query: { ret } };
    router.replace(clean as any, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku, type, name, price, image, qty]);

  const [email, setEmail] = useState(user?.email || "");
  const [card, setCard] = useState({
    name: user?.displayName || "",
    number: "",
    exp: "",
    cvc: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const canPay = useMemo(() => {
    return items.length > 0 && email.includes("@") && card.name && card.number && card.exp && card.cvc;
  }, [items.length, email, card]);

  const returnTo = typeof ret === "string" && ret ? ret : "/";

  const handlePay = async () => {
    // Integración real: Stripe Checkout / Payment Element.
    // Demo: vacía y regresa con ?paid=1
    clear();
    router.push(`${returnTo}?paid=1`);
  };

  if (authLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <FaSpinner className="animate-spin text-indigo-600" size={36} />
        </div>
      </PrivateLayout>
    );
  }

  if (!user) {
    return (
      <PrivateLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <div className="text-center">
            <p className="text-lg mb-3">Debes iniciar sesión para continuar con el pago.</p>
            <a className="px-4 py-2 bg-indigo-600 text-white rounded-lg" href="/login">
              Iniciar sesión
            </a>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 py-8 px-3 md:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna izquierda: formulario */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border bg-white shadow-sm p-6">
              {/* Título */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white grid place-items-center text-lg font-bold">⚡</div>
                <div>
                  <div className="text-lg font-semibold text-indigo-800">Checkout</div>
                  <div className="text-xs text-gray-500">Completa tus datos para finalizar la compra</div>
                </div>
              </div>

              {/* Indicador de paso */}
              <div className="mb-6">
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-indigo-600 w-3/4 transition-all" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Paso 1/1 · Pago</div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <Label>Email address</Label>
                <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {/* Tarjeta */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Name on card</Label>
                  <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Card number</Label>
                  <Input placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                </div>
                <div>
                  <Label>Expiration date (MM/YY)</Label>
                  <Input placeholder="12/29" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
                </div>
              </div>

              {/* Dirección (opcional si es digital) */}
              <div className="mt-3">
                <Label>Address</Label>
                <Input value={card.address} onChange={(e) => setCard({ ...card, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="City" value={card.city} onChange={(e) => setCard({ ...card, city: e.target.value })} />
                <Input placeholder="State / Province" value={card.state} onChange={(e) => setCard({ ...card, state: e.target.value })} />
                <Input placeholder="Postal code" value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value })} />
              </div>

              {/* Botón pagar */}
              <button
                disabled={!canPay}
                onClick={handlePay}
                className={[
                  "mt-6 w-full rounded-xl py-3 font-semibold",
                  "bg-indigo-600 text-white shadow-sm",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:bg-indigo-700 transition-colors",
                ].join(" ")}
              >
                Pagar {money(totalCents)}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center gap-1 justify-center">
                <FaLock /> Tus datos se procesarán de forma segura (demo).
              </p>
            </div>
          </div>

          {/* Columna derecha: resumen (sticky) */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border bg-white shadow-sm p-4 md:sticky md:top-6">
              {items.length === 0 ? (
                <div className="text-center text-gray-600">
                  Tu carrito está vacío.
                  <div className="mt-3">
                    <Link href="/" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                      Explorar
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((it) => (
                    <div key={it.id} className="flex gap-3 border rounded-xl p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.image || "/img/placeholder-80.png"}
                        alt={it.title}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold leading-tight">{it.title}</div>
                            <div className="text-xs text-gray-500 capitalize">{kindLabel[it.kind]}</div>
                          </div>
                          <div className="font-semibold whitespace-nowrap">{money(it.priceCents)}</div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className="p-2 rounded border hover:bg-gray-50"
                            onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))}
                            aria-label="Disminuir"
                          >
                            <FaMinus />
                          </button>
                          <div className="px-3 py-2 border rounded min-w-[44px] text-center">{it.quantity}</div>
                          <button
                            className="p-2 rounded border hover:bg-gray-50"
                            onClick={() => updateQty(it.id, it.quantity + 1)}
                            aria-label="Aumentar"
                          >
                            <FaPlus />
                          </button>
                          <button
                            className="p-2 text-rose-600 ml-2 hover:bg-rose-50 rounded"
                            onClick={() => removeItem(it.id)}
                            title="Quitar"
                            aria-label="Quitar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cupón */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="mt-0"
                    />
                    <button
                      className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                      onClick={() => setDiscountCode(discountCode)}
                    >
                      Apply
                    </button>
                  </div>

                  {/* Totales */}
                  <div className="text-sm space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{money(subtotalCents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span className={discountCents ? "text-rose-600" : ""}>
                        −{money(discountCents)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>{money(taxesCents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{money(shippingCents)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span>{money(totalCents)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button className="text-sm underline text-rose-600" onClick={clear}>
                      Vaciar carrito
                    </button>
                    <button
                      disabled={items.length === 0}
                      onClick={handlePay}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700"
                    >
                      Pagar {money(totalCents)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de acción fija en mobile (mejor UX) */}
        {items.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 md:hidden px-4">
            <div className="mx-auto max-w-3xl rounded-2xl shadow-lg border bg-white p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="text-gray-500">Total</div>
                <div className="font-semibold">{money(totalCents)}</div>
              </div>
              <button
                disabled={!canPay}
                onClick={handlePay}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
              >
                Pagar
              </button>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default CartPage;
