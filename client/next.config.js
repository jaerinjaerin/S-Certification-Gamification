/** @type {import('next').NextConfig} */
// module.exports = {
//   // reactStrictMode: false,
//   productionBrowserSourceMaps: true,
// };

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({});
