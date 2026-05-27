"use client";

// 좌표 추출 도우미 — 광장(village square) 페이지용
// 완료 후 이 페이지(/coord-picker)는 삭제할 것

import { useState, useRef, useEffect } from "react";

function parsePoints(str) {
  return str.trim().split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return { x, y };
  });
}

const INITIAL_ZONES = {
  library:  { label: "📚 도서관", color: "#f59e0b", points: parsePoints("363,452 456,421 547,403 651,390 658,361 600,309 603,284 618,263 588,245 587,181 550,123 466,123 470,42 451,9 435,29 418,19 401,-1 388,20 370,29 352,10 337,34 341,118 205,121 180,108 168,135 145,183 155,204 157,278 145,295 144,336") },
  museum:   { label: "🏛️ 미술관", color: "#60a5fa", points: parsePoints("1080,422 1175,462 1212,484 1202,515 1217,541 1298,572 1378,572 1425,551 1436,556 1449,559 1581,617 1671,572 1671,200 1557,115 1390,137 1236,224 1206,237 1176,232 1175,329 1081,392") },
  garden:   { label: "🌿 정원",   color: "#4ade80", points: parsePoints("706,2 679,42 668,90 682,121 697,144 715,172 743,190 791,201 819,207 826,236 798,235 766,239 731,244 696,249 668,258 643,272 631,290 637,314 748,382 767,383 821,320 838,274 856,322 910,367 917,390 1002,399 1081,379 1136,338 1159,306 1158,277 1116,258 1054,237 976,230 980,195 1020,181 1052,177 1096,150 1121,125 1135,96 1140,65 1090,-1") },
  admin:    { label: "🏠 내 방",  color: "#000000", points: parsePoints("126,-1 138,360 292,449 292,490 220,556 184,626 67,692 8,694 0,693 0,1") },
};

export default function CoordPickerPage() {
  const [zones, setZones]           = useState(INITIAL_ZONES);
  const [activeZone, setActiveZone] = useState("library");
  const [imgSize, setImgSize]       = useState({ w: 0, h: 0 });
  const [copied, setCopied]         = useState(false);

  const dragging = useRef(null);
  const didDrag  = useRef(false);
  const svgRef   = useRef(null);
  const imgRef   = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const apply = () => {
      if (img.naturalWidth > 0)
        setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    if (img.complete) apply();
    else img.addEventListener("load", apply);
    return () => img.removeEventListener("load", apply);
  }, []);

  const toSvgCoords = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round((clientX - rect.left) * (imgSize.w / rect.width)),
      y: Math.round((clientY - rect.top)  * (imgSize.h / rect.height)),
    };
  };

  const handleSvgClick = (e) => {
    if (imgSize.w === 0 || didDrag.current) return;
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    setZones((prev) => ({
      ...prev,
      [activeZone]: { ...prev[activeZone], points: [...prev[activeZone].points, { x, y }] },
    }));
  };

  const handleCircleMouseDown = (e, index) => {
    e.stopPropagation();
    dragging.current = index;
    didDrag.current  = false;
  };

  const handleSvgMouseMove = (e) => {
    if (dragging.current === null) return;
    didDrag.current = true;
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    setZones((prev) => {
      const points = [...prev[activeZone].points];
      points[dragging.current] = { x, y };
      return { ...prev, [activeZone]: { ...prev[activeZone], points } };
    });
  };

  const handleSvgMouseUp = () => {
    dragging.current = null;
    setTimeout(() => { didDrag.current = false; }, 0);
  };

  const handleUndo  = () => setZones((prev) => ({ ...prev, [activeZone]: { ...prev[activeZone], points: prev[activeZone].points.slice(0, -1) } }));
  const handleClear = () => setZones((prev) => ({ ...prev, [activeZone]: { ...prev[activeZone], points: [] } }));
  const toPointsStr = (points) => points.map((p) => `${p.x},${p.y}`).join(" ");

  const handleCopy = (zoneKey) => {
    navigator.clipboard.writeText(toPointsStr(zones[zoneKey].points));
    setCopied(zoneKey);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <img ref={imgRef} src="/images/village-square.png" alt="village" className="w-full h-full object-cover select-none" draggable={false} />

        {imgSize.w === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg">이미지 로딩 중...</div>
        )}

        {imgSize.w > 0 && (
          <svg ref={svgRef} className="absolute inset-0 w-full h-full cursor-crosshair" viewBox={`0 0 ${imgSize.w} ${imgSize.h}`} preserveAspectRatio="xMidYMid slice" onClick={handleSvgClick} onMouseMove={handleSvgMouseMove} onMouseUp={handleSvgMouseUp} onMouseLeave={handleSvgMouseUp}>
            {Object.entries(zones).map(([key, zone]) =>
              zone.points.length > 1 ? (
                <polygon key={key} points={toPointsStr(zone.points)} fill={zone.color + (key === activeZone ? "33" : "11")} stroke={zone.color} strokeWidth={key === activeZone ? 3 : 1} strokeOpacity={key === activeZone ? 1 : 0.3} pointerEvents="none" />
              ) : null
            )}
            {zones[activeZone].points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="18" fill="transparent" className="cursor-grab" onMouseDown={(e) => handleCircleMouseDown(e, i)} />
                <circle cx={p.x} cy={p.y} r="8" fill={zones[activeZone].color} stroke="white" strokeWidth="2" pointerEvents="none" />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="20" fill="white" fontWeight="bold" pointerEvents="none">{i + 1}</text>
              </g>
            ))}
          </svg>
        )}

        <div className="absolute top-4 left-4 bg-black/60 rounded-lg px-4 py-2 text-sm pointer-events-none">
          <p>현재: <span style={{ color: zones[activeZone].color }} className="font-bold">{zones[activeZone].label}</span></p>
          <p className="text-gray-300 text-xs mt-1">빈 곳 클릭 → 점 추가 &nbsp;|&nbsp; 점 드래그 → 이동</p>
        </div>
      </div>

      <div className="w-72 bg-gray-800 flex flex-col p-4 gap-4 overflow-y-auto">
        <h1 className="text-lg font-bold border-b border-gray-600 pb-2">🏘️ 광장 좌표 추출기</h1>
        <p className="text-xs text-gray-400">이미지 원본 크기: {imgSize.w > 0 ? `${imgSize.w} × ${imgSize.h}` : "로딩 중..."}</p>

        <div>
          <p className="text-xs text-gray-400 mb-2">구역 선택</p>
          <div className="flex flex-col gap-2">
            {Object.entries(zones).map(([key, zone]) => (
              <button key={key} onClick={() => setActiveZone(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${activeZone === key ? "bg-gray-700" : "bg-gray-700/50 hover:bg-gray-700"}`}
                style={activeZone === key ? { borderLeft: `3px solid ${zone.color}` } : {}}>
                {zone.label}
                <span className="ml-2 text-xs text-gray-400">({zone.points.length}점)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleUndo}  className="flex-1 bg-gray-600 hover:bg-gray-500 rounded px-2 py-1 text-xs">↩ 되돌리기</button>
          <button onClick={handleClear} className="flex-1 bg-red-800 hover:bg-red-700 rounded px-2 py-1 text-xs">🗑 초기화</button>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">좌표 목록</p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {zones[activeZone].points.length === 0
              ? <p className="text-xs text-gray-500 italic">아직 클릭한 좌표가 없어요</p>
              : zones[activeZone].points.map((p, i) => (
                  <div key={i} className="text-xs bg-gray-700 rounded px-2 py-1 font-mono flex justify-between">
                    <span className="text-gray-400">{i + 1}.</span>
                    <span>({p.x}, {p.y})</span>
                  </div>
                ))
            }
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">polygon points 복사</p>
          <div className="flex flex-col gap-2">
            {Object.entries(zones).map(([key, zone]) => (
              <div key={key} className="bg-gray-700 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: zone.color }}>{zone.label}</span>
                  <button onClick={() => handleCopy(key)} disabled={zone.points.length === 0} className="text-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-30 rounded px-2 py-0.5">
                    {copied === key ? "✅ 복사됨" : "복사"}
                  </button>
                </div>
                <p className="text-xs font-mono text-gray-400 truncate">{zone.points.length === 0 ? "—" : toPointsStr(zone.points)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
