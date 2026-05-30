"use client";

import { useRouter } from "next/navigation";

/**
 * 광장으로 돌아가기 버튼
 * 페이지 하단 중앙에 fixed로 표시
 */
export default function BackToSquare() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-2 px-5 py-2.5 rounded-full
                 text-xs font-medium transition-all duration-200
                 hover:scale-105 active:scale-95"
      style={{
        background:    "rgba(255,255,255,0.07)",
        border:        "1px solid rgba(255,255,255,0.18)",
        color:         "rgba(255,255,255,0.65)",
        backdropFilter:"blur(12px)",
        boxShadow:     "0 4px 20px rgba(0,0,0,0.35)",
      }}
    >
      광장으로 돌아가기
    </button>
  );
}
