/** @type {import('next').NextConfig} */
// module.exports = {
//   // reactStrictMode: false,
//   productionBrowserSourceMaps: true,
// };

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });
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

console.log("isProduction", isProduction);

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Terser 플러그인 설정 수정
      const TerserPlugin = config.optimization.minimizer.find(
        (plugin) => plugin.constructor.name === "TerserPlugin"
      );

      if (TerserPlugin) {
        TerserPlugin.options.terserOptions = {
          ...TerserPlugin.options.terserOptions,
          compress: {
            ...TerserPlugin.options.terserOptions.compress,
            drop_console: false, // console.log를 제거하지 않음
          },
        };
      }
    }

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
