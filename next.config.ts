// Next.js settings; output 'standalone' builds the self-contained server the Dockerfile runs.
// TR: Next.js ayarları; output 'standalone', Dockerfile'ın çalıştırdığı bağımsız sunucuyu üretir.
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['@phosphor-icons/react'],
        instantInsights: { validationLevel: 'manual-warning' },
    },
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
};

export default nextConfig;
