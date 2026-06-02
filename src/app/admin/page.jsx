"use client";

// 내 방 (Admin) — 허브 페이지
// greenhouse(온실) / dash(대시보드) / study(기록) 진입점

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BackToSquare from "@/components/BackToSquare";

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
  const router = useRouter();

  /* ─── 비밀번호 모달 상태 ─── */
  const [locked,  setLocked]  = useState(true);
  const [pw,      setPw]      = useState("");
  const [shake,   setShake]   = useState(false);
  const inputRef = useRef(null);

  /* ─── 튜토리얼 상태 ─── */
  const [hoveredId, setHoveredId] = useState(null);
  const [tutStep,   setTutStep]   = useState(0);
  const [tutDone,   setTutDone]   = useState(true);

  /* 세션 내 인증 여부 확인 — 이미 입장한 적 있으면 모달 스킵 */
  useEffect(() => {
    if (sessionStorage.getItem("admin-unlocked")) {
      setLocked(false);
    }
  }, []);

  /* 모달 열릴 때 input 포커스 */
  useEffect(() => {
    if (locked) setTimeout(() => inputRef.current?.focus(), 80);
  }, [locked]);

  /* 첫 방문 튜토리얼 */
  useEffect(() => {
    if (!locked && !localStorage.getItem("admin-tutorial-seen")) {
      setTutDone(false);
    }
  }, [locked]);

  /* ─── 입장 처리 (mock: 아무거나 입력하면 통과) ─── */
  const handleEnter = (e) => {
    e?.preventDefault();
    if (!pw.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    sessionStorage.setItem("admin-unlocked", "1");
    setLocked(false);
  };

  const finishTutorial = () => {
    localStorage.setItem("admin-tutorial-seen", "1");
    setTutDone(true);
  };

  const current    = STEPS[tutStep];
  const isLastStep = tutStep === STEPS.length - 1;
  const highlightId = !tutDone ? current.id : null;

  return (
    <main className="relative w-full h-screen overflow-hidden" style={BG_STYLE}>

      {/* ── 비밀번호 모달 ── */}
      {locked && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(4,8,16,0.72)", backdropFilter: "blur(6px)" }}
        >
          <form
            onSubmit={handleEnter}
            style={{
              display:        "flex",
              flexDirection:  "column",
              gap:            14,
              background:     "rgba(8,16,40,0.85)",
              backdropFilter: "blur(20px)",
              border:         "1px solid rgba(96,165,250,0.2)",
              borderRadius:   18,
              padding:        "36px 40px",
              minWidth:       280,
              boxShadow:      "0 8px 40px rgba(0,0,0,0.6)",
              transform:      shake ? "translateX(0)" : undefined,
              animation:      shake ? "shake 0.35s ease" : undefined,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <p style={{ fontSize: 28, marginBottom: 6 }}>🏠</p>
              <h1 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>내 방</h1>
              <p style={{ color: "rgba(96,165,250,0.4)", fontSize: 11, marginTop: 4 }}>
                비공개 공간입니다
              </p>
            </div>

            <input
              ref={inputRef}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              autoComplete="off"
              style={{
                background:   "rgba(255,255,255,0.05)",
                border:       "1px solid rgba(96,165,250,0.2)",
                borderRadius: 8,
                padding:      "10px 14px",
                color:        "#e2e8f0",
                fontSize:     13,
                outline:      "none",
                width:        "100%",
                boxSizing:    "border-box",
              }}
            />

            <button
              type="submit"
              style={{
                background:   "rgba(96,165,250,0.18)",
                border:       "1px solid rgba(96,165,250,0.35)",
                borderRadius: 8,
                padding:      "10px",
                color:        "#60a5fa",
                fontWeight:   600,
                fontSize:     13,
                cursor:       "pointer",
                transition:   "opacity 0.15s",
              }}
            >
              입장
            </button>
          </form>

          {/* shake 애니메이션 */}
          <style>{`
            @keyframes shake {
              0%,100% { transform: translateX(0); }
              20%      { transform: translateX(-8px); }
              40%      { transform: translateX(8px); }
              60%      { transform: translateX(-6px); }
              80%      { transform: translateX(6px); }
            }
          `}</style>
        </div>
      )}

      {/* ── 방 콘텐츠 (잠금 해제 후) ── */}
      {!locked && (
        <>
          {/* 튜토리얼 dim 오버레이 */}
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

          {/* 튜토리얼 카드 */}
          {!tutDone && (
            <div
              className="fixed bottom-20 right-6 z-30 flex flex-col gap-3"
              style={{ width: 240 }}
            >
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
                <p
                  className="font-bold text-sm mb-1.5"
                  style={{ color: current.color, fontFamily: "var(--font-display)" }}
                >
                  {current.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(245,230,200,0.7)", whiteSpace: "pre-line" }}
                >
                  {current.desc}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => tutStep === 0 ? finishTutorial() : setTutStep((s) => s - 1)}
                    className="text-xs transition hover:opacity-80"
                    style={{ color: "rgba(245,230,200,0.35)" }}
                  >
                    {tutStep === 0 ? "건너뛰기" : "← 이전"}
                  </button>
                  <button
                    onClick={() => isLastStep ? finishTutorial() : setTutStep((s) => s + 1)}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full transition hover:opacity-90 active:scale-95"
                    style={{ background: current.color, color: "#0a0806" }}
                  >
                    {isLastStep ? "완료" : "다음 →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 튜토리얼 다시보기 */}
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
        </>
      )}
    </main>
  );
}
