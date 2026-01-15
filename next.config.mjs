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
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    outputFileTracingRoot: process.cwd(),
    experimental: {
        serverActions: {
            bodySizeLimit: '1gb',
        },
        proxyClientMaxBodySize: '1gb',
    },
};

export default nextConfig;
