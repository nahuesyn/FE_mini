"use client";

// 대시보드 — 왼쪽: 투두/프로젝트 | 오른쪽: 캘린더(일정+투두)
// 투두는 프로젝트별 또는 독립 관리 가능
// 일정·투두 모두 캘린더에 표시, 시간 설정 지원

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

const TODAY = new Date();
const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ─── 초기 Mock 데이터 ─── */
const INIT_PROJECTS = [
  { id: "p1", title: "마을 포트폴리오", desc: "인터랙티브 마을 컨셉", status: "wip",  tech: ["Next.js", "Tailwind"] },
  { id: "p2", title: "날씨 앱",         desc: "Open Weather API",     status: "done", tech: ["React"] },
];

const todayKey = toKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
const tmrKey   = toKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1);

const INIT_TODOS = [
  { id: "t1", text: "디자인 시스템 정리",  done: true,  projectId: "p1", date: null,     time: null    },
  { id: "t2", text: "광장 호버 효과 구현", done: false, projectId: "p1", date: todayKey, time: "14:00" },
  { id: "t3", text: "Supabase 연동",       done: false, projectId: null, date: tmrKey,   time: null    },
];

const INIT_EVENTS = [
  { id: "e1", title: "팀 미팅", date: todayKey, time: "10:00", endTime: "11:00", color: "#f472b6" },
];

/* ─── 메인 컴포넌트 ─── */
export default function DashPage() {
  const router = useRouter();

  /* 왼쪽 패널 탭 */
  const [leftTab,    setLeftTab]    = useState("투두");   // "투두" | "프로젝트"
  const [todoFilter, setTodoFilter] = useState(null);     // null = 전체, projectId = 프로젝트별

  /* 데이터 */
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [todos,    setTodos]    = useState(INIT_TODOS);
  const [events,   setEvents]   = useState(INIT_EVENTS);

  /* 캘린더 상태 */
  const [calYM,       setCalYM]       = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() });
  const [selectedDay, setSelectedDay] = useState(TODAY.getDate());

  /* 폼 상태 — 투두 */
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodoText,  setNewTodoText]  = useState("");
  const [newTodoPid,   setNewTodoPid]   = useState(null);
  const [newTodoTime,  setNewTodoTime]  = useState("");
  const [newTodoDate,  setNewTodoDate]  = useState("");

  /* 폼 상태 — 일정 */
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", endTime: "", color: "#f472b6" });

  /* 폼 상태 — 프로젝트 */
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", desc: "", status: "wip" });

  /* ─── 투두 정렬 ─── */
  const [sortMode,   setSortMode]   = useState("custom"); // "custom" | "time"
  const [dragOverId, setDragOverId] = useState(null);
  const dragSrcIdx = useRef(null);

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

  /* 캘린더 점 표시 */
  const hasTodo  = (key) => todos.some((t) => t.date === key);
  const hasEvent = (key) => events.some((e) => e.date === key);

  /* ─── 투두 필터링 + 정렬 (왼쪽 패널) ─── */
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

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    const src = dragSrcIdx.current;
    if (src === null || src === dropIdx) { setDragOverId(null); return; }

    // filteredTodos 기준으로 재정렬
    const reordered = [...filteredTodos];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dropIdx, 0, moved);

    // 전체 todos 배열 재구성
    const filteredIdSet = new Set(filteredTodos.map((t) => t.id));
    let fi = 0;
    setTodos(todos.map((t) => filteredIdSet.has(t.id) ? reordered[fi++] : t));

    dragSrcIdx.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => { dragSrcIdx.current = null; setDragOverId(null); };

  /* ─── 핸들러 ─── */
  const toggleTodo = (id) =>
    setTodos((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  /* 왼쪽 패널 투두 추가 */
  const addTodoLeft = () => {
    if (!newTodoText.trim()) return;
    setTodos((p) => [...p, {
      id: `t${Date.now()}`, text: newTodoText.trim(), done: false,
      projectId: newTodoPid,
      date: newTodoDate || null,
      time: newTodoTime || null,
    }]);
    setNewTodoText(""); setNewTodoDate(""); setNewTodoTime(""); setNewTodoPid(null);
    setShowTodoForm(false);
  };

  /* 캘린더에서 투두 추가 */
  const addTodoFromCal = () => {
    if (!newTodoText.trim()) return;
    setTodos((p) => [...p, {
      id: `t${Date.now()}`, text: newTodoText.trim(), done: false,
      projectId: newTodoPid,
      date: selectedKey,
      time: newTodoTime || null,
    }]);
    setNewTodoText(""); setNewTodoTime(""); setNewTodoPid(null);
    setShowTodoForm(false);
  };

  /* 일정 추가 */
  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents((p) => [...p, { id: `e${Date.now()}`, ...newEvent, date: selectedKey }]);
    setNewEvent({ title: "", time: "", endTime: "", color: "#f472b6" });
    setShowEventForm(false);
  };

  /* 프로젝트 추가 */
  const addProject = () => {
    if (!newProject.title.trim()) return;
    setProjects((p) => [...p, { id: `p${Date.now()}`, ...newProject, tech: [] }]);
    setNewProject({ title: "", desc: "", status: "wip" });
    setShowProjectForm(false);
  };

  /* 캘린더 폼 열기 헬퍼 */
  const openTodoForm  = () => { setShowTodoForm(true);  setShowEventForm(false); };
  const openEventForm = () => { setShowEventForm(true); setShowTodoForm(false);  };

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

      {/* ── 2-Column 레이아웃 ── */}
      <div className="w-full max-w-5xl flex gap-4 items-start">

        {/* ════ 왼쪽 패널 ════ */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">

          {/* 투두 / 프로젝트 토글 */}
          <div className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
            {["투두", "프로젝트"].map((t) => (
              <button key={t} onClick={() => setLeftTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
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
                  {projects.map((p) => (
                    <FilterBtn key={p.id} active={todoFilter === p.id} onClick={() => setTodoFilter(p.id)}>
                      {p.title.length > 6 ? p.title.slice(0, 6) + "…" : p.title}
                    </FilterBtn>
                  ))}
                </div>
                {/* 정렬 토글 */}
                <div className="flex gap-1 shrink-0">
                  {[{ val: "custom", label: "직접" }, { val: "time", label: "시간순" }].map(({ val, label }) => (
                    <button key={val} onClick={() => setSortMode(val)}
                      className="text-xs px-2 py-0.5 rounded-md transition-all"
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
                      className="flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all"
                      style={{
                        background:  isDragOver ? "rgba(96,165,250,0.12)" : "transparent",
                        borderTop:   isDragOver ? "2px solid rgba(96,165,250,0.5)" : "2px solid transparent",
                        cursor:      sortMode === "custom" ? "grab" : "default",
                      }}>

                      {/* 드래그 핸들 (직접 정렬 모드) */}
                      {sortMode === "custom" && (
                        <span className="shrink-0 mt-0.5 select-none"
                          style={{ color: "rgba(96,165,250,0.22)", fontSize: 12, lineHeight: 1.2, cursor: "grab" }}>
                          ⠿
                        </span>
                      )}

                      {/* 체크박스 */}
                      <button onClick={() => toggleTodo(t.id)}
                        className="w-4 h-4 rounded shrink-0 flex items-center justify-center mt-0.5 transition-all"
                        style={{
                          background: t.done ? "rgba(96,165,250,0.3)" : "transparent",
                          border: `1.5px solid ${t.done ? "#60a5fa" : "rgba(96,165,250,0.3)"}`,
                        }}>
                        {t.done && <span style={{ color: "#60a5fa", fontSize: 9, lineHeight: 1 }}>✓</span>}
                      </button>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{
                          color: t.done ? "rgba(96,165,250,0.35)" : "rgba(220,235,255,0.85)",
                          textDecoration: t.done ? "line-through" : "none",
                        }}>
                          {t.text}
                        </p>
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
                    </div>
                  );
                })}
              </div>

              {/* 왼쪽 패널 투두 추가 폼 */}
              {!showTodoForm ? (
                <button onClick={() => { setShowTodoForm(true); }}
                  className="text-xs py-1.5 text-left transition-all"
                  style={{ color: "rgba(96,165,250,0.4)" }}>
                  + 새 할 일
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-2"
                  style={{ borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                  <input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodoLeft()}
                    placeholder="할 일 입력..."
                    autoFocus
                    className="bg-transparent text-xs outline-none w-full"
                    style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", paddingBottom: 4 }} />
                  <div className="flex gap-2 items-center">
                    <input type="date" value={newTodoDate} onChange={(e) => setNewTodoDate(e.target.value)}
                      className="bg-transparent text-xs outline-none flex-1"
                      style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark" }} />
                    <input type="time" value={newTodoTime} onChange={(e) => setNewTodoTime(e.target.value)}
                      className="bg-transparent text-xs outline-none w-16"
                      style={{ color: "rgba(96,165,250,0.6)", colorScheme: "dark" }} />
                  </div>
                  <select value={newTodoPid || ""} onChange={(e) => setNewTodoPid(e.target.value || null)}
                    className="bg-transparent text-xs outline-none"
                    style={{ color: "rgba(96,165,250,0.6)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 6, padding: "3px 6px", colorScheme: "dark" }}>
                    <option value="">프로젝트 없음</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowTodoForm(false)}
                      className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                    <button onClick={addTodoLeft}
                      className="text-xs px-3 py-1 rounded font-medium"
                      style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>추가</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 프로젝트 패널 ── */}
          {leftTab === "프로젝트" && (
            <div style={{ ...PANEL, padding: "16px" }} className="flex flex-col gap-3">
              {projects.map((p, idx) => {
                const st        = STATUS[p.status];
                const projTodos = todos.filter((t) => t.projectId === p.id);
                const doneCnt   = projTodos.filter((t) => t.done).length;
                const donePct   = projTodos.length > 0 ? Math.round(doneCnt / projTodos.length * 100) : null;
                return (
                  <div key={p.id} className="flex flex-col gap-1.5 pb-3"
                    style={{ borderBottom: idx < projects.length - 1 ? "1px solid rgba(96,165,250,0.08)" : "none" }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: "rgba(220,235,255,0.9)" }}>{p.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded"
                        style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    {p.desc && (
                      <p className="text-xs" style={{ color: "rgba(220,235,255,0.4)" }}>{p.desc}</p>
                    )}
                    {donePct !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(96,165,250,0.1)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${donePct}%`, background: "#60a5fa", opacity: 0.7 }} />
                        </div>
                        <span className="text-xs" style={{ color: "rgba(96,165,250,0.5)" }}>
                          {doneCnt}/{projTodos.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 프로젝트 추가 */}
              {!showProjectForm ? (
                <button onClick={() => setShowProjectForm(true)}
                  className="text-xs py-1 text-left" style={{ color: "rgba(96,165,250,0.4)" }}>
                  + 새 프로젝트
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-2"
                  style={{ borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                  <input value={newProject.title}
                    onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                    placeholder="프로젝트 이름" autoFocus
                    className="bg-transparent text-xs outline-none w-full"
                    style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", paddingBottom: 4 }} />
                  <input value={newProject.desc}
                    onChange={(e) => setNewProject((p) => ({ ...p, desc: e.target.value }))}
                    placeholder="간단한 설명"
                    className="bg-transparent text-xs outline-none w-full"
                    style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.2)", paddingBottom: 4 }} />
                  <div className="flex gap-1">
                    {Object.entries(STATUS).map(([k, v]) => (
                      <button key={k} onClick={() => setNewProject((p) => ({ ...p, status: k }))}
                        className="px-2 py-0.5 rounded text-xs transition-all"
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
            {/* 월 네비 */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth}
                className="text-blue-300/50 hover:text-blue-300 transition text-xl w-8 h-8 flex items-center justify-center">‹</button>
              <span className="text-blue-100 text-sm font-medium">
                {calYM.year}년 {calYM.month + 1}월
              </span>
              <button onClick={nextMonth}
                className="text-blue-300/50 hover:text-blue-300 transition text-xl w-8 h-8 flex items-center justify-center">›</button>
            </div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {["일","월","화","수","목","금","토"].map((d) => (
                <div key={d} className="text-center text-xs py-1"
                  style={{ color: "rgba(96,165,250,0.4)" }}>{d}</div>
              ))}
            </div>
            {/* 날짜 그리드 */}
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
                  <button key={d} onClick={() => setSelectedDay(d)}
                    className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:opacity-80"
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
            {/* 범례 */}
            <div className="flex gap-4 mt-4 justify-end">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#60a5fa" }} /> 투두
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f472b6" }} /> 일정
              </div>
            </div>
          </div>

          {/* 선택된 날짜 상세 */}
          <div style={{ ...PANEL, padding: "16px" }} className="flex flex-col gap-3">
            {/* 날짜 헤더 + 추가 버튼 */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "rgba(220,235,255,0.8)" }}>
                {calYM.month + 1}월 {selectedDay}일
              </p>
              <div className="flex gap-2">
                <button onClick={openTodoForm}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-90"
                  style={{ background: "rgba(96,165,250,0.12)", color: "rgba(96,165,250,0.75)", border: "1px solid rgba(96,165,250,0.22)" }}>
                  + 투두
                </button>
                <button onClick={openEventForm}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-90"
                  style={{ background: "rgba(244,114,182,0.12)", color: "rgba(244,114,182,0.75)", border: "1px solid rgba(244,114,182,0.22)" }}>
                  + 일정
                </button>
              </div>
            </div>

            {/* 캘린더 투두 추가 폼 */}
            {showTodoForm && (
              <div className="flex flex-col gap-2 p-3 rounded-xl"
                style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
                <p className="text-xs font-medium" style={{ color: "rgba(96,165,250,0.6)" }}>투두 추가</p>
                <input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodoFromCal()}
                  placeholder="할 일 입력..."
                  autoFocus
                  className="bg-transparent text-xs outline-none w-full"
                  style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(96,165,250,0.15)", paddingBottom: 4 }} />
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: "rgba(96,165,250,0.5)" }}>시간</span>
                    <input type="time" value={newTodoTime} onChange={(e) => setNewTodoTime(e.target.value)}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(96,165,250,0.7)", colorScheme: "dark" }} />
                  </div>
                  <select value={newTodoPid || ""} onChange={(e) => setNewTodoPid(e.target.value || null)}
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: "rgba(96,165,250,0.6)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: 6, padding: "3px 6px", colorScheme: "dark", minWidth: 100 }}>
                    <option value="">프로젝트 없음</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowTodoForm(false)}
                    className="text-xs px-2 py-1 rounded" style={{ color: "rgba(220,235,255,0.35)" }}>취소</button>
                  <button onClick={addTodoFromCal}
                    className="text-xs px-3 py-1 rounded font-medium"
                    style={{ background: "rgba(96,165,250,0.18)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.35)" }}>추가</button>
                </div>
              </div>
            )}

            {/* 일정 추가 폼 */}
            {showEventForm && (
              <div className="flex flex-col gap-2 p-3 rounded-xl"
                style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.15)" }}>
                <p className="text-xs font-medium" style={{ color: "rgba(244,114,182,0.6)" }}>일정 추가</p>
                <input value={newEvent.title} onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addEvent()}
                  placeholder="일정 제목..."
                  autoFocus
                  className="bg-transparent text-xs outline-none w-full"
                  style={{ color: "rgba(220,235,255,0.85)", borderBottom: "1px solid rgba(244,114,182,0.15)", paddingBottom: 4 }} />
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>시작</span>
                    <input type="time" value={newEvent.time} onChange={(e) => setNewEvent((v) => ({ ...v, time: e.target.value }))}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(244,114,182,0.7)", colorScheme: "dark" }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>종료</span>
                    <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent((v) => ({ ...v, endTime: e.target.value }))}
                      className="bg-transparent text-xs outline-none"
                      style={{ color: "rgba(244,114,182,0.7)", colorScheme: "dark" }} />
                  </div>
                </div>
                {/* 색상 팔레트 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "rgba(244,114,182,0.5)" }}>색상</span>
                  {EVENT_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewEvent((v) => ({ ...v, color: c }))}
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        background: c,
                        outline:      newEvent.color === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2,
                        opacity:      newEvent.color === c ? 1 : 0.45,
                      }} />
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

            {/* 해당 날짜 아이템 목록 */}
            {selectedEvents.length === 0 && selectedTodos.length === 0 && !showEventForm && !showTodoForm ? (
              <p className="text-xs text-center py-3" style={{ color: "rgba(96,165,250,0.25)" }}>
                이 날의 일정이 없어요
              </p>
            ) : (
              <div className="flex flex-col gap-2">

                {/* 일정 아이템 */}
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                    style={{ background: `${ev.color}11`, border: `1px solid ${ev.color}33` }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ev.color }} />
                    <span className="text-xs flex-1" style={{ color: "rgba(220,235,255,0.85)" }}>{ev.title}</span>
                    {ev.time && (
                      <span className="text-xs shrink-0" style={{ color: `${ev.color}bb` }}>
                        {ev.time}{ev.endTime ? ` ~ ${ev.endTime}` : ""}
                      </span>
                    )}
                  </div>
                ))}

                {/* 투두 아이템 */}
                {selectedTodos.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  return (
                    <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.15)" }}>
                      <button onClick={() => toggleTodo(t.id)}
                        className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center transition-all"
                        style={{
                          background: t.done ? "rgba(96,165,250,0.3)" : "transparent",
                          border: `1.5px solid ${t.done ? "#60a5fa" : "rgba(96,165,250,0.4)"}`,
                        }}>
                        {t.done && <span style={{ color: "#60a5fa", fontSize: 8, lineHeight: 1 }}>✓</span>}
                      </button>
                      <span className="text-xs flex-1" style={{
                        color: t.done ? "rgba(96,165,250,0.35)" : "rgba(220,235,255,0.85)",
                        textDecoration: t.done ? "line-through" : "none",
                      }}>
                        {t.text}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {t.time && (
                          <span className="text-xs" style={{ color: "rgba(96,165,250,0.55)" }}>{t.time}</span>
                        )}
                        {proj && (
                          <span className="text-xs px-1.5 py-px rounded"
                            style={{ background: "rgba(96,165,250,0.1)", color: "rgba(96,165,250,0.65)", fontSize: 10 }}>
                            {proj.title.slice(0, 4)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* ════ end 오른쪽 ════ */}

      </div>
    </main>
  );
}

/* ─── 필터 버튼 헬퍼 컴포넌트 ─── */
function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-xs transition-all"
      style={{
        background: active ? "rgba(96,165,250,0.2)" : "transparent",
        color:      active ? "#60a5fa" : "rgba(96,165,250,0.45)",
        border:    `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.15)"}`,
      }}>
      {children}
    </button>
  );
}
