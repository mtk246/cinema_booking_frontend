/** @type {import('next').NextConfig} */
const nextTranslate = require('next-translate-plugin');
const runtimeCaching = require("next-pwa/cache");
const withYAML = require('next-yaml');

const withPWA = require('next-pwa')({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withPWA(withYAML(nextTranslate({
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}))));
