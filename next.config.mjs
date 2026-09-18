/** @type {import('next').NextConfig} */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";
const staticBasePath = process.env.NEXT_STATIC_BASE_PATH ?? "/inspiration-shopify";

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: staticExport ? "export" : undefined,
  basePath: staticExport ? staticBasePath : undefined,
  assetPrefix: staticExport ? staticBasePath : undefined,
  trailingSlash: staticExport,
  experimental: {
    optimizePackageImports: ["@neondatabase/serverless"]
  }
};

export default nextConfig;
