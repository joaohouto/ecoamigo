import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withSerwistConfig = withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Em dev o SW é desabilitado para não interferir no HMR
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withSerwistConfig(nextConfig);
