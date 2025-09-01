// components/auth/Login.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { FaGoogle, FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import * as THREE from "three";

/** Fondo de partículas (solo cliente) */
const ParticleBackground = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Medidas iniciales (a pantalla completa)
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Geometría de partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;

      velocities[i] = (Math.random() - 0.5) * 0.002;
      velocities[i + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.008,
      color: new THREE.Color().setHSL(0.6, 0.3, 0.9),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const pos = particlesGeometry.attributes.position.array as Float32Array;
      const vel = particlesGeometry.attributes.velocity.array as Float32Array;

      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += vel[i];
        pos[i + 1] += vel[i + 1];
        pos[i + 2] += vel[i + 2];

        if (pos[i] > 10 || pos[i] < -10) vel[i] *= -1;
        if (pos[i + 1] > 10 || pos[i + 1] < -10) vel[i + 1] *= -1;
        if (pos[i + 2] > 10 || pos[i + 2] < -10) vel[i + 2] *= -1;
      }

      particlesGeometry.attributes.position.needsUpdate = true;
      particlesMesh.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current) {
        if (rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      scene.clear();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      animationIdRef.current = null;
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" aria-hidden="true" />;
};

/** Redirección por rol tras login */
const redirectByRole = async (user: User, router: ReturnType<typeof useRouter>) => {
  if (!user) return;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const role = userDocSnap.data()?.role as string | undefined;
      if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role || "")) {
        router.push("/dashboard/inicio");
      } else if (role === "consultor") {
        router.push("/dashboard/consultor");
      } else {
        router.push("/dashboard/inicio");
      }
    } else {
      router.push("/dashboard/inicio");
    }
  } catch (e: any) {
    toast.error("Error al redirigir. Intenta de nuevo.");
    router.push("/dashboard/inicio");
  }
};

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("¡Inicio de sesión exitoso!");
      await redirectByRole(userCredential.user, router);
    } catch (err: any) {
      let msg = "Error al iniciar sesión. Verifica tus credenciales.";
      if (["auth/invalid-email", "auth/user-not-found", "auth/wrong-password"].includes(err?.code)) {
        msg = "Correo o contraseña incorrectos.";
      } else if (err?.code === "auth/network-request-failed") {
        msg = "Problema de conexión. Revisa tu internet.";
      } else if (err?.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Prueba más tarde o usa 'Olvidaste tu contraseña'.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: "google" | "facebook" | "apple") => {
    let provider:
      | GoogleAuthProvider
      | FacebookAuthProvider
      | OAuthProvider
      | undefined;
    if (providerName === "google") provider = new GoogleAuthProvider();
    if (providerName === "facebook") provider = new FacebookAuthProvider();
    if (providerName === "apple") {
      provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
    }
    if (!provider) {
      const msg = "Proveedor de autenticación no reconocido.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      toast.success(`¡Inicio de sesión exitoso con ${providerName}!`);
      await redirectByRole(userCredential.user, router);
    } catch (err: any) {
      let msg = `Error al iniciar sesión con ${providerName}.`;
      if (err?.code === "auth/network-request-failed") {
        msg = "Problema de conexión. Revisa tu internet.";
      } else if (err?.code === "auth/popup-closed-by-user") {
        msg = "La ventana de inicio de sesión fue cerrada.";
      } else if (err?.code === "auth/cancelled-popup-request") {
        msg = "Solicitud cancelada. Intenta de nuevo.";
      } else if (err?.code === "auth/account-exists-with-different-credential") {
        msg = "Ya existe una cuenta con ese correo pero otro proveedor.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 via-sky-300 to-indigo-400" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Header con enlace a "/" */}
      <div className="relative z-10 pt-6 pl-8">
        <h1
          className="text-white text-2xl font-semibold cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          MenthIA
        </h1>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Inicia sesión en tu cuenta
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* ✅ onSubmit en <form> */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="ejemplo@dominio.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/reset-password")}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-4 text-gray-500 text-sm font-medium">o</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <FaGoogle className="text-red-500 mr-3 text-lg" />
                Inicia sesión con Google
              </button>

              <button
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <FaFacebook className="text-blue-600 mr-3 text-lg" />
                Inicia sesión con Facebook
              </button>

              <button
                onClick={() => handleSocialLogin("apple")}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <FaApple className="text-black mr-3 text-lg" />
                Inicia sesión con Apple
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
                >
                  Regístrate
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center text-white/80 text-sm space-y-2 sm:space-y-0 sm:space-x-6">
          <span>© MenthIA</span>
          <button className="hover:text-white transition-colors">Privacidad y condiciones</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
