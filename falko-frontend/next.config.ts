import type { NextConfig } from "next";

// Security headers dla produkcji
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/static/**',
      },
    ],
  },
  
  // Wyłączamy security headers tymczasowo w dev
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  
  // Optymalizacja dla produkcji
  poweredByHeader: false,
  
  // Wyłączamy rewrites tymczasowo - mogą powodować problemy z routingiem
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/medusa/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
