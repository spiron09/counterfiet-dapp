import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'indigo-genuine-dragon-487.mypinata.cloud',
            port: '',
            pathname: '/ipfs/**',
          },
        ],
      },
};

export default nextConfig;
