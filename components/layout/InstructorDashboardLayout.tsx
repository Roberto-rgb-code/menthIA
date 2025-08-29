// components/layout/InstructorDashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBook, FaComments, FaChartLine, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PrivateLayout from './PrivateLayout';

interface InstructorDashboardLayoutProps {
  children: React.ReactNode;
}

const InstructorDashboardLayout: React.FC<InstructorDashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  // Inicializa el estado a 'false' para evitar el mismatch de hidratación en el servidor.
  const [isPerformanceMenuOpen, setIsPerformanceMenuOpen] = useState(false);
  // Nuevo estado para controlar si el componente ya se ha montado en el cliente
  const [hasMounted, setHasMounted] = useState(false);

  // Usa useEffect para actualizar el estado DESPUÉS de que el componente se monte en el cliente.
  useEffect(() => {
    setHasMounted(true); // El componente se ha montado en el cliente
    if (router.pathname.startsWith('/dashboard/instructor/rendimiento')) {
      setIsPerformanceMenuOpen(true);
    }
  }, [router.pathname]); // Se re-ejecuta si la ruta cambia

  const navItems = [
    { name: 'Cursos', icon: FaBook, href: '/dashboard/instructor' },
    { name: 'Comunicación', icon: FaComments, href: '/dashboard/instructor/comunicacion' },
    {
      name: 'Rendimiento',
      icon: FaChartLine,
      href: '/dashboard/instructor/rendimiento',
      subItems: [
        { name: 'Descripción general', href: '/dashboard/instructor/rendimiento' },
        { name: 'Estudiantes', href: '/dashboard/instructor/rendimiento/estudiantes' },
        { name: 'Reseñas', href: '/dashboard/instructor/rendimiento/resenas' },
      ],
    },
  ];

  const togglePerformanceMenu = () => {
    setIsPerformanceMenuOpen(!isPerformanceMenuOpen);
  };

  return (
    <PrivateLayout>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex-shrink-0 shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-300">Panel Instructor</h2>
            <nav>
              <ul>
                {navItems.map((item) => (
                  <li key={item.name} className="mb-2">
                    {item.subItems ? (
                      <>
                        {/* Elemento padre del submenú (Rendimiento) */}
                        <div
                          onClick={togglePerformanceMenu}
                          className={`flex items-center p-3 rounded-md cursor-pointer justify-between ${
                            router.pathname.startsWith(item.href) ? 'bg-blue-700 text-white' : 'hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-4 text-xl" />
                            <span className="font-semibold text-lg">{item.name}</span>
                          </div>
                          {/* Renderiza el icono solo después de que el componente se haya montado en el cliente */}
                          {hasMounted && (
                            isPerformanceMenuOpen ? (
                              <FaChevronUp className="text-sm" />
                            ) : (
                              <FaChevronDown className="text-sm" />
                            )
                          )}
                        </div>
                        {/* Sub-ítems de Rendimiento - Renderizado condicional */}
                        {isPerformanceMenuOpen && (
                          <ul className="ml-8 mt-2 border-l border-gray-700">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.name} className="mb-1">
                                <Link href={subItem.href}
                                  className={`flex items-center p-2 rounded-md text-sm ${
                                    router.pathname === subItem.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link href={item.href}
                        className={`flex items-center p-3 rounded-md ${
                          router.pathname === item.href ? 'bg-blue-700 text-white' : 'hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="mr-4 text-xl" />
                        <span className="font-semibold text-lg">{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </PrivateLayout>
  );
};

export default InstructorDashboardLayout;
