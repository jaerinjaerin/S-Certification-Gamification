/** @type {import('next').NextConfig} */
// module.exports = {
//   // reactStrictMode: false,
//   productionBrowserSourceMaps: true,
// };

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
// module.exports = withBundleAnalyzer({});
// module.exports = withBundleAnalyzer(
//   withNextIntl({
//     basePath: "/path",
//     images: {
//       remotePatterns: [
//         {
//           protocol: "https",
//           hostname: "assets-stage.samsungplus.net",
//         },
//       ],
//     },
//   })
// );

const isProduction = process.env.NODE_ENV === "production";

const nextConfig = {
  assetPrefix: isProduction ? "/certification" : "",
  basePath: isProduction ? "/certification" : "",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-stage.samsungplus.net",
      },
    ],
  },
  rewrites() {
    return isProduction
      ? [
          {
            source: "/certification/_next/:path*",
            destination: "/_next/:path*",
          },
        ]
      : [];
  },
};

module.exports = withNextIntl(nextConfig);
