"use client";

// 기록 — 오늘 학습 내용 정리
// 공부 세션 기록 → 정원(/garden)
// 학습 게시글    → 도서관(/library)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS as BASE_SUBJECTS } from "@/lib/subjects";

const CARD    = { background: "rgba(245,230,200,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px" };
const PAGE_BG = { background: "radial-gradient(ellipse at 50% 30%, #1E1406 0%, #0A0804 100%)" };

// 카테고리 자동 색상 팔레트 (신규 추가 시)
const COLOR_PALETTE = ["#4ade80", "#f59e0b", "#60a5fa", "#f472b6", "#a78bfa", "#94a3b8", "#fb923c", "#34d399", "#e879f9", "#38bdf8"];

// 공통 과목 목록에서 초기값 생성
const DEFAULT_CATEGORIES = BASE_SUBJECTS.map(({ name, color }) => ({ name, color }));

export default function StudyPage() {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const [date, setDate] = useState(todayStr);

  const [title,      setTitle]      = useState("");
  const [categories, setCategories] = useState([]);
  const [content,    setContent]    = useState("");
  const [keyword,    setKeyword]    = useState("");
  const [keywords,   setKeywords]   = useState([]);
  const [saved,      setSaved]      = useState(false);

  // 카테고리 목록 — 추가/삭제 가능
  const [allCats,    setAllCats]    = useState(DEFAULT_CATEGORIES);
  const [newCat,     setNewCat]     = useState("");
  const [editMode,   setEditMode]   = useState(false);

  const toggleCat = (name) => setCategories((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);

  const addCat = () => {
    const name = newCat.trim();
    if (!name || allCats.find((c) => c.name === name)) return;
    const color = COLOR_PALETTE[allCats.length % COLOR_PALETTE.length];
    setAllCats((p) => [...p, { name, color }]);
    setNewCat("");
  };

  const removeCat = (name) => {
    setAllCats((p) => p.filter((c) => c.name !== name));
    setCategories((p) => p.filter((c) => c !== name));
  };

  const addKeyword = () => {
    const k = keyword.trim().replace(/^#/, "");
    if (k && !keywords.includes(k)) setKeywords((prev) => [...prev, k]);
    setKeyword("");
  };

  const handleSave = () => {
    if (!content.trim()) return;
    // TODO: Supabase posts 테이블에 저장
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center p-6 gap-5">
      {/* 배경 — fixed로 분리하여 리렌더링 영향 차단 */}
      <div className="fixed inset-0 -z-10" style={PAGE_BG} />

      {/* 헤더 */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="text-amber-200/50 hover:text-amber-200 transition text-sm">← 내 방</button>
        <h1 className="text-amber-100 font-bold text-lg ml-auto" style={{ fontFamily: "var(--font-display)" }}>📚 오늘 학습 기록</h1>
      </div>

      {/* 날짜 + 제목 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>날짜</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-mono outline-none cursor-pointer"
            style={{
              color: "rgba(245,230,200,0.7)",
              colorScheme: "dark",
            }}
          />
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요"
          className="bg-transparent text-sm outline-none w-full font-medium"
          style={{ color: "rgba(245,230,200,0.9)", borderBottom: "1px solid rgba(245,158,11,0.2)", paddingBottom: "8px" }} />
      </div>

      {/* 카테고리 */}
      <div style={CARD} className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>카테고리</p>
          <button
            onClick={() => setEditMode((v) => !v)}
            className="text-xs transition-all"
            style={{ color: editMode ? "#f59e0b" : "rgba(245,158,11,0.35)" }}>
            {editMode ? "완료" : "편집"}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {allCats.map(({ name, color }) => {
            const active = categories.includes(name);
            return (
              <div key={name} className="relative">
                <button
                  onClick={() => !editMode && toggleCat(name)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active && !editMode ? `${color}22` : "rgba(255,255,255,0.04)",
                    color:      active && !editMode ? color : "rgba(245,230,200,0.4)",
                    border:    `1px solid ${active && !editMode ? `${color}66` : "rgba(255,255,255,0.08)"}`,
                    paddingRight: editMode ? 20 : undefined,
                  }}>
                  {name}
                </button>
                {/* 편집 모드일 때 삭제 버튼 */}
                {editMode && (
                  <button
                    onClick={() => removeCat(name)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs transition-all hover:opacity-80"
                    style={{ background: "rgba(248,113,113,0.8)", color: "#fff", fontSize: 10, lineHeight: 1 }}>
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {/* 새 카테고리 추가 입력 */}
          {editMode && (
            <div className="flex items-center gap-1">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCat()}
                placeholder="새 카테고리"
                className="bg-transparent text-xs outline-none"
                style={{ color: "rgba(245,230,200,0.7)", borderBottom: "1px solid rgba(245,158,11,0.3)", paddingBottom: 2, width: 72 }}
              />
              <button
                onClick={addCat}
                className="text-xs px-2 py-0.5 rounded-md transition-all"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 핵심 키워드 */}
      <div style={CARD} className="w-full max-w-sm">
        <p className="text-xs mb-3" style={{ color: "rgba(245,158,11,0.5)" }}>핵심 키워드</p>
        <div className="flex flex-wrap gap-2 mb-3 min-h-6">
          {keywords.map((k) => (
            <span key={k} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(163,139,230,0.15)", color: "#a78bfa", border: "1px solid rgba(163,139,230,0.25)" }}>
              #{k}
              <button onClick={() => setKeywords((p) => p.filter((x) => x !== k))} className="opacity-50 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="#키워드 입력 후 Enter"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "rgba(245,230,200,0.7)", borderBottom: "1px solid rgba(245,158,11,0.15)", paddingBottom: "4px" }} />
        </div>
      </div>

      {/* 내용 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col gap-2">
        <p className="text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>내용</p>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="오늘 공부한 내용을 자유롭게 작성하세요..."
          rows={5} className="bg-transparent text-sm outline-none w-full resize-none"
          style={{ color: "rgba(245,230,200,0.85)", lineHeight: 1.7 }} />
      </div>

      {/* 저장 버튼 */}
      <button onClick={handleSave}
        className="w-full max-w-sm py-3 rounded-xl text-sm font-semibold transition-all"
        style={{ background: saved ? "rgba(74,222,128,0.2)" : "rgba(245,158,11,0.2)", color: saved ? "#4ade80" : "#f59e0b", border: `1px solid ${saved ? "rgba(74,222,128,0.4)" : "rgba(245,158,11,0.4)"}` }}>
        {saved ? "✓ 저장됐어요" : "저장하기"}
      </button>

    </main>
  );
}
