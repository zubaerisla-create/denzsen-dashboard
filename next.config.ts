import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // Add other domains your app might use
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', // For subdomains
        port: '',
        pathname: '/**',
      },
    ],
    // Or you can use domains array (simpler)
    // domains: ['i.pravatar.cc', 'example.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;