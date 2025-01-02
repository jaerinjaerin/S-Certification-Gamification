/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

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
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     const TerserPlugin = config.optimization.minimizer.find(
  //       (plugin) => plugin.constructor.name === "TerserPlugin"
  //     );

  //     if (TerserPlugin) {
  //       TerserPlugin.options.terserOptions = {
  //         ...TerserPlugin.options.terserOptions,
  //         compress: {
  //           ...TerserPlugin.options.terserOptions.compress,
  //           drop_console: false, // console.log를 제거하지 않음
  //         },
  //       };
  //     }
  //   }

  //   return config;
  // },
};

const sentryConfig = {
  org: "bien-pr",
  project: "samsung-plus-certification-gamification",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(withNextIntl(nextConfig), sentryConfig);
