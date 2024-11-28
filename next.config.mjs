/** @type {import('next').NextConfig} */
import 'dotenv/config';

const nextConfig = {
    env: {
        NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'cdnimg.melon.co.kr',
            'search.pstatic.net',
        ],
    },
};

export default nextConfig;