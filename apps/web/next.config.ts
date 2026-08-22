import type {
  NextConfig,
} from 'next';

const controlPlaneUrl =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

const nextConfig:
  NextConfig = {
  async rewrites() {
    return [
      {
        source:
          '/api/auth/:path*',

        destination:
          `${controlPlaneUrl}/api/auth/:path*`,
      },

      {
        source:
          '/api/control-plane/:path*',

        destination:
          `${controlPlaneUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
