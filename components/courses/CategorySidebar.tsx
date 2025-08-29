// components/courses/CategorySidebar.tsx
import React from 'react';

interface CategorySidebarProps {
  categories: string[]; // Lista de categorías únicas
  selectedCategory: string | null; // La categoría actualmente seleccionada
  onSelectCategory: (category: string | null) => void; // Función para manejar la selección
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-64 flex-shrink-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Explorar Categorías</h2>
      <ul>
        <li className="mb-2">
          <button
            onClick={() => onSelectCategory(null)} // Para ver todos los cursos
            className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 ${
              selectedCategory === null
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas las Categorías
          </button>
        </li>
        {categories.map((category) => (
          <li key={category} className="mb-2">
            <button
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;