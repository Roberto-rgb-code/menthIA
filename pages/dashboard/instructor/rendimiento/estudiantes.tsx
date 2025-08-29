// pages/dashboard/instructor/rendimiento/estudiantes.tsx
import React from 'react';
import InstructorDashboardLayout from '@/components/layout/InstructorDashboardLayout';
import Link from 'next/link'; // Importa Link

const InstructorStudentsPage: React.FC = () => {
  return (
    <InstructorDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
        <p className="text-gray-600 mt-2">Información sobre tus estudiantes.</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm text-center py-20 border border-gray-200">
        <p className="text-gray-600 text-lg mb-6">Aún no hay estudiantes...</p>
        <p className="text-gray-600 mb-8">
          Cuando publiques tu curso, visita esta página para obtener información sobre tus estudiantes.
        </p>
        <Link href="/dashboard/instructor" className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-md">
          Ir al panel del instructor
        </Link>
      </div>
    </InstructorDashboardLayout>
  );
};

export default InstructorStudentsPage;
