// components/layout/PrivateLayout.tsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Navbar'; // Importa tu componente Navbar principal

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Renderiza tu Navbar principal aquí */}
      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        &copy; 2025 MentorApp. Todos los derechos reservados.
      </footer>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default PrivateLayout;
