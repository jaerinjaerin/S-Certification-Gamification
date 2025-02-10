/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

const hasBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== "" &&
  process.env.NEXT_PUBLIC_BASE_PATH != null;

const nextConfig = {
  assetPrefix: hasBasePath ? "/certification" : "",
  basePath: hasBasePath ? "/certification" : "",
  productionBrowserSourceMaps: false,

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
            drop_console: process.env.ENV === "production", // // console.log를 제거하지 않음
          },
        };
      }
    }

    return config;
  },
};

if (process.env.ENV === "production" || process.env.ENV === "staging") {
  nextConfig.compiler = {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  };
}

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
