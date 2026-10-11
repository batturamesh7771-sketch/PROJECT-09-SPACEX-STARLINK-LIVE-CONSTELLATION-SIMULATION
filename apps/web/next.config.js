const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Resolve cesium from wherever npm hoisted it
const cesiumSource = path.dirname(require.resolve('cesium/package.json'));
const cesiumBuild = path.join(cesiumSource, 'Build', 'Cesium');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable experimental lockfile patching that fails in npm workspaces
  experimental: {
    lockfilePatchPrompt: false,
  },
  env: {
    CESIUM_BASE_URL: '/cesium',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(cesiumBuild, 'Workers'),
              to: '../public/cesium/Workers',
              info: { minimized: true }
            },
            {
              from: path.join(cesiumBuild, 'ThirdParty'),
              to: '../public/cesium/ThirdParty',
              info: { minimized: true }
            },
            {
              from: path.join(cesiumBuild, 'Assets'),
              to: '../public/cesium/Assets',
              info: { minimized: true }
            },
            {
              from: path.join(cesiumBuild, 'Widgets'),
              to: '../public/cesium/Widgets',
              info: { minimized: true }
            }
          ],
        })
      );

      // Cesium relies on 'this' being window in some places
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
  // Transpile cesium and resium for Next.js
  transpilePackages: ['cesium', 'resium'],
};

module.exports = nextConfig;
