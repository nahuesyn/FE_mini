"use client";

// 도서관 — Study에서 작성한 과목별 학습 노트를 최신순으로 열람
// village_posts 테이블만 사용

import { useState, useEffect } from "react";
import BackToSquare from "@/components/BackToSquare";
import PageBackground from "@/components/PageBackground";
import { SUBJECTS as SUBJECT_LIST } from "@/lib/subjects";
import { supabase } from "@/lib/supabase";

/* ─── 상수 ─── */
const PANEL = {
  background:     "rgba(8,16,40,0.58)",
  backdropFilter: "blur(14px)",
  border:         "1px solid rgba(96,165,250,0.18)",
  borderRadius:   "16px",
  padding:        "20px",
};

/* subjects.js 기본 맵 */
const SUBJECTS_DEFAULT = Object.fromEntries(SUBJECT_LIST.map((s) => [s.name, s]));

/* ─── 유틸 ─── */
const fmtKo = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "날짜 없음";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
};

const toArr = (v) => (Array.isArray(v) ? v : []);

/* 카테고리 색상: subjectMap(localStorage) → subjects.js → fallback */
const resolveStyle = (name, subjectMap) => {
  const ls = subjectMap[name];
  if (ls) return { color: ls.color, bg: ls.bg || `${ls.color}22`, border: ls.border || `${ls.color}66` };
  const def = SUBJECTS_DEFAULT[name];
  if (def) return { color: def.color, bg: def.bg, border: def.border };
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
};

export default function LibraryPage() {
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [posts,           setPosts]           = useState([]);

  /* ─── 편집 상태 ─── */
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPost,      setEditPost]      = useState(null);
  const [editKeyword,   setEditKeyword]   = useState("");

  /* localStorage를 useEffect로 읽어 state로 관리 */
  const [subjectMap,  setSubjectMap]  = useState({});
  const [subjectList, setSubjectList] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("village-subjects");
      if (saved) {
        const list = JSON.parse(saved);
        setSubjectMap(Object.fromEntries(list.map((s) => [s.name, s])));
        setSubjectList(list.map((s) => s.name));
      } else {
        setSubjectList(SUBJECT_LIST.map((s) => s.name));
      }
    } catch {
      setSubjectList(SUBJECT_LIST.map((s) => s.name));
    }
  }, []);

  /* ─── 데이터 로드 ─── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: sbErr } = await supabase
          .from("village_posts")
          .select("*")
          .order("created_at", { ascending: true });

        if (sbErr) {
          console.error("library load error:", sbErr);
          setError(sbErr.message);
          setLoading(false);
          return;
        }

        setPosts(
          (data || []).map((p) => ({
            id:         p.id         ?? String(Math.random()),
            date:       p.date       ?? null,
            title:      p.title      ?? "제목 없음",
            content:    p.content    ?? "",
            categories: toArr(p.categories),
            keywords:   toArr(p.keywords),
          }))
        );
      } catch (e) {
        console.error("library unexpected error:", e);
        setError(e?.message ?? "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ─── 삭제 ─── */
  const deletePost = async (id) => {
    if (!window.confirm("이 학습 기록을 삭제할까요?")) return;
    setPosts((p) => p.filter((x) => x.id !== id));
    await supabase.from("village_posts").delete().eq("id", id);
  };

  /* ─── 수정 ─── */
  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setEditPost({
      date:       post.date ?? "",
      title:      post.title,
      categories: [...post.categories],
      content:    post.content,
      keywords:   [...post.keywords],
    });
    setEditKeyword("");
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditPost(null);
    setEditKeyword("");
  };

  const saveEditPost = async () => {
    if (!editPost) return;
    const updated = {
      date:       editPost.date || null,
      title:      editPost.title.trim() || "제목 없음",
      categories: editPost.categories,
      content:    editPost.content.trim(),
      keywords:   editPost.keywords,
    };
    setPosts((p) => p.map((x) => x.id === editingPostId ? { ...x, ...updated } : x));
    await supabase.from("village_posts").update(updated).eq("id", editingPostId);
    cancelEditPost();
  };

  const toggleEditCat = (name) => {
    setEditPost((p) => ({
      ...p,
      categories: p.categories.includes(name)
        ? p.categories.filter((x) => x !== name)
        : [...p.categories, name],
    }));
  };

  const addEditKeyword = () => {
    const k = editKeyword.trim().replace(/^#/, "");
    if (k && !editPost.keywords.includes(k)) {
      setEditPost((p) => ({ ...p, keywords: [...p.keywords, k] }));
    }
    setEditKeyword("");
  };

  /* ─── 카테고리 탭: 온실 과목 목록 기준 ─── */
  const allSubjects = subjectList.length > 0
    ? subjectList
    : [...new Set(posts.flatMap((p) => p.categories).filter(Boolean))];

  /* ─── 필터링 ─── */
  const filteredPosts = selectedSubject
    ? posts.filter((p) => p.categories.includes(selectedSubject))
    : posts;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <PageBackground src="/images/library.png" overlay="rgba(4,8,22,0.52)" />

      <div className="relative z-10 h-full overflow-y-scroll flex flex-col items-center p-8 gap-6"
        style={{ background: "rgba(4,8,22,0.35)" }}>

        {/* 헤더 */}
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            📖 학습 기록실
          </h1>
          <p className="text-blue-200/60 text-sm mt-1">과목별 학습 노트를 최신순으로</p>
        </div>

        {/* 로딩 */}
        {loading && (
          <p className="text-blue-200/30 text-sm">불러오는 중...</p>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="w-full max-w-2xl" style={PANEL}>
            <p className="text-red-400/80 text-sm text-center py-2">오류: {error}</p>
          </div>
        )}

        {/* ── 과목 탭 ── */}
        {!loading && !error && allSubjects.length > 0 && posts.length > 0 && (
          <div className="w-full max-w-2xl flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSubject(null)}
              className="px-4 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: selectedSubject === null ? "rgba(96,165,250,0.22)" : "rgba(96,165,250,0.06)",
                color:      selectedSubject === null ? "#60a5fa"                : "rgba(96,165,250,0.45)",
                border:    `1px solid ${selectedSubject === null ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.15)"}`,
              }}>
              전체
            </button>
            {allSubjects.map((name) => {
              const s      = resolveStyle(name, subjectMap);
              const active = selectedSubject === name;
              return (
                <button key={name}
                  onClick={() => setSelectedSubject(name)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: active ? s.bg                    : "rgba(255,255,255,0.04)",
                    color:      active ? s.color                 : "rgba(220,235,255,0.4)",
                    border:    `1px solid ${active ? s.border : "rgba(255,255,255,0.08)"}`,
                  }}>
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── 기록 없음 ── */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="w-full max-w-2xl" style={PANEL}>
            <p className="text-blue-200/30 text-sm text-center py-4">
              {posts.length === 0
                ? "내 방 → 학습기록에서 오늘 공부한 내용을 작성해봐요 📝"
                : "해당 과목의 기록이 없어요 📭"}
            </p>
          </div>
        )}

        {/* ── 포스트 카드 ── */}
        {!loading && !error && filteredPosts.map((post) => (
          <div key={post.id} className="group w-full max-w-2xl relative" style={PANEL}>

            {editingPostId === post.id && editPost ? (
              /* ── 편집 폼 ── */
              <div className="flex flex-col gap-3">

                {/* 날짜 */}
                <div className="flex items-center gap-3">
                  <span className="text-xs shrink-0" style={{ color: "rgba(96,165,250,0.5)" }}>날짜</span>
                  <input type="date" value={editPost.date}
                    onChange={(e) => setEditPost((p) => ({ ...p, date: e.target.value }))}
                    className="bg-transparent text-xs font-mono outline-none cursor-pointer"
                    style={{ color: "rgba(220,235,255,0.7)", colorScheme: "dark" }} />
                </div>

                {/* 제목 */}
                <input value={editPost.title}
                  onChange={(e) => setEditPost((p) => ({ ...p, title: e.target.value }))}
                  placeholder="제목"
                  className="bg-transparent text-sm font-semibold outline-none w-full"
                  style={{ color: "rgba(255,255,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", paddingBottom: 5 }} />

                {/* 카테고리 */}
                <div className="flex gap-2 flex-wrap">
                  {subjectList.map((name) => {
                    const s      = resolveStyle(name, subjectMap);
                    const active = editPost.categories.includes(name);
                    return (
                      <button key={name} onClick={() => toggleEditCat(name)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition"
                        style={{
                          background: active ? s.bg : "rgba(255,255,255,0.04)",
                          color:      active ? s.color : "rgba(220,235,255,0.4)",
                          border:    `1px solid ${active ? s.border : "rgba(255,255,255,0.08)"}`,
                        }}>
                        {name}
                      </button>
                    );
                  })}
                </div>

                {/* 내용 */}
                <textarea value={editPost.content}
                  onChange={(e) => setEditPost((p) => ({ ...p, content: e.target.value }))}
                  rows={5}
                  className="bg-transparent text-xs outline-none w-full resize-none"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.7,
                    border: "1px solid rgba(96,165,250,0.15)",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }} />

                {/* 키워드 */}
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-5">
                    {editPost.keywords.map((k) => (
                      <span key={k} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                        #{k}
                        <button
                          onClick={() => setEditPost((p) => ({ ...p, keywords: p.keywords.filter((x) => x !== k) }))}
                          className="opacity-50 hover:opacity-100">×</button>
                      </span>
                    ))}
                  </div>
                  <input value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEditKeyword()}
                    placeholder="#키워드 입력 후 Enter"
                    className="bg-transparent text-xs outline-none w-full"
                    style={{ color: "rgba(220,235,255,0.6)", borderBottom: "1px solid rgba(96,165,250,0.15)", paddingBottom: 3 }} />
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={cancelEditPost}
                    className="text-xs px-3 py-1.5 rounded transition"
                    style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                  <button onClick={saveEditPost}
                    className="text-xs px-4 py-1.5 rounded font-medium transition"
                    style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>
                    저장
                  </button>
                </div>
              </div>

            ) : (
              /* ── 카드 뷰 ── */
              <>
                {/* 편집 / 삭제 버튼 — hover 시 표시 */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEditPost(post)}
                    className="text-sm leading-none hover:opacity-70 transition">✏️</button>
                  <button onClick={() => deletePost(post.id)}
                    className="text-base leading-none transition"
                    style={{ color: "#f87171", opacity: 0.6 }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}>×</button>
                </div>

                {/* 날짜 + 카테고리 뱃지 */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2 pr-14">
                  <p className="text-blue-200/50 text-xs">{fmtKo(post.date)}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {post.categories.map((c) => {
                      const s = resolveStyle(c, subjectMap);
                      return (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-md"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 제목 */}
                <p className="text-white/85 text-sm font-semibold mb-1">{post.title}</p>

                {/* 내용 */}
                {post.content && (
                  <p className="text-white/45 text-xs leading-relaxed line-clamp-4">{post.content}</p>
                )}

                {/* 키워드 */}
                {post.keywords.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {post.keywords.map((k, i) => (
                      <span key={`${k}-${i}`} className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                        #{k}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        ))}

      </div>

      <BackToSquare />
    </main>
  );
}
