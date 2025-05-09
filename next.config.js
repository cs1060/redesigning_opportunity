// Note: Next.js config files must use CommonJS require/exports
// ESLint may warn about this but it's necessary for Next.js configuration
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Disable Turbopack for now as it may be causing the buildId/deploymentId errors
  experimental: {
    turbo: {
      enabled: false
    }
  }
};

module.exports = withNextIntl(nextConfig);
