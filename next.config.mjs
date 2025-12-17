/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: '**.clerk.com',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
