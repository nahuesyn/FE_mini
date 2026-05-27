"use client";

// 광장 (Village Square) — 인트로 겸 허브 페이지
// 우하단 [마을 지도 보기] SkyviewButton 은 layout.js 에서 전역 관리 예정

import { useState } from "react";
import { useRouter } from "next/navigation";

const HOTSPOTS = [
  {
    id: "library",
    href: "/library",
    color: "#f59e0b",
    points:
      "363,452 456,421 547,403 651,390 657,360 592,317 585,294 591,276 585,248 581,185 537,126 455,126 454,44 451,9 435,29 418,19 401,-1 388,20 370,29 352,10 337,34 339,130 219,132 187,132 163,132 145,183 155,204 157,278 145,295 144,336",
  },
  {
    id: "museum",
    href: "/museum",
    color: "#60a5fa",
    points:
      "1080,422 1175,462 1212,484 1202,515 1217,541 1298,572 1378,572 1425,551 1436,556 1449,559 1581,617 1671,572 1671,200 1557,115 1390,137 1236,224 1206,237 1176,232 1175,329 1081,392",
  },
  {
    id: "garden",
    href: "/garden",
    color: "#4ade80",
    points:
      "706,2 679,42 668,90 682,121 697,144 715,172 743,190 791,201 819,207 826,236 798,235 766,239 731,244 696,249 668,258 643,272 631,290 637,314 748,382 767,383 821,320 838,274 856,322 910,367 917,390 1002,399 1081,379 1136,338 1159,306 1158,277 1116,258 1054,237 976,230 980,195 1020,181 1052,177 1096,150 1121,125 1135,96 1140,65 1090,-1",
  },
  {
    id: "admin",
    href: "/admin",
    color: "#000000",
    subtle: true,
    hoverOpacity: 0.45,
    strokeOpacity: 0.35,
    points:
      "110,1 121,365 269,444 280,469 284,508 250,534 211,561 186,596 169,633 63,680 24,696 0,685 0,7",
  },
];

// 리렌더링마다 새 객체 생성을 피하기 위해 컴포넌트 밖에 선언
const BG_STYLE = {
  backgroundImage: "url('/images/village-square.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function VillagePage() {
  const [hoveredId, setHoveredId] = useState(null);
  const router = useRouter();

  return (
    <main className="relative w-full h-screen overflow-hidden" style={BG_STYLE}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
      >
        {HOTSPOTS.map((spot) => {
          const isHovered = hoveredId === spot.id;
          return (
            <g
              key={spot.id}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(spot.href)}
              onMouseEnter={() => setHoveredId(spot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <polygon
                points={spot.points}
                fill={spot.color}
                fillOpacity={isHovered ? (spot.hoverOpacity ?? 0.22) : 0}
                stroke={spot.color}
                strokeWidth={isHovered ? 2.5 : 0}
                strokeOpacity={isHovered ? (spot.strokeOpacity ?? 1) : 0}
                style={{
                  filter: isHovered
                    ? spot.subtle
                      ? `drop-shadow(0 0 4px rgba(0,0,0,0.4))`
                      : `drop-shadow(0 0 6px ${spot.color}) drop-shadow(0 0 14px ${spot.color})`
                    : "none",
                  transition: "fill-opacity 0.25s ease, stroke-width 0.2s ease, filter 0.25s ease",
                }}
              />
            </g>
          );
        })}
      </svg>
    </main>
  );
}
