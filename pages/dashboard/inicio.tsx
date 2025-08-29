// pages/dashboard/inicio.tsx
import React from 'react';
import PrivateLayout from '../../components/layout/PrivateLayout';
import ProfileCarousel from '../../components/ProfileCarousel';
import { 
  SparklesIcon, 
  UsersIcon, 
  LightBulbIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const Inicio = () => {
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section Mejorada */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-90">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <SparklesIcon className="h-8 w-8" />
                  </div>
                  <span className="text-lg font-medium opacity-90">MentorApp</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Potencia tu{' '}
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Crecimiento
                  </span>
                  Profesional
                </h1>
                
                <p className="text-xl opacity-90 leading-relaxed max-w-lg">
                  Conecta con mentores expertos, accede a cursos especializados y 
                  transforma tus ideas en proyectos exitosos.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2">
                    <span>Comenzar Ahora</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                  <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 flex items-center space-x-2">
                    <PlayIcon className="h-5 w-5" />
                    <span>Ver Demo</span>
                  </button>
                </div>

                {/* Beneficios rápidos */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                    <span className="text-sm opacity-90">Mentores certificados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                    <span className="text-sm opacity-90">Soporte 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                    <span className="text-sm opacity-90">Comunidad global</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                    <span className="text-sm opacity-90">Cursos actualizados</span>
                  </div>
                </div>
              </div>
              
              {/* Componente Card 3D Integrado directamente */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-80 h-80">
                  <style jsx>{`
                    @keyframes rotating {
                      from {
                        transform: perspective(1000px) rotateX(-15deg) rotateY(0);
                      }
                      to {
                        transform: perspective(1000px) rotateX(-15deg) rotateY(360deg);
                      }
                    }
                    .card-container {
                      animation: rotating 20s linear infinite;
                    }
                  `}</style>
                  {/* Card 3D Component */}
                  <div className="w-full h-full relative text-center flex items-center justify-center overflow-hidden">
                    <div 
                      className="card-container absolute w-24 h-36 top-1/4 left-1/2 transform -translate-x-1/2 z-10"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: 'perspective(1000px)'
                      }}
                    >
                      {/* Cartas giratorias */}
                      {[
                        { index: 0, color: '142, 249, 252', title: 'Mentores' },
                        { index: 1, color: '142, 252, 204', title: 'Cursos' },
                        { index: 2, color: '142, 252, 157', title: 'Coaching' },
                        { index: 3, color: '215, 252, 142', title: 'Workshops' },
                        { index: 4, color: '252, 252, 142', title: 'Network' },
                        { index: 5, color: '252, 208, 142', title: 'Recursos' },
                        { index: 6, color: '252, 142, 142', title: 'Eventos' },
                        { index: 7, color: '252, 142, 239', title: 'Comunidad' },
                        { index: 8, color: '204, 142, 252', title: 'Certificados' },
                        { index: 9, color: '142, 202, 252', title: 'Soporte' }
                      ].map((card) => (
                        <div
                          key={card.index}
                          className="absolute inset-0 border-2 rounded-xl overflow-hidden"
                          style={{
                            borderColor: `rgba(${card.color}, 1)`,
                            transform: `rotateY(${(360 / 10) * card.index}deg) translateZ(175px)`
                          }}
                        >
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                            style={{
                              background: `radial-gradient(circle, rgba(${card.color}, 0.3) 0%, rgba(${card.color}, 0.7) 80%, rgba(${card.color}, 0.9) 100%)`
                            }}
                          >
                            {card.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Servicios Principales */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              <span>Servicios Premium</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre todas las herramientas y recursos que tenemos para acelerar tu crecimiento profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mentoría Empresarial */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mentoría Empresarial</h3>
                <p className="text-gray-600 mb-6">
                  Conecta con líderes empresariales que te guiarán en tu camino al éxito
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.9</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            {/* Cursos */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Cursos Especializados</h3>
                <p className="text-gray-600 mb-6">
                  Aprende nuevas habilidades con cursos diseñados por expertos de la industria
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.8</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-purple-500 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            {/* Diagnósticos */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Diagnósticos</h3>
                <p className="text-gray-600 mb-6">
                  Evalúa el estado actual de tu negocio y descubre nuevas oportunidades de crecimiento
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.7</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-green-500 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            {/* Marketplace */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Marketplace</h3>
                <p className="text-gray-600 mb-6">
                  Encuentra y ofrece servicios especializados en nuestra plataforma colaborativa
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.6</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-orange-500 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-900 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900/20 to-purple-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Resultados que Hablan por Sí Solos
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Miles de profesionales ya han transformado sus carreras con MentorApp
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">1000+</div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Mentores Activos</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200">50k+</div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Estudiantes</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-200">200+</div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Cursos</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-200">98%</div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>

        {/* Perfiles Destacados */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <UsersIcon className="h-4 w-4" />
              <span>Comunidad</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfiles Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una selección de mentores y emprendedores que te pueden inspirar en tu crecimiento profesional
            </p>
          </div>
          <ProfileCarousel />
        </div>

        {/* Call to Action Final */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para transformar tu carrera?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a miles de profesionales que ya están creciendo con MentorApp. 
              Tu próximo nivel profesional te está esperando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2">
                <span>Comenzar Gratis</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
                Conocer Planes
              </button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              Sin tarjeta de crédito requerida • Acceso inmediato • Soporte incluido
            </p>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Inicio;