// pages/community.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import PrivateLayout from '@/components/layout/PrivateLayout'; // Ajusta la ruta si es necesario
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaNewspaper, FaCalendarAlt, FaGift, FaStar, FaQuoteRight, FaUserPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import * as THREE from 'three'; // Para el elemento 3D
import { gsap } from 'gsap'; // Para animaciones de elementos

// Importaciones para tsparticles
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim'; // Usamos la versión slim

// Datos de ejemplo para las secciones
const faqItems = [
  {
    question: "¿Cómo puedo unirme a la comunidad?",
    answer: "Puedes unirte registrándote en nuestra plataforma y completando tu perfil. ¡Es rápido y sencillo!",
  },
  {
    question: "¿Qué tipo de eventos se organizan?",
    answer: "Organizamos webinars, talleres, sesiones de networking y charlas con expertos en diversas áreas de negocio.",
  },
  {
    question: "¿Puedo compartir mis propias experiencias o conocimientos?",
    answer: "¡Absolutamente! Fomentamos la participación activa. Puedes contribuir con artículos en nuestro blog o presentarte como ponente en eventos.",
  },
  {
    question: "¿Cómo funciona el programa de referidos?",
    answer: "Nuestro programa de referidos te permite invitar a amigos y colegas. Ambos obtendrán beneficios exclusivos una vez que se unan a la plataforma.",
  },
];

const blogPosts = [
  {
    id: 1,
    title: "5 Estrategias Clave para el Crecimiento de tu PyME",
    date: "15 de Julio, 2025",
    excerpt: "Descubre cómo implementar tácticas efectivas para escalar tu negocio en el mercado actual.",
    link: "#",
    image: "https://placehold.co/400x250/06B6D4/FFFFFF?text=Blog+1"
  },
  {
    id: 2,
    title: "La Importancia de la Digitalización en la Era Post-Pandemia",
    date: "10 de Julio, 2025",
    excerpt: "Analizamos cómo la transformación digital se ha vuelto indispensable para la supervivencia y éxito empresarial.",
    link: "#",
    image: "https://placehold.co/400x250/0EA5E9/FFFFFF?text=Blog+2"
  },
  {
    id: 3,
    title: "Cómo Optimizar tus Finanzas con MentorApp",
    date: "01 de Julio, 2025",
    excerpt: "Consejos prácticos para una gestión financiera eficiente y cómo nuestras herramientas pueden ayudarte.",
    link: "#",
    image: "https://placehold.co/400x250/3B82F6/FFFFFF?text=Blog+3"
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Webinar: Marketing Digital para Emprendedores",
    date: "25 de Agosto, 2025",
    time: "10:00 AM (CDMX)",
    location: "Online",
    link: "#",
  },
  {
    id: 2,
    title: "Taller: Finanzas para No Financieros",
    date: "10 de Septiembre, 2025",
    time: "04:00 PM (CDMX)",
    location: "Online",
    link: "#",
  },
];

const testimonials = [
  {
    id: 1,
    quote: "MentorApp transformó mi negocio. La asesoría fue clave para superar mis retos.",
    author: "Ana G., Emprendedora",
    avatar: "https://placehold.co/100x100/FACC15/FFFFFF?text=AG"
  },
  {
    id: 2,
    quote: "Encontré el mentor perfecto para mi startup. ¡Totalmente recomendado!",
    author: "Carlos R., Fundador de Tech Solutions",
    avatar: "https://placehold.co/100x100/A78BFA/FFFFFF?text=CR"
  },
  {
    id: 3,
    quote: "Los recursos y la comunidad son invaluables. Siempre aprendo algo nuevo.",
    author: "Sofía M., Gerente de PyME",
    avatar: "https://placehold.co/100x100/60A5FA/FFFFFF?text=SM"
  },
];

const Community = () => {
  const threeJsContainer = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  // Estado para el enlace de referido simulado y confirmación de copiado
  const [referralLink, setReferralLink] = useState('mentorapp.com/refer/TUCODIGOUNICO');
  const [copied, setCopied] = useState(false);

  // Función de inicialización de tsparticles
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  // Función para copiar el enlace al portapapeles
  const handleCopyLink = () => {
    // Usamos document.execCommand('copy') por compatibilidad en algunos entornos de iframe
    document.execCommand('copy', false, referralLink);
    setCopied(true);
    // Animación de confirmación con GSAP
    gsap.to('.copy-confirm', { opacity: 1, y: 0, duration: 0.3 });
    setTimeout(() => {
      gsap.to('.copy-confirm', { opacity: 0, y: -10, duration: 0.3, onComplete: () => setCopied(false) });
    }, 2000); // Ocultar después de 2 segundos
  };

  useEffect(() => {
    // Inicialización de Three.js
    if (threeJsContainer.current) {
      const currentMount = threeJsContainer.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Alpha true para fondo transparente
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      currentMount.appendChild(renderer.domElement);

      // Elemento 3D: Una esfera con muchos puntos y líneas (como una red/comunidad)
      const geometry = new THREE.SphereGeometry(1.5, 32, 32);
      // Colores ajustados para que coincidan con el nuevo degradado del hero
      const material = new THREE.PointsMaterial({ color: 0x3B82F6, size: 0.05 }); // Azul-500
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.5 }); // Azul-400, un poco más claro
      const lines = new THREE.Group();
      const numLines = 100;
      for (let i = 0; i < numLines; i++) {
        const start = new THREE.Vector3().randomDirection().multiplyScalar(1.5);
        const end = new THREE.Vector3().randomDirection().multiplyScalar(1.5);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        lines.add(line);
      }
      scene.add(lines);

      camera.position.z = 5;

      // Animación de Three.js
      const animateThree = () => {
        requestAnimationFrame(animateThree);
        points.rotation.x += 0.001;
        points.rotation.y += 0.002;
        lines.rotation.x += 0.0005;
        lines.rotation.y += 0.001;
        renderer.render(scene, camera);
      };
      animateThree();

      // Limpieza al desmontar el componente
      return () => {
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          lineMaterial.dispose();
          scene.clear();
        }
      };
    }
  }, []);

  useEffect(() => {
    // Animaciones con GSAP para las secciones generales
    gsap.fromTo(
      '.section-animate',
      { opacity: 0, translateY: 50 },
      { opacity: 1, translateY: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    // Animaciones para elementos del Hero mejorado (usando GSAP)
    gsap.fromTo(
      '.hero-slogan',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.5, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.hero-headline',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.hero-description',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.9, ease: 'power2.out' }
    );
    // GSAP para el botón CTA del hero (anteriormente .register-button, ahora .hero-cta)
    gsap.fromTo(
      '.hero-cta',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 1.2, ease: 'elastic.out(1, 0.8)' }
    );

    // Animaciones GSAP para la sección de referidos
    gsap.fromTo(
      '.referral-step',
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.2, duration: 0.5, ease: 'back.out(1.7)', delay: 0.5 }
    );
    gsap.fromTo(
      '.referral-input-group',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 1.2, ease: 'power2.out' }
    );
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <PrivateLayout>
      <div className="relative min-h-screen bg-gray-900 text-gray-100 overflow-hidden font-inter">
        {/* Configuración de Particles.js */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "#1a202c", // Un gris oscuro que combina con el fondo
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#00bcd4", // Color azul cian para las partículas
              },
              links: {
                color: "#4dd0e1", // Un poco más claro para las líneas
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0" // Asegura que ocupe todo el espacio y esté detrás del contenido
        />

        {/* Contenido principal */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          {/* Hero Section - MEJORADO */}
          <motion.section
            className="text-center mb-16 md:mb-24 relative overflow-hidden bg-gradient-to-br from-blue-800 to-purple-900 p-8 md:p-16 rounded-3xl shadow-2xl border border-blue-700"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Fondo con patrón sutil (SVG en base64) */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H0V0zm0 0h1v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

            <div ref={threeJsContainer} className="absolute inset-0 z-0 opacity-30"></div> {/* Three.js Canvas con más opacidad */}
            <div className="relative z-10">
              <motion.p
                className="hero-slogan text-xl md:text-2xl font-semibold text-yellow-300 mb-4 drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                ¡Tu Ecosistema de Crecimiento Empresarial!
              </motion.p>
              <motion.h1
                className="hero-headline text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight drop-shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Únete a Nuestra Comunidad <span className="text-blue-300">MentorApp</span>
              </motion.h1>
              <motion.p
                className="hero-description text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.9 }}
              >
                Conecta con líderes, aprende de expertos y escala tu negocio en un espacio vibrante de colaboración y apoyo mutuo.
              </motion.p>
              {/* Se ha cambiado de motion.div a div simple para que GSAP controle la animación */}
              <div className="hero-cta">
                <Link href="/register" className="inline-block bg-yellow-400 text-blue-900 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 ease-in-out">
                  Regístrate Ahora
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Secciones de Contenido */}
          <div className="space-y-16 md:space-y-24">
            {/* Preguntas Frecuentes */}
            <motion.section className="section-animate bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-blue-400 mb-8 flex items-center justify-center">
                <FaQuestionCircle className="mr-4 text-blue-500" /> Preguntas Frecuentes
              </h2>
              <div className="space-y-4 max-w-3xl mx-auto">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
                    <button
                      className="flex justify-between items-center w-full p-5 text-left text-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                      onClick={() => toggleFaq(index)}
                    >
                      {item.question}
                      {activeFaq === index ? <FaChevronUp className="text-blue-300" /> : <FaChevronDown className="text-blue-300" />}
                    </button>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-5 pt-0 text-gray-300"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Blogs y Noticias */}
            <motion.section className="section-animate bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-green-400 mb-8 flex items-center justify-center">
                <FaNewspaper className="mr-4 text-green-500" /> Blogs y Noticias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="bg-gray-700 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out"
                    whileHover={{ translateY: -5 }} // Efecto sutil al pasar el ratón
                  >
                    <img src={post.image} alt={post.title} className="w-full h-48 object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x250/000000/FFFFFF?text=Imagen+No+Disponible'; }}/>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-white mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{post.date}</p>
                      <p className="text-gray-300 text-base mb-4">{post.excerpt}</p>
                      <Link href={post.link} className="inline-block text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                        Leer más &rarr;
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Eventos */}
            <motion.section className="section-animate bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-yellow-400 mb-8 flex items-center justify-center">
                <FaCalendarAlt className="mr-4 text-yellow-500" /> Próximos Eventos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-gray-700 p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ease-in-out flex items-start space-x-4"
                    whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)" }}
                  >
                    <FaCalendarAlt className="text-blue-400 text-3xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-1">{event.title}</h3>
                      <p className="text-gray-300 mb-1">
                        <span className="font-medium">Fecha:</span> {event.date}
                      </p>
                      <p className="text-gray-300 mb-1">
                        <span className="font-medium">Hora:</span> {event.time}
                      </p>
                      <p className="text-gray-300 mb-3">
                        <span className="font-medium">Modalidad:</span> {event.location}
                      </p>
                      <Link href={event.link} className="inline-block text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                        Ver Detalles &rarr;
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Programa de Referidos - INNOVADO */}
            <motion.section className="section-animate bg-gradient-to-br from-purple-800 to-indigo-900 p-8 md:p-12 rounded-3xl shadow-2xl text-center border border-purple-700 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {/* Fondo con patrón sutil (SVG en base64) */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H0V0zm0 0h1v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg flex items-center justify-center">
                  <FaGift className="mr-4 text-yellow-300 text-5xl" /> ¡Invita y Gana con MentorApp!
                </h2>
                <p className="text-xl md:text-2xl text-indigo-200 max-w-3xl mx-auto mb-10">
                  Comparte la oportunidad de crecimiento y recibe recompensas por cada amigo que se una y prospere.
                </p>

                {/* Pasos del Programa */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="referral-step bg-indigo-800 p-6 rounded-xl shadow-lg flex flex-col items-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                    <div className="bg-blue-500 rounded-full p-4 mb-4">
                      <FaUserPlus className="text-white text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">1. Invita</h3>
                    <p className="text-indigo-200 text-center">Comparte tu enlace único con tu red.</p>
                  </div>
                  <div className="referral-step bg-indigo-800 p-6 rounded-xl shadow-lg flex flex-col items-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                    <div className="bg-green-500 rounded-full p-4 mb-4">
                      <FaStar className="text-white text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">2. Gana</h3>
                    <p className="text-indigo-200 text-center">Recibe beneficios cuando se registren y activen.</p>
                  </div>
                  <div className="referral-step bg-indigo-800 p-6 rounded-xl shadow-lg flex flex-col items-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                    <div className="bg-yellow-500 rounded-full p-4 mb-4">
                      <FaGift className="text-white text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">3. Disfruta</h3>
                    <p className="text-indigo-200 text-center">Aprovecha tus recompensas exclusivas.</p>
                  </div>
                </div>

                {/* Enlace de Referido y Copiar */}
                <div className="referral-input-group max-w-xl mx-auto flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                  <div className="relative w-full">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="w-full p-4 pr-12 rounded-xl bg-indigo-700 text-white text-lg border border-indigo-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-inner outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      title="Copiar enlace"
                    >
                      {/* Icono de copiar (SVG inline) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                  {copied && (
                    <span className="copy-confirm text-green-300 text-sm opacity-0 -translate-y-2">¡Copiado!</span>
                  )}
                </div>

                <Link href="/referrals" className="inline-block bg-yellow-400 text-purple-900 font-bold py-4 px-10 rounded-full text-lg md:text-xl shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 ease-in-out">
                  <FaUserPlus className="inline-block mr-3" /> Gestionar Mis Referidos
                </Link>
              </div>
            </motion.section>

            {/* Reseñas y Testimonios */}
            <motion.section className="section-animate bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-red-400 mb-8 flex items-center justify-center">
                <FaStar className="mr-4 text-red-500" /> Reseñas y Testimonios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    className="bg-gray-700 p-6 rounded-xl shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 ease-in-out"
                    whileHover={{ translateY: -5 }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500 shadow-md"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/CCCCCC/000000?text=Avatar'; }}
                    />
                    <FaQuoteRight className="text-blue-400 text-3xl mb-4" />
                    <p className="text-gray-200 italic mb-4 text-lg">"{testimonial.quote}"</p>
                    <p className="font-semibold text-white text-md">- {testimonial.author}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Call to Action Final */}
            <motion.section
              className="section-animate text-center py-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-2xl border border-blue-500"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Listo para Conectar?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                Únete a nuestra creciente red de profesionales y emprendedores. ¡Tu próximo gran paso comienza aquí!
              </p>
              <Link href="/register" className="register-button inline-block bg-white text-blue-800 font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out">
                <FaUserPlus className="inline-block mr-3" /> Empezar Ahora
              </Link>
            </motion.section>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Community;
