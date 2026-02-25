import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Use project directory so Next.js doesn't infer parent (avoids "multiple lockfiles" warning)
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
