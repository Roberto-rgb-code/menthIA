// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Next 15: aquí va ahora
  serverExternalPackages: [
    'firebase-admin',
    'google-auth-library',
    'gaxios',
    'gcp-metadata',
  ],

  images: {
    domains: [
      'mi-primer-bucket-2025-mentorapp.s3.us-east-2.amazonaws.com',
      's3.amazonaws.com',
    ],
    // Si prefieres patrón genérico en vez de domains:
    // remotePatterns: [{ protocol: 'https', hostname: '**.s3.**.amazonaws.com' }],
  },
};

module.exports = nextConfig;
