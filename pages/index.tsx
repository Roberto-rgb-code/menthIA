// pages/index.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import PrivateLayout from '@/components/layout/PrivateLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaUsers, FaLightbulb, FaRocket, FaHandshake, FaBullseye, FaEye, FaHeart,
    FaUserPlus, FaArrowRight, FaChartLine, FaGraduationCap, FaStore, FaGem, FaBrain, FaCogs,
    FaBriefcase, FaNetworkWired, FaTools, FaShieldAlt, FaRegLightbulb, FaConnectdevelop, FaChartBar, FaGlobe, FaSearchDollar,
    FaFacebook, FaTwitter, FaLinkedin, FaInstagram
} from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Importaciones para tsparticles
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    const particlesInit = useCallback(async (engine: any) => {
        await loadSlim(engine);
    }, []);

    const heroParticlesOptions = {
        background: {
            color: { value: "#f0f8ff" },
        },
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "bubble" },
                onHover: { enable: true, mode: "bubble" },
                resize: true,
            },
            modes: {
                bubble: { distance: 100, size: 10, duration: 0.4, opacity: 0.8, speed: 3 },
                push: { quantity: 4 },
            },
        },
        particles: {
            color: { value: ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff"] },
            links: { enable: false },
            move: {
                direction: "top",
                enable: true,
                // Cambio clave: `outModes: "bounce"` en lugar de "destroy"
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: { min: 3, max: 6 },
                straight: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            },
            number: { density: { enable: true, area: 800 }, value: 150 },
            opacity: {
                value: { min: 0.3, max: 0.8 },
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            shape: { type: ["circle", "star"] },
            size: {
                value: { min: 1, max: 4 },
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.5, sync: false }
            },
            twinkle: { enable: true, opacity: 0.5, color: "#ffffff" }
        },
        detectRetina: true,
    };

    useEffect(() => {
        gsap.fromTo('.hero-home-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' });
        gsap.fromTo('.hero-home-description', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.4, ease: 'power3.out' });
        gsap.fromTo('.hero-home-cta', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, delay: 0.8, ease: 'elastic.out(1, 0.8)' });

        sectionRefs.current.forEach((el) => {
            if (el) {
                gsap.fromTo(el, { opacity: 0, y: 50 }, {
                    opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: {
                        trigger: el, start: 'top 85%', end: 'bottom 20%', toggleActions: 'play none none reverse',
                    },
                });
            }
        });

        gsap.utils.toArray<HTMLElement>('.value-item').forEach((item, i) => {
            gsap.fromTo(item, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power2.out', scrollTrigger: {
                    trigger: item, start: 'top 90%', toggleActions: 'play none none reverse',
                }
            });
        });

    }, []);

    return (
        <PrivateLayout>
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float { animation: float 2.5s ease-in-out infinite; }
                .card-custom {
                    background-color: #ffffff; padding: 1.5rem; border-radius: 1rem; color: #333333;
                    border: 1px solid rgba(0, 0, 0, 0.1); transition: all 0.3s ease-in-out;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .card-custom:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); }
                .value-item {
                    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                    background-color: #ffffff; border: 1px solid #e0e0e0; color: #333333;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .value-item:hover { background-color: rgba(160, 196, 255, 0.2); transform: translateY(-5px) scale(1.03); box-shadow: 0 10px 20px rgba(160, 196, 255, 0.35); }
            `}</style>

            {/* Contenedor principal con flex para asegurar que el footer esté al final */}
            <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-inter">
                <div className="flex-grow relative z-10">
                    {/* Hero Section */}
                    <section className="min-h-[90vh] flex items-center justify-center text-center overflow-hidden relative p-4 bg-gradient-to-br from-blue-50 to-white">
                        <Particles
                            id="tsparticles-hero"
                            init={particlesInit}
                            options={heroParticlesOptions}
                            className="absolute inset-0 z-0"
                        />
                        <div className="relative z-20 p-4 max-w-6xl mx-auto">
                            <h1 className="hero-home-title text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 drop-shadow-md">
                                Estrategia y Liderazgo para <span className="text-blue-600">Consultores</span> y <span className="text-blue-600">Empresarios</span>
                            </h1>
                            <p className="hero-home-description text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto">
                                Accede a una red exclusiva, herramientas de vanguardia y conocimientos estratégicos para **maximizar tu impacto y la rentabilidad** de tu negocio.
                            </p>
                            <div className="hero-home-cta">
                                <Link href="/register" className="inline-block bg-blue-600 text-white font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out animate-float border-2 border-blue-500">
                                    <FaUserPlus className="inline-block mr-3" /> Potencia Tu Negocio Ahora
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Quiénes somos */}
                    <section ref={el => sectionRefs.current[0] = el} className="py-20 md:py-32 px-4 container mx-auto text-center bg-white rounded-2xl shadow-lg my-16 border border-gray-200">
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-8 flex items-center justify-center">
                            <FaBriefcase className="text-5xl mr-4 text-blue-600" /> Quiénes Somos: Tu Socio Estratégico
                        </h2>
                        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            MentorApp es la plataforma de élite diseñada para **consultores empresariales y empresarios visionarios**. Nos dedicamos a ser tu **socio estratégico** en el camino hacia la excelencia, proporcionando acceso sin precedentes a **conocimiento de alto nivel, una red de contactos influyente y herramientas innovadoras** que impulsarán tu capacidad de generar valor y liderar el mercado.
                        </p>
                    </section>

                    {/* QUE HACEMOS */}
                    <section ref={el => sectionRefs.current[1] = el} className="py-20 md:py-32 px-4 container mx-auto text-center bg-gray-100 rounded-2xl shadow-lg my-16 border border-gray-200">
                        <h2 className="text-4xl md:text-5xl font-bold text-cyan-700 mb-12 flex items-center justify-center">
                            <FaRegLightbulb className="text-5xl mr-4 text-blue-600" /> Soluciones Estratégicas para tu Crecimiento
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaChartBar className="mr-3 text-blue-600" /> **Inteligencia de Mercado y Estrategia**</h3>
                                <p className="text-gray-700 text-sm">Accede a análisis de mercado profundos y metodologías probadas para desarrollar estrategias de negocio escalables y con ventaja competitiva.</p>
                            </motion.div>
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaNetworkWired className="mr-3 text-purple-600" /> **Networking y Alianzas Estratégicas**</h3>
                                <p className="text-gray-700 text-sm">Conéctate con líderes de la industria, inversores y potenciales clientes para forjar alianzas que impulsen tu crecimiento.</p>
                            </motion.div>
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaGraduationCap className="mr-3 text-red-600" /> **Maestría en Consultoría y Liderazgo**</h3>
                                <p className="text-gray-700 text-sm">Programas de formación avanzada y certificaciones en las últimas metodologías de consultoría y liderazgo empresarial.</p>
                            </motion.div>
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaSearchDollar className="mr-3 text-yellow-600" /> **Posicionamiento y Captación de Clientes**</h3>
                                <p className="text-gray-700 text-sm">Estrategias de marca personal y herramientas de marketing digital para atraer y retener a clientes de alto valor.</p>
                            </motion.div>
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaTools className="mr-3 text-pink-600" /> **Herramientas y Recursos Exclusivos**</h3>
                                <p className="text-gray-700 text-sm">Biblioteca de plantillas, frameworks, estudios de caso y software especializado para optimizar tu eficiencia operativa.</p>
                            </motion.div>
                            <motion.div className="card-custom" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center"><FaGlobe className="mr-3 text-orange-600" /> **Análisis de Tendencias y Futuro del Negocio**</h3>
                                <p className="text-gray-700 text-sm">Obtén insights sobre las disrupciones tecnológicas y las tendencias emergentes para mantener tu negocio a la vanguardia.</p>
                            </motion.div>
                        </div>
                    </section>

                    {/* PORQUE SOMOS DIFERENTES */}
                    <section ref={el => sectionRefs.current[2] = el} className="py-20 md:py-32 px-4 container mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-12 flex items-center justify-center">
                            <FaRocket className="text-5xl mr-4 text-cyan-600" /> Tu Ventaja Competitiva con MentorApp
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                            <motion.div className="card-custom flex items-start p-8 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaBullseye className="text-5xl text-yellow-600 mr-6 flex-shrink-0" />
                                <div className="text-left">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">**Enfoque Hiper-Especializado**</h3>
                                    <p className="text-gray-700 text-sm">Diseñado exclusivamente para la élite de consultores y empresarios, abordando sus desafíos y oportunidades únicas.</p>
                                </div>
                            </motion.div>
                            <motion.div className="card-custom flex items-start p-8 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaCogs className="text-5xl text-purple-600 mr-6 flex-shrink-0" />
                                <div className="text-left">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">**Analítica de Rendimiento Avanzada**</h3>
                                    <p className="text-gray-700 text-sm">Dashboards intuitivos y métricas clave para monitorear el crecimiento, la eficiencia y la rentabilidad de tu práctica.</p>
                                </div>
                            </motion.div>
                            <motion.div className="card-custom flex items-start p-8 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaConnectdevelop className="text-5xl text-cyan-600 mr-6 flex-shrink-0" />
                                <div className="text-left">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">**Comunidad de Liderazgo Verificado**</h3>
                                    <p className="text-gray-700 text-sm">Colabora y aprende de un círculo selecto de líderes empresariales y consultores de prestigio.</p>
                                </div>
                            </motion.div>
                            <motion.div className="card-custom flex items-start p-8 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaShieldAlt className="text-5xl text-red-600 mr-6 flex-shrink-0" />
                                <div className="text-left">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">**Soporte Proactivo y Curación de Contenido**</h3>
                                    <p className="text-gray-700 text-sm">Acceso a un equipo de soporte dedicado y una biblioteca de recursos estratégicos constantemente actualizada y curada.</p>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* MISION, VISION, VALORES */}
                    <section ref={el => sectionRefs.current[3] = el} className="py-20 md:py-32 px-4 container mx-auto text-center bg-white rounded-2xl shadow-lg my-16 border border-gray-200">
                        <h2 className="text-4xl md:text-5xl font-bold text-cyan-700 mb-12 flex items-center justify-center">
                            <FaEye className="text-5xl mr-4 text-blue-600" /> Nuestra Esencia: Impulsando el Liderazgo
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div className="value-item p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaBullseye className="text-6xl text-blue-600 mb-4" />
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Misión</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Capacitar a consultores y empresarios para **dominar la estrategia y la ejecución**, maximizando su **impacto en el mercado** y la **rentabilidad sostenida** de sus ventures.
                                </p>
                            </motion.div>
                            <motion.div className="value-item p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaEye className="text-6xl text-purple-600 mb-4" />
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Visión</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Ser el **ecosistema global de referencia** para el crecimiento estratégico de consultores y empresarios, reconocido por **fomentar la innovación disruptiva** y el **liderazgo transformador**.
                                </p>
                            </motion.div>
                            <motion.div className="value-item p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                <FaHeart className="text-6xl text-red-600 mb-4" />
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Valores</h3>
                                <ul className="list-none text-gray-700 text-lg space-y-2 text-left">
                                    <li className="flex items-center"><FaArrowRight className="text-blue-600 mr-2" /> **Excelencia Estratégica**: Búsqueda implacable de resultados superiores.</li>
                                    <li className="flex items-center"><FaArrowRight className="text-blue-600 mr-2" /> **Innovación Constante**: Adaptación y anticipación a las dinámicas del mercado.</li>
                                    <li className="flex items-center"><FaArrowRight className="text-blue-600 mr-2" /> **Colaboración de Alto Impacto**: Sinergias que multiplican el valor.</li>
                                    <li className="flex items-center"><FaArrowRight className="text-blue-600 mr-2" /> **Integridad Inquebrantable**: Confianza como pilar de cada interacción.</li>
                                    <li className="flex items-center"><FaArrowRight className="text-blue-600 mr-2" /> **Liderazgo Visionario**: Inspirar y guiar el futuro del sector.</li>
                                </ul>
                            </motion.div>
                        </div>
                    </section>

                    {/* Sección de Registro - Call to Action Final */}
                    <section ref={el => sectionRefs.current[4] = el} className="py-20 md:py-32 bg-gradient-to-r from-blue-300 to-cyan-400 text-center shadow-inner-2xl rounded-3xl mx-4 md:mx-auto max-w-6xl mb-16 p-8 md:p-12 relative z-10 border border-blue-300">
                        <div className="container mx-auto px-4">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                ¿Listo para Escalar tu Influencia y Rentabilidad?
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto mb-10">
                                Únete a la red de élite de MentorApp y **transforma tu visión en resultados tangibles y duraderos.**
                            </p>
                            <Link href="/register" className="inline-block bg-white text-blue-800 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-white">
                                <FaUserPlus className="inline-block mr-3" /> Inicia Tu Transformación Ahora
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-12">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1">
                            <h3 className="text-xl font-bold text-white mb-4">MentorApp</h3>
                            <p className="text-sm">Plataforma de élite para consultores y empresarios.</p>
                            <div className="flex space-x-4 mt-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><FaFacebook size={24} /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><FaTwitter size={24} /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><FaLinkedin size={24} /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><FaInstagram size={24} /></a>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-lg font-semibold text-white mb-4">Explorar</h3>
                            <ul className="space-y-2">
                                <li><Link href="/features" className="hover:text-white transition-colors duration-300">Características</Link></li>
                                <li><Link href="/about" className="hover:text-white transition-colors duration-300">Sobre Nosotros</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors duration-300">Precios</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition-colors duration-300">Blog</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-lg font-semibold text-white mb-4">Soporte</h3>
                            <ul className="space-y-2">
                                <li><Link href="/faq" className="hover:text-white transition-colors duration-300">Preguntas Frecuentes</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors duration-300">Contacto</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors duration-300">Términos de Servicio</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors duration-300">Política de Privacidad</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
                            <p className="text-sm">123 Calle Innovación, Ciudad Futura</p>
                            <p className="text-sm">info@mentorapp.com</p>
                            <p className="text-sm">+1 234 567 8900</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} MentorApp. Todos los derechos reservados.
                    </div>
                </footer>
            </div>
        </PrivateLayout>
    );
};

export default Home;