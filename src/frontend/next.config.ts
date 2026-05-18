import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  transpilePackages: ["cesium", "resium"],

  webpack(config) {
    /**
     * Cesium's pre-built bundles (Build/Cesium/index.js, transcodeKTX2.js, …)
     * embed WASM binary data as raw bytes inside template literals, e.g.
     *   `\0asm\x01\0\0\0…`
     * SWC / webpack parse these in strict mode and throw:
     *   "Octal escape sequences are not allowed in template strings"
     *
     * These files are copied to /public/cesium/ and served as static assets —
     * webpack should never bundle them. Marking them as noParse + externals
     * prevents any attempted transpilation.
     */
    const cjsNoParse = Array.isArray(config.module.noParse)
      ? config.module.noParse
      : config.module.noParse
        ? [config.module.noParse]
        : [];

    config.module.noParse = [...cjsNoParse, /cesium[\/\\]Build[\/\\]/];

    /**
     * Cesium workers and WASM files are loaded at runtime from /public/cesium.
     * Exclude them from the webpack bundle entirely.
     */
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      (
        { request }: { request?: string },
        callback: (err?: Error | null, result?: string) => void,
      ) => {
        if (request && /cesium\/Build\//.test(request)) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ];

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      cleanupIds: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
    return config;
  },

  turbopack: {
    root: path.join(__dirname, "..", ".."),

    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        cleanupIds: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
