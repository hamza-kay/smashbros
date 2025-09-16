/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.grubify.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'api.ramtd.net',
      },
      {
  protocol: 'https',
  hostname: 'grubify-app-artifacts.s3.eu-west-2.amazonaws.com',
}
    ],
  },
};

export default nextConfig;
