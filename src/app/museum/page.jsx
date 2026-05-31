"use client";

// 미술관 — 프로젝트 전시 (읽기 전용)
// dash(/admin/dash)에서 등록한 village_projects 데이터를 표시

import { useState, useEffect } from "react";
import BackToSquare from "@/components/BackToSquare";
import PageBackground from "@/components/PageBackground";
import { supabase } from "@/lib/supabase";

const toMonthLabel = (d) => {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${y}년 ${parseInt(m)}월`;
};

const STATUS = {
  wip:  { label: "진행중",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  done: { label: "완료",     color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  idea: { label: "아이디어", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

// 아이디어 상태는 전시실에서 숨김
const FILTERS = [
  { label: "완료",   value: "done" },
  { label: "진행중", value: "wip"  },
  { label: "전체",   value: null   },
];

const PANEL = {
  background:     "rgba(10,14,30,0.55)",
  backdropFilter: "blur(12px)",
  border:         "1px solid rgba(96,165,250,0.2)",
  borderRadius:   "16px",
  padding:        "20px",
};

export default function MuseumPage() {
  const [activeFilter, setActiveFilter] = useState("done"); // 기본: 완료 프로젝트
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("village_projects")
        .select("*")
        .order("created_at");
      if (data) setProjects(data.map((p) => ({
        id:           p.id,
        title:        p.name,
        desc:         p.description || "",
        status:       p.status || "wip",
        color:        p.color || "#60a5fa",
        pinned:       p.pinned || false,
        startDate:    p.start_date || "",
        endDate:      p.end_date || "",
        url:          p.url || "",
        thumbnailUrl: p.thumbnail_url || "",
        createdAt:    p.created_at,
      })));
      setLoading(false);
    };
    load();
  }, []);

  // 정렬: 고정 → 완료(최신순) → 진행중(최신순)
  const sorted = [...projects]
    .filter((p) => p.status !== "idea")
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.status !== b.status) {
        if (a.status === "done") return -1;
        if (b.status === "done") return 1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const filtered = activeFilter
    ? sorted.filter((p) => p.status === activeFilter)
    : sorted;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <PageBackground src="/images/museum.png" overlay="rgba(5,10,25,0.35)" />

      <div className="relative z-10 h-full overflow-y-scroll flex flex-col items-center p-8 gap-6"
        style={{ background: "rgba(5,10,25,0.35)" }}>

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
                className="px-4 py-1.5 rounded-full text-xs font-medium transition"
                style={{
                  background: active ? "rgba(96,165,250,0.2)"  : "rgba(255,255,255,0.06)",
                  color:      active ? "#60a5fa"                : "rgba(255,255,255,0.5)",
                  border:    `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* 프로젝트 그리드 */}
        {loading ? (
          <p className="text-blue-200/30 text-sm">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div className="w-full max-w-2xl" style={PANEL}>
            <p className="text-blue-200/30 text-sm text-center py-4">
              {projects.length === 0 ? "내 방 → 대시보드에서 프로젝트를 추가해보세요" : "해당 상태의 프로젝트가 없어요"}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
            {filtered.map((p) => {
              const st = STATUS[p.status] ?? STATUS.wip;

              /* 공통 카드 내부 콘텐츠 */
              const inner = (
                <>
                  {/* 썸네일 */}
                  <div className="h-28 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🖼️</span>
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {p.pinned && <span style={{ fontSize: 11 }}>📌</span>}
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || st.color }} />
                        <p className="text-white text-sm font-semibold">{p.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.url && <span style={{ fontSize: 11, opacity: 0.6 }}>🔗</span>}
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    {p.desc && <p className="text-white/50 text-xs">{p.desc}</p>}
                    {(p.startDate || p.endDate) && (
                      <p className="text-xs" style={{ color: "rgba(96,165,250,0.5)" }}>
                        {toMonthLabel(p.startDate) || "?"} ~ {toMonthLabel(p.endDate) || "진행중"}
                      </p>
                    )}
                  </div>
                </>
              );

              return p.url ? (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                  style={PANEL}
                  className="flex flex-col gap-3 hover:border-blue-400/40 transition cursor-pointer group no-underline">
                  {inner}
                </a>
              ) : (
                <div key={p.id} style={PANEL}
                  className="flex flex-col gap-3 hover:border-blue-400/40 transition group">
                  {inner}
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
