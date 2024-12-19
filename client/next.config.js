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
            drop_console: false, // console.log를 제거하지 않음
          },
        };
      }
    }

    return config;
  },
};

const sentryConfig = {
  org: "bnpr",
  project: "splus-certification-nextjs",
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

// /** @type {import('next').NextConfig} */
// // module.exports = {
// //   // reactStrictMode: false,
// //   productionBrowserSourceMaps: true,
// // };

// const { withSentryConfig } = require("@sentry/nextjs");

// const createNextIntlPlugin = require("next-intl/plugin");
// const withNextIntl = createNextIntlPlugin();
// // const withBundleAnalyzer = require("@next/bundle-analyzer")({
// //   enabled: process.env.ANALYZE === "true",
// // });
// // module.exports = withBundleAnalyzer({});
// // module.exports = withBundleAnalyzer(
// //   withNextIntl({
// //     basePath: "/path",
// //     images: {
// //       remotePatterns: [
// //         {
// //           protocol: "https",
// //           hostname: "assets-stage.samsungplus.net",
// //         },
// //       ],
// //     },
// //   })
// // );

// const isProduction = process.env.NODE_ENV === "production";

// console.log("isProduction", isProduction);

// const nextConfig = {
//   assetPrefix: isProduction ? "/certification" : "",
//   basePath: isProduction ? "/certification" : "",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "assets-stage.samsungplus.net",
//       },
//     ],
//   },
//   rewrites() {
//     return isProduction
//       ? [
//           {
//             source: "/certification/_next/:path*",
//             destination: "/_next/:path*",
//           },
//         ]
//       : [];
//   },
//   webpack: (config, { isServer }) => {
//     if (!isServer) {
//       // Terser 플러그인 설정 수정
//       const TerserPlugin = config.optimization.minimizer.find(
//         (plugin) => plugin.constructor.name === "TerserPlugin"
//       );

//       if (TerserPlugin) {
//         TerserPlugin.options.terserOptions = {
//           ...TerserPlugin.options.terserOptions,
//           compress: {
//             ...TerserPlugin.options.terserOptions.compress,
//             drop_console: false, // console.log를 제거하지 않음
//           },
//         };
//       }
//     }

//     return config;
//   },
// };

// module.exports = withNextIntl(nextConfig);

// // Injected content via Sentry wizard below

// const { withSentryConfig } = require("@sentry/nextjs");

// module.exports = withSentryConfig(
//   module.exports,
//   {
//     // For all available options, see:
//     // https://github.com/getsentry/sentry-webpack-plugin#options

//     org: "bnpr",
//     project: "splus-certification-nextjs",

//     // Only print logs for uploading source maps in CI
//     silent: !process.env.CI,

//     // For all available options, see:
//     // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//     // Upload a larger set of source maps for prettier stack traces (increases build time)
//     widenClientFileUpload: true,

//     // Automatically annotate React components to show their full name in breadcrumbs and session replay
//     reactComponentAnnotation: {
//       enabled: true,
//     },

//     // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//     // This can increase your server load as well as your hosting bill.
//     // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//     // side errors will fail.
//     tunnelRoute: "/monitoring",

//     // Hides source maps from generated client bundles
//     hideSourceMaps: true,

//     // Automatically tree-shake Sentry logger statements to reduce bundle size
//     disableLogger: true,

//     // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//     // See the following for more information:
//     // https://docs.sentry.io/product/crons/
//     // https://vercel.com/docs/cron-jobs
//     automaticVercelMonitors: true,
//   }
// );
