/** @type {import('next').NextConfig} */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";
const pagesBasePath = "/inspiration-shopify";

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: staticExport ? "export" : undefined,
  basePath: staticExport ? pagesBasePath : undefined,
  assetPrefix: staticExport ? pagesBasePath : undefined,
  trailingSlash: staticExport,
  experimental: {
    optimizePackageImports: ["@neondatabase/serverless"]
  }
};

export default nextConfig;
