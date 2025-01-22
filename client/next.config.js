/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

const hasBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== "" &&
  process.env.NEXT_PUBLIC_BASE_PATH != null;

// console.log("hasBasePath", hasBasePath);

const nextConfig = {
  assetPrefix: hasBasePath ? "/certification" : "",
  basePath: hasBasePath ? "/certification" : "",
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "assets-stage.samsungplus.net",
  //     },
  //   ],
  // },
  async headers() {
    return [
      {
        source: "/api/:path*", // `/api` 하위 모든 경로에 적용
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_API_URL,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  rewrites() {
    return hasBasePath
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
      const TerserPlugin = config.optimization.minimizer.find(
        (plugin) => plugin.constructor.name === "TerserPlugin"
      );

      if (TerserPlugin) {
        TerserPlugin.options.terserOptions = {
          ...TerserPlugin.options.terserOptions,
          compress: {
            ...TerserPlugin.options.terserOptions.compress,
            drop_console: false, // // console.log를 제거하지 않음
          },
        };
      }
    }

    return config;
  },
};

// if (process.env.ENV === "production") {
//   nextConfig.compiler = {
//     removeConsole: {
//       exclude: ["error", "warn", "info"],
//     },
//   };
// }

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
