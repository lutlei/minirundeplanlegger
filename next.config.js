/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable App Router for production
  appDir: false
};

module.exports = nextConfig; 