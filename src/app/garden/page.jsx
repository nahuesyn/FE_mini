"use client";

// 정원 — 공부시간 나무
// 온실(/greenhouse) 기록 → study_sessions 테이블 → 나무로 시각화
// TODO: Supabase study_sessions 연동

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackToSquare from "@/components/BackToSquare";
import PageBackground from "@/components/PageBackground";
import { SUBJECTS as SUBJECT_LIST } from "@/lib/subjects";

/* ─── 상수 ─── */
const BG_STYLE = {
  backgroundImage: "url('/images/garden.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const PANEL = {
  background: "rgba(6,18,10,0.55)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(74,222,128,0.18)",
  borderRadius: "16px",
  padding: "20px",
};

const SUBJECT_COLORS = Object.fromEntries(SUBJECT_LIST.map((s) => [s.name, s.color]));

/* ─── Mock 데이터 (TODO: Supabase study_sessions) ─── */
// 이번 주 (월~일) 과목별 공부 초
const MOCK_WEEK = [
  { day: "월", sessions: [{ subject: "수학", seconds: 3600 }, { subject: "코딩", seconds: 1800 }] },
  { day: "화", sessions: [{ subject: "수학", seconds: 7200 }, { subject: "영어", seconds: 3600 }] },
  { day: "수", sessions: [{ subject: "코딩", seconds: 5400 }] },
  { day: "목", sessions: [{ subject: "수학", seconds: 3600 }, { subject: "코딩", seconds: 7200 }, { subject: "영어", seconds: 1800 }] },
  { day: "금", sessions: [{ subject: "코딩", seconds: 3600 }, { subject: "영어", seconds: 3600 }] },
  { day: "토", sessions: [{ subject: "수학", seconds: 1800 }] },
  { day: "일", sessions: [] },
];

// 이번 달 주차별 총 초
const MOCK_MONTH_WEEKS = [
  { label: "1주", totalSec: 28800 },
  { label: "2주", totalSec: 54000 },
  { label: "3주", totalSec: 43200 },
  { label: "4주", totalSec: 72000 },
];

/* ─── 유틸 ─── */
const fmtH = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

/* ─── 나무 SVG ─── */
// totalSec → 나무 크기 단계 0~4
function TreeSVG({ totalSec }) {
  const hours = totalSec / 3600;
  // 단계: 0 = 새싹, 1 = 작은, 2 = 중간, 3 = 큰, 4 = 거대
  const stage = hours < 1 ? 0 : hours < 5 ? 1 : hours < 10 ? 2 : hours < 20 ? 3 : 4;

  const trunk = { w: [4, 5, 6, 7, 8][stage], h: [10, 18, 26, 34, 42][stage] };
  const layers = [
    { w: [20, 30, 44, 58, 72][stage], h: [14, 20, 30, 40, 52][stage], yOff: 0 },
    { w: [14, 22, 32, 44, 56][stage], h: [10, 15, 22, 30, 40][stage], yOff: [7, 10, 15, 20, 26][stage] },
    { w: [8,  14, 20, 30, 40][stage], h: [6,  10, 14, 20, 28][stage], yOff: [13, 20, 30, 40, 52][stage] },
  ];

  const totalH = trunk.h + (layers[2].yOff + layers[2].h) + 10;
  const cx = 80;
  const base = totalH + 5;

  return (
    <svg width="160" height={totalH + 15} viewBox={`0 0 160 ${totalH + 15}`}>
      {/* 줄기 */}
      <rect
        x={cx - trunk.w / 2} y={base - trunk.h}
        width={trunk.w} height={trunk.h}
        rx={trunk.w / 2}
        fill="#7a5c3a" opacity={0.85}
      />
      {/* 잎 레이어 (아래 → 위) */}
      {layers.map((l, i) => (
        <ellipse key={i}
          cx={cx}
          cy={base - trunk.h - l.yOff - l.h / 2}
          rx={l.w / 2} ry={l.h / 2}
          fill={["#22c55e", "#4ade80", "#86efac"][i]}
          opacity={0.78 - i * 0.05}
        />
      ))}
      {/* 총 시간 텍스트 */}
      {stage >= 1 && (
        <text
          x={cx} y={base - trunk.h - layers[0].yOff - layers[0].h / 2 + 4}
          textAnchor="middle"
          fontSize={10} fontWeight="600" fill="#fff" opacity={0.9}>
          {fmtH(totalSec)}
        </text>
      )}
      {/* 새싹 (stage 0) */}
      {stage === 0 && (
        <text x={cx} y={base - trunk.h - 8} textAnchor="middle" fontSize={18}>🌱</text>
      )}
    </svg>
  );
}

/* ─── 메인 페이지 ─── */
export default function GardenPage() {
  const router = useRouter();
  const [view, setView] = useState("주"); // "주" | "월"

  /* 이번 주 데이터 */
  const weekTotals = MOCK_WEEK.map((d) => ({
    day:      d.day,
    totalSec: d.sessions.reduce((a, s) => a + s.seconds, 0),
    sessions: d.sessions,
  }));
  const weekTotal  = weekTotals.reduce((a, d) => a + d.totalSec, 0);
  const weekMax    = Math.max(...weekTotals.map((d) => d.totalSec), 1);

  /* 이번 달 데이터 */
  const monthTotal = MOCK_MONTH_WEEKS.reduce((a, w) => a + w.totalSec, 0);
  const monthMax   = Math.max(...MOCK_MONTH_WEEKS.map((w) => w.totalSec), 1);

  const displayTotal = view === "주" ? weekTotal : monthTotal;

  /* 과목별 합계 (주간) */
  const subjectMap = weekTotals.flatMap((d) => d.sessions).reduce((acc, { subject, seconds }) => {
    acc[subject] = (acc[subject] || 0) + seconds;
    return acc;
  }, {});

  return (
    <main className="relative w-full min-h-screen overflow-y-scroll">
      <PageBackground src="/images/garden.png" overlay="rgba(3,12,6,0.52)" />

      <div className="relative z-10 flex flex-col items-center p-8 gap-6 min-h-screen">

        {/* 헤더 + 토글 */}
        <div className="w-full max-w-xl flex items-end justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
              🌳 공부 나무
            </h1>
            <p className="text-green-200/60 text-sm mt-1">공부할수록 자라는 나의 나무</p>
          </div>
          {/* 주 / 월 토글 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}>
            {["주", "월"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: view === v ? "rgba(74,222,128,0.22)" : "transparent",
                  color:      view === v ? "#4ade80" : "rgba(74,222,128,0.4)",
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 나무 + 총 시간 */}
        <div className="w-full max-w-xl" style={PANEL}>
          <div className="flex flex-col items-center gap-3">
            <p className="text-green-200/40 text-xs self-start">
              {view === "주" ? "이번 주 나무" : "이번 달 나무"}
            </p>
            <TreeSVG totalSec={displayTotal} />
            <div className="text-center">
              <p className="text-green-300 text-2xl font-bold">{fmtH(displayTotal)}</p>
              <p className="text-green-200/40 text-xs mt-0.5">
                {view === "주" ? "이번 주 총 공부 시간" : "이번 달 총 공부 시간"}
              </p>
            </div>
          </div>
        </div>

        {/* 요일별 막대 (주 뷰) */}
        {view === "주" && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-4">요일별 공부 시간</p>
            <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
              {weekTotals.map(({ day, totalSec: sec }) => {
                const pct    = sec / weekMax;
                const barH   = Math.max(pct * 80, sec > 0 ? 6 : 2);
                const greens = ["#86efac", "#4ade80", "#22c55e"];
                const color  = sec === 0 ? "rgba(74,222,128,0.1)"
                  : pct > 0.7 ? greens[2] : pct > 0.4 ? greens[1] : greens[0];

                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    {sec > 0 && (
                      <span className="text-green-300/60 text-xs font-mono">{fmtH(sec)}</span>
                    )}
                    <div className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height:     barH,
                        background: color,
                        border:     sec === 0 ? "1px dashed rgba(74,222,128,0.2)" : "none",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                    <span className="text-green-200/50 text-xs">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 주차별 막대 (월 뷰) */}
        {view === "월" && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-4">주차별 공부 시간</p>
            <div className="flex flex-col gap-3">
              {MOCK_MONTH_WEEKS.map(({ label, totalSec: sec }) => {
                const pct = sec / monthMax;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs w-6 shrink-0" style={{ color: "rgba(74,222,128,0.6)" }}>{label}</span>
                    <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: "rgba(74,222,128,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct * 100}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", opacity: 0.8 }} />
                    </div>
                    <span className="text-xs w-14 text-right" style={{ color: "rgba(74,222,128,0.5)" }}>{fmtH(sec)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 과목별 합계 (주 뷰) */}
        {view === "주" && Object.keys(subjectMap).length > 0 && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-3">과목별 이번 주</p>
            <div className="flex flex-col gap-2.5">
              {Object.entries(subjectMap).map(([subj, sec]) => {
                const color = SUBJECT_COLORS[subj] || "#94a3b8";
                const pct   = sec / weekTotal;
                return (
                  <div key={subj} className="flex items-center gap-3">
                    <span className="text-xs w-8 shrink-0" style={{ color }}>{subj}</span>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct * 100}%`, background: color, opacity: 0.7 }} />
                    </div>
                    <span className="text-xs w-12 text-right" style={{ color: "rgba(255,255,255,0.35)" }}>{fmtH(sec)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <BackToSquare />
    </main>
  );
}
