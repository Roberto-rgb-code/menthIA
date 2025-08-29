// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'; // Importa User y signOut
import { auth } from '@/lib/firebase'; // Asegúrate de que tu instancia de 'auth' de Firebase esté correctamente exportada aquí

// Define la interfaz para el objeto de usuario que tu hook devolverá
interface User {
  id: string; // Aquí es donde mapearemos firebaseUser.uid
  name: string; // Nombre a mostrar del usuario (displayName o parte del email)
  email: string | null;
  // Puedes añadir otros campos que necesites de tu usuario
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      // Opcional: Podrías limpiar el estado local del usuario aquí,
      // aunque onAuthStateChanged ya se encargará de ponerlo a null.
      setUser(null);
      console.log("useAuth: Sesión de Firebase cerrada exitosamente.");
    } catch (error) {
      console.error("useAuth: Error al cerrar sesión de Firebase:", error);
      throw error; // Propaga el error para que el componente que llama pueda manejarlo
    }
  };

  return { user, loading, logout }; // ¡Ahora también devolvemos la función logout!
};
