/** @type {import('next').NextConfig} */

const path = require("path");
// load root .env file
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig = {
  reactStrictMode: true,
  //   to temprory ignore eslint error on build
  //   eslint: {
  //     ignoreDuringBuilds: true,
  //   },
  strictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
