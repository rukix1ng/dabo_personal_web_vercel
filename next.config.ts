import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images for SEO
  images: {
    // Disable AVIF to save CPU (it's very expensive to compress)
    formats: ['image/webp'],
    // Reduce number of device sizes to generate fewer variants
    deviceSizes: [640, 1080, 1920], // 减少到3个尺寸以降低CPU负载
    imageSizes: [32, 64, 96], // 减少到3个尺寸
    minimumCacheTTL: 86400, // 缓存24小时
    // Allow images from Qiniu cloud storage
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'tb7l8osfp.hd-bkt.clouddn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tb7l8osfp.hd-bkt.clouddn.com',
        pathname: '/**',
      },
      // Temporary: allow old S3 domain for existing images
      {
        protocol: 'https',
        hostname: 'dabowebsite.s3.cn-east-1.qiniucs.com',
        pathname: '/**',
      },
    ],
  },
  // Enable compression for better performance
  compress: true,
  // Optimize build performance
  experimental: {
    // 启用并行构建（如果支持）
    optimizePackageImports: ['lucide-react'],
  },
  // 优化构建性能
  typescript: {
    // 构建时不进行类型检查（类型检查在开发时进行）
    ignoreBuildErrors: false,
  },
  // Note: ESLint 配置已移除，Next.js 16 不再支持在 next.config.ts 中配置 ESLint
  // ESLint 检查通过 'next lint' 命令或 IDE 插件进行
  // Note: swcMinify is enabled by default in Next.js 16, no need to specify
};

export default nextConfig;
