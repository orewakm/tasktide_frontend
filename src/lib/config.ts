// Where the API lives, e.g. http://localhost:8000 in development.
// Left empty in production: Caddy serves the app and the API on the same domain,
// so requests go to /api on the current origin.
// TR: API'nin adresi, örneğin geliştirmede http://localhost:8000.
// TR: Production'da boş bırakılır: Caddy uygulamayı ve API'yi aynı domain'de sunar,
// TR: bu yüzden istekler mevcut origin'deki /api'ye gider.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
