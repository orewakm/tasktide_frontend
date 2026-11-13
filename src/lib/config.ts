const DEV_API_URL = 'http://localhost:8000';

export const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? DEV_API_URL : '')
).replace(/\/+$/, '');
