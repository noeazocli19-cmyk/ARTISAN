import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }],
  },
  allowedDevOrigins: [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://21.0.20.135:3000',
    'http://21.0.20.135:81',
  ],
};

export default nextConfig;
