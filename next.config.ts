// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Next 15: va a nivel raíz
  serverExternalPackages: [
    'firebase-admin',
    'google-auth-library',
    'gaxios',
    'gcp-metadata',
  ],

  images: {
    // Opción 1: dominios explícitos (lo que ya usas)
    domains: [
      'mi-primer-bucket-2025-mentorapp.s3.us-east-2.amazonaws.com',
      's3.amazonaws.com',
    ],

    // 👇 O opción 2 (recomendada si cambias región/bucket/ruta a futuro):
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '**.s3.**.amazonaws.com',
    //   },
    // ],
  },

  // Si no tienes más flags experimentales válidas, puedes eliminar "experimental"
  // experimental: { ...otrasFlagsValidas }
};

module.exports = nextConfig;
