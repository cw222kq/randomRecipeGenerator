import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
        port: '',
        pathname: '/recipes/**',
      },
    ],
  },
}

export default nextConfig
