// pages/services.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import PrivateLayout from '@/components/layout/PrivateLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaChartLine, FaHandshake, FaGraduationCap, FaStore, FaUsers,
  FaUserPlus, FaArrowRight, FaChevronDown, FaChevronUp,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Particles
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

gsap.registerPlugin(ScrollTrigger);

// Datos de los servicios
const servicesData = [
  {
    id: 'diagnostics',
    title: 'Diagnósticos Estratégicos',
    description: 'Identificamos fortalezas y áreas de oportunidad con análisis accionables para trazar el camino al éxito.',
    icon: FaChartLine,
    color: 'from-blue-500 to-blue-700',
    details: [
      'Análisis FODA completo',
      'Evaluación de mercado y competencia',
      'Identificación de cuellos de botella',
      'Reportes ejecutivos detallados',
    ],
    phase: 'PHASE II',
    progress: 65
  },
  {
    id: 'mentoring',
    title: 'Mentoría de Alto Impacto',
    description: 'Acompañamiento 1 a 1 con mentores expertos. Planes de acción prácticos y seguimiento continuo.',
    icon: FaHandshake,
    color: 'from-purple-500 to-purple-700',
    details: [
      'Sesiones 1 a 1 personalizadas',
      'Planes de acción con seguimiento',
      'Acceso a red de contactos del mentor',
      'Desarrollo de liderazgo',
    ],
    phase: 'PHASE I',
    progress: 42
  },
  {
    id: 'courses',
    title: 'Cursos Especializados',
    description: 'Biblioteca de contenidos para potenciar habilidades: finanzas, marketing, operaciones y más.',
    icon: FaGraduationCap,
    color: 'from-green-500 to-green-700',
    details: [
      'Cursos online a tu ritmo',
      'Contenido actualizado por expertos',
      'Certificaciones al finalizar',
      'Materiales y ejercicios',
    ],
    phase: 'PHASE III',
    progress: 89
  },
  {
    id: 'ecosystem',
    title: 'Ecosistema Comercial',
    description: 'Conecta con socios, proveedores y clientes. Multiplica oportunidades dentro de la comunidad.',
    icon: FaStore,
    color: 'from-yellow-500 to-yellow-700',
    details: [
      'Directorio de empresas y emprendedores',
      'Oportunidades de colaboración',
      'Foros y networking',
      'Eventos exclusivos',
    ],
    phase: 'PHASE II',
    progress: 51
  },
  {
    id: 'community',
    title: 'Comunidad Exclusiva',
    description: 'Comparte experiencias, resuelve dudas y crece con otros emprendedores.',
    icon: FaUsers,
    color: 'from-red-500 to-red-700',
    details: [
      'Grupos por sector',
      'Q&A en vivo',
      'Meetups y networking',
      'Feedback constructivo',
    ],
    phase: 'PHASE III',
    progress: 78
  },
];

const Services = () => {
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // tsparticles
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const globalParticlesOptions = {
    background: { color: { value: '#1a202c' } },
    fpsLimit: 120,
    interactivity: {
      events: { onClick: { enable: true, mode: 'push' }, onHover: { enable: true, mode: 'repulse' }, resize: true },
      modes: { push: { quantity: 4 }, repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
      color: { value: '#00bcd4' },
      links: { color: '#4dd0e1', distance: 150, enable: true, opacity: 0.5, width: 1 },
      move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, random: false, speed: 1, straight: false },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.5 },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
  };

  // Animaciones de entrada (hero + CTA)
  useEffect(() => {
    gsap.fromTo('.hero-services-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' });
    gsap.fromTo('.hero-services-description', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo('.hero-services-cta', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, delay: 0.8, ease: 'elastic.out(1, 0.8)' });

    serviceRefs.current.forEach((el) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 100, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 20%', toggleActions: 'play none none reverse' },
          },
        );
      }
    });

    gsap.fromTo(
      '.final-cta-section',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.final-cta-section', start: 'top 85%', toggleActions: 'play none none reverse' } },
    );
  }, []);

  const toggleDetails = (id: string) => setExpandedService(expandedService === id ? null : id);

  // ------------------ CAROUSEL (adaptado a React) ------------------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indicatorsRef = useRef<HTMLDivElement | null>(null);

  const debounce = (fn: (...args: any[]) => void, delay = 250) => {
    let t: any;
    return (...args: any[]) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  const updateClasses = useCallback((idx: number) => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      card.classList.remove('is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next');
      if (i === idx) card.classList.add('is-active');
      else if (i === idx - 1) card.classList.add('is-prev');
      else if (i === idx + 1) card.classList.add('is-next');
      else if (i < idx - 1) card.classList.add('is-far-prev');
      else if (i > idx + 1) card.classList.add('is-far-next');
    });

    if (indicatorsRef.current) {
      const dots = Array.from(indicatorsRef.current.querySelectorAll<HTMLDivElement>('.indicator'));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }
  }, []);

  const computeTranslateX = useCallback((idx: number) => {
    const track = trackRef.current;
    const container = containerRef.current;
    const firstCard = cardRefs.current[0];
    if (!track || !container || !firstCard) return 0;

    const cardWidth = firstCard.offsetWidth;
    const cardMarginX = 25 * 2; // según CSS .carousel-card { margin: 0 25px; }
    const amountToMove = idx * (cardWidth + cardMarginX);
    const containerCenter = container.offsetWidth / 2;
    const cardCenter = cardWidth / 2;
    // -25 para compensar el gap visual del borde
    const targetTranslateX = containerCenter - cardCenter - amountToMove - 25;
    return targetTranslateX;
  }, []);

  const moveToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(idx, servicesData.length - 1));
    const tx = computeTranslateX(clamped);
    track.style.transform = `translateX(${tx}px)`;
    setCurrentIndex(clamped);
    updateClasses(clamped);
    requestAnimationFrame(() => {
      animateActiveCard();
      animateDataCounter();
    });
  }, [computeTranslateX, updateClasses]);

  const initialize = useCallback(() => {
    const start = Math.min(2, servicesData.length - 1);
    moveToIndex(start);
  }, [moveToIndex]);

  useEffect(() => {
    initialize();
    const onResize = debounce(() => {
      moveToIndex(currentIndex);
    }, 250);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (currentIndex < servicesData.length - 1) moveToIndex(currentIndex + 1);
  };
  const prev = () => {
    if (currentIndex > 0) moveToIndex(currentIndex - 1);
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < servicesData.length - 1;

  // ---- Efectos “HUD” de la tarjeta activa (scan line + progress anim) ----
  const animateActiveCard = () => {
    const active = cardRefs.current[currentIndex];
    if (!active) return;
    const header = active.querySelector<HTMLDivElement>('.card-header');
    if (!header) return;

    const scanLine = document.createElement('div');
    scanLine.style.cssText = `
      position: absolute; left: 0; top: 0; height: 2px; width: 100%;
      background: linear-gradient(90deg, transparent, rgba(56,189,248,0.8), rgba(56,189,248,0.8), transparent);
      opacity: 0.7; z-index: 10; pointer-events: none; animation: scanAnimation 2s ease-in-out;
    `;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scanAnimation {
        0% { top: 0; }
        75% { top: calc(100% - 2px); }
        100% { top: calc(100% - 2px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    header.appendChild(scanLine);
    setTimeout(() => {
      if (scanLine.parentElement) header.removeChild(scanLine);
      if (style.parentNode) style.parentNode.removeChild(style);
    }, 2000);
  };

  const animateDataCounter = () => {
    const active = cardRefs.current[currentIndex];
    if (!active) return;
    const stats = active.querySelector<HTMLDivElement>('.card-stats');
    const bar = active.querySelector<HTMLDivElement>('.progress-value');
    if (!stats || !bar) return;

    const right = stats.querySelector('span:last-child');
    if (!right) return;

    const match = right.textContent?.match(/(\d+)%/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    let current = 0;
    right.textContent = '0% COMPLETE';
    bar.style.width = '0%';

    const int = setInterval(() => {
      current += Math.ceil(target / 15);
      if (current >= target) {
        current = target;
        clearInterval(int);
      }
      right.textContent = `${current}% COMPLETE`;
    }, 50);

    setTimeout(() => {
      bar.style.transition = 'width 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
      bar.style.width = `${target}%`;
      setTimeout(() => {
        bar.style.transition = 'none';
      }, 900);
    }, 100);
  };

  return (
    <PrivateLayout>
      {/* Estilos “futuristas” + carrusel */}
      <style jsx global>{`
        :root {
          --glow-primary: rgba(56, 189, 248, 0.7);
          --glow-secondary: rgba(94, 234, 212, 0.6);
          --neon-pink: rgba(236, 72, 153, 0.8);
          --neon-blue: rgba(59, 130, 246, 0.8);
          --neon-green: rgba(16, 185, 129, 0.8);
        }
        .carousel-container {
          width: 90%;
          max-width: 1100px;
          position: relative;
          perspective: 2000px;
          padding: 3rem 0;
          z-index: 10;
          margin: 0 auto;
        }
        .carousel-track {
          display: flex;
          transition: transform 0.75s cubic-bezier(0.21, 0.61, 0.35, 1);
          transform-style: preserve-3d;
          will-change: transform;
        }
        .carousel-card {
          min-width: 320px;
          max-width: 320px;
          margin: 0 25px;
          background: linear-gradient(135deg, rgba(30,41,59,0.85), rgba(15,23,42,0.9));
          border-radius: 1.2rem;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 0 15px 25px rgba(0,0,0,0.5), 0 0 30px rgba(56,189,248,0.2);
          transition: all 0.6s cubic-bezier(0.21, 0.61, 0.35, 1);
          transform-origin: center center;
          position: relative;
          border: 1px solid rgba(94,234,212,0.2);
        }
        .carousel-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, transparent 0%, var(--neon-blue) 25%, var(--neon-green) 50%, var(--neon-pink) 75%, transparent 100%);
          z-index: -1;
          border-radius: 1.3rem;
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.5s ease;
          animation: borderGlow 6s linear infinite;
        }
        @keyframes borderGlow {
          0% { background-position: 0% 50%; opacity: 0.3; }
          50% { background-position: 100% 50%; opacity: 0.5; }
          100% { background-position: 0% 50%; opacity: 0.3; }
        }
        .carousel-card.is-active::before { opacity: 1; background-size: 300% 300%; }
        .carousel-card:not(.is-active) { transform: scale(0.8) rotateY(35deg) translateZ(-100px); opacity: 0.45; filter: saturate(0.6) brightness(0.7); }
        .carousel-card.is-prev { transform-origin: right center; transform: scale(0.75) rotateY(45deg) translateX(-80px) translateZ(-150px); }
        .carousel-card.is-next { transform-origin: left center; transform: scale(0.75) rotateY(-45deg) translateX(80px) translateZ(-150px); }
        .carousel-card.is-active { transform: scale(1) rotateY(0) translateZ(0); opacity: 1; z-index: 20; box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 40px var(--glow-primary), inset 0 0 20px rgba(56,189,248,0.1); filter: saturate(1.2) brightness(1.1); }

        /* Header con icono (sustituye la imagen) */
        .card-header {
          position: relative;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          border-bottom: 1px solid rgba(94,234,212,0.25);
        }
        .card-header .title {
          margin-top: .75rem;
          font-weight: 800;
          letter-spacing: .3px;
        }
        .card-header::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(120deg, rgba(56,189,248,0.1), transparent 70%),
                      radial-gradient(circle at 80% 20%, rgba(94,234,212,0.15), transparent 50%);
          pointer-events:none;
        }

        .card-content { padding: 1.5rem; color: #f1f5f9; }
        .card-title { font-family: "Orbitron", sans-serif; margin-bottom: .5rem; letter-spacing: .6px; position: relative; display: inline-block; }
        .card-title::after { content: attr(data-text); position: absolute; top:0; left:0; color: transparent; -webkit-text-stroke: .5px; filter: blur(3px); opacity:0; transition: opacity .3s ease; }
        .carousel-card.is-active .card-title::after { opacity: .8; }

        .card-description { font-size:.95rem; line-height:1.6; color: rgba(241,245,249,0.85); font-weight:300; }

        .card-progress { height:3px; background: rgba(56,189,248,0.15); margin-top:1rem; position: relative; border-radius:4px; overflow: hidden; }
        .progress-value { position:absolute; height:100%; background: linear-gradient(90deg, var(--neon-blue), var(--neon-green)); border-radius:4px; width: 75%; }

        .card-stats { display:flex; justify-content: space-between; margin-top:.5rem; font-size:.75rem; color: rgba(241,245,249,0.6); }

        .details {
          margin-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 1rem;
        }
        .details ul { margin-top: .5rem; }
        .details .cta {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
        }

        .carousel-button {
          position:absolute; top:50%; transform: translateY(-50%);
          background: rgba(12,74,110,0.3); color:#38bdf8; border:1px solid rgba(14,165,233,0.4);
          border-radius: 9999px; width:48px; height:48px; display:flex; justify-content:center; align-items:center;
          cursor:pointer; z-index:20; transition: all .3s ease; backdrop-filter: blur(5px); box-shadow: 0 0 15px rgba(56,189,248,0.2);
        }
        .carousel-button:hover { background: rgba(14,165,233,0.3); color:#e0f2fe; transform: translateY(-50%) scale(1.1); box-shadow: 0 0 20px rgba(56,189,248,0.4); }
        .carousel-button:active { transform: translateY(-50%) scale(.95); }
        .carousel-button.prev { left: -24px; }
        .carousel-button.next { right: -24px; }

        .carousel-indicators { display:flex; justify-content:center; gap:10px; margin-top:2rem; }
        .indicator { width:24px; height:4px; background: rgba(56,189,248,0.2); border-radius:2px; cursor:pointer; transition: all .3s ease; }
        .indicator.active { background:#38bdf8; box-shadow: 0 0 10px #38bdf8; }

        @media (max-width: 768px) {
          .carousel-button { width:40px; height:40px; }
          .carousel-button.prev { left: 5px; }
          .carousel-button.next { right: 5px; }
          .carousel-card { min-width: 260px; max-width: 260px; margin: 0 15px; }
          .carousel-card:not(.is-active) { transform: scale(0.85) rotateY(25deg); }
          .carousel-card.is-prev { transform: scale(0.8) rotateY(30deg) translateX(-40px); }
          .carousel-card.is-next { transform: scale(0.8) rotateY(-30deg) translateX(40px); }
          .card-header { height: 160px; }
        }
      `}</style>

      <div className="relative min-h-screen bg-gray-900 text-gray-100 font-inter overflow-hidden">
        <Particles id="tsparticles-global" init={particlesInit} options={globalParticlesOptions} className="absolute inset-0 z-0" />
        <div className="relative z-10">
          {/* Hero */}
          <section className="min-h-[80vh] flex items-center justify-center text-center overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-black/60 z-0"></div>
            <div className="relative z-10 p-4 max-w-5xl mx-auto">
              <h1 className="hero-services-title text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                Nuestras <span className="text-blue-400">Soluciones</span> Integrales
              </h1>
              <p className="hero-services-description text-xl md:text-2xl text-indigo-200 mb-10 max-w-3xl mx-auto">
                Descubre cómo MentorApp impulsa tu negocio con estrategias personalizadas y el apoyo de una comunidad experta.
              </p>
              <div className="hero-services-cta">
                <Link
                  href="#services-grid"
                  className="inline-block bg-yellow-400 text-blue-900 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  Explorar Servicios
                </Link>
              </div>
            </div>
          </section>

          {/* Carrusel Servicios */}
          <section id="services-grid" className="py-16 md:py-24 container mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-300 mb-10">
              Servicios a tu Medida
            </h2>

            <div className="carousel-container" ref={containerRef}>
              <div className="carousel-track" ref={trackRef}>
                {servicesData.map((s, i) => {
                  const Icon = s.icon;
                  const titleColor =
                    s.color.includes('blue') ? 'text-cyan-200' :
                    s.color.includes('purple') ? 'text-indigo-200' :
                    s.color.includes('green') ? 'text-emerald-200' :
                    s.color.includes('yellow') ? 'text-amber-200' : 'text-rose-200';

                  const buttonBg =
                    s.color.includes('blue') ? 'bg-blue-600 hover:bg-blue-700' :
                    s.color.includes('purple') ? 'bg-purple-600 hover:bg-purple-700' :
                    s.color.includes('green') ? 'bg-green-600 hover:bg-green-700' :
                    s.color.includes('yellow') ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-rose-600 hover:bg-rose-700';

                  return (
                    <div
                      key={s.id}
                      className={`carousel-card ${i === 0 ? 'is-active' : ''}`}
                      ref={(el) => { if (el) cardRefs.current[i] = el; }}
                    >
                      {/* HEADER con icono y gradiente */}
                      <div className={`card-header bg-gradient-to-br ${s.color}`}>
                        <div className="flex flex-col items-center justify-center">
                          <Icon className="text-white drop-shadow-lg" size={64} />
                          <div className={`title ${titleColor} text-xl`}>{s.title}</div>
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="card-content">
                        <h3
                          className="card-title text-lg font-bold text-cyan-400"
                          data-text={s.title}
                        >
                          {s.title}
                        </h3>
                        <p className="card-description">{s.description}</p>

                        {/* Progreso + stats */}
                        <div className="card-progress">
                          <div className="progress-value" style={{ width: `${s.progress}%` }} />
                        </div>
                        <div className="card-stats">
                          <span>{s.phase}</span>
                          <span>{s.progress}% COMPLETE</span>
                        </div>

                        {/* Botón Más detalles */}
                        <button
                          onClick={() => toggleDetails(s.id)}
                          className={`neo-btn mt-4 w-full ${buttonBg} text-white py-2.5 px-4 rounded-full font-semibold transition-colors duration-200 shadow-md flex items-center justify-center`}
                          type="button"
                        >
                          {expandedService === s.id ? (
                            <>Ver menos <FaChevronUp className="ml-2" /></>
                          ) : (
                            <>Más detalles <FaChevronDown className="ml-2" /></>
                          )}
                        </button>

                        {/* Detalles desplegables + CTA a Registro */}
                        {expandedService === s.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="details"
                          >
                            <h4 className="text-base font-semibold text-blue-300 mb-2">¿Qué incluye?</h4>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {s.details.map((d, k) => (
                                <li key={k} className="flex items-start">
                                  <FaArrowRight className="text-blue-400 text-sm mr-2 mt-1 flex-shrink-0" /> {d}
                                </li>
                              ))}
                            </ul>

                            <div className="cta">
                              <Link
                                href="/register"
                                className="inline-flex items-center justify-center bg-white text-blue-900 font-bold py-2.5 px-6 rounded-full text-sm shadow-lg hover:bg-gray-100 transition-all"
                              >
                                <FaUserPlus className="mr-2" /> Regístrate y empieza ahora
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones */}
              <button
                className="carousel-button prev"
                onClick={prev}
                disabled={!canPrev}
                aria-label="Anterior"
                style={{ opacity: canPrev ? 1 : .4, cursor: canPrev ? 'pointer' : 'not-allowed' }}
              >
                <FaChevronLeft />
              </button>
              <button
                className="carousel-button next"
                onClick={next}
                disabled={!canNext}
                aria-label="Siguiente"
                style={{ opacity: canNext ? 1 : .4, cursor: canNext ? 'pointer' : 'not-allowed' }}
              >
                <FaChevronRight />
              </button>

              {/* Indicadores */}
              <div className="carousel-indicators" ref={indicatorsRef}>
                {servicesData.map((_, idx) => (
                  <div
                    key={idx}
                    className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => moveToIndex(idx)}
                    aria-label={`Ir al slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="final-cta-section py-16 md:py-24 bg-gradient-to-r from-fuchsia-700 to-purple-800 text-center shadow-inner-2xl rounded-3xl mx-4 md:mx-auto max-w-6xl mb-16 p-8 md:p-12 relative z-10">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                ¡Impulsa tu Negocio Hoy Mismo!
              </h2>
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-10">
                Regístrate en MentorApp y comienza a transformar tus ideas en éxito con el apoyo de nuestra comunidad y expertos.
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-purple-800 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <FaUserPlus className="inline-block mr-3" /> Regístrate Ahora
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Services;
