"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const ITEM_H  = 38;   // 각 항목 높이 (px)
const VISIBLE = 5;    // 보이는 항목 수 (홀수여야 가운데 선택됨)
const PAD     = ITEM_H * Math.floor(VISIBLE / 2); // 첫/마지막 항목도 가운데 올 수 있도록 패딩

const YEARS  = Array.from({ length: 12 }, (_, i) => 2020 + i); // 2020 ~ 2031
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);    // 1 ~ 12

/* ── 드럼 컬럼 ── */
function DrumColumn({ items, selectedIdx, onSelect, fmt }) {
  const ref      = useRef(null);
  const snapTimer = useRef(null);

  /* 선택 인덱스가 바뀌면 해당 위치로 스크롤 */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: selectedIdx * ITEM_H, behavior: "smooth" });
  }, [selectedIdx]);

  /* 스크롤 끝나면 가장 가까운 항목에 스냅 */
  const handleScroll = useCallback(() => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(i, items.length - 1));
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onSelect(clamped);
    }, 80);
  }, [items.length, onSelect]);

  return (
    <div style={{ position: "relative", width: 72 }}>
      {/* 선택 영역 하이라이트 */}
      <div style={{
        position:     "absolute",
        top:          ITEM_H * Math.floor(VISIBLE / 2),
        left:         0, right: 0,
        height:       ITEM_H,
        background:   "rgba(96,165,250,0.12)",
        borderRadius: 8,
        border:       "1px solid rgba(96,165,250,0.28)",
        pointerEvents: "none",
        zIndex:       1,
      }} />

      {/* 위 페이드 */}
      <div style={{
        position:   "absolute", top: 0, left: 0, right: 0,
        height:     PAD,
        background: "linear-gradient(to bottom, rgba(8,16,40,0.92), transparent)",
        pointerEvents: "none", zIndex: 2,
      }} />
      {/* 아래 페이드 */}
      <div style={{
        position:   "absolute", bottom: 0, left: 0, right: 0,
        height:     PAD,
        background: "linear-gradient(to top, rgba(8,16,40,0.92), transparent)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* 스크롤 영역 */}
      <div
        ref={ref}
        className="drum-col"
        onScroll={handleScroll}
        style={{
          height:           ITEM_H * VISIBLE,
          overflowY:        "scroll",
          scrollSnapType:   "y mandatory",
          scrollbarWidth:   "none",
          msOverflowStyle:  "none",
          position:         "relative",
        }}
      >
        <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
          {items.map((item, i) => (
            <div
              key={item}
              onClick={() => {
                ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                onSelect(i);
              }}
              style={{
                height:         ITEM_H,
                scrollSnapAlign: "center",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                cursor:         "pointer",
                fontSize:       i === selectedIdx ? 15 : 13,
                fontWeight:     i === selectedIdx ? 600 : 400,
                color:          i === selectedIdx
                  ? "rgba(220,235,255,0.95)"
                  : "rgba(220,235,255,0.3)",
                transition:     "color 0.15s, font-size 0.15s",
                userSelect:     "none",
              }}
            >
              {fmt ? fmt(item) : item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function MonthDrumPicker({ value, onChange, placeholder = "연월 선택" }) {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);

  /* value(YYYY-MM)에서 초기 인덱스 계산 */
  const initIndices = (v) => {
    if (!v) return { yi: Math.max(0, YEARS.indexOf(new Date().getFullYear())), mi: new Date().getMonth() };
    const [y, m] = v.split("-");
    const yi = YEARS.indexOf(parseInt(y, 10));
    return { yi: yi === -1 ? 0 : yi, mi: parseInt(m, 10) - 1 };
  };

  const { yi: initYi, mi: initMi } = initIndices(value);
  const [yearIdx,  setYearIdx]  = useState(initYi);
  const [monthIdx, setMonthIdx] = useState(initMi);

  /* 외부 value 변경 시 인덱스 동기화 */
  useEffect(() => {
    const { yi, mi } = initIndices(value);
    setYearIdx(yi);
    setMonthIdx(mi);
  }, [value]);

  /* 바깥 클릭 시 닫기 */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const confirm = () => {
    const y = YEARS[yearIdx];
    const m = String(MONTHS[monthIdx]).padStart(2, "0");
    onChange(`${y}-${m}`);
    setOpen(false);
  };

  const clear = () => { onChange(""); setOpen(false); };

  const displayVal = value
    ? `${value.slice(0, 4)}년 ${parseInt(value.slice(5, 7), 10)}월`
    : placeholder;

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1 }}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width:        "100%",
          textAlign:    "left",
          background:   "transparent",
          border:       "1px solid rgba(96,165,250,0.15)",
          borderRadius: 5,
          padding:      "3px 8px",
          color:        value ? "rgba(96,165,250,0.7)" : "rgba(96,165,250,0.3)",
          fontSize:     12,
          cursor:       "pointer",
          whiteSpace:   "nowrap",
        }}
      >
        {displayVal}
      </button>

      {/* 드럼롤 팝업 */}
      {open && (
        <div style={{
          position:       "absolute",
          top:            "calc(100% + 6px)",
          left:           "50%",
          transform:      "translateX(-50%)",
          zIndex:         200,
          background:     "rgba(8,16,40,0.97)",
          backdropFilter: "blur(20px)",
          border:         "1px solid rgba(96,165,250,0.25)",
          borderRadius:   14,
          padding:        "12px 16px 10px",
          boxShadow:      "0 12px 40px rgba(0,0,0,0.6)",
          minWidth:       190,
        }}>
          {/* 컬럼 */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
            <DrumColumn items={YEARS}  selectedIdx={yearIdx}  onSelect={setYearIdx} />
            <span style={{ color: "rgba(96,165,250,0.35)", fontSize: 12, marginBottom: 1 }}>년</span>
            <DrumColumn
              items={MONTHS}
              selectedIdx={monthIdx}
              onSelect={setMonthIdx}
              fmt={(m) => `${m}월`}
            />
          </div>

          {/* 버튼 */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={clear}
              style={{ fontSize: 11, color: "rgba(248,113,113,0.55)", background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px" }}>
              초기화
            </button>
            <button type="button" onClick={confirm}
              style={{ fontSize: 11, color: "#60a5fa", background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, padding: "3px 12px", cursor: "pointer" }}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
