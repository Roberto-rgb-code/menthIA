// lib/checkout.ts
export async function startCheckout(kind: string, quantity = 1, metadata: Record<string, any> = {}) {
  const r = await fetch("/api/payments/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: { kind, quantity, metadata } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "No se pudo iniciar el checkout");
  window.location.href = j.url; // Stripe Hosted Checkout
}
