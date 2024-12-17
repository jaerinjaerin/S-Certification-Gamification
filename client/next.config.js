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
module.exports = withBundleAnalyzer(
  withNextIntl({
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "assets-stage.samsungplus.net",
        },
      ],
    },
  })
);
