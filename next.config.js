/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        // Ignore system folders that Termux cannot access
        ignored: [
          '/data/**',
          '/proc/**',
          '/sys/**',
          '/dev/**',
          '/storage/**',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
