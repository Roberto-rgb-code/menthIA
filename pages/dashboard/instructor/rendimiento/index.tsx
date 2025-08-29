// pages/dashboard/instructor/rendimiento/index.tsx
import React from 'react';
import InstructorDashboardLayout from '@/components/layout/InstructorDashboardLayout';
import Link from 'next/link'; // Importa Link

const InstructorPerformanceOverviewPage: React.FC = () => {
  return (
    <InstructorDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Descripción general</h1>
        <p className="text-gray-600 mt-2">Obtén la mejor información sobre tu rendimiento.</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
          <div>
            <p className="text-sm text-gray-500">Total de ingresos</p>
            <h2 className="text-4xl font-bold text-gray-800 mt-1">0,00 US$</h2>
            <p className="text-sm text-gray-500">0,00 US$ este mes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Inscripciones totales</p>
            <h2 className="text-4xl font-bold text-gray-800 mt-1">0</h2>
            <p className="text-sm text-gray-500">0 este mes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Calificación del instructor</p>
            <h2 className="text-4xl font-bold text-gray-800 mt-1">0,00</h2>
            <p className="text-sm text-gray-500">0 calificaciones este mes</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Periodo:</span>
            <select className="p-2 border border-gray-300 rounded-md">
              <option>Últimos 12 meses</option>
            </select>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-300">
              Exportar
            </button>
          </div>
        </div>

        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">No hay datos para mostrar</p>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard/instructor/rendimiento/informe-ingresos" className="text-blue-600 hover:underline font-semibold">
            Informe de ingresos &gt;
          </Link>
        </div>
      </div>
    </InstructorDashboardLayout>
  );
};

export default InstructorPerformanceOverviewPage;
