// Note: Next.js config files must use CommonJS require/exports
// ESLint may warn about this but it's necessary for Next.js configuration
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Fix the experimental.turbo setting to be an object instead of a boolean
  experimental: {
    // Set to false to disable Turbopack
    turbo: { 
      enabled: false
    }
  }
};

module.exports = withNextIntl(nextConfig);
