// components/auth/Register.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; // Make sure auth and db are correctly initialized and exported here
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

// --- Constants ---
const ROLES_FINAL = [
  {
    value: "emprendedor",
    label: "PyME / Emprendedor",
    description: "Acceso freemium/premium, diagnóstico, cursos y comunidad.",
  },
  {
    value: "consultor",
    label: "Consultor Independiente",
    description: "Carga perfil experto, gestión de agenda, consultoría 1:1.",
  },
  {
    value: "empresa",
    label: "Empresa (Licenciataria)",
    description: "Acceso corporativo, métricas de empleados, equipos.",
  },
  {
    value: "universidad",
    label: "Universidad",
    description: "Gestión de usuarios institucional, seguimiento académico.",
  },
  {
    value: "gobierno",
    label: "Gobierno",
    description: "Reportes de impacto, acceso institucional, licenciamiento.",
  },
];

const INITIAL_USER_DATA = {
  fullName: "",
  email: "",
  phone: "",
  birthYear: "",
  language: "",
  gender: "",
  country: "",
  city: "",
  password: "",
  privacyConsent: false,
};

// --- Main Register Component ---
const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [userData, setUserData] = useState({ ...INITIAL_USER_DATA });
  const [error, setError] = useState("");
  const router = useRouter();

  // --- State for Emprendedor/Empresa/Universidad/Gobierno (common fields) ---
  const [motivation, setMotivation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRelationship, setBusinessRelationship] = useState("");
  const [businessStage, setBusinessStage] = useState("");
  const [mainChallenge, setMainChallenge] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState(""); // For "Otro" goal
  const [previousAdvisory, setPreviousAdvisory] = useState("");
  const [supportAreas, setSupportAreas] = useState<string[]>([]);
  const [otherSupportArea, setOtherSupportArea] = useState(""); // For "Otro" support area

  // --- State for Consultor ---
  const [ultimoGrado, setUltimoGrado] = useState("");
  const [otroGrado, setOtroGrado] = useState(""); // For "Otro" degree
  const [areaEstudios, setAreaEstudios] = useState("");
  const [anosExperiencia, setAnosExperiencia] = useState("");
  const [experienciaMipymes, setExperienciaMipymes] = useState("");
  const [colaboracionInstitucional, setColaboracionInstitucional] = useState("");
  const [areasExperiencia, setAreasExperiencia] = useState<string[]>([]);
  const [otherAreaExperiencia, setOtherAreaExperiencia] = useState(""); // For "Otro" area de experiencia
  const [industrias, setIndustrias] = useState<string[]>([]);
  const [otherIndustry, setOtherIndustry] = useState(""); // For "Otro" industry
  const [casoExito, setCasoExito] = useState("");
  const [intervencionPreferida, setIntervencionPreferida] = useState("");
  const [otraIntervencion, setOtraIntervencion] = useState(""); // For "Otra" intervencion
  const [acompanamiento, setAcompanamiento] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [herramientasDigitales, setHerramientasDigitales] = useState<string[]>([]);
  const [otherDigitalTool, setOtherDigitalTool] = useState(""); // For "Otra" herramienta
  const [recursosPropios, setRecursosPropios] = useState("");
  const [reportesEstructurados, setReportesEstructurados] = useState("");
  const [horasSemanales, setHorasSemanales] = useState("");
  const [trabajoProyecto, setTrabajoProyecto] = useState("");
  const [tarifaTipo, setTarifaTipo] = useState("");
  const [tarifaHora, setTarifaHora] = useState("");
  const [tarifaPaquete, setTarifaPaquete] = useState("");
  const [motivacionConsultor, setMotivacionConsultor] = useState("");
  const [otraMotivacion, setOtraMotivacion] = useState(""); // For "Otra" motivacion
  const [curriculum, setCurriculum] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [referencias, setReferencias] = useState("");
  const [confirmacionEntrevista, setConfirmacionEntrevista] = useState(false);

  // --- Handlers ---
  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2); // Immediately move to the next step
    setError(""); // Clear any previous errors
  };

  const handleCheckboxChange = (
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    currentArray: string[],
    value: string,
    otherValueState?: string, // Used for 'Otro' textbox management
    setOtherValueState?: React.Dispatch<React.SetStateAction<string>> // Used for 'Otro' textbox management
  ) => {
    if (currentArray.includes(value)) {
      setState(currentArray.filter((item) => item !== value));
      if (value === "Otro" && setOtherValueState) {
        setOtherValueState(""); // Clear other text if 'Otro' is deselected
      }
    } else {
      setState([...currentArray, value]);
    }
  };

  const handleNext = () => {
    setError(""); // Clear previous errors

    // --- Common Validations (Step 2: About You) ---
    if (step === 2) {
      const { fullName, email, phone, language, country, city, birthYear } = userData;
      if (!fullName || !email || !phone || !language || !country || !city || !birthYear) {
        setError("Por favor, completa todos los campos obligatorios del Paso 1: Sobre ti.");
        return;
      }
    }

    // --- Role-Specific Validations ---
    if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
      // Step 3 (Paso 2: Sobre tu Negocio/Institución)
      if (step === 3 && (!motivation || !businessName || !businessRelationship || !businessStage)) {
        setError("Por favor, completa todos los campos del Paso 2: Sobre tu Negocio/Institución.");
        return;
      }
      // Step 4 (Paso 3: Retos y Metas)
      if (step === 4) {
        if (!mainChallenge || goals.length === 0 || (goals.includes("Otro") && otherGoal.trim() === "") || !previousAdvisory) {
          setError("Completa los retos, metas y experiencia previa del Paso 3: Retos y Metas. Si seleccionaste 'Otro' en metas, debes especificarla.");
          return;
        }
      }
      // Step 5 (Paso 4: Áreas de Apoyo)
      if (step === 5) {
        if (supportAreas.length === 0 || (supportAreas.includes("Otro") && otherSupportArea.trim() === "")) {
          setError("Por favor, selecciona al menos una área de apoyo en el Paso 4: Áreas de Apoyo y especifica 'Otro' si aplica.");
          return;
        }
      }
      // Step 6 (Paso 5: Registro Final)
      if (step === 6) {
        if (!userData.password) {
          setError("La contraseña no puede estar vacía.");
          return;
        }
        if (userData.password.length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
        if (!userData.privacyConsent) {
          setError("Debes aceptar el aviso de privacidad y los términos de uso.");
          return;
        }
      }
    } else if (role === "consultor") {
      // Step 3 (Paso 2: Formación y Experiencia)
      if (step === 3) {
        if (!ultimoGrado || (ultimoGrado === "Otro" && otroGrado.trim() === "") || !areaEstudios || !anosExperiencia || !experienciaMipymes || !colaboracionInstitucional) {
          setError("Por favor, completa todos los campos de formación y experiencia en el Paso 2: Formación y Experiencia. Si seleccionaste 'Otro' en grado, debes especificarlo.");
          return;
        }
      }
      // Step 4 (Paso 3: Especialidad Profesional)
      if (step === 4) {
        if (areasExperiencia.length === 0 || (areasExperiencia.includes("Otro") && otherAreaExperiencia.trim() === "")) {
          setError("Selecciona al menos un área de experiencia y especifica 'Otro' si aplica.");
          return;
        }
        if (industrias.length === 0 || (industrias.includes("Otro") && otherIndustry.trim() === "")) {
          setError("Selecciona al menos una industria y especifica 'Otro' si aplica.");
          return;
        }
        if (!casoExito || !intervencionPreferida || (intervencionPreferida === "Otro" && otraIntervencion.trim() === "")) {
          setError("Completa el caso de éxito y la intervención preferida del Paso 3: Especialidad Profesional. Si seleccionaste 'Otro' en intervención, debes especificarla.");
          return;
        }
      }
      // Step 5 (Paso 4: Estilo y Metodología)
      if (step === 5) {
        if (!acompanamiento || !modalidad || herramientasDigitales.length === 0 || (herramientasDigitales.includes("Otra") && otherDigitalTool.trim() === "") || !recursosPropios || !reportesEstructurados) {
          setError("Por favor, completa todos los campos de estilo y metodología en el Paso 4: Estilo y Metodología y especifica 'Otra' herramienta si aplica.");
          return;
        }
      }
      // Step 6 (Paso 5: Disponibilidad y Condiciones)
      if (step === 6) {
        if (!horasSemanales || !trabajoProyecto || !tarifaTipo || (tarifaTipo === "Por hora" && tarifaHora.trim() === "") || (tarifaTipo === "Por paquete" && tarifaPaquete.trim() === "") || !motivacionConsultor || (motivacionConsultor === "Otro" && otraMotivacion.trim() === "")) {
          setError("Por favor, completa todos los campos de disponibilidad y condiciones en el Paso 5: Disponibilidad y Condiciones. Si seleccionaste 'Otro' en motivación, debes especificarla.");
          return;
        }
      }
      // Step 7 (Paso 6: Validaciones)
      if (step === 7) {
        if (!curriculum || !referencias) { // Added basic check for curriculum and references
          setError("Por favor, completa los campos obligatorios de validaciones en el Paso 6: Validaciones (CV y Referencias).");
          return;
        }
      }
      // Step 8 (Paso 7: Registro Final)
      if (step === 8) {
        if (!userData.password || userData.password.length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
        if (!userData.privacyConsent || !confirmacionEntrevista) {
          setError("Debes aceptar el aviso de privacidad/términos y confirmar tu disposición a una entrevista.");
          return;
        }
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const saveUserData = async (user: User) => {
    try {
      const baseData: any = {
        uid: user.uid,
        email: user.email || userData.email, // Use Firebase email if available, else from form
        role,
        fullName: userData.fullName,
        phone: userData.phone,
        birthYear: userData.birthYear,
        language: userData.language,
        gender: userData.gender,
        country: userData.country,
        city: userData.city,
        privacyConsent: userData.privacyConsent,
        createdAt: new Date().toISOString(),
      };

      if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
        Object.assign(baseData, {
          motivation,
          businessName,
          businessRelationship,
          businessStage,
          mainChallenge,
          // Handle 'Otro' for goals
          goals: goals.includes("Otro") && otherGoal ? [...goals.filter(g => g !== "Otro"), otherGoal] : goals,
          previousAdvisory,
          // Handle 'Otro' for supportAreas
          supportAreas: supportAreas.includes("Otro") && otherSupportArea ? [...supportAreas.filter(sa => sa !== "Otro"), otherSupportArea] : supportAreas,
        });
      } else if (role === "consultor") {
        Object.assign(baseData, {
          ultimoGrado: ultimoGrado === "Otro" ? otroGrado : ultimoGrado,
          areaEstudios,
          anosExperiencia,
          experienciaMipymes,
          colaboracionInstitucional,
          // Handle 'Otro' for areasExperiencia
          areasExperiencia: areasExperiencia.includes("Otro") && otherAreaExperiencia ? [...areasExperiencia.filter(ae => ae !== "Otro"), otherAreaExperiencia] : areasExperiencia,
          // Handle 'Otro' for industrias
          industrias: industrias.includes("Otro") && otherIndustry ? [...industrias.filter(ind => ind !== "Otro"), otherIndustry] : industrias,
          casoExito,
          intervencionPreferida: intervencionPreferida === "Otro" ? otraIntervencion : intervencionPreferida,
          acompanamiento,
          modalidad,
          // Handle 'Otra' for herramientasDigitales
          herramientasDigitales: herramientasDigitales.includes("Otra") && otherDigitalTool ? [...herramientasDigitales.filter(hd => hd !== "Otra"), otherDigitalTool] : herramientasDigitales,
          recursosPropios,
          reportesEstructurados,
          horasSemanales,
          trabajoProyecto,
          // Dynamically set tarifa based on type
          tarifa: tarifaTipo === "Por hora" ? tarifaHora : tarifaTipo === "Por paquete" ? tarifaPaquete : "Ajustable",
          motivacion: motivacionConsultor === "Otro" ? otraMotivacion : motivacionConsultor,
          curriculum,
          portafolio,
          linkedin,
          referencias,
          confirmacionEntrevista,
        });
      }
      await setDoc(doc(db, "users", user.uid), baseData);
    } catch (err: any) {
      console.error("Error saving user data to Firestore:", err);
      setError("Error al guardar tus datos adicionales. Intenta de nuevo.");
    }
  };

  const handleRegister = async () => {
    // Re-run final step validation before registering
    const totalSteps = getMaxSteps();
    if (step < totalSteps) { // If not on the last step, don't try to register yet
      setError("Por favor, completa todos los pasos antes de registrarte.");
      return;
    }

    setError(""); // Clear any previous errors before attempting registration

    try {
      // This is the primary point where network failures occur for email/password
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      // Ensure user object exists after successful auth operation
      if (userCredential.user) {
        await saveUserData(userCredential.user);
        router.push("/dashboard/inicio");
      } else {
        // This case should theoretically not happen with createUserWithEmailAndPassword if no error was thrown
        // It might indicate an unexpected partial success from Firebase, though rare.
        setError("Error inesperado: No se pudo obtener la información del usuario después del registro.");
        // Optionally, consider logging out the user if a partial state is detected
        // await auth.signOut();
      }

    } catch (err: any) {
      console.error("Firebase Auth Error during registration:", err.code, err.message);
      // More specific error messages for the user
      if (err.code === 'auth/network-request-failed') {
        setError("Problema de conexión: Asegúrate de tener internet estable y revisa tu firewall o VPN.");
      } else if (err.code === 'auth/email-already-in-use') {
        // As discussed, if this error is received, the user IS NOT created/logged in by this call.
        // So, access SHOULD NOT have been granted.
        setError("El correo electrónico ya está registrado. Por favor, inicia sesión o usa un correo diferente.");
        // IMPORTANT: DO NOT redirect to dashboard here.
      } else if (err.code === 'auth/invalid-email') {
        setError("El formato del correo electrónico es inválido.");
      } else if (err.code === 'auth/weak-password') {
        setError("La contraseña es demasiado débil (mínimo 8 caracteres).");
      } else {
        // Fallback for other less common errors
        setError(err.message || "Error al registrarse. Verifica tus datos.");
      }
    }
  };

  const handleSocialLogin = async (providerName: string) => {
    let provider;
    switch (providerName) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "apple":
        provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");
        break;
      default:
        setError("Proveedor de autenticación no reconocido.");
        return;
    }

    setError(""); // Clear any previous errors before attempting social login

    try {
      // This is the primary point where network failures occur for social logins
      const userCredential = await signInWithPopup(auth, provider);

      // Ensure user object exists after successful auth operation
      if (userCredential.user) {
        await saveUserData(userCredential.user);
        router.push("/dashboard/inicio");
      } else {
        setError("Error inesperado: No se pudo obtener la información del usuario después del inicio de sesión social.");
        // Optionally, consider logging out the user if a partial state is detected
        // await auth.signOut();
      }

    } catch (err: any) {
      console.error(`Firebase Auth Error with ${providerName}:`, err.code, err.message);
      if (err.code === 'auth/network-request-failed') {
        setError("Problema de conexión: Asegúrate de tener internet estable y revisa tu firewall o VPN.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("La ventana de inicio de sesión fue cerrada por el usuario.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("La solicitud de ventana emergente fue cancelada. Intenta de nuevo.");
      } else if (err.code === 'auth/email-already-in-use') {
        // For social logins, 'auth/email-already-in-use' can occur if the email
        // associated with the social account is ALREADY linked to another
        // Firebase authentication method (e.g., email/password or another social provider).
        // Firebase often offers account linking in these scenarios.
        setError("El correo electrónico de tu cuenta social ya está asociado a otra forma de inicio de sesión. Por favor, inicia sesión con esa cuenta o vincula tus cuentas.");
      }
      else {
        setError(err.message || `Error al registrarse con ${providerName}.`);
      }
    }
  };

  const getMaxSteps = () => {
    if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
      return 6; // Role selection (1) + Common (1) + Role-specific (3) + Final Registration (1) = 6
    } else if (role === "consultor") {
      return 8; // Role selection (1) + Common (1) + Role-specific (5) + Final Registration (1) = 8
    }
    return 1; // Only role selection step
  };

  const renderStepIndicator = () => {
    const totalSteps = getMaxSteps();
    // Adjust totalSteps and current step for visual indicator (excluding initial role selection)
    const currentRoleSteps = role ? totalSteps - 1 : 0;
    const displayStep = role ? step - 1 : 0;

    return (
      <div className="flex justify-center mb-6">
        {Array.from({ length: currentRoleSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-6 h-1 mx-1 rounded-full transition-all duration-300
              ${displayStep > index ? "bg-blue-600" : "bg-gray-300"}
            `}
          ></div>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">¿Qué te trae a MentorApp?</h2>
            <div className="space-y-4">
              {ROLES_FINAL.map((rol) => (
                <button
                  key={rol.value}
                  onClick={() => handleRoleSelection(rol.value)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-start text-left"
                >
                  <span className="font-semibold text-lg">{rol.label}</span>
                  <span className="text-sm opacity-90 mt-1">{rol.description}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 1: Sobre ti</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Número de teléfono 📞 (+ lada internacional)</label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Año de nacimiento 🎂</label>
                <input
                  type="number"
                  value={userData.birthYear}
                  onChange={(e) => setUserData({ ...userData, birthYear: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="AAAA (Ej. 1990)"
                  min="1900"
                  max={new Date().getFullYear().toString()}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Idioma preferido para la plataforma 🌐</label>
                <select
                  value={userData.language}
                  onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                >
                  <option value="">Selecciona</option>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Francés">Francés</option>
                  <option value="Alemán">Alemán</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Género (opcional)</label>
                <div className="flex flex-wrap gap-4">
                  {["Mujer", "Hombre", "Prefiero no decirlo", "Otro"].map((genderOption) => (
                    <label key={genderOption} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={genderOption}
                        checked={userData.gender === genderOption}
                        onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-800">{genderOption}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">País 🌍</label>
                <input
                  type="text"
                  value={userData.country}
                  onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu país de residencia"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ciudad 🏙️</label>
                <input
                  type="text"
                  value={userData.city}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu ciudad"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
              >
                Volver
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          </div>
        );
      case 3:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 2: Sobre tu Negocio/Institución</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu principal motivación?</label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Quiero crecer mi negocio, busco mentoría para mi equipo, etc."
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre de tu Negocio/Institución</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Nombre de tu empresa o institución"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu relación con la empresa/institución?</label>
                  <select
                    value={businessRelationship}
                    onChange={(e) => setBusinessRelationship(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Propietario">Propietario</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Fundador">Fundador</option>
                    <option value="Director">Director</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿En qué etapa se encuentra tu negocio/institución?</label>
                  <select
                    value={businessStage}
                    onChange={(e) => setBusinessStage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Idea">Idea</option>
                    <option value="Pre-lanzamiento">Pre-lanzamiento</option>
                    <option value="Lanzamiento">Lanzamiento</option>
                    <option value="Crecimiento temprano">Crecimiento temprano</option>
                    <option value="Crecimiento establecido">Crecimiento establecido</option>
                    <option value="Madurez">Madurez</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 2: Formación y Experiencia</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Último grado académico 🎓</label>
                  <select
                    value={ultimoGrado}
                    onChange={(e) => setUltimoGrado(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                    <option value="Diplomado">Diplomado</option>
                    <option value="Carrera Técnica">Carrera Técnica</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {ultimoGrado === "Otro" && (
                    <input
                      type="text"
                      value={otroGrado}
                      onChange={(e) => setOtroGrado(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica tu otro grado académico"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Área de estudios principal</label>
                  <input
                    type="text"
                    value={areaEstudios}
                    onChange={(e) => setAreaEstudios(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Negocios, Ingeniería, Finanzas"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Años de experiencia profesional</label>
                  <input
                    type="number"
                    value={anosExperiencia}
                    onChange={(e) => setAnosExperiencia(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. 5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Tienes experiencia trabajando con MiPymes?</label>
                  <select
                    value={experienciaMipymes}
                    onChange={(e) => setExperienciaMipymes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, extensiva">Sí, extensiva</option>
                    <option value="Sí, limitada">Sí, limitada</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Has colaborado con instituciones de apoyo empresarial o gubernamentales?</label>
                  <select
                    value={colaboracionInstitucional}
                    onChange={(e) => setColaboracionInstitucional(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, frecuentemente">Sí, frecuentemente</option>
                    <option value="Sí, ocasionalmente">Sí, ocasionalmente</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        }
      case 4:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 3: Retos y Metas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu principal reto actual?</label>
                  <textarea
                    value={mainChallenge}
                    onChange={(e) => setMainChallenge(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Aumentar ventas, mejorar gestión, expandirme a nuevos mercados."
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Qué metas esperas lograr con MentorApp? (Selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Acceso a mentoría especializada",
                      "Desarrollo de habilidades",
                      "Networking y comunidad",
                      "Herramientas y recursos",
                      "Crecimiento del negocio/institución",
                      "Resolución de problemas específicos",
                      "Acceso a financiamiento",
                      "Otro",
                    ].map((goalOption) => (
                      <label key={goalOption} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                        <input
                          type="checkbox"
                          checked={goals.includes(goalOption)}
                          onChange={() => handleCheckboxChange(setGoals, goals, goalOption, otherGoal, setOtherGoal)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-800">{goalOption}</span>
                      </label>
                    ))}
                  </div>
                  {goals.includes("Otro") && (
                    <input
                      type="text"
                      value={otherGoal}
                      onChange={(e) => setOtherGoal(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica tu otra meta"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Has recibido mentoría o asesoría empresarial previamente?</label>
                  <select
                    value={previousAdvisory}
                    onChange={(e) => setPreviousAdvisory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, formal e integral">Sí, formal e integral</option>
                    <option value="Sí, informal o puntual">Sí, informal o puntual</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 3: Especialidad Profesional</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Áreas de experiencia y dominio (Selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Estrategia y Planificación",
                      "Marketing y Ventas",
                      "Finanzas y Contabilidad",
                      "Operaciones y Logística",
                      "Recursos Humanos y Talento",
                      "Tecnología e Innovación",
                      "Legal y Cumplimiento",
                      "Sustentabilidad y RSE",
                      "Exportación e Internacionalización",
                      "Desarrollo de Producto",
                      "Otro",
                    ].map((area) => (
                      <label key={area} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                        <input
                          type="checkbox"
                          checked={areasExperiencia.includes(area)}
                          onChange={() => handleCheckboxChange(setAreasExperiencia, areasExperiencia, area, otherAreaExperiencia, setOtherAreaExperiencia)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-800">{area}</span>
                      </label>
                    ))}
                  </div>
                  {areasExperiencia.includes("Otro") && (
                    <input
                      type="text"
                      value={otherAreaExperiencia}
                      onChange={(e) => setOtherAreaExperiencia(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra área de experiencia"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Industrias en las que tienes experiencia (Selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Tecnología y Software",
                      "Comercio Electrónico",
                      "Servicios Profesionales",
                      "Manufactura",
                      "Retail",
                      "Alimentos y Bebidas",
                      "Salud y Bienestar",
                      "Educación",
                      "Financiera",
                      "Turismo y Hospitalidad",
                      "Energía",
                      "Agronegocios",
                      "Otro",
                    ].map((industry) => (
                      <label key={industry} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                        <input
                          type="checkbox"
                          checked={industrias.includes(industry)}
                          onChange={() => handleCheckboxChange(setIndustrias, industrias, industry, otherIndustry, setOtherIndustry)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-800">{industry}</span>
                      </label>
                    ))}
                  </div>
                  {industrias.includes("Otro") && (
                    <input
                      type="text"
                      value={otherIndustry}
                      onChange={(e) => setOtherIndustry(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra industria"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Describe un caso de éxito relevante de asesoría/mentoría que hayas liderado.</label>
                  <textarea
                    value={casoExito}
                    onChange={(e) => setCasoExito(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Ayudé a una PyME a aumentar sus ventas en un 30% en 6 meses mediante una nueva estrategia digital."
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de intervención preferida</label>
                  <select
                    value={intervencionPreferida}
                    onChange={(e) => setIntervencionPreferida(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Mentoría 1:1">Mentoría 1:1</option>
                    <option value="Consultoría de Proyecto">Consultoría de Proyecto</option>
                    <option value="Talleres grupales">Talleres grupales</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {intervencionPreferida === "Otro" && (
                    <input
                      type="text"
                      value={otraIntervencion}
                      onChange={(e) => setOtraIntervencion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otro tipo de intervención"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        }
      case 5:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 4: Áreas de Apoyo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿En qué áreas te gustaría recibir apoyo? (Selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Estrategia Empresarial",
                      "Marketing Digital",
                      "Ventas y Clientes",
                      "Finanzas y Contabilidad",
                      "Operaciones y Eficiencia",
                      "Recursos Humanos y Liderazgo",
                      "Innovación y Tecnología",
                      "Legal y Normativa",
                      "Sustentabilidad y RSE",
                      "Internacionalización",
                      "Desarrollo de Producto/Servicio",
                      "Otro",
                    ].map((area) => (
                      <label key={area} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                        <input
                          type="checkbox"
                          checked={supportAreas.includes(area)}
                          onChange={() => handleCheckboxChange(setSupportAreas, supportAreas, area, otherSupportArea, setOtherSupportArea)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-800">{area}</span>
                      </label>
                    ))}
                  </div>
                  {supportAreas.includes("Otro") && (
                    <input
                      type="text"
                      value={otherSupportArea}
                      onChange={(e) => setOtherSupportArea(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra área de apoyo"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 4: Estilo y Metodología</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Enfoque de acompañamiento preferido</label>
                  <select
                    value={acompanamiento}
                    onChange={(e) => setAcompanamiento(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Directivo (orientación explícita)">Directivo (orientación explícita)</option>
                    <option value="Colaborativo (trabajo conjunto)">Colaborativo (trabajo conjunto)</option>
                    <option value="Facilitador (guiar para descubrir soluciones)">Facilitador (guiar para descubrir soluciones)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Modalidad de trabajo preferida</label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Remoto (online)">Remoto (online)</option>
                    <option value="Presencial (en sitio)">Presencial (en sitio)</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Herramientas digitales que utilizas con frecuencia para la colaboración (Selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Zoom", "Google Meet", "Microsoft Teams",
                      "Slack", "Trello", "Asana", "Miro",
                      "Google Drive", "Dropbox", "Otro"
                    ].map((tool) => (
                      <label key={tool} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                        <input
                          type="checkbox"
                          checked={herramientasDigitales.includes(tool)}
                          onChange={() => handleCheckboxChange(setHerramientasDigitales, herramientasDigitales, tool, otherDigitalTool, setOtherDigitalTool)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-800">{tool}</span>
                      </label>
                    ))}
                  </div>
                  {herramientasDigitales.includes("Otra") && (
                    <input
                      type="text"
                      value={otherDigitalTool}
                      onChange={(e) => setOtherDigitalTool(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra herramienta digital"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Estás dispuesto a usar recursos propios (ej. plantillas, diagnósticos) durante la mentoría?</label>
                  <select
                    value={recursosPropios}
                    onChange={(e) => setRecursosPropios(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, activamente">Sí, activamente</option>
                    <option value="Sí, si es necesario">Sí, si es necesario</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Estás acostumbrado a entregar reportes estructurados de avance?</label>
                  <select
                    value={reportesEstructurados}
                    onChange={(e) => setReportesEstructurados(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, muy acostumbrado">Sí, muy acostumbrado</option>
                    <option value="Sí, ocasionalmente">Sí, ocasionalmente</option>
                    <option value="No, prefiero un enfoque más informal">No, prefiero un enfoque más informal</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        }
      case 6:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 5: Registro Final</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Crea tu contraseña</label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.privacyConsent}
                    onChange={(e) => setUserData({ ...userData, privacyConsent: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <label className="ml-2 text-gray-800">
                    Acepto el <a href="/aviso-privacidad" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Aviso de Privacidad</a> y los <a href="/terminos-uso" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Términos de Uso</a>.
                  </label>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Registrarme
                </button>
              </div>
              <div className="mt-6 text-center text-gray-600">
                <p className="mb-4">O regístrate con:</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Google"
                  >
                    <FaGoogle className="w-6 h-6 text-red-500" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Facebook"
                  >
                    <FaFacebook className="w-6 h-6 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Apple"
                  >
                    <FaApple className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 5: Disponibilidad y Condiciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Horas semanales disponibles para mentoría/consultoría</label>
                  <input
                    type="number"
                    value={horasSemanales}
                    onChange={(e) => setHorasSemanales(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. 5"
                    min="1"
                    max="40"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Estás dispuesto a trabajar en proyectos específicos o por horas?</label>
                  <select
                    value={trabajoProyecto}
                    onChange={(e) => setTrabajoProyecto(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Ambos">Ambos</option>
                    <option value="Solo por proyecto">Solo por proyecto</option>
                    <option value="Solo por horas">Solo por horas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de tarifa preferida</label>
                  <select
                    value={tarifaTipo}
                    onChange={(e) => {
                      setTarifaTipo(e.target.value);
                      if (e.target.value !== "Por hora") setTarifaHora(""); // Clear if not hourly
                      if (e.target.value !== "Por paquete") setTarifaPaquete(""); // Clear if not package
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Por hora">Por hora</option>
                    <option value="Por paquete">Por paquete</option>
                    <option value="Ajustable">Ajustable según el proyecto</option>
                  </select>
                  {tarifaTipo === "Por hora" && (
                    <input
                      type="text"
                      value={tarifaHora}
                      onChange={(e) => setTarifaHora(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Tarifa por hora (Ej. $50 USD)"
                    />
                  )}
                  {tarifaTipo === "Por paquete" && (
                    <input
                      type="text"
                      value={tarifaPaquete}
                      onChange={(e) => setTarifaPaquete(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Tarifa por paquete (Ej. $500 USD por 10 horas)"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu principal motivación para unirte a MentorApp como consultor?</label>
                  <select
                    value={motivacionConsultor}
                    onChange={(e) => setMotivacionConsultor(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Impacto social">Impacto social</option>
                    <option value="Ingresos adicionales">Ingresos adicionales</option>
                    <option value="Networking con emprendedores">Networking con emprendedores</option>
                    <option value="Reconocimiento profesional">Reconocimiento profesional</option>
                    <option value="Compartir conocimiento">Compartir conocimiento</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {motivacionConsultor === "Otro" && (
                    <input
                      type="text"
                      value={otraMotivacion}
                      onChange={(e) => setOtraMotivacion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra motivación"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        }
      case 7:
        if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 6: Validaciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Link a tu Curriculum Vitae (CV) o perfil profesional (Google Drive, Dropbox, LinkedIn, etc.)</label>
                  <input
                    type="url"
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. https://drive.google.com/tu-cv"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Link a tu portafolio de proyectos o experiencia (opcional)</label>
                  <input
                    type="url"
                    value={portafolio}
                    onChange={(e) => setPortafolio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. https://tu-portafolio.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Link a tu perfil de LinkedIn (opcional, pero recomendado)</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Referencias profesionales (nombre, cargo y contacto de al menos dos personas que puedan dar fe de tu experiencia)</label>
                  <textarea
                    value={referencias}
                    onChange={(e) => setReferencias(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. 1. Juan Pérez, Director de Innovación, juan.perez@empresa.com; 2. Ana Gómez, CEO, ana.gomez@otraempresa.com"
                    rows={4}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        }
      case 8:
        if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 7: Registro Final</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Crea tu contraseña</label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.privacyConsent}
                    onChange={(e) => setUserData({ ...userData, privacyConsent: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <label className="ml-2 text-gray-800">
                    Acepto el <a href="/aviso-privacidad" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Aviso de Privacidad</a> y los <a href="/terminos-uso" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Términos de Uso</a>.
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={confirmacionEntrevista}
                    onChange={(e) => setConfirmacionEntrevista(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <label className="ml-2 text-gray-800">
                    Confirmo mi disposición a participar en una entrevista de validación como parte del proceso de selección de consultores.
                  </label>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Volver
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Registrarme
                </button>
              </div>
              <div className="mt-6 text-center text-gray-600">
                <p className="mb-4">O regístrate con:</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Google"
                  >
                    <FaGoogle className="w-6 h-6 text-red-500" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Facebook"
                  >
                    <FaFacebook className="w-6 h-6 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition duration-300"
                    aria-label="Regístrate con Apple"
                  >
                    <FaApple className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all duration-300">
        {renderStepIndicator()}
        {renderStep()}
        {/* General error display, moved inside the last step's render for clarity, but could be global */}
        {/* {error && step !== getMaxSteps() && ( // Display error if not on the final step's own error handling
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )} */}
        {/* The error message is now handled specifically within the final step for better UX */}
      </div>
    </div>
  );
};

export default Register;