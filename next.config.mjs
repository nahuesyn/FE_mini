/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",      // 정적 파일로 빌드 (out/ 폴더)
  trailingSlash: true,   // /garden → /garden/index.html (Cloudflare Pages 호환)
  images: {
    unoptimized: true,   // 정적 export 시 이미지 최적화 서버 불필요
  },
};

export default nextConfig;
