import type { NextConfig } from 'next';
const config: NextConfig = { devIndicators: false, serverExternalPackages: ['node:sqlite'], poweredByHeader: false };
export default config;
