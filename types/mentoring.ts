// types/mentoring.ts
// Define la estructura de un perfil de mentor
export interface MentorProfile {
  id: string; // El ID del documento, que debe coincidir con el userId
  userId: string;
  userEmail: string;
  name: string;
  experience: number;
  expertise: string;
  bio: string;
}

// Define la estructura para el formulario de postulación
export interface BecomeMentorData {
  name: string;
  experience: number;
  expertise: string;
  bio: string;
}