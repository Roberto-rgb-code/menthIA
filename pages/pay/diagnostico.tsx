// pages/pay/diagnostico.tsx
import React from "react";
import PrivateLayout from "../../components/layout/PrivateLayout";
import ProductCheckout, { ProductInput } from "../../components/payments/ProductCheckout";

const PayDiagnosticoPage: React.FC = () => {
  const product: ProductInput = {
    kind: "diagnostico_profundo",
    // Puedes pasar metadata adicional si quieres identificar esta orden
    metadata: { feature: "diag_profundo_chatbot" },
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 py-8 px-3">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border rounded-2xl shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-indigo-800">Diagnóstico Profundo</h1>
                <p className="text-sm text-gray-600">Análisis consultivo 30-60-90 con IA</p>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-sm">Precio</div>
                {/* El precio real lo define el backend; esto es solo visual */}
                <div className="text-2xl font-bold text-gray-900">$499.00</div>
              </div>
            </div>

            <div className="mt-6">
              <ProductCheckout
                title="Checkout"
                subtitle="Completa el pago para desbloquear el análisis con IA."
                product={product}
                intentEndpoint="/api/payments/create-payment-intent"
                // Si no pasas onSuccess, por defecto añade ?paid=1 a la URL actual
                onSuccess={() => {
                  // Marca acceso local y vuelve al chatbot con ?paid=1
                  try {
                    localStorage.setItem("diag_profundo_paid", "1");
                  } catch {}
                  window.location.href = "/dashboard/diagnostico/profundo?paid=1";
                }}
                cancelReturnUrl="/dashboard/diagnostico/profundo"
              />
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default PayDiagnosticoPage;
