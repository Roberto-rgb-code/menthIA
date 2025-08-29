// components/ProfileCarousel.tsx
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Profile {
  name: string;
  role: 'MENTOR' | 'ENTREPRENEUR';
  location: string;
  description: string;
  image: string;
}

const profiles: Profile[] = [
  {
    name: 'Eric',
    role: 'MENTOR',
    location: 'USA',
    description:
      'Eric, un emprendedor con experiencia y súper mentor, valora la preparación. Ha creado y vendido cuatro empresas, por lo que motiva a sus mentees a llegar listos para aprovechar cada sesión.',
    image: '/images/eric.jpg',
  },
  {
    name: 'María',
    role: 'ENTREPRENEUR',
    location: 'MEXICO',
    description:
      'Después de 18 años en la industria de la comida mexicana, María enfrentó retos tras la pandemia. Sus mentores la ayudaron a plantear su estrategia y recuperar confianza en su negocio.',
    image: '/images/maria.jpg',
  },
  {
    name: 'Carrie',
    role: 'ENTREPRENEUR',
    location: 'USA',
    description:
      'Carrie, experta en salud cerebral y coaching, tenía problemas con su marketing. Con la ayuda de mentores en Micrommentor, mejoró su sitio web, fortaleció su marca y ahora se promociona con seguridad.',
    image: '/images/carrie.jpg',
  },
];

const ProfileCarousel: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="my-8 px-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Conoce a Nuestros Mentores y Emprendedores
      </h2>
      <Slider {...settings}>
        {profiles.map((profile, index) => (
          <div key={index} className="px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={profile.image}
                alt={`Foto de ${profile.name}`}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-blue-600 text-sm">{profile.location}</p>
              <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
              <span
                className={`inline-block px-3 py-1 text-white text-sm rounded-full mt-2 ${
                  profile.role === 'MENTOR' ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
              >
                {profile.role}
              </span>
              <p className="text-gray-600 mt-4 text-sm">{profile.description}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProfileCarousel;