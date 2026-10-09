import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // dynamicStartUrl adds a start-url route whose async cacheWillUpdate
  // references _async_to_generator, which is not bundled into sw.js
  // (known @ducanh2912/next-pwa issue). The default "pages" route
  // already covers "/", so disabling it loses nothing.
  dynamicStartUrl: false,
})(nextConfig);
