"use client";

// 온실 — 공부시간 타이머
// 기록 저장 → study_sessions 테이블 → 도서관/정원에서 시각화

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/useAdminAuth";

const CARD    = { background: "rgba(6,20,10,0.55)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "12px", padding: "16px" };
const PAGE_BG = { background: "radial-gradient(ellipse at 35% 40%, #0A2010 0%, #040E07 100%)" };

const COLOR_PALETTE = [
  { color: "#4ade80", bg: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.4)"  },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.4)"  },
  { color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.4)"  },
  { color: "#f472b6", bg: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.4)" },
  { color: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.4)" },
  { color: "#fb923c", bg: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.4)"  },
  { color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.4)"  },
  { color: "#e879f9", bg: "rgba(232,121,249,0.15)", border: "rgba(232,121,249,0.4)" },
  { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.4)"  },
  { color: "#facc15", bg: "rgba(250,204,21,0.15)",  border: "rgba(250,204,21,0.4)"  },
];

const todayStr  = () => new Date().toISOString().split("T")[0];
const fmtClock  = (d) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/* ─── 타이머 localStorage 영속화 ─── */
const TIMER_KEY = "gh-timer";

const getPersistedTimer = () => {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const savePersistedTimer = (data) => {
  try { localStorage.setItem(TIMER_KEY, JSON.stringify(data)); } catch {}
};

const clearPersistedTimer = () => {
  try { localStorage.removeItem(TIMER_KEY); } catch {}
};

export default function GreenhousePage() {
  const authed = useAdminAuth();

  /* ─── 타이머 상태 — localStorage에서 복원 ─── */
  const [seconds, setSeconds] = useState(() => {
    const p = getPersistedTimer();
    if (!p) return 0;
    /* 실행 중이었다면 자리를 비운 사이 흐른 시간도 합산 */
    if (p.running && p.resumedAt) {
      return p.accumulated + Math.floor((Date.now() - p.resumedAt) / 1000);
    }
    return p.accumulated ?? 0;
  });

  const [isRunning, setIsRunning] = useState(() => {
    const p = getPersistedTimer();
    return p?.running ?? false;
  });

  const [subject, setSubject] = useState(() => {
    const p = getPersistedTimer();
    return p?.subjectId ?? null;
  });

  /* 세션 시작 시각 — state로 관리해야 JSX에서 리렌더 됨 */
  const [sessionStartAt, setSessionStartAt] = useState(() => {
    const p = getPersistedTimer();
    return p?.sessionStart ? new Date(p.sessionStart) : null;
  });

  /* 오늘 개별 세션 기록 */
  const [records, setRecords] = useState([]);

  const [subjectList, setSubjectList] = useState(() => {
    try {
      const saved = localStorage.getItem("village-subjects");
      if (saved) return JSON.parse(saved);
    } catch {}
    return SUBJECTS.map((s) => ({ ...s }));
  });
  const [editMode,    setEditMode]    = useState(false);
  const [newSubName,  setNewSubName]  = useState("");
  const [newSubColor, setNewSubColor] = useState(COLOR_PALETTE[0].color);
  const [saving,      setSaving]      = useState(false);

  const intervalRef = useRef(null);
  const router = useRouter();

  /* ─── 오늘 기록 불러오기 ─── */
  useEffect(() => {
    const loadToday = async () => {
      const { data } = await supabase
        .from("study_sessions")
        .select("subject_name, seconds, start_clock, end_clock")
        .eq("date", todayStr())
        .order("created_at", { ascending: true });
      if (data) {
        setRecords(data.map((r) => ({
          name:       r.subject_name,
          seconds:    r.seconds,
          startClock: r.start_clock || "",
          endClock:   r.end_clock   || "",
        })));
      }
    };
    loadToday();
  }, []);

  /* 과목 초기값 설정 */
  useEffect(() => {
    if (!subject && subjectList.length > 0) setSubject(subjectList[0].id);
  }, [subjectList, subject]);

  /* ─── 타이머 ─── */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

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

  /* ─── 시작/일시정지 토글 ─── */
  const handleToggle = () => {
    const now = Date.now();
    if (!isRunning) {
      /* 시작 or 재개 */
      let sessionStart = sessionStartAt;
      if (seconds === 0) {
        /* 새 세션 — 시작 시각 기록 */
        sessionStart = new Date(now);
        setSessionStartAt(sessionStart);
      }
      /* localStorage 저장: accumulated = 현재 seconds, resumedAt = 지금 */
      savePersistedTimer({
        running:      true,
        accumulated:  seconds,
        resumedAt:    now,
        sessionStart: sessionStart ? sessionStart.getTime() : now,
        subjectId:    subject,
      });
    } else {
      /* 일시정지 — 현재 accumulated 저장, resumedAt 제거 */
      const p = getPersistedTimer();
      savePersistedTimer({
        running:      false,
        accumulated:  seconds,
        resumedAt:    null,
        sessionStart: p?.sessionStart ?? now,
        subjectId:    subject,
      });
    }
    setIsRunning((v) => !v);
  };

  /* ─── 저장 ─── */
  const handleStop = async () => {
    if (seconds === 0) { setIsRunning(false); return; }
    const subj = subjectList.find((s) => s.id === subject) ?? subjectList[0];
    if (!subj) return;

    const endTime    = new Date();
    const startTime  = sessionStartAt ?? endTime;
    const startClock = fmtClock(startTime);
    const endClock   = fmtClock(endTime);

    setSaving(true);
    const { error } = await supabase.from("study_sessions").insert({
      subject_name:  subj.name,
      subject_color: subj.color,
      seconds,
      date:        todayStr(),
      start_clock: startClock,
      end_clock:   endClock,
    });
    setSaving(false);

    if (error) {
      console.error("세션 저장 오류:", error.message);
      alert(`저장 실패: ${error.message}\n\nSupabase에 start_clock, end_clock 컬럼이 필요합니다.`);
      return;
    }

    setRecords((prev) => [...prev, { name: subj.name, seconds, startClock, endClock }]);

    /* localStorage 초기화 */
    clearPersistedTimer();
    setSessionStartAt(null);
    setIsRunning(false);
    setSeconds(0);
  };

  /* ─── 과목 편집 (localStorage 동기화) ─── */
  const saveSubjects = (list) => {
    localStorage.setItem("village-subjects", JSON.stringify(list));
  };

  const renameSubject = (id, newName) => {
    const name = newName.trim();
    if (!name) return;
    const newList = subjectList.map((s) => s.id === id ? { ...s, name } : s);
    setSubjectList(newList);
    saveSubjects(newList);
  };

  const removeSubject = (id) => {
    const newList = subjectList.filter((s) => s.id !== id);
    setSubjectList(newList);
    saveSubjects(newList);
    if (subject === id && newList.length > 0) setSubject(newList[0].id);
  };

  const addSubject = () => {
    const name = newSubName.trim();
    if (!name || subjectList.find((s) => s.name === name)) return;
    const id      = `custom_${Date.now()}`;
    const palette = COLOR_PALETTE.find((p) => p.color === newSubColor) ?? COLOR_PALETTE[0];
    const newList = [...subjectList, { id, name, color: palette.color, bg: palette.bg, border: palette.border, bookPalette: [palette.color] }];
    setSubjectList(newList);
    saveSubjects(newList);
    setNewSubName("");
    setNewSubColor(COLOR_PALETTE[0].color);
  };

  const currentSubject = subjectList.find((s) => s.id === subject) ?? subjectList[0];

  if (!authed) return null;

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 gap-5">
      <div className="fixed inset-0 -z-10" style={PAGE_BG} />

      {/* 헤더 */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button onClick={() => router.push("/admin")}
          className="text-green-200/50 hover:text-green-200 transition text-sm">← 내 방</button>
        <h1 className="text-green-100 font-bold text-lg ml-auto"
          style={{ fontFamily: "var(--font-display)" }}>🌿 온실</h1>
      </div>

      {/* 타이머 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col items-center gap-5">
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
          <span className="text-green-100 font-mono text-2xl font-bold z-10">{fmt(seconds)}</span>
        </div>

        {/* 시작 시각 표시 */}
        {sessionStartAt && (
          <p className="text-xs -mt-2" style={{ color: "rgba(74,222,128,0.45)" }}>
            {fmtClock(sessionStartAt)} 시작
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={handleToggle}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition"
            style={{
              background: isRunning ? "rgba(245,158,11,0.2)" : "rgba(74,222,128,0.2)",
              color:      "#4ade80",
              border:    `1px solid ${isRunning ? "rgba(245,158,11,0.4)" : "rgba(74,222,128,0.4)"}`,
            }}>
            {isRunning ? "⏸ 일시정지" : "▶ 시작"}
          </button>
          <button onClick={handleStop} disabled={seconds === 0 || saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-30"
            style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)" }}>
            {saving ? "저장 중..." : "■ 저장"}
          </button>
        </div>
      </div>

      {/* 과목 선택 */}
      <div style={CARD} className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-green-200/50 text-xs">과목 선택</p>
          <button onClick={() => setEditMode((v) => !v)}
            className="text-xs transition"
            style={{ color: editMode ? "#4ade80" : "rgba(74,222,128,0.35)" }}>
            {editMode ? "완료" : "편집"}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {subjectList.map((s) => (
            <div key={s.id} className="relative">
              {editMode ? (
                <div className="flex items-center rounded-lg px-2 py-1 gap-1"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <input value={s.name} onChange={(e) => renameSubject(s.id, e.target.value)}
                    className="bg-transparent text-xs font-medium outline-none"
                    style={{ color: s.color, width: Math.max(s.name.length * 10, 28) }} />
                </div>
              ) : (
                <button onClick={() => {
                  setSubject(s.id);
                  /* 타이머가 저장 중이면 과목도 함께 갱신 */
                  const p = getPersistedTimer();
                  if (p) savePersistedTimer({ ...p, subjectId: s.id });
                }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  style={{
                    background: subject === s.id ? s.bg : "rgba(255,255,255,0.04)",
                    color:      subject === s.id ? s.color : "rgba(200,245,215,0.5)",
                    border:    `1px solid ${subject === s.id ? s.border : "rgba(255,255,255,0.08)"}`,
                  }}>
                  {s.name}
                </button>
              )}
              {editMode && (
                <button onClick={() => removeSubject(s.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "rgba(248,113,113,0.8)", color: "#fff", fontSize: 10, lineHeight: 1 }}>
                  ×
                </button>
              )}
            </div>
          ))}

          {editMode && (
            <div className="flex flex-col gap-2 w-full mt-1"
              style={{ borderTop: "1px solid rgba(74,222,128,0.1)", paddingTop: 10 }}>
              {/* 색상 선택 */}
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_PALETTE.map((p) => (
                  <button key={p.color} onClick={() => setNewSubColor(p.color)}
                    className="w-4 h-4 rounded-full transition hover:scale-110"
                    style={{
                      background:    p.color,
                      outline:       newSubColor === p.color ? `2px solid ${p.color}` : "none",
                      outlineOffset: 2,
                      opacity:       newSubColor === p.color ? 1 : 0.4,
                    }} />
                ))}
              </div>
              {/* 이름 입력 + 추가 버튼 */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: newSubColor }} />
                <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                  placeholder="새 과목 이름"
                  className="flex-1 bg-transparent text-xs outline-none"
                  style={{ color: "rgba(200,245,215,0.7)", borderBottom: "1px solid rgba(74,222,128,0.3)", paddingBottom: 2 }} />
                <button onClick={addSubject}
                  className="text-xs px-2 py-0.5 rounded-md transition shrink-0"
                  style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오늘 기록 — 개별 세션 + 시간대 */}
      <div style={CARD} className="w-full max-w-sm">
        <p className="text-green-200/50 text-xs mb-3">오늘 기록</p>
        {records.length === 0 ? (
          <p className="text-green-200/25 text-xs text-center py-2">아직 기록이 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map((r, i) => {
              const s     = subjectList.find((x) => x.name === r.name);
              const color = s?.color ?? "#94a3b8";
              return (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {/* 과목 색상 dot */}
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  {/* 과목명 */}
                  <span className="text-xs font-medium w-10 shrink-0 truncate" style={{ color }}>
                    {r.name}
                  </span>
                  {/* 시간대 */}
                  {(r.startClock || r.endClock) ? (
                    <span className="text-xs flex-1" style={{ color: "rgba(200,245,215,0.38)" }}>
                      {r.startClock}{r.endClock ? ` ~ ${r.endClock}` : ""}
                    </span>
                  ) : (
                    <span className="flex-1" />
                  )}
                  {/* 집중 시간 */}
                  <span className="text-xs font-mono shrink-0" style={{ color: "rgba(200,245,215,0.65)" }}>
                    {fmtH(r.seconds)}
                  </span>
                </div>
              );
            })}
            {/* 오늘 총계 */}
            {records.length > 1 && (
              <div className="flex justify-end pt-1"
                style={{ borderTop: "1px solid rgba(74,222,128,0.1)" }}>
                <span className="text-xs" style={{ color: "rgba(74,222,128,0.5)" }}>
                  합계 {fmtH(records.reduce((a, r) => a + r.seconds, 0))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
