import "../styles/globals.css";

export const metadata = {
  title: "My Village 🏡",
  description: "인터랙티브 마을을 탐험하며 발견하는 포트폴리오",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — 한국어 최적화 가변 폰트 CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        {children}

        {/*
          [SkyviewButton] — 우하단 고정, 전역 공통 UI
          - 모든 페이지에서 항상 표시
          - 클릭 시 전체 마을 지도(skyview) 오버레이
          - 추후 components/ui/SkyviewButton.jsx 로 분리 예정
          - 위치: fixed bottom-6 right-6 z-50
        */}
      </body>
    </html>
  );
}
