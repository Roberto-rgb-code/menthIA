// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'mi-primer-bucket-2025-mentorapp.s3.us-east-2.amazonaws.com',
      's3.amazonaws.com',
      // agrega otros dominios si hace falta
    ],
  },
  experimental: {
    // <- ESTO ES CLAVE CON TURBOPACK
    serverComponentsExternalPackages: [
      'firebase-admin',
      'google-auth-library',
      'gaxios',
      'gcp-metadata',
    ],
  },
};

module.exports = nextConfig;
