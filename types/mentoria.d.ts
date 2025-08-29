export type MentorProfile = {
    userId: string;
    role: "mentor" | "mentee";
    status: "pending" | "approved" | "rejected";
    roleStatus: string;
    fullName: string;
    areasInteres: string[];
    porQueSoyMentor: string;
    comoPuedoAyudar: string;
    acercaDeMi: string;
    idiomas: string[];
    experiencia: string;
    country?: string;
    photoUrl?: string;
    hourlyRate?: number;
    rating?: number;
    sessionsCount?: number;
    createdAt: string;
    updatedAt: string;
  };
  