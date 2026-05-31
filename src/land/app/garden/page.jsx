
// 정원 — 공부 시간 나무 시각화
// study_sessions 테이블 연동

import { useState, useEffect } from "react";
import BackToSquare from "../../components/BackToSquare";
import PageBackground from "../../components/PageBackground";
import { SUBJECTS as SUBJECT_LIST } from "../../lib/subjects";
import { supabase } from "../../lib/supabase";

/* ─── 상수 ─── */
const PANEL = {
  background: "rgba(6,18,10,0.55)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(74,222,128,0.18)",
  borderRadius: "16px",
  padding: "20px",
};

/* subjects.js 기본 색상 맵 (fallback용) */
const SUBJECT_COLORS_DEFAULT = Object.fromEntries(SUBJECT_LIST.map((s) => [s.name, s.color]));
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/* ─── 유틸 ─── */
const fmtH = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

/* 이번 주 월~일 날짜 배열 반환 (YYYY-MM-DD) */
const getWeekDates = () => {
  const today = new Date();
  const dow   = today.getDay(); // 0=일, 1=월 ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
};

/* 이번 달 주차별 날짜 범위 (1주 ~ 5주) */
const getMonthWeeks = () => {
  const today  = new Date();
  const year   = today.getFullYear();
  const month  = today.getMonth();
  const first  = new Date(year, month, 1);
  const last   = new Date(year, month + 1, 0);
  const weeks  = [];
  let cur = new Date(first);
  let wNum = 1;
  while (cur <= last) {
    const start = cur.toISOString().split("T")[0];
    const end   = new Date(Math.min(
      new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 6),
      last
    )).toISOString().split("T")[0];
    weeks.push({ label: `${wNum}주`, start, end });
    cur.setDate(cur.getDate() + 7);
    wNum++;
  }
  return weeks;
};

/* ─── 나무 SVG ─── */
function TreeSVG({ totalSec }) {
  const hours = totalSec / 3600;
  const stage = hours < 1 ? 0 : hours < 5 ? 1 : hours < 10 ? 2 : hours < 20 ? 3 : 4;

  const W = 160, cx = 80;

  /* ── 새싹 (stage 0) ── */
  if (stage === 0) {
    return (
      <svg width={W} height={120} viewBox="0 0 160 120" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="sprout-leaf" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </radialGradient>
        </defs>
        {/* 땅 */}
        <ellipse cx={cx} cy={104} rx={22} ry={5} fill="rgba(74,222,128,0.12)" />
        {/* 줄기 */}
        <path d={`M${cx},102 Q${cx + 3},86 ${cx},66`}
          stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 왼쪽 잎 */}
        <path d={`M${cx - 1},84 Q${cx - 22},72 ${cx - 10},62`}
          fill="url(#sprout-leaf)" opacity="0.9" />
        {/* 오른쪽 잎 */}
        <path d={`M${cx + 1},78 Q${cx + 22},66 ${cx + 10},56`}
          fill="url(#sprout-leaf)" opacity="0.9" />
        {/* 새싹 끝 */}
        <ellipse cx={cx} cy={62} rx={5} ry={7} fill="#86efac" opacity={0.95} />
        <ellipse cx={cx} cy={60} rx={2.5} ry={3} fill="#dcfce7" opacity={0.7} />
        {/* 라벨 */}
        <text x={cx} y={116} textAnchor="middle" fontSize={9}
          fill="rgba(134,239,172,0.45)" fontFamily="monospace">새싹</text>
      </svg>
    );
  }

  /* ── stage 1~4 공통 설정 ── */
  // 트렁크
  const tw = [0, 6, 8, 11, 15][stage];
  const th = [0, 32, 50, 68, 88][stage];

  // 수관 클러스터 정의 (cx, cy offset from trunkTop, r, color, opacity)
  const clusterDefs = [
    // stage 1
    [
      { dx:  0, dy: -22, r: 30, c: "#22c55e", o: 0.88 },
      { dx:  0, dy: -8,  r: 22, c: "#4ade80", o: 0.55 },
    ],
    // stage 2
    [
      { dx: -14, dy: -16, r: 28, c: "#15803d", o: 0.82 },
      { dx:  16, dy: -18, r: 26, c: "#166534", o: 0.82 },
      { dx:   0, dy: -34, r: 32, c: "#22c55e", o: 0.88 },
      { dx:   0, dy: -12, r: 20, c: "#4ade80", o: 0.45 },
    ],
    // stage 3
    [
      { dx: -22, dy: -14, r: 28, c: "#14532d", o: 0.85 },
      { dx:  24, dy: -16, r: 26, c: "#166534", o: 0.85 },
      { dx:  -8, dy: -36, r: 32, c: "#16a34a", o: 0.88 },
      { dx:  10, dy: -38, r: 28, c: "#15803d", o: 0.80 },
      { dx:   0, dy: -58, r: 28, c: "#22c55e", o: 0.88 },
      { dx:   0, dy: -18, r: 18, c: "#4ade80", o: 0.40 },
    ],
    // stage 4
    [
      { dx: -30, dy: -14, r: 30, c: "#14532d", o: 0.85 },
      { dx:  32, dy: -16, r: 28, c: "#166534", o: 0.85 },
      { dx: -16, dy: -38, r: 34, c: "#15803d", o: 0.88 },
      { dx:  18, dy: -40, r: 32, c: "#166534", o: 0.82 },
      { dx:  -6, dy: -62, r: 32, c: "#16a34a", o: 0.88 },
      { dx:   8, dy: -65, r: 28, c: "#15803d", o: 0.78 },
      { dx:   0, dy: -86, r: 26, c: "#22c55e", o: 0.88 },
      { dx:   0, dy: -22, r: 20, c: "#4ade80", o: 0.38 },
    ],
  ][stage - 1];

  // 전체 높이 계산
  const topCluster = clusterDefs.reduce((a, b) => (b.dy - b.r < a.dy - a.r ? b : a));
  const canopyTop  = topCluster.dy - topCluster.r;
  const svgH       = th + Math.abs(canopyTop) + 28;
  const base       = svgH - 12;
  const trunkTop   = base - th;

  // 중앙 수관 (텍스트 위치용)
  const mainCluster = clusterDefs.reduce((a, b) => (b.r > a.r ? b : a));
  const textY       = trunkTop + mainCluster.dy + 5;

  // 반짝이 위치 (stage 3+)
  const sparkles = stage >= 3 ? [
    { x: cx + clusterDefs[0].dx - 12, y: trunkTop + clusterDefs[0].dy - clusterDefs[0].r + 6 },
    { x: cx + clusterDefs[1].dx + 10, y: trunkTop + clusterDefs[1].dy - clusterDefs[1].r + 8 },
    { x: cx + mainCluster.dx + 4,     y: trunkTop + mainCluster.dy - mainCluster.r - 2 },
  ] : [];

  return (
    <svg width={W} height={svgH} viewBox={`0 0 ${W} ${svgH}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="trunk-g" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#a0714f" />
          <stop offset="100%" stopColor="#4a2e12" />
        </radialGradient>
        <radialGradient id="leaf-hi" cx="38%" cy="32%">
          <stop offset="0%" stopColor="rgba(187,247,208,0.35)" />
          <stop offset="100%" stopColor="rgba(187,247,208,0)" />
        </radialGradient>
        <filter id="tree-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 그림자 */}
      <ellipse cx={cx} cy={base + 4} rx={tw * 3.5} ry={5}
        fill="rgba(0,0,0,0.18)" />

      {/* 트렁크 (곡선 경로) */}
      <path
        d={`M${cx - tw / 2},${base}
            C${cx - tw / 2 - 3},${trunkTop + th * 0.6} ${cx - tw / 3},${trunkTop + th * 0.3} ${cx - tw / 4},${trunkTop}
            L${cx + tw / 4},${trunkTop}
            C${cx + tw / 3},${trunkTop + th * 0.3} ${cx + tw / 2 + 3},${trunkTop + th * 0.6} ${cx + tw / 2},${base} Z`}
        fill="url(#trunk-g)"
      />

      {/* 수관 클러스터 */}
      {clusterDefs.map((cl, i) => (
        <circle
          key={i}
          cx={cx + cl.dx}
          cy={trunkTop + cl.dy}
          r={cl.r}
          fill={cl.c}
          opacity={cl.o}
        />
      ))}

      {/* 하이라이트 레이어 */}
      {clusterDefs.map((cl, i) => (
        <ellipse
          key={"h" + i}
          cx={cx + cl.dx - cl.r * 0.15}
          cy={trunkTop + cl.dy - cl.r * 0.2}
          rx={cl.r * 0.55}
          ry={cl.r * 0.42}
          fill="url(#leaf-hi)"
        />
      ))}

      {/* 공부 시간 텍스트 */}
      <text x={cx} y={textY} textAnchor="middle"
        fontSize={12} fontWeight="700"
        fill="rgba(255,255,255,0.92)"
        style={{ fontFamily: "monospace" }}>
        {fmtH(totalSec)}
      </text>

      {/* 반짝이 (stage 3+) */}
      {sparkles.map((s, i) => (
        <text key={i} x={s.x} y={s.y} fontSize={9}
          fill="rgba(187,247,208,0.7)" textAnchor="middle">✦</text>
      ))}

      {/* stage 4 추가 반짝이 */}
      {stage === 4 && (
        <>
          <text x={cx - 35} y={trunkTop + clusterDefs[2].dy} fontSize={7}
            fill="rgba(134,239,172,0.5)">✦</text>
          <text x={cx + 34} y={trunkTop + clusterDefs[3].dy + 4} fontSize={6}
            fill="rgba(134,239,172,0.4)">✦</text>
        </>
      )}
    </svg>
  );
}

/* ─── 메인 ─── */
export default function GardenPage() {
  const [view,    setView]    = useState("주");
  const [loading, setLoading] = useState(true);

  /* localStorage에서 과목 색상 읽기 — 온실에서 수정한 내용 반영 */
  const [subjectColors, setSubjectColors] = useState({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem("village-subjects");
      if (saved) {
        const list = JSON.parse(saved);
        setSubjectColors(Object.fromEntries(list.map((s) => [s.name, s.color])));
      }
    } catch {}
  }, []);

  /* 이번 주 요일별 데이터 */
  const [weekData, setWeekData] = useState(
    DAY_LABELS.map((day) => ({ day, totalSec: 0, sessions: [] }))
  );

  /* 이번 달 주차별 데이터 */
  const [monthWeeks,      setMonthWeeks]      = useState([]);
  const [monthSubjectMap, setMonthSubjectMap] = useState({});

  /* ─── Supabase 로드 ─── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const today     = new Date();
      const year      = today.getFullYear();
      const month     = String(today.getMonth() + 1).padStart(2, "0");
      const monthStart = `${year}-${month}-01`;
      const monthEnd   = `${year}-${month}-31`;

      const { data } = await supabase
        .from("study_sessions")
        .select("date, subject_name, seconds")
        .gte("date", monthStart)
        .lte("date", monthEnd);

      const sessions = data || [];

      /* 이번 주 처리 */
      const weekDates = getWeekDates(); // [월, 화, 수, 목, 금, 토, 일]
      const wd = DAY_LABELS.map((day, i) => {
        const key  = weekDates[i];
        const daySessions = sessions.filter((s) => s.date === key);
        return {
          day,
          totalSec: daySessions.reduce((a, s) => a + s.seconds, 0),
          sessions: daySessions.map((s) => ({ subject: s.subject_name, seconds: s.seconds })),
        };
      });
      setWeekData(wd);

      /* 이번 달 주차별 처리 */
      const weeks = getMonthWeeks();
      const mw = weeks.map(({ label, start, end }) => {
        const total = sessions
          .filter((s) => s.date >= start && s.date <= end)
          .reduce((a, s) => a + s.seconds, 0);
        return { label, totalSec: total };
      });
      setMonthWeeks(mw);

      /* 이번 달 과목별 합계 */
      const msm = {};
      sessions.forEach(({ subject_name, seconds }) => {
        msm[subject_name] = (msm[subject_name] || 0) + seconds;
      });
      setMonthSubjectMap(msm);

      setLoading(false);
    };
    load();
  }, []);

  /* ─── 계산 ─── */
  const weekTotal  = weekData.reduce((a, d) => a + d.totalSec, 0);
  const weekMax    = Math.max(...weekData.map((d) => d.totalSec), 1);
  const monthTotal = monthWeeks.reduce((a, w) => a + w.totalSec, 0);
  const monthMax   = Math.max(...monthWeeks.map((w) => w.totalSec), 1);
  const displayTotal = view === "주" ? weekTotal : monthTotal;

  /* 과목별 주간 합계 */
  const subjectMap = weekData
    .flatMap((d) => d.sessions)
    .reduce((acc, { subject, seconds }) => {
      acc[subject] = (acc[subject] || 0) + seconds;
      return acc;
    }, {});

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <PageBackground src="/images/garden.png" overlay="rgba(3,12,6,0.52)" />

      <div className="relative z-10 h-full overflow-y-scroll flex flex-col items-center p-8 gap-6"
        style={{ background: "rgba(3,12,6,0.35)" }}>

        {/* 헤더 + 토글 */}
        <div className="w-full max-w-xl flex items-end justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
              🌳 공부 나무
            </h1>
            <p className="text-green-200/60 text-sm mt-1">공부할수록 자라는 나의 나무</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}>
            {["주", "월"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-md text-xs font-medium transition"
                style={{
                  background: view === v ? "rgba(74,222,128,0.22)" : "transparent",
                  color:      view === v ? "#4ade80" : "rgba(74,222,128,0.4)",
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <p className="text-green-200/30 text-sm">불러오는 중...</p>
        )}

        {/* 나무 + 총 시간 */}
        {!loading && (
          <div className="w-full max-w-xl" style={PANEL}>
            <div className="flex flex-col items-center gap-3">
              <p className="text-green-200/40 text-xs self-start">
                {view === "주" ? "이번 주 나무" : "이번 달 나무"}
              </p>
              <TreeSVG totalSec={displayTotal} />
              <div className="text-center">
                <p className="text-green-300 text-2xl font-bold">{fmtH(displayTotal)}</p>
                <p className="text-green-200/40 text-xs mt-0.5">
                  {view === "주" ? "이번 주 총 공부 시간" : "이번 달 총 공부 시간"}
                </p>
              </div>
              {displayTotal === 0 && (
                <p className="text-green-200/25 text-xs">온실에서 공부를 시작하면 나무가 자라요 🌱</p>
              )}
            </div>
          </div>
        )}

        {/* 요일별 막대 (주 뷰) */}
        {!loading && view === "주" && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-4">요일별 공부 시간</p>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {weekData.map(({ day, totalSec: sec }) => {
                const pct   = sec / weekMax;
                const barH  = Math.max(pct * 88, sec > 0 ? 6 : 2);
                const color = sec === 0 ? "rgba(74,222,128,0.1)"
                  : pct > 0.7 ? "#22c55e" : pct > 0.4 ? "#4ade80" : "#86efac";
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    {sec > 0 && (
                      <span className="text-green-300/60 text-xs font-mono">{fmtH(sec)}</span>
                    )}
                    <div className="w-full transition-[height] duration-500"
                      style={{
                        height: barH,
                        background: color,
                        borderRadius: "4px 4px 0 0",
                        border: sec === 0 ? "1px dashed rgba(74,222,128,0.2)" : "none",
                      }} />
                    <span className="text-green-200/50 text-xs">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 주차별 막대 (월 뷰) */}
        {!loading && view === "월" && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-4">주차별 공부 시간</p>
            {monthTotal === 0 ? (
              <p className="text-green-200/25 text-xs text-center py-3">이번 달 기록이 없어요</p>
            ) : (
              <div className="flex flex-col gap-3">
                {monthWeeks.map(({ label, totalSec: sec }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs w-6 shrink-0" style={{ color: "rgba(74,222,128,0.6)" }}>{label}</span>
                    <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: "rgba(74,222,128,0.08)" }}>
                      <div className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${(sec / monthMax) * 100}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", opacity: 0.8 }} />
                    </div>
                    <span className="text-xs w-14 text-right" style={{ color: "rgba(74,222,128,0.5)" }}>
                      {sec > 0 ? fmtH(sec) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 과목별 합계 (월 뷰) */}
        {!loading && view === "월" && Object.keys(monthSubjectMap).length > 0 && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-3">과목별 이번 달</p>
            <div className="flex flex-col gap-2.5">
              {Object.entries(monthSubjectMap)
                .sort((a, b) => b[1] - a[1])
                .map(([subj, sec]) => {
                  const color = subjectColors[subj] || SUBJECT_COLORS_DEFAULT[subj] || "#94a3b8";
                  return (
                    <div key={subj} className="flex items-center gap-3">
                      <span className="text-xs w-10 shrink-0" style={{ color }}>{subj}</span>
                      <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full transition-[width] duration-500"
                          style={{ width: `${(sec / monthTotal) * 100}%`, background: color, opacity: 0.7 }} />
                      </div>
                      <span className="text-xs w-12 text-right" style={{ color: "rgba(255,255,255,0.35)" }}>{fmtH(sec)}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 과목별 합계 (주 뷰) */}
        {!loading && view === "주" && Object.keys(subjectMap).length > 0 && (
          <div className="w-full max-w-xl" style={PANEL}>
            <p className="text-green-200/40 text-xs mb-3">과목별 이번 주</p>
            <div className="flex flex-col gap-2.5">
              {Object.entries(subjectMap)
                .sort((a, b) => b[1] - a[1])
                .map(([subj, sec]) => {
                  const color = subjectColors[subj] || SUBJECT_COLORS_DEFAULT[subj] || "#94a3b8";
                  return (
                    <div key={subj} className="flex items-center gap-3">
                      <span className="text-xs w-10 shrink-0" style={{ color }}>{subj}</span>
                      <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full transition-[width] duration-500"
                          style={{ width: `${(sec / weekTotal) * 100}%`, background: color, opacity: 0.7 }} />
                      </div>
                      <span className="text-xs w-12 text-right" style={{ color: "rgba(255,255,255,0.35)" }}>{fmtH(sec)}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      </div>

      <BackToSquare />
    </main>
  );
}
