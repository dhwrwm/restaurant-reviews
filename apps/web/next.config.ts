import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["types"],
  images: {
    // previewImageUrl is arbitrary user input (see restaurants DTOs), so we
    // can't allowlist specific hosts here — but restricting to https closes
    // off the most common SSRF targets (cloud metadata endpoints, internal
    // services) which are almost always served over plain http.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
