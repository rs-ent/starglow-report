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
            'i.scdn.co',
        ],
    },
    webpack(config) {
        config.module.rules.push({
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                // 필요하다면 SVGR 옵션 추가
              },
            },
          ],
        });
        return config;
    },
};

export default nextConfig;