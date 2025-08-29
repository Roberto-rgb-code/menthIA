// utils/roles.ts

export const ROLES = {
    EMPRENDEDOR: "emprendedor",          // PyME/Emprendedor
    CONSULTOR: "consultor",              // Consultor Independiente
    ADMIN: "admin",                      // Administrador
    EMPRESA: "empresa",                  // Empresa (Licenciataria)
    UNIVERSIDAD: "universidad",          // Universidad
    GOBIERNO: "gobierno",                // Gobierno
  };
  
  export const ROLES_UI = [
    {
      value: ROLES.EMPRENDEDOR,
      label: "PyME / Emprendedor",
      description: "Acceso freemium/premium, diagnóstico, cursos y comunidad.",
      comingSoon: false,
    },
    {
      value: ROLES.CONSULTOR,
      label: "Consultor Independiente",
      description: "Carga perfil experto, gestión de agenda, consultoría 1:1.",
      comingSoon: false,
    },
    {
      value: ROLES.EMPRESA,
      label: "Empresa (Licenciataria)",
      description: "Acceso corporativo, métricas de empleados, equipos.",
      comingSoon: true,  // Cambia a false cuando esté listo
    },
    {
      value: ROLES.UNIVERSIDAD,
      label: "Universidad",
      description: "Gestión de usuarios institucional, seguimiento académico.",
      comingSoon: true,
    },
    {
      value: ROLES.GOBIERNO,
      label: "Gobierno",
      description: "Reportes de impacto, acceso institucional, licenciamiento.",
      comingSoon: true,
    },
    {
      value: ROLES.ADMIN,
      label: "Administrador",
      description: "Control total de plataforma, métricas y usuarios.",
      comingSoon: true, // Generalmente solo creado por backoffice
    },
  ];
  