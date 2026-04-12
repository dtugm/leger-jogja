import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  transpilePackages: ["cesium", "resium"],
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/dashboard/default",
  //       permanent: false,
  //     },
  //   ];
  // },
};

export default nextConfig;
