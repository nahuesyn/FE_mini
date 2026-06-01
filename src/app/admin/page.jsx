"use client";

// 내 방 (Admin) — 허브 페이지
// greenhouse(온실) / dash(대시보드) / study(기록) 진입점

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackToSquare from "@/components/BackToSquare";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { supabase } from "@/lib/supabase";

const HOTSPOTS = [
  {
    id: "greenhouse",
    href: "/admin/greenhouse",
    color: "#4ade80",
    points:
      "1004,580 1334,635 1333,166 1328,120 1317,86 1299,54 1273,31 1239,19 1195,13 1155,12 1122,16 1092,26 1064,42 1040,63 1022,92 1010,132 1005,180",
  },
  {
    id: "dash",
    href: "/admin/dash",
    color: "#60a5fa",
    points:
      "65,75 434,125 435,433 74,466 49,460 47,113 33,86",
  },
  {
    id: "study",
    href: "/admin/study",
    color: "#f59e0b",
    points:
      "459,674 503,667 548,658 583,648 618,632 649,618 670,605 671,581 647,561 615,549 584,542 553,536 521,531 488,529 453,527 418,526 387,526 358,526 328,527 250,534 197,541 152,549 124,557 95,565 66,576 37,590 17,606 16,626 38,643 66,658 99,670 138,676 178,683 221,685 255,687 292,687 323,685 359,685 387,683 419,678",
  },
];

/* ─── 튜토리얼 단계 ─── */
const STEPS = [
  {
    id: null,
    color: "#C9A84C",
    title: "내 방에 오신 것을 환영해요!",
    desc: "이 방에는 세 가지 공간이 있어요.\n각 건물을 클릭하면 이동할 수 있어요.",
  },
  {
    id: "study",
    color: "#f59e0b",
    title: "📚 학습기록",
    desc: "오늘 공부한 내용을\n키워드와 함께 정리해요.",
  },
  {
    id: "greenhouse",
    color: "#4ade80",
    title: "🌿 온실",
    desc: "공부 타이머를 켜고\n과목별 시간을 기록해요.",
  },
  {
    id: "dash",
    color: "#60a5fa",
    title: "🏛️ 대시보드",
    desc: "투두 리스트, 캘린더, 프로젝트를\n한눈에 관리하는 공간이에요.",
  },
];

const BG_STYLE = {
  backgroundImage: "url('/images/myroom.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function AdminPage() {
  const authed = useAdminAuth();
  const [hoveredId,  setHoveredId]  = useState(null);
  const [tutStep,    setTutStep]    = useState(0);
  const [tutDone,    setTutDone]    = useState(true); // 기본은 숨김
  const router = useRouter();

  if (!authed) return null;

  // 첫 방문에만 튜토리얼 자동 시작
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin-tutorial-seen")) {
      setTutDone(false);
    }
  }, []);

  const finishTutorial = () => {
    localStorage.setItem("admin-tutorial-seen", "1");
    setTutDone(true);
  };

  const current    = STEPS[tutStep];
  const isLastStep = tutStep === STEPS.length - 1;

  /* 튜토리얼 단계에서 강조할 건물 id */
  const highlightId = !tutDone ? current.id : null;

  return (
    <main className="relative w-full h-screen overflow-hidden" style={BG_STYLE}>

      {/* ── 튜토리얼 오버레이 (비활성 영역 dim) ── */}
      {!tutDone && current.id && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
      )}

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 20 }}
        viewBox="0 0 1402 788"
        preserveAspectRatio="xMidYMid slice"
      >
        {HOTSPOTS.map((spot) => {
          const isHovered   = hoveredId === spot.id;
          const isHighlight = highlightId === spot.id;

          return (
            <g
              key={spot.id}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(spot.href)}
              onMouseEnter={() => setHoveredId(spot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <polygon
                points={spot.points}
                fill={spot.color}
                fillOpacity={isHighlight ? 0.28 : isHovered ? 0.22 : 0}
                stroke={spot.color}
                strokeWidth={isHighlight ? 3 : isHovered ? 2.5 : 0}
                strokeOpacity={isHighlight ? 0.9 : 1}
                style={{
                  filter: isHighlight
                    ? `drop-shadow(0 0 16px ${spot.color})`
                    : isHovered
                    ? `drop-shadow(0 0 8px ${spot.color})`
                    : "none",
                  transition: "fill-opacity 0.25s ease, filter 0.25s ease",
                  willChange: "fill-opacity, filter",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* ── 튜토리얼 카드 (우하단) ── */}
      {!tutDone && (
        <div
          className="fixed bottom-20 right-6 z-30 flex flex-col gap-3"
          style={{ width: 240 }}
        >
          {/* 단계 점 표시 */}
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width:  i === tutStep ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === tutStep ? current.color : "rgba(255,255,255,0.25)",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* 카드 본문 */}
          <div
            style={{
              background:    "rgba(10,8,6,0.82)",
              backdropFilter: "blur(16px)",
              border:        `1px solid ${current.color}44`,
              borderRadius:  "14px",
              padding:       "16px 18px",
              boxShadow:     `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${current.color}22`,
            }}
          >
            {/* 제목 */}
            <p
              className="font-bold text-sm mb-1.5"
              style={{ color: current.color, fontFamily: "var(--font-display)" }}
            >
              {current.title}
            </p>

            {/* 설명 */}
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(245,230,200,0.7)", whiteSpace: "pre-line" }}
            >
              {current.desc}
            </p>

            {/* 버튼 영역 */}
            <div className="flex items-center justify-between mt-4">
              {/* 건너뛰기 / 이전 */}
              <button
                onClick={() => tutStep === 0 ? finishTutorial() : setTutStep((s) => s - 1)}
                className="text-xs transition hover:opacity-80"
                style={{ color: "rgba(245,230,200,0.35)" }}
              >
                {tutStep === 0 ? "건너뛰기" : "← 이전"}
              </button>

              {/* 다음 / 완료 */}
              <button
                onClick={() => isLastStep ? finishTutorial() : setTutStep((s) => s + 1)}
                className="text-xs font-semibold px-4 py-1.5 rounded-full transition hover:opacity-90 active:scale-95"
                style={{
                  background: current.color,
                  color:      "#0a0806",
                }}
              >
                {isLastStep ? "완료" : "다음 →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 튜토리얼 다시보기 버튼 */}
      {tutDone && (
        <button
          onClick={() => { setTutStep(0); setTutDone(false); localStorage.removeItem("admin-tutorial-seen"); }}
          className="fixed bottom-20 right-6 z-30 text-xs px-3 py-1.5 rounded-full transition hover:opacity-80"
          style={{
            background:    "rgba(255,255,255,0.07)",
            border:        "1px solid rgba(255,255,255,0.18)",
            color:         "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          ? 도움말
        </button>
      )}

      <BackToSquare />

      {/* 로그아웃 */}
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          position: "fixed", bottom: 20, right: 72,
          background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 8, padding: "6px 12px",
          color: "rgba(248,113,113,0.6)", fontSize: 11, cursor: "pointer",
          backdropFilter: "blur(8px)", zIndex: 50,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.6)")}
      >
        로그아웃
      </button>
    </main>
  );
}
