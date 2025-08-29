// components/auth/ForgotPassword.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase"; // Asegúrate de que 'auth' esté bien exportado desde firebase.ts

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Limpiar mensajes previos
    setError("");   // Limpiar errores previos

    if (!email) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y spam).");
      setEmail(""); // Limpiar el campo del email
    } catch (err: any) {
      console.error("Error sending password reset email:", err.code, err.message);

      let userFriendlyMessage = "Error al enviar el enlace para restablecer la contraseña.";

      if (err.code === 'auth/user-not-found') {
        userFriendlyMessage = "No se encontró ningún usuario con ese correo electrónico. Por favor, verifica el correo.";
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyMessage = "El formato del correo electrónico es inválido.";
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMessage = "Problema de conexión: Asegúrate de tener una conexión a internet estable.";
      }
      setError(userFriendlyMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-4">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-blue-800 mb-2 text-center">¿Olvidaste tu contraseña?</h2>
        <p className="text-gray-600 mb-6 text-center">
          Introduce tu correo electrónico para restablecer tu contraseña.
        </p>

        {message && (
          <p className="text-green-600 text-center mb-4 p-3 bg-green-100 border border-green-300 rounded-lg animate-fade-in">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center mb-4 p-3 bg-red-100 border border-red-300 rounded-lg animate-shake">
            {error}
          </p>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="example@domain.com"
              required
              aria-label="Correo Electrónico"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            Enviar enlace de restablecimiento
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          ¿Recordaste tu contraseña?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:underline font-semibold"
          >
            Volver a Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;