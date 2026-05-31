
// 학습기록 — 오늘 공부 내용 정리
// village_posts 테이블에 저장 → 도서관(/library)에서 열람

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SUBJECTS as BASE_SUBJECTS } from "../../../lib/subjects";
import { supabase } from "../../../lib/supabase";

const CARD    = { background: "rgba(245,230,200,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px" };
const PAGE_BG = { background: "radial-gradient(ellipse at 50% 30%, #1E1406 0%, #0A0804 100%)" };

const DEFAULT_CATEGORIES = BASE_SUBJECTS.map(({ name, color }) => ({ name, color }));

export default function StudyPage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  const [date,       setDate]       = useState(todayStr);
  const [title,      setTitle]      = useState("");
  const [categories, setCategories] = useState([]);
  const [content,    setContent]    = useState("");
  const [keyword,    setKeyword]    = useState("");
  const [keywords,   setKeywords]   = useState([]);
  const [saved,      setSaved]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  /* localStorage에서 바로 초기화 — 온실과 카테고리 공유 (읽기 전용) */
  const [allCats] = useState(() => {
    try {
      const saved = localStorage.getItem("village-subjects");
      if (saved) return JSON.parse(saved).map((s) => ({ name: s.name, color: s.color }));
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const toggleCat = (name) => setCategories((prev) =>
    prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
  );

  const addKeyword = () => {
    const k = keyword.trim().replace(/^#/, "");
    if (k && !keywords.includes(k)) setKeywords((prev) => [...prev, k]);
    setKeyword("");
  };

  const handleSave = async () => {
    if (!content.trim()) { setError("내용을 입력해주세요"); return; }
    setError("");
    setSaving(true);
    const { error: err } = await supabase.from("village_posts").insert({
      title:      title.trim() || "제목 없음",
      content:    content.trim(),
      categories,
      keywords,
      date,
    });
    setSaving(false);
    if (err) { console.error("village_posts insert error:", err); setError(`저장 실패: ${err.message}`); return; }
    setSaved(true);
    setTitle(""); setContent(""); setCategories([]); setKeywords([]); setKeyword("");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center p-6 gap-5">
      <div className="fixed inset-0 -z-10" style={PAGE_BG} />

      {/* 헤더 */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button onClick={() => navigate("/land/admin")} className="text-amber-200/50 hover:text-amber-200 transition text-sm">← 내 방</button>
        <h1 className="text-amber-100 font-bold text-lg ml-auto" style={{ fontFamily: "var(--font-display)" }}>📚 오늘 학습 기록</h1>
      </div>

      {/* 날짜 + 제목 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-mono outline-none cursor-pointer"
            style={{ color: "rgba(245,230,200,0.7)", colorScheme: "dark" }} />
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요"
          className="bg-transparent text-sm outline-none w-full font-medium"
          style={{ color: "rgba(245,230,200,0.9)", borderBottom: "1px solid rgba(245,158,11,0.2)", paddingBottom: "8px" }} />
      </div>

      {/* 카테고리 — 선택만 가능 (편집은 온실에서) */}
      <div style={CARD} className="w-full max-w-sm">
        <p className="text-xs mb-3" style={{ color: "rgba(245,158,11,0.5)" }}>카테고리</p>
        <div className="flex gap-2 flex-wrap">
          {allCats.map(({ name, color }) => {
            const active = categories.includes(name);
            return (
              <button key={name} onClick={() => toggleCat(name)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition"
                style={{
                  background: active ? `${color}22` : "rgba(255,255,255,0.04)",
                  color:      active ? color        : "rgba(245,230,200,0.4)",
                  border:    `1px solid ${active ? `${color}66` : "rgba(255,255,255,0.08)"}`,
                }}>
                {name}
              </button>
            );
          })}
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
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          placeholder="#키워드 입력 후 Enter"
          className="w-full bg-transparent text-xs outline-none"
          style={{ color: "rgba(245,230,200,0.7)", borderBottom: "1px solid rgba(245,158,11,0.15)", paddingBottom: "4px" }} />
      </div>

      {/* 내용 */}
      <div style={CARD} className="w-full max-w-sm flex flex-col gap-2">
        <p className="text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>내용</p>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 공부한 내용을 자유롭게 작성하세요..."
          rows={5} className="bg-transparent text-sm outline-none w-full resize-none"
          style={{ color: "rgba(245,230,200,0.85)", lineHeight: 1.7 }} />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-xs w-full max-w-sm" style={{ color: "#f87171" }}>{error}</p>}

      {/* 저장 버튼 */}
      <button onClick={handleSave} disabled={saving}
        className="w-full max-w-sm py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        style={{
          background: saved ? "rgba(74,222,128,0.2)"  : "rgba(245,158,11,0.2)",
          color:      saved ? "#4ade80"                : "#f59e0b",
          border:    `1px solid ${saved ? "rgba(74,222,128,0.4)" : "rgba(245,158,11,0.4)"}`,
        }}>
        {saving ? "저장 중..." : saved ? "✓ 저장됐어요" : "저장하기"}
      </button>

    </main>
  );
}
