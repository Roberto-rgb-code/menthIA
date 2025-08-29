// lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Esta función se encarga de inicializar el SDK de Firebase Admin en el servidor
// y lo exporta para que pueda ser utilizado en las API routes.
// Se asegura de que la app solo se inicialice una vez.
const getFirebaseAdminApp = () => {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Reemplaza los caracteres de escape '\\n' con '\n' para la clave privada
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Error al inicializar Firebase Admin:', error);
    }
  }
  return admin.app();
};

const db = getFirestore(getFirebaseAdminApp());
const auth = getFirebaseAdminApp().auth();

export { db, auth, getFirebaseAdminApp };
