import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    // Builds a self-contained server in .next/standalone for the Docker image on the VDS.
    // TR: VDS'teki Docker imajı için .next/standalone içinde kendi kendine yeten bir sunucu üretir.
    output: 'standalone',
    experimental: {
        // Only bundle the icons we actually import.
        // TR: Sadece gerçekten import ettiğimiz ikonları pakete ekle.
        optimizePackageImports: ['@phosphor-icons/react'],
        // Pages after login render only in the browser (the token is in localStorage), so
        // the server can't prerender them. Only check pages that ask for it with `instant`.
        // TR: Girişten sonraki sayfalar sadece tarayıcıda render edilir (token localStorage'da),
        // TR: bu yüzden sunucu onları önceden render edemez. Sadece `instant` ile isteyen sayfaları kontrol et.
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
