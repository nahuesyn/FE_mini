"use client";

// 대시보드 — 왼쪽: 투두/프로젝트 | 오른쪽: 캘린더(일정+투두)
// 투두는 프로젝트별 또는 독립 관리 가능
// 일정·투두 모두 캘린더에 표시, 시간 설정 지원

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─── 스타일 상수 ─── */
const PAGE_BG = { background: "radial-gradient(ellipse at 60% 40%, #0A1520 0%, #060E18 100%)" };

const PANEL = {
  background: "rgba(8,16,40,0.55)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "16px",
};

const STATUS = {
  wip:  { label: "진행중",   color: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
  done: { label: "완료",     color: "#4ade80", bg: "rgba(74,222,128,0.15)"  },
  idea: { label: "아이디어", color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
};

const EVENT_COLORS = ["#f472b6", "#60a5fa", "#4ade80", "#f59e0b", "#a78bfa"];

/* ─── 프로젝트 색상 팔레트 (7색 × 밝음/중간/어둠) ─── */
const PROJECT_COLORS = [
  // 빨강
  ["#ffb3b3", "#f87171", "#dc2626"],
  // 주황
  ["#fed7aa", "#fb923c", "#ea580c"],
  // 노랑
  ["#fef08a", "#facc15", "#ca8a04"],
  // 초록
  ["#bbf7d0", "#4ade80", "#16a34a"],
  // 파랑
  ["#bfdbfe", "#60a5fa", "#2563eb"],
  // 남색
  ["#c7d2fe", "#818cf8", "#4338ca"],
  // 보라
  ["#e9d5ff", "#c084fc", "#9333ea"],
];

const TODAY = new Date();
const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ─── 날짜 → 월 표시 (2026-05 → 2026년 5월) ─── */
const toMonthLabel = (d) => {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${y}년 ${parseInt(m)}월`;
};

/* ─── DB row → 로컬 객체 변환 ─── */
const rowToTodo    = (r) => ({ id: r.id, text: r.text, done: r.done, projectId: r.project || null, date: r.date || null, time: r.start_time || null });
const rowToEvent   = (r) => ({ id: r.id, title: r.title, date: r.date, time: r.start_time || "", endTime: r.end_time || "", color: r.color || "#f472b6" });
const rowToProject = (r) => ({
  id:           r.id,
  title:        r.name,
  desc:         r.description || "",
  status:       r.status || "wip",
  color:        r.color || "#60a5fa",
  pinned:       r.pinned || false,
  startDate:    r.start_date || "",
  endDate:      r.end_date || "",
  url:          r.url || "",
  thumbnailUrl: r.thumbnail_url || "",
  createdAt:    r.created_at,
  tech: [],
});

/* ─── 메인 컴포넌트 ─── */
export default function DashPage() {
  const router = useRouter();

  /* 왼쪽 패널 탭 */
  const [leftTab,    setLeftTab]    = useState("투두");
  const [todoFilter, setTodoFilter] = useState(null);

  /* 데이터 */
  const [projects, setProjects] = useState([]);
  const [todos,    setTodos]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* 캘린더 상태 */
  const [calYM,       setCalYM]       = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() });
  const [selectedDay, setSelectedDay] = useState(TODAY.getDate());

  /* 폼 상태 — 왼쪽 투두 */
  const [showLeftTodoForm,  setShowLeftTodoForm]  = useState(false);
  const [newLeftText,       setNewLeftText]       = useState("");
  const [newLeftPid,        setNewLeftPid]        = useState(null);
  const [newLeftTime,       setNewLeftTime]       = useState("");
  const [newLeftDate,       setNewLeftDate]       = useState("");
  const [showLeftDateInput, setShowLeftDateInput] = useState(false);
  const [showLeftTimeInput, setShowLeftTimeInput] = useState(false);


  /* 폼 상태 — 일정 */
  const [showDayModal,  setShowDayModal]  = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", endTime: "", color: "#f472b6" });

  /* 폼 상태 — 프로젝트 */
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", desc: "", status: "wip", color: "#60a5fa", startDate: "", endDate: "", url: "" });

  /* ─── 투두 정렬 ─── */
  const [sortMode,   setSortMode]   = useState("custom");
  const [dragOverId, setDragOverId] = useState(null);
  const dragSrcIdx = useRef(null);

  /* ─── 투두 인라인 편집 ─── */
  const [editingId,  setEditingId]  = useState(null);
  const [editText,   setEditText]   = useState("");
  const [editPid,    setEditPid]    = useState(null);

  /* ─── 프로젝트 필터 ─── */
  const [projFilter, setProjFilter] = useState(null); // null = 전체

  /* ─── 프로젝트 인라인 편집 ─── */
  const [editingProjId,  setEditingProjId]  = useState(null);
  const [editProj,       setEditProj]       = useState(null);

  /* ─── 썸네일 파일 상태 ─── */
  const [newProjThumb,  setNewProjThumb]  = useState(null);
  const [editProjThumb, setEditProjThumb] = useState(null);

  /* ─── 일정 수정 상태 ─── */
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEvent,      setEditEvent]      = useState(null);

  /* ─── 썸네일 업로드 헬퍼 ─── */
  const uploadThumb = async (file) => {
    const ext  = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("project-thumbnails")
      .upload(path, file, { upsert: true });
    if (error) { console.error("thumb upload:", error.message); return null; }
    const { data: { publicUrl } } = supabase.storage
      .from("project-thumbnails")
      .getPublicUrl(data.path);
    return publicUrl;
  };

  /* ─── 초기 데이터 로드 ─── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: td }, { data: ev }, { data: pj }] = await Promise.all([
        supabase.from("village_todos").select("*").order("sort_order").order("created_at"),
        supabase.from("village_events").select("*").order("created_at"),
        supabase.from("village_projects").select("*").order("created_at"),
      ]);
      if (td) setTodos(td.map(rowToTodo));
      if (ev) setEvents(ev.map(rowToEvent));
      if (pj) setProjects(pj.map(rowToProject));
      setLoading(false);
    };
    load();
  }, []);

  /* ─── 캘린더 계산 ─── */
  const firstDay    = new Date(calYM.year, calYM.month, 1).getDay();
  const daysInMonth = new Date(calYM.year, calYM.month + 1, 0).getDate();
  const selectedKey = toKey(calYM.year, calYM.month, selectedDay);

  const prevMonth = () => setCalYM(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const nextMonth = () => setCalYM(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });

  /* ─── 날짜별 아이템 ─── */
  const selectedTodos  = todos.filter((t) => t.date === selectedKey);
  const selectedEvents = events.filter((e) => e.date === selectedKey);

  const hasTodo  = (key) => todos.some((t) => t.date === key);
  const hasEvent = (key) => events.some((e) => e.date === key);

  /* ─── 투두 필터링 + 정렬 (왼쪽 패널) ─── */
  // 진행중(wip) 프로젝트만 필터 목록에 표시
  const wipProjects = projects.filter((p) => p.status === "wip");

  const filteredTodos = todoFilter
    ? todos.filter((t) => t.projectId === todoFilter)
    : todos;

  const displayTodos = sortMode === "time"
    ? [...filteredTodos].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      })
    : filteredTodos;

  /* ─── 드래그 핸들러 ─── */
  const handleDragStart = (idx) => { dragSrcIdx.current = idx; };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault();
    const src = dragSrcIdx.current;
    if (src === null || src === dropIdx) { setDragOverId(null); return; }

    const reordered = [...filteredTodos];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dropIdx, 0, moved);

    const filteredIdSet = new Set(filteredTodos.map((t) => t.id));
    let fi = 0;
    const newTodos = todos.map((t) => filteredIdSet.has(t.id) ? reordered[fi++] : t);
    setTodos(newTodos);

    // DB sort_order 업데이트
    await Promise.all(
      reordered.map((t, i) =>
        supabase.from("village_todos").update({ sort_order: i }).eq("id", t.id)
      )
    );

    dragSrcIdx.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => { dragSrcIdx.current = null; setDragOverId(null); };

  /* ─── 핸들러 ─── */
  /* ─── 프로젝트 핀 토글 (로컬 상태만 — DB pinned 컬럼 추가 전까지) ─── */
  const togglePin = (proj) => {
    setProjects((p) => p.map((x) => x.id === proj.id ? { ...x, pinned: !x.pinned } : x));
  };

  /* ─── 프로젝트 수정 저장 ─── */
  const saveEditProj = async () => {
    if (!editProj || !editProj.title.trim()) return;
    let thumbUrl = editProj.thumbnailUrl;
    if (editProjThumb) {
      thumbUrl = (await uploadThumb(editProjThumb)) || thumbUrl;
    }
    const updated = { ...editProj, thumbnailUrl: thumbUrl };
    setProjects((p) => p.map((x) => x.id === editingProjId ? { ...x, ...updated } : x));

    const { error } = await supabase.from("village_projects").update({
      name:          editProj.title.trim(),
      description:   editProj.desc,
      status:        editProj.status,
      color:         editProj.color,
      start_date:    editProj.startDate,
      end_date:      editProj.endDate,
      url:           editProj.url,
      thumbnail_url: thumbUrl,
    }).eq("id", editingProjId);

    if (error) {
      console.error("프로젝트 저장 오류:", error.message, error.details, error.hint);
      alert(`저장 실패: ${error.message}`);
    }

    setEditingProjId(null);
    setEditProj(null);
    setEditProjThumb(null);
  };

  const startEdit = (t) => { setEditingId(t.id); setEditText(t.text); setEditPid(t.projectId); };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    setTodos((p) => p.map((t) => t.id === id ? { ...t, text: editText.trim(), projectId: editPid } : t));
    await supabase.from("village_todos").update({ text: editText.trim(), project: editPid || "" }).eq("id", id);
    setEditingId(null);
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    // 낙관적 업데이트
    setTodos((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    await supabase.from("village_todos").update({ done: !todo.done }).eq("id", id);
  };

  /* 왼쪽 패널 투두 추가 */
  const addTodoLeft = async () => {
    if (!newLeftText.trim()) return;
    const { data } = await supabase.from("village_todos").insert({
      text:       newLeftText.trim(),
      done:       false,
      project:    newLeftPid || "",
      start_time: newLeftTime || "",
      date:       newLeftDate || null,
      sort_order: todos.length,
    }).select().single();
    if (data) setTodos((p) => [...p, rowToTodo(data)]);
    setNewLeftText(""); setNewLeftDate(""); setNewLeftTime(""); setNewLeftPid(null);
    setShowLeftTodoForm(false);
  };


  /* 일정 추가 */
  const addEvent = async () => {
    if (!newEvent.title.trim()) return;
    const { data } = await supabase.from("village_events").insert({
      title:      newEvent.title.trim(),
      date:       selectedKey,
      start_time: newEvent.time || "",
      end_time:   newEvent.endTime || "",
      color:      newEvent.color,
    }).select().single();
    if (data) setEvents((p) => [...p, rowToEvent(data)]);
    setNewEvent({ title: "", time: "", endTime: "", color: "#f472b6" });
    setShowEventForm(false);
  };

  /* 프로젝트 추가 */
  const addProject = async () => {
    if (!newProject.title.trim()) return;
    let thumbUrl = "";
    if (newProjThumb) {
      thumbUrl = (await uploadThumb(newProjThumb)) || "";
    }
    const { data, error } = await supabase.from("village_projects").insert({
      name:          newProject.title.trim(),
      description:   newProject.desc,
      status:        newProject.status,
      color:         newProject.color,
      start_date:    newProject.startDate,
      end_date:      newProject.endDate,
      url:           newProject.url,
      thumbnail_url: thumbUrl,
    }).select().single();
    if (error) return; // 저장 실패
    if (data) {
      setProjects((p) => [...p, rowToProject(data)]);
    } else {
      // .select().single()이 data를 못 가져온 경우 전체 재조회
      const { data: pj } = await supabase.from("village_projects").select("*").order("created_at");
      if (pj) setProjects(pj.map(rowToProject));
    }
    setNewProject({ title: "", desc: "", status: "wip", color: "#60a5fa", startDate: "", endDate: "", url: "" });
    setNewProjThumb(null);
    setShowProjectForm(false);
    setProjFilter(null); // 저장 후 전체 보기로 리셋 → 방금 추가한 프로젝트가 보임
  };

  /* 날짜 모달 닫기 */
  const closeDayModal = () => {
    setShowDayModal(false);
    setShowEventForm(false);
    setNewEvent({ title: "", time: "", endTime: "", color: "#f472b6" });
    setEditingEventId(null);
    setEditEvent(null);
  };

  /* ─── 삭제 핸들러 ─── */
  const deleteTodo = async (id) => {
    if (!window.confirm("이 할 일을 삭제할까요?")) return;
    setTodos((p) => p.filter((t) => t.id !== id));
    await supabase.from("village_todos").delete().eq("id", id);
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("이 일정을 삭제할까요?")) return;
    setEvents((p) => p.filter((e) => e.id !== id));
    await supabase.from("village_events").delete().eq("id", id);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("이 프로젝트를 삭제할까요?")) return;
    setProjects((p) => p.filter((x) => x.id !== id));
    await supabase.from("village_projects").delete().eq("id", id);
  };

  /* ─── 일정 수정 저장 ─── */
  const saveEditEvent = async () => {
    if (!editEvent || !editEvent.title.trim()) return;
    setEvents((p) => p.map((e) => e.id === editingEventId ? { ...e, ...editEvent } : e));
    await supabase.from("village_events").update({
      title:      editEvent.title.trim(),
      start_time: editEvent.time     || "",
      end_time:   editEvent.endTime  || "",
      color:      editEvent.color,
    }).eq("id", editingEventId);
    setEditingEventId(null);
    setEditEvent(null);
  };

  /* ─── 렌더링 ─── */
  return (
    <main className="relative w-full min-h-screen flex flex-col items-center p-6 gap-5">
      <div className="fixed inset-0 -z-10" style={PAGE_BG} />

      {/* 헤더 */}
      <div className="w-full max-w-5xl flex items-center gap-3">
        <button onClick={() => router.push("/admin")}
          className="text-blue-200/50 hover:text-blue-200 transition text-sm">← 내 방</button>
        <h1 className="text-blue-100 font-bold text-lg ml-auto"
          style={{ fontFamily: "var(--font-display)" }}>🏛️ 대시보드</h1>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: "rgba(96,165,250,0.4)" }}>불러오는 중...</p>
        </div>
      )}

      {/* ── 2-Column 레이아웃 ── */}
      {!loading && (
        <div className="w-full max-w-5xl flex gap-4 items-start">

          {/* ════ 왼쪽 패널 ════ */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">

            {/* 투두 / 프로젝트 토글 */}
            <div className="flex gap-1 p-1 rounded-xl"
              style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
              {["투두", "프로젝트"].map((t) => (
                <button key={t} onClick={() => setLeftTab(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                  style={{
                    background: leftTab === t ? "rgba(96,165,250,0.2)" : "transparent",
                    color:      leftTab === t ? "#60a5fa" : "rgba(96,165,250,0.5)",
                  }}>
                  {t}
                </button>
              ))}
            </div>

            {/* ── 투두 패널 ── */}
            {leftTab === "투두" && (
              <div style={{ ...PANEL, padding: "16px" }} className="flex flex-col gap-3">

                {/* 프로젝트 필터 + 정렬 토글 */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    <FilterBtn active={todoFilter === null} onClick={() => setTodoFilter(null)}>전체</FilterBtn>
                    {wipProjects.map((p) => (
                      <FilterBtn key={p.id} active={todoFilter === p.id} onClick={() => setTodoFilter(p.id)}>
                        {p.title.length > 6 ? p.title.slice(0, 6) + "…" : p.title}
                      </FilterBtn>
                    ))}
                  </div>
                  {/* 정렬 토글 */}
                  <div className="flex gap-1 shrink-0">
                    {[{ val: "custom", label: "직접" }, { val: "time", label: "시간순" }].map(({ val, label }) => (
                      <button key={val} onClick={() => setSortMode(val)}
                        className="text-xs px-2 py-0.5 rounded-md transition"
                        style={{
                          background: sortMode === val ? "rgba(96,165,250,0.18)" : "transparent",
                          color:      sortMode === val ? "#60a5fa" : "rgba(96,165,250,0.35)",
                          border:    `1px solid ${sortMode === val ? "rgba(96,165,250,0.35)" : "rgba(96,165,250,0.12)"}`,
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 투두 목록 */}
                <div className="flex flex-col gap-1.5">
                  {displayTodos.length === 0 ? (
                    <p className="text-xs text-center py-2" style={{ color: "rgba(96,165,250,0.3)" }}>
                      할 일이 없어요
                    </p>
                  ) : displayTodos.map((t, idx) => {
                    const proj       = projects.find((p) => p.id === t.projectId);
                    const isDragOver = dragOverId === t.id && sortMode === "custom";
                    return (
                      <div key={t.id}
                        draggable={sortMode === "custom"}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => sortMode === "custom" && handleDragOver(e, t.id)}
                        onDrop={(e) => sortMode === "custom" && handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="group flex items-start gap-2 px-2 py-1.5 rounded-lg transition"
                        style={{
                          background:  isDragOver ? "rgba(96,165,250,0.12)" : "transparent",
                          borderTop:   isDragOver ? "2px solid rgba(96,165,250,0.5)" : "2px solid transparent",
                          cursor:      sortMode === "custom" ? "grab" : "default",
                        }}>

                        {sortMode === "custom" && (
                          <span className="shrink-0 mt-0.5 select-none"
                            style={{ color: "rgba(96,165,250,0.22)", fontSize: 12, lineHeight: 1.2, cursor: "grab" }}>
                            ⠿
                          </span>
                        )}

                        <button onClick={() => toggleTodo(t.id)}
                          className="w-4 h-4 rounded shrink-0 flex items-center justify-center mt-0.5 transition"
                          style={{
                            background: t.done ? "rgba(96,165,250,0.3)" : "transparent",
                            border: `1.5px solid ${t.done ? "#60a5fa" : "rgba(96,165,250,0.3)"}`,
                          }}>
                          {t.done && <span style={{ color: "#60a5fa", fontSize: 9, lineHeight: 1 }}>✓</span>}
                        </button>

                        <div className="flex-1 min-w-0 overflow-hidden">
                          {editingId === t.id ? (
                            <div className="flex flex-col gap-1.5">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(t.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                autoFocus
                                className="bg-transparent text-xs outline-none w-full"
                                style={{
                                  color: "rgba(220,235,255,0.9)",
                                  borderBottom: "1px solid rgba(96,165,250,0.4)",
                                  paddingBottom: 2,
                                }}
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <select
                                  value={editPid || ""}
                                  onChange={(e) => setEditPid(e.target.value || null)}
                                  className="flex-1 bg-transparent text-xs outline-none"
                                  style={{ color: "rgba(96,165,250,0.7)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 5, padding: "3px 6px", colorScheme: "dark" }}>
                                  <option value="">프로젝트 없음</option>
                                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                                <button onClick={() => saveEdit(t.id)}
                                  className="text-xs px-2.5 py-1 rounded font-medium shrink-0"
                                  style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>저장</button>
                                <button onClick={() => setEditingId(null)}
                                  className="text-xs px-2 py-1 rounded shrink-0"
                                  style={{ color: "rgba(220,235,255,0.3)" }}>✕</button>
                              </div>
                            </div>
                          ) : (
                            <p
                              className="text-xs leading-relaxed cursor-text"
                              onClick={() => { if (!t.done) { setEditingId(null); startEdit(t); } }}
                              style={{
                                color: t.done ? "rgba(96,165,250,0.35)" : "rgba(220,235,255,0.85)",
                                textDecoration: t.done ? "line-through" : "none",
                              }}>
                              {t.text}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {t.date && (
                              <span className="text-xs" style={{ color: "rgba(96,165,250,0.4)" }}>
                                {t.date.slice(5).replace("-", "/")}{t.time ? ` ${t.time}` : ""}
                              </span>
                            )}
                            {proj && (
                              <span className="text-xs px-1.5 py-px rounded"
                                style={{ background: "rgba(96,165,250,0.1)", color: "rgba(96,165,250,0.6)", fontSize: 10 }}>
                                {proj.title.slice(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 삭제 버튼 — hover 시 표시 */}
                        {editingId !== t.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTodo(t.id); }}
                            className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition mt-0.5"
                            style={{ color: "#f87171", fontSize: 15, lineHeight: 1, padding: "0 2px" }}>
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 왼쪽 패널 투두 추가 폼 */}
                {!showLeftTodoForm ? (
                  <button onClick={() => setShowLeftTodoForm(true)}
                    className="text-xs py-3 text-left transition"
                    style={{ color: "rgba(96,165,250,0.4)" }}>
                    + 새 할 일
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 pt-3 pb-1"
                    style={{ borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                    {/* 텍스트 입력 + 이모티콘 버튼 */}
                    <div className="flex items-center gap-2 pb-2"
                      style={{ borderBottom: "1px solid rgba(96,165,250,0.2)" }}>
                      {/* 빈 체크박스 */}
                      <div className="w-4 h-4 rounded shrink-0"
                        style={{ border: "1.5px solid rgba(96,165,250,0.3)", background: "transparent" }} />
                      <input value={newLeftText} onChange={(e) => setNewLeftText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTodoLeft()}
                        placeholder="할 일 입력..."
                        autoFocus
                        className="flex-1 bg-transparent text-xs outline-none"
                        style={{ color: "rgba(220,235,255,0.85)" }} />
                      <button onClick={() => setShowLeftDateInput((v) => !v)}
                        className="text-sm transition hover:scale-110"
                        style={{ opacity: newLeftDate ? 1 : showLeftDateInput ? 0.8 : 0.35 }}
                        title="날짜 설정">📅</button>
                      <button onClick={() => setShowLeftTimeInput((v) => !v)}
                        className="text-sm transition hover:scale-110"
                        style={{ opacity: newLeftTime ? 1 : showLeftTimeInput ? 0.8 : 0.35 }}
                        title="시간 설정">🕐</button>
                    </div>
                    {/* 날짜 피커 */}
                    {showLeftDateInput && (
                      <input type="date" value={newLeftDate} onChange={(e) => setNewLeftDate(e.target.value)}
                        className="bg-transparent text-xs outline-none w-full"
                        style={{ color: "rgba(96,165,250,0.7)", colorScheme: "dark",
                          border: "1px solid rgba(96,165,250,0.2)", borderRadius: 6, padding: "5px 8px" }} />
                    )}
                    {/* 시간 피커 */}
                    {showLeftTimeInput && (
                      <input type="time" value={newLeftTime} onChange={(e) => setNewLeftTime(e.target.value)}
                        className="bg-transparent text-xs outline-none w-full"
                        style={{ color: "rgba(96,165,250,0.7)", colorScheme: "dark",
                          border: "1px solid rgba(96,165,250,0.2)", borderRadius: 6, padding: "5px 8px" }} />
                    )}
                    <select value={newLeftPid || ""} onChange={(e) => setNewLeftPid(e.target.value || null)}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(96,165,250,0.6)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 6, padding: "6px 8px", colorScheme: "dark" }}>
                      <option value="">프로젝트 없음</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => { setShowLeftTodoForm(false); setShowLeftDateInput(false); setShowLeftTimeInput(false); }}
                        className="text-xs px-3 py-1.5 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                      <button onClick={addTodoLeft}
                        className="text-xs px-4 py-1.5 rounded font-medium"
                        style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>추가</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 프로젝트 패널 ── */}
            {leftTab === "프로젝트" && (
              <div style={{ ...PANEL, padding: "16px" }} className="flex flex-col gap-3">

                {/* 카테고리 필터 */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: "전체",    value: null    },
                    { label: "진행중",  value: "wip"   },
                    { label: "완료",    value: "done"  },
                    { label: "아이디어", value: "idea" },
                  ].map(({ label, value }) => (
                    <FilterBtn key={label} active={projFilter === value} onClick={() => setProjFilter(value)}>
                      {label}
                    </FilterBtn>
                  ))}
                </div>

                {(projFilter ? projects.filter((p) => p.status === projFilter) : projects).map((p, idx, arr) => {
                  const st        = STATUS[p.status] ?? STATUS.wip;
                  const pColor    = p.color || st.color;
                  const projTodos = todos.filter((t) => t.projectId === p.id);
                  const doneCnt   = projTodos.filter((t) => t.done).length;
                  const donePct   = projTodos.length > 0 ? Math.round(doneCnt / projTodos.length * 100) : null;
                  const isEditing = editingProjId === p.id;

                  return (
                    <div key={p.id} className="flex flex-col gap-1.5 pb-3"
                      style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(96,165,250,0.08)" : "none" }}>

                      {isEditing ? (
                        /* ── 수정 폼 ── */
                        <div className="flex flex-col gap-2">
                          <input value={editProj.title}
                            onChange={(e) => setEditProj((v) => ({ ...v, title: e.target.value }))}
                            autoFocus
                            className="bg-transparent text-xs outline-none w-full"
                            style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", paddingBottom: 4 }} />
                          <input value={editProj.desc}
                            onChange={(e) => setEditProj((v) => ({ ...v, desc: e.target.value }))}
                            placeholder="설명"
                            className="bg-transparent text-xs outline-none w-full"
                            style={{ color: "rgba(220,235,255,0.6)", borderBottom: "1px solid rgba(96,165,250,0.12)", paddingBottom: 3 }} />
                          <input value={editProj.url}
                            onChange={(e) => setEditProj((v) => ({ ...v, url: e.target.value }))}
                            placeholder="🔗 프로젝트 링크 (선택)"
                            className="bg-transparent text-xs outline-none w-full"
                            style={{ color: "rgba(96,165,250,0.7)", borderBottom: "1px solid rgba(96,165,250,0.12)", paddingBottom: 3 }} />
                          {/* 썸네일 */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs" style={{ color: "rgba(96,165,250,0.45)" }}>썸네일 이미지</span>
                            {editProj.thumbnailUrl && !editProjThumb && (
                              <img src={editProj.thumbnailUrl} alt="현재 썸네일"
                                className="h-14 rounded-lg object-cover w-full" />
                            )}
                            {editProjThumb && (
                              <img src={URL.createObjectURL(editProjThumb)} alt="미리보기"
                                className="h-14 rounded-lg object-cover w-full" />
                            )}
                            <input type="file" accept="image/*"
                              onChange={(e) => setEditProjThumb(e.target.files?.[0] || null)}
                              className="text-xs"
                              style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark" }} />
                          </div>
                          {/* 기간 */}
                          <div className="flex items-center gap-2">
                            <input type="date" value={editProj.startDate}
                              onChange={(e) => setEditProj((v) => ({ ...v, startDate: e.target.value }))}
                              className="flex-1 bg-transparent text-xs outline-none"
                              style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 5, padding: "3px 6px" }} />
                            <span className="text-xs" style={{ color: "rgba(96,165,250,0.3)" }}>~</span>
                            <input type="date" value={editProj.endDate}
                              onChange={(e) => setEditProj((v) => ({ ...v, endDate: e.target.value }))}
                              className="flex-1 bg-transparent text-xs outline-none"
                              style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 5, padding: "3px 6px" }} />
                          </div>
                          {/* 상태 */}
                          <div className="flex gap-1">
                            {Object.entries(STATUS).map(([k, v]) => (
                              <button key={k} onClick={() => setEditProj((ep) => ({ ...ep, status: k }))}
                                className="px-2 py-0.5 rounded text-xs transition"
                                style={{
                                  background: editProj.status === k ? v.bg : "transparent",
                                  color:      editProj.status === k ? v.color : "rgba(220,235,255,0.3)",
                                  border:    `1px solid ${editProj.status === k ? v.color : "rgba(255,255,255,0.08)"}`,
                                }}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                          {/* 색상 */}
                          <div className="flex flex-col gap-1">
                            {PROJECT_COLORS.map((row, ri) => (
                              <div key={ri} className="flex gap-1.5">
                                {row.map((c) => (
                                  <button key={c} onClick={() => setEditProj((ep) => ({ ...ep, color: c }))}
                                    className="w-4 h-4 rounded-full transition hover:scale-110"
                                    style={{
                                      background: c,
                                      outline: editProj.color === c ? `2px solid ${c}` : "none",
                                      outlineOffset: 2,
                                      opacity: editProj.color === c ? 1 : 0.5,
                                    }} />
                                ))}
                              </div>
                            ))}
                          </div>
                          {/* 핀 고정 */}
                          <button onClick={() => setEditProj((ep) => ({ ...ep, pinned: !ep.pinned }))}
                            className="flex items-center gap-1.5 text-xs w-fit px-2.5 py-1 rounded-full transition"
                            style={{
                              background: editProj.pinned ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                              color:      editProj.pinned ? "#f59e0b" : "rgba(220,235,255,0.3)",
                              border:    `1px solid ${editProj.pinned ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)"}`,
                            }}>
                            📌 {editProj.pinned ? "상단 고정" : "고정 안함"}
                          </button>
                          <div className="flex gap-2 justify-end mt-1">
                            <button onClick={() => setEditingProjId(null)}
                              className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.3)" }}>취소</button>
                            <button onClick={saveEditProj}
                              className="text-xs px-3 py-1 rounded font-medium"
                              style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>저장</button>
                          </div>
                        </div>
                      ) : (
                        /* ── 카드 뷰 ── */
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pColor }} />
                              <p className="text-sm font-medium truncate" style={{ color: "rgba(220,235,255,0.9)" }}>{p.title}</p>
                              {p.pinned && <span style={{ fontSize: 11 }}>📌</span>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded"
                                style={{ background: st.bg, color: st.color }}>{st.label}</span>
                              <button onClick={() => { setEditingProjId(p.id); setEditProj({ title: p.title, desc: p.desc, status: p.status, color: p.color, pinned: p.pinned, startDate: p.startDate, endDate: p.endDate, url: p.url, thumbnailUrl: p.thumbnailUrl }); setEditProjThumb(null); }}
                                className="text-xs transition hover:opacity-60">✏️</button>
                              <button onClick={() => deleteProject(p.id)}
                                className="text-xs transition hover:opacity-60"
                                style={{ color: "rgba(248,113,113,0.7)", fontSize: 16, lineHeight: 1 }}>×</button>
                            </div>
                          </div>
                          {p.desc && <p className="text-xs" style={{ color: "rgba(220,235,255,0.4)" }}>{p.desc}</p>}
                          {(p.startDate || p.endDate) && (
                            <p className="text-xs" style={{ color: "rgba(96,165,250,0.4)" }}>
                              {toMonthLabel(p.startDate) || "?"} ~ {toMonthLabel(p.endDate) || "진행중"}
                            </p>
                          )}
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 transition hover:opacity-80 w-fit"
                              style={{ color: "rgba(96,165,250,0.5)" }}
                              onClick={(e) => e.stopPropagation()}>
                              🔗 <span className="underline underline-offset-2 truncate max-w-[120px]">링크</span>
                            </a>
                          )}
                          {donePct !== null && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: "rgba(96,165,250,0.1)" }}>
                                <div className="h-full rounded-full transition-[width] duration-500"
                                  style={{ width: `${donePct}%`, background: pColor, opacity: 0.7 }} />
                              </div>
                              <span className="text-xs" style={{ color: "rgba(96,165,250,0.5)" }}>
                                {doneCnt}/{projTodos.length}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {!showProjectForm ? (
                  <button onClick={() => setShowProjectForm(true)}
                    className="text-xs py-3 text-left" style={{ color: "rgba(96,165,250,0.4)" }}>
                    + 새 프로젝트
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 pt-4 pb-2"
                    style={{ borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                    <input value={newProject.title}
                      onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                      placeholder="프로젝트 이름" autoFocus
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", padding: "6px 0 6px 0" }} />
                    <input value={newProject.desc}
                      onChange={(e) => setNewProject((p) => ({ ...p, desc: e.target.value }))}
                      placeholder="간단한 설명"
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", padding: "6px 0 6px 0" }} />
                    <input value={newProject.url}
                      onChange={(e) => setNewProject((p) => ({ ...p, url: e.target.value }))}
                      placeholder="🔗 프로젝트 링크 (선택)"
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: "rgba(96,165,250,0.7)", borderBottom: "1px solid rgba(96,165,250,0.12)", paddingBottom: 4 }} />
                    {/* 썸네일 */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs" style={{ color: "rgba(96,165,250,0.45)" }}>썸네일 이미지 (선택)</span>
                      <input type="file" accept="image/*"
                        onChange={(e) => setNewProjThumb(e.target.files?.[0] || null)}
                        className="text-xs"
                        style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark" }} />
                      {newProjThumb && (
                        <img src={URL.createObjectURL(newProjThumb)} alt="미리보기"
                          className="h-16 rounded-lg object-cover w-full" />
                      )}
                    </div>
                    {/* 기간 */}
                    <div className="flex items-center gap-2">
                      <input type="date" value={newProject.startDate}
                        onChange={(e) => setNewProject((p) => ({ ...p, startDate: e.target.value }))}
                        className="flex-1 bg-transparent text-xs outline-none"
                        style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 5, padding: "3px 6px" }} />
                      <span className="text-xs" style={{ color: "rgba(96,165,250,0.3)" }}>~</span>
                      <input type="date" value={newProject.endDate}
                        onChange={(e) => setNewProject((p) => ({ ...p, endDate: e.target.value }))}
                        className="flex-1 bg-transparent text-xs outline-none"
                        style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 5, padding: "3px 6px" }} />
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(STATUS).map(([k, v]) => (
                        <button key={k} onClick={() => setNewProject((p) => ({ ...p, status: k }))}
                          className="px-2 py-0.5 rounded text-xs transition"
                          style={{
                            background: newProject.status === k ? v.bg : "transparent",
                            color:      newProject.status === k ? v.color : "rgba(220,235,255,0.35)",
                            border:    `1px solid ${newProject.status === k ? v.color : "rgba(255,255,255,0.08)"}`,
                          }}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowProjectForm(false)}
                        className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                      <button onClick={addProject}
                        className="text-xs px-3 py-1 rounded font-medium"
                        style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>저장</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════ 오른쪽 캘린더 패널 ════ */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* 월 캘린더 */}
            <div style={{ ...PANEL, padding: "20px" }}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth}
                  className="text-blue-300/50 hover:text-blue-300 transition text-xl w-8 h-8 flex items-center justify-center">‹</button>
                <span className="text-blue-100 text-sm font-medium">
                  {calYM.year}년 {calYM.month + 1}월
                </span>
                <button onClick={nextMonth}
                  className="text-blue-300/50 hover:text-blue-300 transition text-xl w-8 h-8 flex items-center justify-center">›</button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {["일","월","화","수","목","금","토"].map((d) => (
                  <div key={d} className="text-center text-xs py-1"
                    style={{ color: "rgba(96,165,250,0.4)" }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const d   = i + 1;
                  const key = toKey(calYM.year, calYM.month, d);
                  const isToday    = d === TODAY.getDate() && calYM.month === TODAY.getMonth() && calYM.year === TODAY.getFullYear();
                  const isSelected = d === selectedDay;
                  const hasTd = hasTodo(key);
                  const hasEv = hasEvent(key);

                  return (
                    <button key={d} onClick={() => { setSelectedDay(d); setShowDayModal(true); setShowEventForm(false); }}
                      className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition hover:opacity-80"
                      style={{
                        background: isSelected ? "rgba(96,165,250,0.28)" : isToday ? "rgba(96,165,250,0.12)" : "transparent",
                        color:      isSelected ? "#fff" : isToday ? "#60a5fa" : "rgba(220,235,255,0.7)",
                        border:    `1px solid ${isSelected ? "rgba(96,165,250,0.6)" : isToday ? "rgba(96,165,250,0.3)" : "transparent"}`,
                      }}>
                      <span>{d}</span>
                      <div className="flex gap-0.5 mt-px h-1.5 items-center">
                        {hasTd && <div className="w-1 h-1 rounded-full" style={{ background: "#60a5fa" }} />}
                        {hasEv && <div className="w-1 h-1 rounded-full" style={{ background: "#f472b6" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 justify-end">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#60a5fa" }} /> 투두
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f472b6" }} /> 일정
                </div>
              </div>
            </div>

          </div>
          {/* ════ end 오른쪽 ════ */}

        </div>
      )}
      {/* ── 날짜 클릭 모달 ── */}
      {showDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={closeDayModal}>
          <div className="flex flex-col gap-3 w-full max-w-sm mx-4 rounded-2xl p-5"
            style={{ background: "rgba(6,14,36,0.97)", border: "1px solid rgba(96,165,250,0.25)", backdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: "rgba(220,235,255,0.9)", fontFamily: "var(--font-display)" }}>
                {calYM.month + 1}월 {selectedDay}일
              </p>
              <div className="flex items-center gap-2">
                {!showEventForm && (
                  <button onClick={() => setShowEventForm(true)}
                    className="text-xs px-2.5 py-1 rounded-lg transition hover:opacity-90"
                    style={{ background: "rgba(244,114,182,0.12)", color: "rgba(244,114,182,0.8)", border: "1px solid rgba(244,114,182,0.25)" }}>
                    + 일정
                  </button>
                )}
                <button onClick={closeDayModal}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-sm transition hover:opacity-70"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  ×
                </button>
              </div>
            </div>

            {/* 일정 추가 폼 */}
            {showEventForm && (
              <div className="flex flex-col gap-2 p-3 rounded-xl"
                style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.18)" }}>
                <input value={newEvent.title} onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addEvent()}
                  placeholder="일정 제목..."
                  autoFocus
                  className="bg-transparent text-xs outline-none w-full"
                  style={{ color: "rgba(220,235,255,0.9)", borderBottom: "1px solid rgba(244,114,182,0.15)", paddingBottom: 4 }} />
                <div className="flex gap-3 items-center flex-wrap mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>시작</span>
                    <input type="time" value={newEvent.time} onChange={(e) => setNewEvent((v) => ({ ...v, time: e.target.value }))}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(244,114,182,0.75)", colorScheme: "dark" }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>종료</span>
                    <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent((v) => ({ ...v, endTime: e.target.value }))}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(244,114,182,0.75)", colorScheme: "dark" }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>색상</span>
                  {EVENT_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewEvent((v) => ({ ...v, color: c }))}
                      className="w-4 h-4 rounded-full transition"
                      style={{ background: c, outline: newEvent.color === c ? `2px solid ${c}` : "none", outlineOffset: 2, opacity: newEvent.color === c ? 1 : 0.45 }} />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowEventForm(false)}
                    className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                  <button onClick={addEvent}
                    className="text-xs px-3 py-1 rounded font-medium"
                    style={{ background: "rgba(244,114,182,0.18)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.35)" }}>추가</button>
                </div>
              </div>
            )}

            {/* 투두 목록 */}
            {selectedTodos.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs" style={{ color: "rgba(96,165,250,0.35)" }}>할 일</p>
                {selectedTodos.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  return (
                    <div key={t.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.15)" }}>
                      <button onClick={() => toggleTodo(t.id)}
                        className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition"
                        style={{
                          background: t.done ? "rgba(96,165,250,0.3)" : "transparent",
                          border: `1.5px solid ${t.done ? "#60a5fa" : "rgba(96,165,250,0.3)"}`,
                        }}>
                        {t.done && <span style={{ color: "#60a5fa", fontSize: 9, lineHeight: 1 }}>✓</span>}
                      </button>
                      <span className="text-xs flex-1"
                        style={{
                          color: t.done ? "rgba(96,165,250,0.35)" : "rgba(220,235,255,0.85)",
                          textDecoration: t.done ? "line-through" : "none",
                        }}>
                        {t.text}
                      </span>
                      {t.time && (
                        <span className="text-xs shrink-0" style={{ color: "rgba(96,165,250,0.45)" }}>{t.time}</span>
                      )}
                      {proj && (
                        <span className="text-xs px-1.5 py-px rounded shrink-0"
                          style={{ background: "rgba(96,165,250,0.1)", color: "rgba(96,165,250,0.55)", fontSize: 10 }}>
                          {proj.title.slice(0, 5)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 일정 목록 */}
            {selectedEvents.length === 0 && selectedTodos.length === 0 && !showEventForm ? (
              <p className="text-xs text-center py-4" style={{ color: "rgba(96,165,250,0.25)" }}>이 날의 일정이 없어요</p>
            ) : selectedEvents.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((ev) => (
                  <div key={ev.id}>
                    {editingEventId === ev.id ? (
                      /* ── 일정 수정 폼 ── */
                      <div className="flex flex-col gap-2 p-3 rounded-xl"
                        style={{ background: `${ev.color}0d`, border: `1px solid ${ev.color}33` }}>
                        <input value={editEvent.title}
                          onChange={(e) => setEditEvent((v) => ({ ...v, title: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && saveEditEvent()}
                          autoFocus
                          className="bg-transparent text-xs outline-none w-full"
                          style={{ color: "rgba(220,235,255,0.9)", borderBottom: "1px solid rgba(244,114,182,0.15)", paddingBottom: 4 }} />
                        <div className="flex gap-3 items-center flex-wrap mt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>시작</span>
                            <input type="time" value={editEvent.time}
                              onChange={(e) => setEditEvent((v) => ({ ...v, time: e.target.value }))}
                              className="bg-transparent text-xs outline-none"
                              style={{ color: "rgba(244,114,182,0.75)", colorScheme: "dark" }} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>종료</span>
                            <input type="time" value={editEvent.endTime}
                              onChange={(e) => setEditEvent((v) => ({ ...v, endTime: e.target.value }))}
                              className="bg-transparent text-xs outline-none"
                              style={{ color: "rgba(244,114,182,0.75)", colorScheme: "dark" }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>색상</span>
                          {EVENT_COLORS.map((c) => (
                            <button key={c} onClick={() => setEditEvent((v) => ({ ...v, color: c }))}
                              className="w-4 h-4 rounded-full transition"
                              style={{ background: c, outline: editEvent.color === c ? `2px solid ${c}` : "none", outlineOffset: 2, opacity: editEvent.color === c ? 1 : 0.45 }} />
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingEventId(null); setEditEvent(null); }}
                            className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                          <button onClick={saveEditEvent}
                            className="text-xs px-3 py-1 rounded font-medium"
                            style={{ background: "rgba(244,114,182,0.18)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.35)" }}>저장</button>
                        </div>
                      </div>
                    ) : (
                      /* ── 일정 카드 ── */
                      <div className="group flex items-center gap-2.5 px-3 py-2 rounded-lg"
                        style={{ background: `${ev.color}11`, border: `1px solid ${ev.color}33` }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ev.color }} />
                        <span className="text-xs flex-1" style={{ color: "rgba(220,235,255,0.85)" }}>{ev.title}</span>
                        {ev.time && (
                          <span className="text-xs shrink-0" style={{ color: `${ev.color}bb` }}>
                            {ev.time}{ev.endTime ? ` ~ ${ev.endTime}` : ""}
                          </span>
                        )}
                        {/* 수정 / 삭제 */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button onClick={() => { setEditingEventId(ev.id); setEditEvent({ title: ev.title, time: ev.time, endTime: ev.endTime, color: ev.color }); setShowEventForm(false); }}
                            className="text-xs hover:opacity-70 transition">✏️</button>
                          <button onClick={() => deleteEvent(ev.id)}
                            className="text-xs hover:opacity-70 transition"
                            style={{ color: "rgba(248,113,113,0.8)", fontSize: 15, lineHeight: 1 }}>×</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}

/* ─── 필터 버튼 헬퍼 컴포넌트 ─── */
function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-xs transition"
      style={{
        background: active ? "rgba(96,165,250,0.2)" : "transparent",
        color:      active ? "#60a5fa" : "rgba(96,165,250,0.45)",
        border:    `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.15)"}`,
      }}>
      {children}
    </button>
  );
}
