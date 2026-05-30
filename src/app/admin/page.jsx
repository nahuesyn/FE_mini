"use client";

// 내 방 (Admin) — 허브 페이지
// greenhouse(온실) / dash(대시보드) / study(기록) 진입점

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackToSquare from "@/components/BackToSquare";

const HOTSPOTS = [
  {
    id: "greenhouse",
    href: "/admin/greenhouse",
    color: "#4ade80",
    points:
      "1004,580 1334,635 1333,166 1328,120 1317,86 1299,54 1273,31 1239,19 1195,13 1155,12 1122,16 1092,26 1064,42 1040,63 1022,92 1010,132 1005,180",
  },
  {
    id: "dash",
    href: "/admin/dash",
    color: "#60a5fa",
    points:
      "65,75 434,125 435,433 74,466 49,460 47,113 33,86",
  },
  {
    id: "study",
    href: "/admin/study",
    color: "#f59e0b",
    points:
      "459,674 503,667 548,658 583,648 618,632 649,618 670,605 671,581 647,561 615,549 584,542 553,536 521,531 488,529 453,527 418,526 387,526 358,526 328,527 250,534 197,541 152,549 124,557 95,565 66,576 37,590 17,606 16,626 38,643 66,658 99,670 138,676 178,683 221,685 255,687 292,687 323,685 359,685 387,683 419,678",
  },
];

const BG_STYLE = {
  backgroundImage: "url('/images/myroom.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function AdminPage() {
  const [hoveredId, setHoveredId] = useState(null);
  const router = useRouter();

  return (
    <main className="relative w-full h-screen overflow-hidden" style={BG_STYLE}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1402 788"
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
                fillOpacity={isHovered ? 0.22 : 0}
                stroke={spot.color}
                strokeWidth={isHovered ? 2.5 : 0}
                style={{
                  filter: isHovered
                    ? `drop-shadow(0 0 8px ${spot.color})`
                    : "none",
                  transition: "fill-opacity 0.2s ease, stroke-width 0.15s ease, filter 0.2s ease",
                  willChange: "fill-opacity, filter",
                }}
              />
            </g>
          );
        })}
      </svg>

      <BackToSquare />
    </main>
  );
}
