"use client";

// 도서관 — 일간 학습 시각화
// 온실(/greenhouse) 공부시간 → study_sessions 테이블
// 기록(/study) 게시글     → posts 테이블
// TODO: Supabase 연동

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackToSquare from "@/components/BackToSquare";
import PageBackground from "@/components/PageBackground";
import { SUBJECTS as SUBJECT_LIST, subjectByName } from "@/lib/subjects";

/* ─── 상수 ─── */
const BG_STYLE = {
  backgroundImage: "url('/images/library.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const PANEL = {
  background: "rgba(8,16,40,0.58)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "16px",
  padding: "20px",
};

// 공통 과목 목록에서 name → 객체 맵 생성
const SUBJECTS = Object.fromEntries(SUBJECT_LIST.map((s) => [s.name, s]));

/* ─── Mock 데이터 (TODO: Supabase study_sessions / posts) ─── */
const MOCK_SESSIONS = {
  "2026-05-28": [
    { subject: "수학", seconds: 7200 },
    { subject: "코딩", seconds: 5400 },
    { subject: "영어", seconds: 3600 },
  ],
  "2026-05-27": [
    { subject: "수학", seconds: 3600 },
    { subject: "코딩", seconds: 9000 },
  ],
  "2026-05-26": [
    { subject: "영어", seconds: 7200 },
    { subject: "역사", seconds: 1800 },
  ],
};

const MOCK_POSTS = {
  "2026-05-28": [
    { id: 1, title: "미적분 기초 개념 정리", content: "극한, 연속, 미분의 정의와 예제...", categories: ["수학"], keywords: ["극한", "미분"] },
    { id: 2, title: "React Hooks 심화", content: "useCallback, useMemo 차이점과 활용...", categories: ["코딩"], keywords: ["React", "hooks"] },
  ],
  "2026-05-27": [
    { id: 3, title: "코딩 테스트 풀이", content: "BFS/DFS 문제 패턴 정리...", categories: ["코딩"], keywords: ["알고리즘", "BFS"] },
  ],
};

/* ─── 유틸 ─── */
const toKey  = (d) => d.toISOString().split("T")[0];
const fmtKo  = (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const fmtH   = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
};

const BOOK_WIDTHS  = [10, 8, 13, 9, 12, 7, 11, 8, 14, 9];
const BOOK_HEIGHTS = [62, 72, 55, 68, 58, 75, 50, 65, 60, 70];

/* ─── 컴포넌트 ─── */
export default function LibraryPage() {
  const router  = useRouter();
  const [date,  setDate]  = useState(new Date());
  const [view,  setView]  = useState("day"); // "day" | "calendar"

  /* 캘린더용 표시 월 */
  const [calYM, setCalYM] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });

  const key      = toKey(date);
  const sessions = MOCK_SESSIONS[key] || [];
  const posts    = MOCK_POSTS[key]    || [];

  /* 과목별 합산 */
  const grouped = sessions.reduce((acc, { subject, seconds }) => {
    acc[subject] = (acc[subject] || 0) + seconds;
    return acc;
  }, {});

  const totalSec = Object.values(grouped).reduce((a, b) => a + b, 0);

  const prev = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); };
  const next = () => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); };

  /* 캘린더 계산 */
  const firstDay     = new Date(calYM.year, calYM.month, 1).getDay();
  const daysInMonth  = new Date(calYM.year, calYM.month + 1, 0).getDate();
  const today        = new Date();

  const prevMonth = () => setCalYM(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const nextMonth = () => setCalYM(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });

  const selectDay = (d) => {
    setDate(new Date(calYM.year, calYM.month, d));
    setView("day");
  };

  const entries = Object.entries(grouped);

  return (
    <main className="relative w-full min-h-screen overflow-y-scroll">
      <PageBackground src="/images/library.png" overlay="rgba(4,8,22,0.52)" />

      <div className="relative z-10 flex flex-col items-center p-8 gap-6 min-h-screen">

        {/* 헤더 */}
        <div className="w-full max-w-2xl flex items-end justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
              📖 학습 기록실
            </h1>
            <p className="text-blue-200/60 text-sm mt-1">날짜별 공부 시간과 노트를 한눈에</p>
          </div>
          {/* 뷰 토글 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
            {[{ label: "날짜", val: "day" }, { label: "캘린더", val: "calendar" }].map(({ label, val }) => (
              <button key={val} onClick={() => setView(val)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: view === val ? "rgba(96,165,250,0.22)" : "transparent",
                  color:      view === val ? "#60a5fa" : "rgba(96,165,250,0.4)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 캘린더 뷰 ── */}
        {view === "calendar" && (
          <div className="w-full max-w-2xl" style={PANEL}>
            {/* 월 네비 */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="text-blue-300/50 hover:text-blue-300 transition text-xl">‹</button>
              <span className="text-blue-100 text-sm font-medium">{calYM.year}년 {calYM.month + 1}월</span>
              <button onClick={nextMonth} className="text-blue-300/50 hover:text-blue-300 transition text-xl">›</button>
            </div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {["일","월","화","수","목","금","토"].map((d) => (
                <div key={d} className="text-center text-xs py-1" style={{ color: "rgba(96,165,250,0.4)" }}>{d}</div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const d        = i + 1;
                const dayKey   = `${calYM.year}-${String(calYM.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isToday  = d === today.getDate() && calYM.month === today.getMonth() && calYM.year === today.getFullYear();
                const isSelected = dayKey === toKey(date);
                const hasSess  = !!MOCK_SESSIONS[dayKey];
                const hasPost  = !!MOCK_POSTS[dayKey];

                return (
                  <button key={d} onClick={() => selectDay(d)}
                    className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:opacity-80"
                    style={{
                      background: isSelected ? "rgba(96,165,250,0.3)" : isToday ? "rgba(96,165,250,0.12)" : "transparent",
                      color:      isSelected ? "#fff" : isToday ? "#60a5fa" : "rgba(220,235,255,0.7)",
                      border:    `1px solid ${isSelected ? "rgba(96,165,250,0.6)" : isToday ? "rgba(96,165,250,0.3)" : "transparent"}`,
                    }}>
                    {d}
                    {/* 기록 있는 날 점 표시 */}
                    <div className="flex gap-0.5 mt-0.5">
                      {hasSess && <div className="w-1 h-1 rounded-full" style={{ background: "#4ade80" }} />}
                      {hasPost && <div className="w-1 h-1 rounded-full" style={{ background: "#60a5fa" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* 범례 */}
            <div className="flex gap-4 mt-4 justify-end">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> 공부 기록
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 학습 노트
              </div>
            </div>
          </div>
        )}

        {/* ── 날짜 네비게이션 (날짜 뷰) ── */}
        {view === "day" && (
          <div className="w-full max-w-2xl flex items-center justify-between"
            style={{ ...PANEL, padding: "12px 24px" }}>
            <button onClick={prev}
              className="text-blue-300/50 hover:text-blue-300 transition-colors text-2xl leading-none">‹</button>
            <div className="text-center">
              <p className="text-blue-100 text-sm font-medium">{fmtKo(date)}</p>
              {totalSec > 0 && (
                <p className="text-blue-300/50 text-xs mt-0.5">총 {fmtH(totalSec)} 학습</p>
              )}
            </div>
            <button onClick={next}
              className="text-blue-300/50 hover:text-blue-300 transition-colors text-2xl leading-none">›</button>
          </div>
        )}

        {/* ── 날짜 뷰 콘텐츠 ── */}
        {view === "day" && entries.length > 0 ? (
          <div className="w-full max-w-2xl flex gap-3">
            {entries.map(([subj, secs]) => {
              const s = SUBJECTS[subj] || SUBJECTS["기타"];
              return (
                <div key={subj}
                  className="flex-1 flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl transition-all"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <span className="text-xs font-medium" style={{ color: s.color }}>{subj}</span>
                  <span className="text-xl font-bold" style={{ color: s.color }}>{fmtH(secs)}</span>
                </div>
              );
            })}
          </div>
        ) : view === "day" ? (
          <div className="w-full max-w-2xl" style={PANEL}>
            <p className="text-blue-200/30 text-sm text-center py-2">이 날의 학습 기록이 없어요 📭</p>
          </div>
        ) : null}

        {/* 카테고리별 책장 */}
        {view === "day" && <div className="w-full max-w-2xl" style={PANEL}>
          <p className="text-blue-200/50 text-xs mb-5">카테고리별 책장</p>

          {entries.length === 0 ? (
            <p className="text-blue-200/25 text-xs text-center py-3">기록이 없습니다</p>
          ) : (
            <div className="flex flex-col gap-5">
              {entries.map(([subj, secs]) => {
                const s          = SUBJECTS[subj] || SUBJECTS["기타"];
                const bookCount  = Math.max(2, Math.ceil(secs / 900)); // 15분 = 책 1권
                return (
                  <div key={subj} className="flex items-end gap-3">
                    {/* 과목 라벨 */}
                    <span className="text-xs w-8 shrink-0 text-right" style={{ color: s.color, paddingBottom: 4 }}>
                      {subj}
                    </span>

                    {/* 책 스파인 */}
                    <div className="flex items-end gap-[3px]"
                      style={{ borderBottom: `1px solid rgba(96,165,250,0.15)`, paddingBottom: 0 }}>
                      {Array(bookCount).fill(null).map((_, i) => (
                        <div key={i}
                          className="rounded-t-sm transition-all"
                          style={{
                            width:      BOOK_WIDTHS[i % BOOK_WIDTHS.length],
                            height:     BOOK_HEIGHTS[i % BOOK_HEIGHTS.length],
                            background: s.bookPalette[i % s.bookPalette.length],
                            opacity:    0.65 + (i % 3) * 0.1,
                          }}
                        />
                      ))}
                    </div>

                    {/* 시간 */}
                    <span className="text-xs" style={{ color: "rgba(96,165,250,0.45)", paddingBottom: 4 }}>
                      {fmtH(secs)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>}

        {/* 오늘의 학습 노트 */}
        {view === "day" && <div className="w-full max-w-2xl" style={PANEL}>
          <p className="text-blue-200/50 text-xs mb-3">학습 노트</p>
          {posts.length === 0 ? (
            <p className="text-blue-200/25 text-xs text-center py-3">작성된 노트가 없어요</p>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <div key={post.id}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:border-blue-400/30"
                  style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.12)" }}>
                  <p className="text-white/85 text-sm font-medium">{post.title}</p>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{post.content}</p>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {post.categories.map((c) => {
                      const s = SUBJECTS[c] || SUBJECTS["기타"];
                      return (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-md"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {c}
                        </span>
                      );
                    })}
                    {post.keywords.map((k) => (
                      <span key={k} className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}

      </div>

      <BackToSquare />
    </main>
  );
}
