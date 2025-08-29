import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

// You can define team members and their images here or fetch them from an API
const teamMembers = [
  {
    name: 'Juan Pérez',
    title: 'Fundador & CEO',
    bio: 'Visionario detrás de MentorApp, con más de 15 años de experiencia en desarrollo empresarial y mentoría.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    skills: ['Liderazgo', 'Estrategia', 'Innovación']
  },
  {
    name: 'María García',
    title: 'Directora de Operaciones',
    bio: 'Experta en eficiencia operativa y gestión de proyectos, asegurando que cada iniciativa se ejecute a la perfección.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    skills: ['Operaciones', 'Gestión', 'Eficiencia']
  },
  {
    name: 'Carlos López',
    title: 'Jefe de Tecnología',
    bio: 'Arquitecto de nuestra plataforma, lidera el equipo de desarrollo con pasión por la innovación tecnológica.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    skills: ['Desarrollo', 'Arquitectura', 'Innovation']
  },
  {
    name: 'Ana Rodríguez',
    title: 'Directora de Contenido y Mentoría',
    bio: 'Curadora de nuestros programas educativos y red de mentores, garantizando la calidad y relevancia del conocimiento.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    skills: ['Contenido', 'Educación', 'Mentoría']
  },
];

// Estadísticas
const stats = [
  { number: '10K+', label: 'Empresas Conectadas' },
  { number: '50K+', label: 'Horas de Mentoría' },
  { number: '95%', label: 'Tasa de Éxito' },
  { number: '25+', label: 'Países Impactados' },
];

const NosotrosPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar Particles.js
    const loadParticles = () => {
      if (typeof window !== 'undefined' && window.particlesJS && particlesRef.current) {
        window.particlesJS('particles-js', {
          particles: {
            number: {
              value: 120,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
            },
            shape: {
              type: 'circle',
              stroke: {
                width: 0,
                color: '#000000'
              }
            },
            opacity: {
              value: 0.6,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#667eea',
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'grab'
              },
              onclick: {
                enable: true,
                mode: 'push'
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 200,
                line_linked: {
                  opacity: 0.5
                }
              },
              push: {
                particles_nb: 4
              }
            }
          },
          retina_detect: true
        });
      }
    };

    // Cargar Anime.js animations
    const loadAnime = () => {
      if (typeof window !== 'undefined' && window.anime) {
        const anime = window.anime;

        // Hero title animation
        if (titleRef.current) {
          anime({
            targets: titleRef.current,
            translateY: [-100, 0],
            opacity: [0, 1],
            duration: 1500,
            easing: 'easeOutExpo',
            delay: 500
          });
        }

        // Subtitle animation
        if (subtitleRef.current) {
          anime({
            targets: subtitleRef.current,
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1200,
            easing: 'easeOutExpo',
            delay: 800
          });
        }

        // Buttons animation
        if (buttonsRef.current) {
          anime({
            targets: buttonsRef.current.children,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: anime.stagger(200, {start: 1100})
          });
        }

        // Stats counter animation
        const animateStats = () => {
          if (statsRef.current) {
            const statNumbers = statsRef.current.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
              const finalValue = stat.textContent?.replace(/[^0-9]/g, '') || '0';
              anime({
                targets: stat,
                innerHTML: [0, parseInt(finalValue)],
                duration: 2000,
                delay: index * 200,
                round: 1,
                easing: 'easeOutExpo'
              });
            });
          }
        };

        // Team cards animation
        const animateTeam = () => {
          if (teamRef.current) {
            anime({
              targets: teamRef.current.querySelectorAll('.team-card'),
              translateY: [50, 0],
              opacity: [0, 1],
              duration: 800,
              easing: 'easeOutExpo',
              delay: anime.stagger(150)
            });
          }
        };

        // Intersection Observer para trigger de animaciones
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target === statsRef.current) {
                animateStats();
              }
              if (entry.target === teamRef.current) {
                animateTeam();
              }
            }
          });
        }, { threshold: 0.3 });

        if (statsRef.current) observer.observe(statsRef.current);
        if (teamRef.current) observer.observe(teamRef.current);

        // Floating elements animation
        anime({
          targets: '.floating-element',
          translateY: [-20, 20],
          duration: 3000,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutSine',
          delay: anime.stagger(500)
        });

        // Pulse animation for cards
        anime({
          targets: '.pulse-element',
          scale: [1, 1.05, 1],
          duration: 2000,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutSine',
          delay: anime.stagger(300)
        });

        return () => observer.disconnect();
      }
    };

    // Cargar scripts
    const loadScripts = async () => {
      // Cargar Particles.js
      if (!window.particlesJS) {
        const particlesScript = document.createElement('script');
        particlesScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
        particlesScript.onload = loadParticles;
        document.head.appendChild(particlesScript);
      } else {
        loadParticles();
      }

      // Cargar Anime.js
      if (!window.anime) {
        const animeScript = document.createElement('script');
        animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
        animeScript.onload = loadAnime;
        document.head.appendChild(animeScript);
      } else {
        loadAnime();
      }
    };

    loadScripts();

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const updateScrollY = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('scroll', updateScrollY);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('scroll', updateScrollY);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Nosotros - MentorApp</title>
        <meta name="description" content="Conoce más sobre MentorApp: Nuestra historia, misión, visión, valores y equipo." />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          body {
            overflow-x: hidden;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .floating-element {
            animation: float 6s ease-in-out infinite;
          }
          
          .pulse-element {
            animation: pulse 3s ease-in-out infinite;
          }
          
          .cursor-glow {
            position: fixed;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
            transform: translate(-50%, -50%);
            left: ${mousePosition.x}px;
            top: ${mousePosition.y}px;
            transition: all 0.1s ease-out;
          }
          
          #particles-js {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
          }
          
          .hero-content {
            position: relative;
            z-index: 10;
          }
          
          .team-card {
            opacity: 0;
            transform: translateY(50px);
          }
          
          .stat-number {
            font-feature-settings: 'tnum';
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hover-lift:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
          
          .gradient-border {
            position: relative;
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
            padding: 2px;
            border-radius: 20px;
          }
          
          .gradient-border-inner {
            background: white;
            border-radius: 18px;
            height: 100%;
          }
        `}</style>
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 relative overflow-x-hidden">
        {/* Cursor personalizado */}
        <div className="cursor-glow"></div>
        
        <Navbar />

        <main className="flex-grow">
          {/* Hero Section con Particles.js */}
          <section 
            ref={heroRef}
            className="relative h-screen flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
          >
            {/* Particles.js container */}
            <div ref={particlesRef} id="particles-js" className="absolute inset-0"></div>
            
            {/* Floating geometric shapes */}
            <div className="absolute inset-0 z-2">
              <div className="floating-element absolute top-20 left-20 w-32 h-32 border-2 border-blue-400 rounded-full opacity-30"></div>
              <div className="floating-element absolute top-40 right-32 w-24 h-24 border-2 border-purple-400 opacity-40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
              <div className="floating-element absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-30"></div>
              <div className="floating-element absolute bottom-20 right-20 w-28 h-28 border-2 border-cyan-400 opacity-25" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
            </div>
            
            <div className="hero-content text-center px-4 max-w-6xl mx-auto">
              <h1 
                ref={titleRef}
                className="text-6xl md:text-8xl font-black leading-tight mb-8 opacity-0"
                style={{ transform: 'translateY(-100px)' }}
              >
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Impulsando la
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Innovación
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Empresarial
                </span>
              </h1>
              
              <p 
                ref={subtitleRef}
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed opacity-0"
                style={{ transform: 'translateY(50px)' }}
              >
                Conoce el corazón de MentorApp, nuestra historia, valores y el equipo que hace posible tu crecimiento empresarial.
              </p>
              
              <div 
                ref={buttonsRef}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <button 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden opacity-0"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <span className="relative z-10">Conoce Más</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
                
                <button 
                  className="flex items-center space-x-2 px-8 py-4 glass-effect rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 opacity-0"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <span>Ver Equipo</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Estadísticas con Anime.js */}
          <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto">
              <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center group hover-lift p-6 rounded-2xl bg-white/70 backdrop-blur-sm pulse-element"
                  >
                    <div className="stat-number text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About Us Section mejorado */}
          <section className="py-20 px-4 md:px-8 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="md:order-2">
                <div className="relative group">
                  <div className="gradient-border">
                    <div className="gradient-border-inner p-4">
                      <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                        alt="Nuestro equipo colaborando"
                        className="w-full h-96 object-cover rounded-2xl transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="floating-element absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-80"></div>
                  <div className="floating-element absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60"></div>
                </div>
              </div>
              <div className="md:order-1">
                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Nuestra Historia:
                  </span>
                  <br />
                  <span className="text-gray-800">
                    Una Trayectoria de Impacto
                  </span>
                </h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    MentorApp nació de la <strong className="text-blue-600">visión compartida</strong> de un grupo de emprendedores y mentores experimentados que reconocieron una necesidad crítica en el ecosistema empresarial.
                  </p>
                  <p>
                    Desde nuestros inicios en <strong className="text-purple-600">2020</strong>, nos hemos dedicado a crear una plataforma que no solo conecta, sino que realmente <em>impulsa el éxito</em> empresarial.
                  </p>
                  <p>
                    Hemos evolucionado de una pequeña iniciativa a un <strong className="text-indigo-600">hub vibrante</strong>, facilitando miles de horas de mentoría y construyendo una comunidad donde la colaboración es el núcleo del crecimiento.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mission, Vision, Values Section */}
          <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <div className="floating-element absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-10"></div>
            <div className="floating-element absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-10"></div>
            
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Pilares de Nuestro
                  </span>
                  <br />
                  <span className="text-gray-800">Compromiso</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Nuestra filosofía se basa en principios sólidos que guían cada interacción y decisión.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Misión Card */}
                <div className="group hover-lift p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 pulse-element relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-6">🚀</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Empoderar a emprendedores y empresas con las herramientas, conocimientos y conexiones necesarias para innovar, crecer y transformar sus ideas en realidades exitosas.
                    </p>
                  </div>
                </div>
                
                {/* Visión Card */}
                <div className="group hover-lift p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 pulse-element relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-6">🔭</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Ser la plataforma líder global en mentoría y recursos para la innovación empresarial, creando un ecosistema donde el aprendizaje continuo y la colaboración impulsen el desarrollo sostenible.
                    </p>
                  </div>
                </div>
                
                {/* Valores Card */}
                <div className="group hover-lift p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 pulse-element relative overflow-hidden sm:col-span-2 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-6">✨</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestros Valores</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-blue-700">Innovación:</strong> Búsqueda constante de nuevas soluciones.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-purple-700">Excelencia:</strong> Compromiso con la calidad y el impacto.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-indigo-700">Colaboración:</strong> Creemos en el poder del trabajo en equipo.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-cyan-700">Integridad:</strong> Actuar con honestidad y transparencia.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-pink-700">Empoderamiento:</strong> Fomentar el crecimiento personal y profesional.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Team Section con Anime.js */}
          <section className="py-20 px-4 md:px-8 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Conoce a Nuestro
                  </span>
                  <br />
                  <span className="text-gray-800">Equipo</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Profesionales apasionados y dedicados que hacen posible tu éxito empresarial.
                </p>
              </div>
              
              <div ref={teamRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                                      <div
                    key={index}
                    className="team-card group relative"
                  >
                    <div className="gradient-border hover-lift">
                      <div className="gradient-border-inner p-6 relative overflow-hidden">
                        {/* Efecto de brillo en hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <div className="relative z-10">
                          <div className="relative mb-6">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-28 h-28 rounded-2xl object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">{member.name}</h3>
                          <p className="text-blue-600 font-semibold mb-4 text-center text-sm">{member.title}</p>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 text-center">{member.bio}</p>
                          
                          {/* Skills tags */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {member.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200 hover:scale-105 transition-transform duration-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action Section mejorado */}
          <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-center relative overflow-hidden">
            {/* Particles en el CTA */}
            <div className="absolute inset-0">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-60 floating-element"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s`
                  }}
                />
              ))}
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.3 }} />
                  </linearGradient>
                </defs>
                <polygon points="0,20 20,0 40,10 60,0 80,15 100,10 100,100 0,100" fill="url(#grad1)" />
                <polygon points="0,40 25,30 50,35 75,25 100,30 100,100 0,100" fill="url(#grad1)" opacity="0.5" />
              </svg>
            </div>
            
            <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  ¿Listo para Transformar
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  tu Negocio?
                </span>
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed mb-12 opacity-90 max-w-2xl mx-auto">
                Únete a miles de emprendedores que ya están impulsando sus ideas con MentorApp.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-5 sm:space-y-0 sm:space-x-8">
                <Link
                  href="/register"
                  className="group relative px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Empezar Ahora</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </Link>
                
                <Link
                  href="/contact"
                  className="group glass-effect px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-2 border-white/30"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Contáctanos</span>
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Si decides agregar un Footer más tarde, lo agregarías aquí */}
        {/* <Footer /> */}
      </div>
    </>
  );
};



export default NosotrosPage;