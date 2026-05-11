/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sql.js", "tesseract.js"]
  }
};

export default nextConfig;
