import PublicLayout from '../components/layout/PublicLayout';
import Link from 'next/link';

// You might want to define features as an array of objects for easier management
const planFeatures = {
  basic: [
    { text: 'Mentoría grupal', icon: '👥' }, // Example icons, replace with actual SVG/component
    { text: 'Acceso a recursos básicos', icon: '📚' },
    { text: 'Soporte por correo electrónico', icon: '📧' },
  ],
  pro: [
    { text: 'Mentoría 1:1 (2 sesiones/mes)', icon: '🤝' },
    { text: 'Talleres exclusivos', icon: '💡' },
    { text: 'Acceso a recursos avanzados', icon: '🌟' },
    { text: 'Soporte prioritario', icon: '⚡' },
  ],
  empresa: [
    { text: 'Mentoría 1:1 ilimitada', icon: '🚀' },
    { text: 'Acceso completo a todos los recursos', icon: '💎' },
    { text: 'Soporte premium 24/7', icon: '📞' },
    { text: 'Sesiones estratégicas personalizadas', icon: '🎯' },
  ],
};

const Plans = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero mejorada */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          Elige el Plan Perfecto para Tu Éxito
        </h1>
        <p className="mt-6 text-xl max-w-2xl mx-auto opacity-90">
          Ofrecemos planes flexibles diseñados para impulsar tu emprendimiento, sin importar en qué etapa te encuentres.
        </p>
      </section>

      {/* Sección 2: Planes mejorada con énfasis y mejores detalles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Plan Básico */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Básico</h2>
                <p className="text-gray-600 mb-6">Ideal para emprendedores que están dando sus primeros pasos.</p>
                <p className="text-5xl font-extrabold text-blue-700 mb-6">
                  $29<span className="text-xl font-medium text-gray-500">/mes</span>
                </p>
                <ul className="mt-6 space-y-4 text-gray-700">
                  {planFeatures.basic.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <span className="text-blue-500 mr-3 text-2xl">{feature.icon}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-10 block w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center">
                Empezar con Básico
              </Link>
            </div>

            {/* Plan Pro - Destacado como el más popular */}
            <div className="bg-white p-8 rounded-xl shadow-2xl border-4 border-blue-600 relative transform scale-105 z-10 flex flex-col justify-between">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 text-sm font-bold py-1 px-4 rounded-full shadow-md rotate-3">
                ¡Más Popular!
              </div>
              <div>
                <h2 className="text-3xl font-bold text-blue-700 mb-2">Pro</h2>
                <p className="text-gray-600 mb-6">Perfecto para negocios que buscan escalar su crecimiento.</p>
                <p className="text-5xl font-extrabold text-blue-700 mb-6">
                  $59<span className="text-xl font-medium text-gray-500">/mes</span>
                </p>
                <ul className="mt-6 space-y-4 text-gray-700">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <span className="text-blue-500 mr-3 text-2xl">{feature.icon}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-10 block w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center">
                Elegir Plan Pro
              </Link>
            </div>

            {/* Plan Empresa */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Empresa</h2>
                <p className="text-gray-600 mb-6">Para empresas establecidas que exigen soporte y mentoría ilimitada.</p>
                <p className="text-5xl font-extrabold text-blue-700 mb-6">
                  $99<span className="text-xl font-medium text-gray-500">/mes</span>
                </p>
                <ul className="mt-6 space-y-4 text-gray-700">
                  {planFeatures.empresa.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <span className="text-blue-500 mr-3 text-2xl">{feature.icon}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-10 block w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center">
                Solicitar Plan Empresa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Consulta mejorada */}
      <section className="py-16 bg-blue-500 text-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">¿Aún tienes dudas sobre qué plan elegir?</h2>
          <p className="mt-4 text-xl max-w-3xl mx-auto opacity-90">
            Nuestro equipo está listo para ayudarte a encontrar la solución perfecta para tu negocio. Agenda una consulta gratuita y despeja todas tus inquietudes.
          </p>
          <Link href="/contact" className="mt-10 inline-block bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
            Agenda una Consulta Gratuita
          </Link>
        </div>
      </section>

      {/* Sección 4: Preguntas Frecuentes (FAQ) - Nueva sección para mejorar UX */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Preguntas Frecuentes</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">¿Puedo cambiar de plan más adelante?</h3>
              <p className="text-gray-600">Sí, puedes mejorar o bajar de plan en cualquier momento desde tu panel de usuario. Los cambios se aplican de forma prorrateada.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">¿Hay algún compromiso a largo plazo?</h3>
              <p className="text-gray-600">Nuestros planes son mensuales y puedes cancelar en cualquier momento sin penalizaciones.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">¿Qué tipo de soporte recibo?</h3>
              <p className="text-gray-600">Dependiendo de tu plan, recibirás soporte por correo electrónico, soporte prioritario o soporte premium 24/7. Siempre nos aseguramos de responder rápidamente.</p>
            </div>
            {/* Agrega más preguntas frecuentes aquí */}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Plans;