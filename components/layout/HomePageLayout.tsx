// components/layout/HomePageLayout.tsx
import React, { useState, useEffect } from 'react';
import PublicLayout from './PublicLayout'; // Asegúrate de que esta ruta sea correcta
import Link from 'next/link';
import { FaBullhorn } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageLayoutProps {
  children: React.ReactNode;
}

const messages = [
  <>
    ¡Nueva función! Accede a nuestros{' '}
    <Link href="/dashboard/webinars" className="underline hover:text-blue-200 transition-colors duration-200">
      webinars exclusivos
    </Link>{' '}
    para potenciar tu estrategia.
  </>,
  <>
    🚀 Lanza tu primer proyecto con nuestro{' '}
    <Link href="/dashboard/cursos" className="underline hover:text-blue-200 transition-colors duration-200">
      curso gratuito
    </Link>{' '}
    de e-commerce.
  </>,
  <>
    🎉 Descuentos exclusivos solo por hoy en nuestra{' '}
    <Link href="/dashboard/promos" className="underline hover:text-blue-200 transition-colors duration-200">
      tienda online
    </Link>!
  </>
];

const HomePageLayout: React.FC<HomePageLayoutProps> = ({ children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000); // Cambia el mensaje cada 4 segundos
    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <>
      {/* Announcement Bar - Carousel animado */}
      <div className="bg-blue-800 text-white text-center py-3 px-4 text-sm md:text-base font-medium flex items-center justify-center shadow-md overflow-hidden" style={{ minHeight: 48 }}>
        <FaBullhorn className="mr-2 text-xl flex-shrink-0" />
        <div style={{ position: 'relative', width: '100%', minHeight: 24 }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -120, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="inline-block absolute left-0 w-full"
            >
              {messages[index]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* PublicLayout contiene el Navbar y el resto del contenido de la página */}
      <PublicLayout>
        {children}
      </PublicLayout>
    </>
  );
};

export default HomePageLayout;
