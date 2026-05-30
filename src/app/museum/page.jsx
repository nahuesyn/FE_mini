"use client";

// 미술관 — 프로젝트 전시 (읽기 전용)
// dash(/admin/dash)에서 등록한 projects 데이터를 표시
// TODO: Supabase projects 테이블 연동

import { useState } from "react";
import BackToSquare from "@/components/BackToSquare";
import PageBackground from "@/components/PageBackground";

/* ─── Mock 데이터 (TODO: Supabase projects 연동) ─── */
const MOCK_PROJECTS = [
  { id: 1, title: "마을 포트폴리오", desc: "인터랙티브 마을 컨셉 포트폴리오", status: "wip",  tech: ["Next.js", "Tailwind", "GSAP"] },
  { id: 2, title: "날씨 앱",         desc: "Open Weather API 활용",           status: "done", tech: ["React", "Axios"] },
  { id: 3, title: "팀 협업 툴",      desc: "실시간 채팅 + 칸반보드",          status: "idea", tech: ["Socket.io"] },
];

const STATUS = {
  wip:  { label: "진행중",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  done: { label: "완료",     color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  idea: { label: "아이디어", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

// 아이디어 상태는 내 방(/admin/dash)에서만 확인 — 전시실에서는 숨김
const FILTERS = [
  { label: "전체",   value: null   },
  { label: "진행중", value: "wip"  },
  { label: "완료",   value: "done" },
];

const BG_STYLE = {
  backgroundImage: "url('/images/museum.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const PANEL = {
  background:    "rgba(10,14,30,0.55)",
  backdropFilter:"blur(12px)",
  border:        "1px solid rgba(96,165,250,0.2)",
  borderRadius:  "16px",
  padding:       "20px",
};

export default function MuseumPage() {
  const [activeFilter, setActiveFilter] = useState(null); // null = 전체

  // 아이디어 상태 프로젝트는 전시실에서 제외
  const visible  = MOCK_PROJECTS.filter((p) => p.status !== "idea");
  const filtered = activeFilter
    ? visible.filter((p) => p.status === activeFilter)
    : visible;

  return (
    <main className="relative w-full min-h-screen overflow-y-scroll">
      <PageBackground src="/images/museum.png" overlay="rgba(5,10,25,0.35)" />

      <div className="relative z-10 flex flex-col items-center p-8 gap-6 min-h-screen">

        {/* 헤더 */}
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            🏛️ 프로젝트 전시실
          </h1>
          <p className="text-blue-200/60 text-sm mt-1">작업한 프로젝트들을 한눈에</p>
        </div>

        {/* 필터 */}
        <div className="w-full max-w-2xl flex gap-2">
          {FILTERS.map((f) => {
            const active = activeFilter === f.value;
            return (
              <button key={f.label}
                onClick={() => setActiveFilter(f.value)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active ? "rgba(96,165,250,0.2)"        : "rgba(255,255,255,0.06)",
                  color:      active ? "#60a5fa"                      : "rgba(255,255,255,0.5)",
                  border:    `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* 프로젝트 그리드 */}
        {filtered.length === 0 ? (
          <div className="w-full max-w-2xl" style={PANEL}>
            <p className="text-blue-200/30 text-sm text-center py-4">해당 상태의 프로젝트가 없어요</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
            {filtered.map((p) => {
              const st = STATUS[p.status];
              return (
                <div key={p.id} style={PANEL}
                  className="flex flex-col gap-3 hover:border-blue-400/40 transition-all cursor-pointer group">
                  {/* 썸네일 */}
                  <div className="h-28 rounded-xl flex items-center justify-center text-4xl transition-transform group-hover:scale-105"
                    style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
                    🖼️
                  </div>
                  {/* 정보 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-semibold">{p.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <p className="text-white/50 text-xs">{p.desc}</p>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {p.tech.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-md"
                          style={{ background: "rgba(96,165,250,0.08)", color: "rgba(96,165,250,0.7)", border: "1px solid rgba(96,165,250,0.15)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <BackToSquare />
    </main>
  );
}
