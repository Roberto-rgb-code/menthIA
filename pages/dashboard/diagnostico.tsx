// pages/dashboard/diagnostico.tsx
import { useRouter } from 'next/router';
import PrivateLayout from '../../components/layout/PrivateLayout';
import { 
  FaUserTie, 
  FaBuilding, 
  FaExclamationTriangle, 
  FaArrowRight, 
  FaClock, 
  FaChartLine, 
  FaMicroscope,
  FaFire,
  FaRocket,
  FaGem,
  FaShieldAlt,
  FaLightbulb,
  FaCog
} from 'react-icons/fa';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Componente para el fondo de partículas mejorado
const EnhancedParticlesBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Sistema de partículas múltiple
    const particleSystems: THREE.Points[] = [];

    // Partículas principales (azules)
    const createParticleSystem = (count: number, size: number, color: number, range: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * range;
        positions[i * 3 + 1] = (Math.random() - 0.5) * range;
        positions[i * 3 + 2] = (Math.random() - 0.5) * range;

        const colorObj = new THREE.Color(color);
        colors[i * 3] = colorObj.r;
        colors[i * 3 + 1] = colorObj.g;
        colors[i * 3 + 2] = colorObj.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      return new THREE.Points(geometry, material);
    };

    // Crear múltiples sistemas de partículas
    const mainParticles = createParticleSystem(2000, 0.02, 0xfce7f3, 15); // Rosa pastel
    const accentParticles = createParticleSystem(800, 0.015, 0xe0f2fe, 12); // Azul pastel
    const glowParticles = createParticleSystem(400, 0.025, 0xf0fdf4, 8); // Verde pastel

    particleSystems.push(mainParticles, accentParticles, glowParticles);
    particleSystems.forEach(system => scene.add(system));

    camera.position.z = 5;

    // Variables de animación
    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      // Animación diferenciada para cada sistema
      particleSystems.forEach((system, index) => {
        system.rotation.x = Math.sin(time * 0.5) * 0.1 + index * 0.1;
        system.rotation.y = Math.cos(time * 0.3) * 0.1 + index * 0.2;
        system.rotation.z += 0.0005 * (index + 1);
      });

      // Interacción con el mouse más suave
      const targetX = mouseX.current * 0.0002;
      const targetY = mouseY.current * 0.0002;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    const onMouseMove = (event: MouseEvent) => {
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleSystems.forEach(system => {
        system.geometry.dispose();
        (system.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

// Componente de tarjeta con colores mejorados
const DiagnosticCard: React.FC<{
  type: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  secondaryIcon: React.ReactNode;
  accentIcon: React.ReactNode;
  gradient: string;
  glowColor: string;
  buttonText: string;
  estimatedTime: string;
  priority: string;
  onClick: () => void;
}> = ({ 
  type, 
  title, 
  subtitle, 
  description, 
  icon, 
  secondaryIcon, 
  accentIcon,
  gradient, 
  glowColor,
  buttonText, 
  estimatedTime, 
  priority,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 cursor-pointer ${gradient} border-0`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Seleccionar ${title}`}
      style={{
        boxShadow: isHovered ? `0 25px 50px -12px ${glowColor}40, 0 0 40px ${glowColor}20` : '0 10px 30px rgba(0,0,0,0.3)'
      }}
    >
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
      
      {/* Patrón decorativo superior */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
        <div className="absolute top-4 right-4 text-3xl transform rotate-12 text-black drop-shadow-xl filter brightness-125">
          {secondaryIcon}
        </div>
        <div className="absolute top-8 right-12 text-xl transform -rotate-12 opacity-80 text-black drop-shadow-lg filter brightness-110">
          {accentIcon}
        </div>
      </div>

        {/* Badge de prioridad */}
        <div className="absolute top-6 left-6 z-10">
          <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/10 shadow-lg">
            {priority}
          </div>
        </div>

      <div className="relative p-8 pt-16 text-white h-full flex flex-col">
        {/* Icono principal con efecto glow */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-black bg-opacity-20 backdrop-blur-sm mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-black border-opacity-20 shadow-lg">
          <div className="text-4xl text-white drop-shadow-2xl filter brightness-110">{icon}</div>
        </div>

        {/* Contenido */}
        <div className="flex-grow">
          <div className="mb-3">
            <h2 className="text-3xl font-black mb-1 tracking-tight">{title}</h2>
            <h3 className="text-xl font-bold text-white text-opacity-90 tracking-wide">
              {subtitle}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-xs font-medium border border-white/10">
              <FaClock className="text-xs" />
              {estimatedTime}
            </div>
            <div className="h-1 w-1 bg-white/60 rounded-full"></div>
            <div className="text-xs font-medium opacity-75">Recomendado</div>
          </div>

          <p className="text-sm leading-relaxed opacity-90 mb-8 text-white">
            {description}
          </p>
        </div>

        {/* Botón de acción mejorado */}
        <button className="group/btn relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover/btn:opacity-100 transform -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
          <span className="relative z-10">{buttonText}</span>
          <FaArrowRight className={`relative z-10 text-sm transition-all duration-300 ${isHovered ? 'translate-x-2 scale-110' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const Diagnostico = () => {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleSelectDiagnostico = (type: string) => {
    setSelectedCard(type);
    // Redirige a la ruta específica del diagnóstico
    setTimeout(() => {
      router.push(`/dashboard/diagnostico/${type}`);
    }, 200);
  };

  const diagnosticOptions = [
    {
      type: 'emergencia',
      title: 'Diagnóstico',
      subtitle: 'Emergencia',
      description: 'Respuesta inmediata para crisis empresariales. Identifica problemas críticos y obtén soluciones urgentes para estabilizar tu negocio en tiempo récord.',
      icon: <FaExclamationTriangle />,
      secondaryIcon: <FaFire />,
      accentIcon: <FaShieldAlt />,
      gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-600',
      glowColor: '#f97316',
      buttonText: 'Resolver Crisis',
      estimatedTime: '5-10 min',
      priority: 'URGENTE'
    },
    {
      type: 'general',
      title: 'Diagnóstico',
      subtitle: 'General',
      description: 'Evaluación integral y estratégica de tu negocio. Descubre fortalezas ocultas, identifica oportunidades de crecimiento y establece un plan de acción sostenible.',
      icon: <FaUserTie />,
      secondaryIcon: <FaRocket />,
      accentIcon: <FaLightbulb />,
      gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
      glowColor: '#10b981',
      buttonText: 'Iniciar Análisis',
      estimatedTime: '15-20 min',
      priority: 'RECOMENDADO'
    },
    {
      type: 'profundo',
      title: 'Diagnóstico',
      subtitle: 'Profundo',
      description: 'Análisis exhaustivo de nivel empresarial. Sumérgete en cada aspecto de tu organización con metodologías avanzadas y obtén insights de alto valor estratégico.',
      icon: <FaBuilding />,
      secondaryIcon: <FaGem />,
      accentIcon: <FaCog />,
      gradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600',
      glowColor: '#8b5cf6',
      buttonText: 'Análisis Completo',
      estimatedTime: '30-45 min',
      priority: 'AVANZADO'
    }
  ];

  return (
    <PrivateLayout>
      {/* Fondo de partículas mejorado */}
      <EnhancedParticlesBackground />

      {/* Overlay con gradiente más sofisticado */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50/60 via-blue-50/40 to-green-50/50 z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-purple-50/70 via-transparent to-indigo-50/60 z-0"></div>

      <div className="relative z-10 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        {/* Header mejorado con iconos */}
        <div className="max-w-5xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-bold mb-8 shadow-lg backdrop-blur-sm border border-indigo-200">
            <FaChartLine className="text-base animate-pulse" />
            Herramientas de Diagnóstico Empresarial
            <FaMicroscope className="text-base" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
            Elige tu{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              Diagnóstico
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">
            Selecciona la herramienta que transformará tu visión empresarial.{' '}
            <span className="text-indigo-600 font-semibold">Cada diagnóstico</span>{' '}
            está diseñado para brindarte insights específicos y resultados accionables.
          </p>
        </div>

        {/* Grid de tarjetas con mejor espaciado */}
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-12">
            {diagnosticOptions.map((option) => (
              <DiagnosticCard
                key={option.type}
                {...option}
                onClick={() => handleSelectDiagnostico(option.type)}
              />
            ))}
          </div>
        </div>

        {/* Footer informativo mejorado */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="bg-gradient-to-r from-white/70 via-white/80 to-white/70 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-bold mb-4">
                <FaLightbulb className="animate-pulse" />
                Guía de Selección
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                ¿Primera vez? Te ayudamos a decidir
              </h3>
              <p className="text-gray-600 text-lg">
                Si no estás seguro, el <strong className="text-indigo-600">Diagnóstico General</strong> es perfecto para comenzar tu transformación empresarial.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <FaFire className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-red-700 mb-2">Crisis Inmediata</h4>
                <p className="text-red-600 text-sm">Problemas que requieren atención urgente</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-blue-700 mb-2">Crecimiento Estratégico</h4>
                <p className="text-blue-600 text-sm">Evaluación completa y plan de acción</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <FaGem className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-purple-700 mb-2">Análisis Exhaustivo</h4>
                <p className="text-purple-600 text-sm">Insights profundos y transformación total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Diagnostico;
