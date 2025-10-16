// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Laisse passer le build même s'il reste des erreurs ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Laisse le build échouer si TS a des erreurs (tu peux passer à true si besoin)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
