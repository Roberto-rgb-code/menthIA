/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignorar errores de TypeScript en producción para reducir uso de memoria
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar errores de ESLint en producción para reducir uso de memoria
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Paquetes externos para servidor
  serverExternalPackages: [
    'firebase-admin',
    'google-auth-library',
    'gaxios',
    'gcp-metadata',
  ],
  // Configuración de imágenes
  images: {
    domains: [
      'mi-primer-bucket-2025-mentorapp.s3.us-east-2.amazonaws.com',
      's3.amazonaws.com',
    ],
    // Si prefieres patrón genérico en vez de domains:
    // remotePatterns: [{ protocol: 'https', hostname: '**.s3.**.amazonaws.com' }],
  },
  // Optimización experimental para reducir memoria en importaciones pesadas
  experimental: {
    optimizePackageImports: ['firebase-admin', 'google-auth-library', 'gaxios', 'gcp-metadata'],
  },
};

export default nextConfig;