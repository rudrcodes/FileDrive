/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "acoustic-kangaroo-501.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
