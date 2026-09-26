import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages serves static assets natively. The app has no server
  // routes, middleware, or next/image usage, so a full static export works
  // and avoids needing the @cloudflare/next-on-pages adapter (which does not
  // yet support Next 16).
  output: "export",
  images: {
    // Required for `output: "export"` if next/image is adopted later.
    unoptimized: true,
  },
};

export default nextConfig;
