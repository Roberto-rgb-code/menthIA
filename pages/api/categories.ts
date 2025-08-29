// pages/api/categories.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { courseCategories } from '../../utils/categories'; // Importa las categorías predefinidas

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Simplemente devolvemos las categorías predefinidas
    res.status(200).json(courseCategories);
  } catch (error: any) {
    // Aunque es menos probable que haya un error aquí, mantenemos el catch
    console.error('Error serving categories:', error);
    res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
  }
}