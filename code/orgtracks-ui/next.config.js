/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_BASE_URL: 'http://localhost:3001/api' || 'https://orgtracks-api.onrender.com/api'
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            port: '',
            pathname: '/a/**',
          },
        ],
      },
}

module.exports = nextConfig
