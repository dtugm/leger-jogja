import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  transpilePackages: ["cesium", "resium"],

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          svgoConfig: {
            plugins: [{
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupIds: false
                }
              }
            }]
          }
        }
      }]
    });
    return config;
  }
};

export default nextConfig;