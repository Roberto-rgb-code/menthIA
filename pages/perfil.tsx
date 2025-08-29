// pages/perfil.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Asume que useAuth está en ../hooks/useAuth
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Asume que db está inicializado en ../lib/firebase
import PrivateLayout from "../components/layout/PrivateLayout"; // Asume que PrivateLayout está en ../components/layout/PrivateLayout
import {
  FaUserCircle,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaHourglassHalf,
  FaIndustry,
  FaHandshake,
  FaTools,
  FaFolderOpen,
  FaFileAlt,
  FaDollarSign,
  FaLightbulb,
  FaFilePdf,
  FaLinkedin,
  FaUsers,
  FaBuilding,
  FaUniversity,
  FaLandmark,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner, // Añadir FaSpinner para el estado de carga
} from 'react-icons/fa';
import { motion } from "framer-motion";
import { toast } from 'react-toastify'; // Importa toast para notificaciones

const Perfil = () => {
  const { user, loading: authLoading } = useAuth(); // Obtén el estado de carga de autenticación
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true); // Estado de carga del perfil desde Firestore
  const [isSaving, setIsSaving] = useState(false); // Estado para guardar los cambios
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("Perfil useEffect: authLoading =", authLoading, "user =", user);

      // Si la autenticación aún está cargando o si user es null/undefined, espera.
      // Esto previene la llamada a Firestore con un user.uid indefinido.
      if (authLoading || !user?.uid) {
        // Si authLoading es false y user es null/undefined, significa que no hay usuario logueado.
        if (!authLoading && !user?.uid) {
          setLoadingProfile(false);
          setProfile(null);
          setError("Debes iniciar sesión para ver tu perfil.");
        }
        return;
      }

      // Si hay un usuario (y authLoading es false), intenta cargar su perfil de Firestore
      try {
        setLoadingProfile(true); // Asegura que el spinner de carga esté activo mientras se carga el perfil
        const ref = doc(db, "users", user.uid); // user.uid ahora está garantizado que existe
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setFormData(data); // Inicializa formData con los datos del perfil actual
          console.log("Perfil: Datos del perfil cargados:", data);
        } else {
          setError("No se encontraron datos de perfil adicionales. Creando perfil básico...");
          // Si no hay perfil extendido, crea uno básico con los datos del usuario de autenticación
          const initialProfile = {
            fullName: user.displayName || "No especificado",
            email: user.email,
            role: "N/A", // O un rol por defecto si lo tienes
            // Añade otros campos básicos que quieras inicializar
          };
          await updateDoc(doc(db, "users", user.uid), initialProfile); // Crea el documento
          setProfile(initialProfile);
          setFormData(initialProfile);
          toast.info('Perfil básico creado. Por favor, completa tu información.');
          console.log("Perfil: Documento de perfil no encontrado, creando uno nuevo.");
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("Error al cargar tu perfil. Intenta de nuevo más tarde.");
        toast.error('Error al cargar tu perfil.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, [user, authLoading]); // Dependencias: user y authLoading para re-ejecutar cuando cambien

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev: any) => {
      const currentArray = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter((item: string) => item !== value) };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true); // Activa el estado de guardado
    setError("");
    try {
      if (!user || !user.uid) {
        setError("Usuario no autenticado o ID de usuario no disponible.");
        toast.error("Usuario no autenticado. Por favor, inicia sesión de nuevo.");
        return;
      }

      const dataToSave: { [key: string]: any } = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined && value !== null)
      );

      // Manejo específico para campos "Otro" si se usan en el formulario de registro
      // Para campos de selección (select)
      if (dataToSave.hasOwnProperty("ultimoGrado") && dataToSave.ultimoGrado === "Otro") {
          dataToSave.ultimoGrado = formData.otroGrado;
      }
      if (dataToSave.hasOwnProperty("intervencionPreferida") && dataToSave.intervencionPreferida === "Otro") {
          dataToSave.intervencionPreferida = formData.otraIntervencion;
      }
      if (dataToSave.hasOwnProperty("motivacionConsultor") && dataToSave.motivacionConsultor === "Otro") {
          dataToSave.motivacionConsultor = formData.otraMotivacion;
      }
      // Para campos de checkbox que incluyen "Otro"
      if (dataToSave.hasOwnProperty("goals") && Array.isArray(dataToSave.goals) && dataToSave.goals.includes("Otro")) {
          dataToSave.goals = [...dataToSave.goals.filter((g: string) => g !== "Otro"), formData.otherGoal].filter(Boolean);
      }
      if (dataToSave.hasOwnProperty("areasExperiencia") && Array.isArray(dataToSave.areasExperiencia) && dataToSave.areasExperiencia.includes("Otro")) {
          dataToSave.areasExperiencia = [...dataToSave.areasExperiencia.filter((g: string) => g !== "Otro"), formData.otherAreaExperiencia].filter(Boolean);
      }
      if (dataToSave.hasOwnProperty("industrias") && Array.isArray(dataToSave.industrias) && dataToSave.industrias.includes("Otro")) {
          dataToSave.industrias = [...dataToSave.industrias.filter((g: string) => g !== "Otro"), formData.otherIndustry].filter(Boolean);
      }
      if (dataToSave.hasOwnProperty("supportAreas") && Array.isArray(dataToSave.supportAreas) && dataToSave.supportAreas.includes("Otro")) {
          dataToSave.supportAreas = [...dataToSave.supportAreas.filter((g: string) => g !== "Otro"), formData.otherSupportArea].filter(Boolean);
      }
      if (dataToSave.hasOwnProperty("herramientasDigitales") && Array.isArray(dataToSave.herramientasDigitales) && dataToSave.herramientasDigitales.includes("Otra")) {
          dataToSave.herramientasDigitales = [...dataToSave.herramientasDigitales.filter((g: string) => g !== "Otra"), formData.otherDigitalTool].filter(Boolean);
      }


      await updateDoc(doc(db, "users", user.uid), dataToSave);
      setProfile(formData); // Actualiza el estado local del perfil con los datos guardados
      setIsEditing(false); // Sale del modo de edición
      toast.success('Perfil actualizado exitosamente.');
      console.log("Perfil: Perfil guardado:", dataToSave);
    } catch (err) {
      console.error("Error al guardar el perfil:", err);
      setError("Error al guardar los cambios. Intenta de nuevo.");
      toast.error('Error al guardar el perfil.');
    } finally {
      setIsSaving(false); // Desactiva el estado de guardado
    }
  };

  const handleCancel = () => {
    setFormData(profile); // Revierte los datos del formulario a los originales del perfil
    setIsEditing(false); // Sale del modo de edición
    setError(""); // Limpia cualquier error previo
    toast.info('Edición cancelada. Los cambios no se guardaron.');
  };

  // Helper para renderizar un campo de input/select/textarea o un párrafo
  const renderField = (
    icon: React.ReactNode,
    label: string,
    name: string,
    type: string = "text",
    options?: { value: string; label: string }[],
    isTextArea: boolean = false,
    isCheckboxGroup: boolean = false,
    checkboxOptions?: string[]
  ) => {
    const value = formData[name];
    const displayValue = Array.isArray(value) ? value.join(", ") : value;

    if (!isEditing) {
      return renderProfileDetail(icon, label, displayValue);
    }

    if (isCheckboxGroup && checkboxOptions) {
      return (
        <motion.div
          className="p-3 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-gray-700 font-medium mb-2 flex items-center">
            <div className="text-blue-500 mr-3 text-xl">{icon}</div>
            {label}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checkboxOptions.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  value={option}
                  checked={Array.isArray(formData[name]) && formData[name].includes(option)}
                  onChange={handleArrayChange}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-800">{option}</span>
              </label>
            ))}
            {/* Campos 'Otro' condicionales para checkboxes */}
            {name === "goals" && formData.goals?.includes("Otro") && (
                <input
                  type="text"
                  name="otherGoal"
                  value={formData.otherGoal || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                  placeholder="Especifica otra meta"
                />
            )}
            {name === "areasExperiencia" && formData.areasExperiencia?.includes("Otro") && (
                <input
                  type="text"
                  name="otherAreaExperiencia"
                  value={formData.otherAreaExperiencia || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                  placeholder="Especifica otra área de experiencia"
                />
            )}
            {name === "industrias" && formData.industrias?.includes("Otro") && (
                <input
                  type="text"
                  name="otherIndustry"
                  value={formData.otherIndustry || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                  placeholder="Especifica otra industria"
                />
            )}
            {name === "supportAreas" && formData.supportAreas?.includes("Otro") && (
                <input
                  type="text"
                  name="otherSupportArea"
                  value={formData.otherSupportArea || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                  placeholder="Especifica otra área de apoyo"
                />
            )}
            {name === "herramientasDigitales" && formData.herramientasDigitales?.includes("Otra") && (
                <input
                  type="text"
                  name="otherDigitalTool"
                  value={formData.otherDigitalTool || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                  placeholder="Especifica otra herramienta digital"
                />
            )}
          </div>
        </motion.div>
      );
    }

    // Campos 'Otro' condicionales para select/text fields (no checkboxes)
    return (
      <motion.div
        className="p-3 bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-gray-700 font-medium mb-2 flex items-center">
          <div className="text-blue-500 mr-3 text-xl">{icon}</div>
          {label}
        </label>
        {isTextArea ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            rows={3}
          />
        ) : options ? (
          <>
            <select
              name={name}
              value={value || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
            >
              <option value="">Selecciona</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Campos 'Otro' condicionales para selects */}
            {name === "ultimoGrado" && formData.ultimoGrado === "Otro" && (
                <input
                  type="text"
                  name="otroGrado"
                  value={formData.otroGrado || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                  placeholder="Especifica otro grado académico"
                />
            )}
            {name === "intervencionPreferida" && formData.intervencionPreferida === "Otro" && (
                <input
                  type="text"
                  name="otraIntervencion"
                  value={formData.otraIntervencion || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                  placeholder="Especifica otra intervención"
                />
            )}
            {name === "motivacionConsultor" && formData.motivacionConsultor === "Otro" && (
                <input
                  type="text"
                  name="otraMotivacion"
                  value={formData.otraMotivacion || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                  placeholder="Especifica otra motivación"
                />
            )}
          </>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        )}
      </motion.div>
    );
  };

  // Helper para renderizar detalles del perfil en modo de visualización
  const renderProfileDetail = (icon: React.ReactNode, label: string, value: string | number | string[] | React.ReactNode | undefined) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;

    let displayValue: React.ReactNode = value;
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }

    return (
      <motion.div
        className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.01]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-blue-500 mr-3 text-xl">{icon}</div>
        <div>
          <strong className="text-gray-700 text-sm md:text-base">{label}:</strong>{" "}
          <span className="text-gray-900 text-base md:text-lg font-medium">{displayValue}</span>
        </div>
      </motion.div>
    );
  };

  // Opciones para campos de selección y checkboxes
  const languageOptions = [
    { value: "Español", label: "Español" },
    { value: "Inglés", label: "Inglés" },
    { value: "Francés", label: "Francés" },
    { value: "Alemán", label: "Alemán" },
  ];

  const genderOptions = [
    { value: "Mujer", label: "Mujer" },
    { value: "Hombre", label: "Hombre" },
    { value: "Prefiero no decirlo", label: "Prefiero no decirlo" },
    { value: "Otro", label: "Otro" },
  ];

  const businessRelationshipOptions = [
    { value: "Propietario", label: "Propietario" },
    { value: "Gerente", label: "Gerente" },
    { value: "Empleado", label: "Empleado" },
    { value: "Fundador", label: "Fundador" },
    { value: "Director", label: "Director" },
    { value: "Otro", label: "Otro" },
  ];

  const businessStageOptions = [
    { value: "Idea", label: "Idea" },
    { value: "Pre-lanzamiento", label: "Pre-lanzamiento" },
    { value: "Lanzamiento", label: "Lanzamiento" },
    { value: "Crecimiento temprano", label: "Crecimiento temprano" },
    { value: "Crecimiento establecido", label: "Crecimiento establecido" },
    { value: "Madurez", label: "Madurez" },
  ];

  const previousAdvisoryOptions = [
    { value: "Sí, formal", label: "Sí, formal (programas estructurados)" },
    { value: "Sí, informal", label: "Sí, informal (contactos personales)" },
    { value: "No", label: "No" },
  ];

  const ultimoGradoOptions = [
    { value: "Licenciatura", label: "Licenciatura" },
    { value: "Maestría", label: "Maestría" },
    { value: "Doctorado", label: "Doctorado" },
    { value: "Diplomado", label: "Diplomado" },
    { value: "Carrera Técnica", label: "Carrera Técnica" },
    { value: "Otro", label: "Otro" },
  ];

  const experienciaMipymesOptions = [
    { value: "Sí, extensiva", label: "Sí, extensiva (más de 5 años)" },
    { value: "Sí, moderada", label: "Sí, moderada (2-5 años)" },
    { value: "Sí, limitada", label: "Sí, limitada (menos de 2 años)" },
    { value: "No", label: "No" },
  ];

  const colaboracionInstitucionalOptions = [
    { value: "Sí, frecuentemente", label: "Sí, frecuentemente" },
    { value: "Sí, ocasionalmente", label: "Sí, ocasionalmente" },
    { value: "No", label: "No" },
  ];

  const intervencionPreferidaOptions = [
    { value: "Mentoría 1:1", label: "Mentoría 1:1" },
    { value: "Asesoría puntual", label: "Asesoría puntual" },
    { value: "Talleres/Capacitación", label: "Talleres/Capacitación" },
    { value: "Proyectos a largo plazo", label: "Proyectos a largo plazo" },
    { value: "Otro", label: "Otro" },
  ];

  const acompanamientoOptions = [
    { value: "Directivo (guía paso a paso)", label: "Directivo (guía paso a paso)" },
    { value: "Facilitador (exploración y descubrimiento)", label: "Facilitador (exploración y descubrimiento)" },
    { value: "Híbrido", label: "Híbrido" },
  ];

  const modalityOptions = [
    { value: "Online", label: "Online" },
    { value: "Presencial", label: "Presencial" },
    { value: "Híbrido", label: "Híbrido" },
  ];

  const recursosPropiosOptions = [
    { value: "Sí, extensivo", label: "Sí, extensivo" },
    { value: "Sí, limitado", label: "Sí, limitado" },
    { value: "No", label: "No" },
  ];

  const reportesEstructuradosOptions = [
    { value: "Sí", label: "Sí" },
    { value: "No", label: "No" },
  ];

  const trabajoProyectoOptions = [
    { value: "Sí", label: "Sí" },
    { value: "No", label: "No" },
    { value: "Depende del proyecto", label: "Depende del proyecto" },
  ];

  const tarifaTipoOptions = [
    { value: "Por hora", label: "Por hora" },
    { value: "Por paquete", label: "Por paquete" },
    { value: "Ajustable", label: "Ajustable según proyecto" },
  ];

  const motivacionConsultorOptions = [
    { value: "Generar ingresos adicionales", label: "Generar ingresos adicionales" },
    { value: "Compartir conocimiento", label: "Compartir conocimiento" },
    { value: "Expandir mi red de contactos", label: "Expandir mi red de contactos" },
    { value: "Acceder a nuevos proyectos", label: "Acceder a nuevos proyectos" },
    { value: "Otro", label: "Otro" },
  ];

  // Opciones para checkboxes
  const goalsOptions = [
    "Crecimiento de ventas", "Optimización de procesos", "Acceso a financiamiento",
    "Desarrollo de nuevos productos/servicios", "Expansión a nuevos mercados",
    "Mejora de la estrategia de marketing", "Digitalización",
    "Desarrollo de liderazgo", "Gestión de equipos", "Innovación", "Otro"
  ];

  const supportAreasOptions = [
    "Estrategia de Negocio", "Finanzas y Contabilidad", "Marketing Digital",
    "Ventas y Comercialización", "Operaciones y Logística",
    "Recursos Humanos y Talento", "Tecnología e Innovación",
    "Desarrollo de Producto/Servicio", "Internacionalización",
    "Aspectos Legales y Fiscales", "Sustentabilidad", "Otro"
  ];

  const areasExperienciaOptions = [
    "Estrategia y Planificación", "Finanzas y Contabilidad", "Marketing y Ventas",
    "Operaciones y Logística", "Recursos Humanos", "Tecnología y Digitalización",
    "Innovación y Desarrollo de Producto", "Legal y Regulatorio",
    "Comercio Exterior", "Sustentabilidad y Responsabilidad Social", "Otro"
  ];

  const industriasOptions = [
    "Tecnología", "Servicios", "Manufactura", "Comercio minorista",
    "Alimentos y Bebidas", "Educación", "Salud", "Financiera",
    "Turismo", "Agroindustria", "Consultoría", "Energía", "Otro"
  ];

  const herramientasDigitalesOptions = [
    "Google Workspace", "Microsoft Office 365", "Zoom/Google Meet",
    "Trello/Asana", "Miro/FigJam", "CRM (Salesforce, HubSpot)",
    "ERP (SAP, Oracle)", "Software de contabilidad (QuickBooks)",
    "Herramientas de marketing (Mailchimp)", "Ninguna en particular", "Otra"
  ];

  return (
    <PrivateLayout>
      {/* Siempre renderiza PrivateLayout como el contenedor raíz */}
      {(authLoading || loadingProfile) ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <FaSpinner className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
          <p className="mt-4 text-gray-700 text-lg">Cargando tu información...</p>
        </div>
      ) : error && !user ? ( // Si hay un error y no hay usuario (después de la carga)
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-500 to-purple-700 text-white p-4 rounded-lg shadow-xl">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <p className="text-lg mb-6 text-center">Por favor, inicia sesión para acceder a tu perfil.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-white text-blue-700 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      ) : ( // Contenido principal del perfil
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 rounded-xl shadow-lg animate-fade-in-up">
          <header className="flex items-center justify-between border-b pb-4 mb-6 md:mb-8">
            <motion.h1
              className="text-4xl font-extrabold text-gray-900 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaUserCircle className="mr-3 text-blue-600 text-4xl" /> Tu Perfil
            </motion.h1>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center"
                >
                  <FaEdit className="mr-2" /> Editar Perfil
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center"
                    disabled={isSaving} // Deshabilita durante el guardado
                  >
                    {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 flex items-center"
                  >
                    <FaTimes className="mr-2" /> Cancelar
                  </button>
                </div>
              )}
            </div>
          </header>

          {error && <p className="text-red-500 text-center mb-4 animate-shake">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información General */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                <FaUserCircle className="mr-2 text-blue-500" /> Información General
              </h2>
              <div className="space-y-4">
                {renderField(<FaUserCircle />, "Nombre Completo", "fullName")}
                {renderProfileDetail(<FaEnvelope />, "Correo Electrónico", user?.email)} {/* Email no editable aquí */}
                {renderField(<FaPhone />, "Teléfono", "phone")}
                {renderField(<FaCalendarAlt />, "Año de Nacimiento", "birthYear", "number")}
                {renderField(<FaGlobe />, "Idioma Preferido", "language", "select", languageOptions)}
                {renderField(<FaVenusMars />, "Género", "gender", "select", genderOptions)}
                {/* El rol se asigna durante el registro y rara vez se edita directamente desde aquí */}
                {renderProfileDetail(<FaBriefcase />, "Rol en MentorApp", profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "No especificado")}
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" /> Ubicación
              </h2>
              <div className="space-y-4">
                {renderField(<FaGlobe />, "País", "country")}
                {renderField(<FaMapMarkerAlt />, "Ciudad", "city")}
              </div>
            </div>

            {/* Información Específica por Rol */}
            {profile?.role === "emprendedor" && (
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                  <FaBriefcase className="mr-2 text-green-500" /> Detalles de PyME / Emprendedor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(<FaHandshake />, "Nombre del Negocio", "businessName")}
                  {renderField(<FaUserCircle />, "Relación con el Negocio", "businessRelationship", "select", businessRelationshipOptions)}
                  {renderField(<FaHourglassHalf />, "Etapa del Negocio", "businessStage", "select", businessStageOptions)}
                  {renderField(<FaBriefcase />, "Motivación Principal", "motivation", "text", undefined, true)}
                  {renderField(<FaBriefcase />, "Reto Principal", "mainChallenge", "text", undefined, true)}
                  {renderField(<FaCalendarAlt />, "Metas", "goals", "checkbox", undefined, false, true, goalsOptions)}
                  {renderField(<FaHandshake />, "Asesoría Previa", "previousAdvisory", "select", previousAdvisoryOptions)}
                  {renderField(<FaBriefcase />, "Áreas de Apoyo", "supportAreas", "checkbox", undefined, false, true, supportAreasOptions)}
                </div>
              </div>
            )}

            {profile?.role === "consultor" && (
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  <FaGraduationCap className="mr-2 text-purple-500" /> Detalles de Consultor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(<FaGraduationCap />, "Último Grado Académico", "ultimoGrado", "select", ultimoGradoOptions)}
                  {/* El campo "Otro Grado" se renderiza condicionalmente dentro de renderField */}
                  {renderField(<FaGraduationCap />, "Área de Estudios", "areaEstudios")}
                  {renderField(<FaHourglassHalf />, "Años de Experiencia", "anosExperiencia", "number")}
                  {renderField(<FaBriefcase />, "Exp. con MiPymes", "experienciaMipymes", "select", experienciaMipymesOptions)}
                  {renderField(<FaHandshake />, "Colaboración Institucional", "colaboracionInstitucional", "select", colaboracionInstitucionalOptions)}
                  {renderField(<FaBriefcase />, "Áreas de Experiencia", "areasExperiencia", "checkbox", undefined, false, true, areasExperienciaOptions)}
                  {renderField(<FaIndustry />, "Industrias", "industrias", "checkbox", undefined, false, true, industriasOptions)}
                  {renderField(<FaBriefcase />, "Caso de Éxito Relevante", "casoExito", "text", undefined, true)}
                  {renderField(<FaHandshake />, "Intervención Preferida", "intervencionPreferida", "select", intervencionPreferidaOptions)}
                  {/* El campo "Otra Intervención" se renderiza condicionalmente dentro de renderField */}
                  {renderField(<FaHandshake />, "Enfoque de Acompañamiento", "acompanamiento", "select", acompanamientoOptions)}
                  {renderField(<FaMapMarkerAlt />, "Modalidad de Consultoría", "modalidad", "select", modalityOptions)} {/* Usar modalityOptions */}
                  {renderField(<FaTools />, "Herramientas Digitales", "herramientasDigitales", "checkbox", undefined, false, true, herramientasDigitalesOptions)}
                  {renderField(<FaFolderOpen />, "Recursos Propios", "recursosPropios", "select", recursosPropiosOptions)}
                  {renderField(<FaFileAlt />, "Reportes Estructurados", "reportesEstructurados", "select", reportesEstructuradosOptions)}
                  {renderField(<FaHourglassHalf />, "Horas Semanales Disp.", "horasSemanales", "number")}
                  {renderField(<FaBriefcase />, "Proyectos Largo Plazo", "trabajoProyecto", "select", trabajoProyectoOptions)}
                  {renderField(<FaDollarSign />, "Tipo de Tarifa", "tarifaTipo", "select", tarifaTipoOptions)}
                  {formData.tarifaTipo === "Por hora" && renderField(<FaDollarSign />, "Tarifa por Hora", "tarifaHora", "number")}
                  {formData.tarifaTipo === "Por paquete" && renderField(<FaDollarSign />, "Tarifa por Paquete", "tarifaPaquete", "number")}
                  {renderField(<FaLightbulb />, "Motivación para Unirse", "motivacionConsultor", "select", motivacionConsultorOptions)}
                  {/* El campo "Otra Motivación" se renderiza condicionalmente dentro de renderField */}
                  {renderField(<FaFilePdf />, "URL CV", "curriculum")}
                  {renderField(<FaBriefcase />, "URL Portafolio", "portafolio")}
                  {renderField(<FaLinkedin />, "URL LinkedIn", "linkedin")}
                  {renderField(<FaUsers />, "Referencias Profesionales", "referencias", "text", undefined, true)}
                </div>
              </div>
            )}

            {profile?.role === "empresa" && (
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center">
                  <FaBuilding className="mr-2 text-orange-500" /> Detalles de Empresa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(<FaHandshake />, "Nombre de la Empresa", "businessName")}
                  {renderField(<FaUserCircle />, "Tu Rol", "businessRelationship", "select", businessRelationshipOptions)}
                  {renderField(<FaHourglassHalf />, "Etapa de la Empresa", "businessStage", "select", businessStageOptions)}
                  {renderField(<FaBriefcase />, "Motivación Principal", "motivation", "text", undefined, true)}
                  {renderField(<FaBriefcase />, "Reto Principal", "mainChallenge", "text", undefined, true)}
                  {renderField(<FaCalendarAlt />, "Metas", "goals", "checkbox", undefined, false, true, goalsOptions)}
                  {renderField(<FaHandshake />, "Asesoría Previa", "previousAdvisory", "select", previousAdvisoryOptions)}
                  {renderField(<FaBriefcase />, "Áreas de Apoyo", "supportAreas", "checkbox", undefined, false, true, supportAreasOptions)}
                </div>
              </div>
            )}

            {profile?.role === "universidad" && (
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaUniversity className="mr-2 text-red-500" /> Detalles de Universidad
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(<FaUniversity />, "Nombre de la Universidad", "businessName")}
                  {renderField(<FaUserCircle />, "Tu Rol", "businessRelationship", "select", businessRelationshipOptions)}
                  {renderField(<FaBriefcase />, "Motivación Principal", "motivation", "text", undefined, true)}
                  {renderField(<FaBriefcase />, "Reto Principal", "mainChallenge", "text", undefined, true)}
                  {renderField(<FaCalendarAlt />, "Metas", "goals", "checkbox", undefined, false, true, goalsOptions)}
                  {renderField(<FaBriefcase />, "Áreas de Apoyo", "supportAreas", "checkbox", undefined, false, true, supportAreasOptions)}
                </div>
              </div>
            )}

            {profile?.role === "gobierno" && (
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
                  <FaLandmark className="mr-2 text-gray-500" /> Detalles de Gobierno
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(<FaLandmark />, "Nombre de la Institución", "businessName")}
                  {renderField(<FaUserCircle />, "Tu Rol", "businessRelationship", "select", businessRelationshipOptions)}
                  {renderField(<FaBriefcase />, "Motivación Principal", "motivation", "text", undefined, true)}
                  {renderField(<FaBriefcase />, "Reto Principal", "mainChallenge", "text", undefined, true)}
                  {renderField(<FaCalendarAlt />, "Metas", "goals", "checkbox", undefined, false, true, goalsOptions)}
                  {renderField(<FaBriefcase />, "Áreas de Apoyo", "supportAreas", "checkbox", undefined, false, true, supportAreasOptions)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PrivateLayout>
  );
};

export default Perfil;
