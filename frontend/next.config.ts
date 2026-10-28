import type { NextConfig } from "next";
import os from "os";

function getLocalIpAddresses(): string[] {
  const addresses: string[] = ["localhost", "127.0.0.1", "192.168.20.167"];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  } catch {}
  return Array.from(new Set(addresses));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalIpAddresses(),
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/peta",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

