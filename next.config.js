// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // ✅ Matikan error useSearchParams
    missingSuspenseWithCSRBailout: false,
  },

  // Catatan: header CORS wildcard (Access-Control-Allow-Origin: *) sengaja
  // TIDAK ditambahkan untuk /api/auth/*. NextAuth dipanggil same-origin dari
  // frontend kita sendiri, jadi tidak butuh CORS — dan mengizinkan origin
  // manapun mengakses endpoint sesi/csrf NextAuth adalah risiko keamanan
  // (bisa dipakai untuk serangan lintas situs terhadap sesi login).

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          framer: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  async redirects() {
    return [];
  },
};

module.exports = withBundleAnalyzer(nextConfig);