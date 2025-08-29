// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Importa doc y getDoc de Firestore
import { auth, db } from '../lib/firebase'; // Asegúrate de que db esté importado

// Define la interfaz del objeto de usuario con todos los campos necesarios
interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
  role: string | null; // Importante para la lógica de redirección y permisos
}

// Define la interfaz del valor del contexto
interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario logueado, ahora buscamos sus datos en Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userData = {};
          if (userDocSnap.exists()) {
            userData = userDocSnap.data();
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name || null,
            photoUrl: firebaseUser.photoURL || userData.photoUrl || null,
            role: userData.role || null,
          });
        } catch (error) {
          console.error("Error al obtener datos del usuario de Firestore:", error);
          setUser(null);
        }
      } else {
        // No hay usuario
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};