

import type {NextConfig} from 'next';

const assetBaseUrl = process.env.NEXT_PUBLIC_API_ASSETS_BASE_URL;
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
  },
];

if (assetBaseUrl) {
  try {
    const url = new URL(assetBaseUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname}/**`,
    });
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_API_ASSETS_BASE_URL:', error);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
