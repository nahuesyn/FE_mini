"use client";

// 온실 — 공부시간 타이머
// 기록 저장 → 정원(/garden)에서 나무로 시각화

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS } from "@/lib/subjects";

const CARD    = { background: "rgba(245,230,200,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "12px", padding: "16px" };
const PAGE_BG = { background: "radial-gradient(ellipse at 35% 40%, #2C1A0E 0%, #0E0906 100%)" };

// 신규 과목 자동 색상 팔레트
const COLOR_PALETTE = [
  { color: "#fb923c", bg: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.4)"  },
  { color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.4)"  },
  { color: "#e879f9", bg: "rgba(232,121,249,0.15)", border: "rgba(232,121,249,0.4)" },
  { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.4)"  },
  { color: "#facc15", bg: "rgba(250,204,21,0.15)",  border: "rgba(250,204,21,0.4)"  },
];

export default function GreenhousePage() {
  const [seconds,   setSeconds]   = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [subject,   setSubject]   = useState("math");

  const [records, setRecords] = useState([
    { id: "math",   seconds: 7200 },
    { id: "coding", seconds: 5400 },
  ]);

  // 과목 목록 — 편집 가능한 로컬 state
  const [subjectList, setSubjectList] = useState(SUBJECTS.map((s) => ({ ...s })));
  const [editMode,    setEditMode]    = useState(false);
  const [newSubName,  setNewSubName]  = useState("");

  const intervalRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  /* ─── 유틸 ─── */
  const fmt = (s) => {
    const h   = String(Math.floor(s / 3600)).padStart(2, "0");
    const m   = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const fmtH = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  /* ─── 타이머 저장 ─── */
  const handleStop = () => {
    if (seconds > 0) {
      setRecords((prev) => {
        const exists = prev.find((r) => r.id === subject);
        if (exists) return prev.map((r) => r.id === subject ? { ...r, seconds: r.seconds + seconds } : r);
        return [...prev, { id: subject, seconds }];
      });
    }
    setIsRunning(false);
    setSeconds(0);
  };

  /* ─── 과목 편집 핸들러 ─── */
  // 이름 변경
  const renameSubject = (id, newName) => {
    const name = newName.trim();
    if (!name) return;
    setSubjectList((p) => p.map((s) => s.id === id ? { ...s, name } : s));
  };

  // 삭제
  const removeSubject = (id) => {
    setSubjectList((p) => p.filter((s) => s.id !== id));
    // 선택된 과목이 삭제되면 첫 번째 과목으로 이동
    if (subject === id) {
      const remaining = subjectList.filter((s) => s.id !== id);
      if (remaining.length > 0) setSubject(remaining[0].id);
    }
  };

  // 새 과목 추가
  const addSubject = () => {
    const name = newSubName.trim();
    if (!name || subjectList.find((s) => s.name === name)) return;
    const id       = `custom_${Date.now()}`;
    const palette  = COLOR_PALETTE[subjectList.length % COLOR_PALETTE.length];
    setSubjectList((p) => [...p, {
      id,
      name,
      color: palette.color,
      bg:    palette.bg,
      border: palette.border,
      bookPalette: [palette.color],
    }]);
    setNewSubName("");
  };

  const maxSeconds    = Math.max(...records.map((r) => r.seconds), 1);
  const currentSubject = subjectList.find((s) => s.id === subject) ?? subjectList[0];

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 gap-5">
      {/* 배경 */}
      <div className="fixed inset-0 -z-10" style={PAGE_BG} />

      {/* 헤더 */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button onClick={() => router.push("/admin")}
          className="text-amber-200/50 hover:text-amber-200 transition text-sm">← 내 방</button>
        <h1 className="text-amber-100 font-bold text-lg ml-auto"
          style={{ fontFamily: "var(--font-display)" }}>🌿 온실</h1>
      </div>

      {/* 타이머 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col items-center gap-5">
        {/* 원형 타이머 */}
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" className="absolute">
            <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="6" />
            <circle cx="70" cy="70" r="62" fill="none"
              stroke={currentSubject?.color ?? "#4ade80"} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(seconds % 3600) / 3600 * 389.6} 389.6`}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dasharray 0.5s ease" }} />
          </svg>
          <span className="text-amber-100 font-mono text-2xl font-bold z-10">{fmt(seconds)}</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button onClick={() => setIsRunning((v) => !v)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isRunning ? "rgba(245,158,11,0.2)" : "rgba(74,222,128,0.2)",
              color:      isRunning ? "#f59e0b" : "#4ade80",
              border:    `1px solid ${isRunning ? "rgba(245,158,11,0.4)" : "rgba(74,222,128,0.4)"}`,
            }}>
            {isRunning ? "⏸ 일시정지" : "▶ 시작"}
          </button>
          <button onClick={handleStop} disabled={seconds === 0}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
            style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
            ■ 저장
          </button>
        </div>
      </div>

      {/* 과목 선택 */}
      <div style={CARD} className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-amber-200/50 text-xs">과목 선택</p>
          <button
            onClick={() => setEditMode((v) => !v)}
            className="text-xs transition-all"
            style={{ color: editMode ? "#f59e0b" : "rgba(245,158,11,0.35)" }}>
            {editMode ? "완료" : "편집"}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {subjectList.map((s) => (
            <div key={s.id} className="relative">
              {editMode ? (
                /* 편집 모드 — 이름 인라인 수정 */
                <div className="flex items-center rounded-lg px-2 py-1 gap-1"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                  }}>
                  <input
                    value={s.name}
                    onChange={(e) => renameSubject(s.id, e.target.value)}
                    className="bg-transparent text-xs font-medium outline-none"
                    style={{ color: s.color, width: Math.max(s.name.length * 10, 28) }}
                  />
                </div>
              ) : (
                /* 일반 모드 — 선택 버튼 */
                <button onClick={() => setSubject(s.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: subject === s.id ? s.bg : "rgba(255,255,255,0.04)",
                    color:      subject === s.id ? s.color : "rgba(245,230,200,0.5)",
                    border:    `1px solid ${subject === s.id ? s.border : "rgba(255,255,255,0.08)"}`,
                  }}>
                  {s.name}
                </button>
              )}

              {/* 편집 모드 — × 삭제 버튼 */}
              {editMode && (
                <button
                  onClick={() => removeSubject(s.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: "rgba(248,113,113,0.8)", color: "#fff", fontSize: 10, lineHeight: 1 }}>
                  ×
                </button>
              )}
            </div>
          ))}

          {/* 편집 모드 — 새 과목 추가 */}
          {editMode && (
            <div className="flex items-center gap-1">
              <input
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubject()}
                placeholder="새 과목"
                className="bg-transparent text-xs outline-none"
                style={{
                  color: "rgba(245,230,200,0.7)",
                  borderBottom: "1px solid rgba(245,158,11,0.3)",
                  paddingBottom: 2,
                  width: 56,
                }}
              />
              <button onClick={addSubject}
                className="text-xs px-2 py-0.5 rounded-md transition-all"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 오늘 기록 */}
      <div style={CARD} className="w-full max-w-sm">
        <p className="text-amber-200/50 text-xs mb-3">오늘 기록</p>
        <div className="flex flex-col gap-3">
          {records.map((r) => {
            const s = subjectList.find((x) => x.id === r.id);
            const name  = s?.name  ?? r.id;
            const color = s?.color ?? "#94a3b8";
            return (
              <div key={r.id} className="flex items-center gap-3">
                <span className="text-xs w-10 shrink-0" style={{ color }}>{name}</span>
                <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(r.seconds / maxSeconds) * 100}%`, background: color, opacity: 0.7 }} />
                </div>
                <span className="text-xs w-12 text-right" style={{ color: "rgba(245,230,200,0.5)" }}>{fmtH(r.seconds)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}
