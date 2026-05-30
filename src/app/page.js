"use client";

// 광장 (Village Square) — 인트로 겸 허브 페이지

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/ProfileModal";
import WelcomeScrollModal from "@/components/WelcomeScrollModal";

/* ── 건물 이동 hotspot ── */
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
    color: "#C0C8D8",
    hoverOpacity: 0.2,
    strokeOpacity: 0.7,
    points:
      "110,1 121,365 269,444 280,469 284,508 250,534 211,561 186,596 169,633 63,680 24,696 0,685 0,7",
  },
];

/* ── 모달 hotspot (페이지 이동 없이 모달 오픈) ── */
const MODAL_HOTSPOT = {
  id: "profile",
  color: "#C9A84C",
  points:
    "753,618 752,628 762,631 763,736 756,742 757,751 774,751 780,737 780,737 776,729 774,713 890,713 890,730 883,738 882,747 889,750 904,748 905,740 899,730 904,631 904,631 911,625 908,616 899,592 887,618 866,609 834,600 773,615 802,608 802,608 773,615 767,593",
};

const BG_STYLE = {
  backgroundImage: "url('/images/village-square.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function VillagePage() {
  const [hoveredId,      setHoveredId]      = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [showWelcome,    setShowWelcome]    = useState(false);
  const router = useRouter();

  // 첫 방문 시에만 안내 모달 표시
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("village-welcome-seen")) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem("village-welcome-seen", "1");
    setShowWelcome(false);
  };

  const isProfileHovered = hoveredId === "profile";

  return (
    <main className="relative w-full h-screen overflow-hidden" style={BG_STYLE}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 건물 hotspot — 클릭 시 페이지 이동 */}
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
                      : `drop-shadow(0 0 8px ${spot.color})`
                    : "none",
                  transition: "fill-opacity 0.2s ease, stroke-width 0.15s ease, filter 0.2s ease",
                  willChange: "fill-opacity, filter",
                }}
              />
            </g>
          );
        })}

        {/* 프로필 hotspot — 클릭 시 모달 오픈 */}
        <g
          style={{ cursor: "pointer" }}
          onClick={() => setProfileVisible(true)}
          onMouseEnter={() => setHoveredId("profile")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <polygon
            points={MODAL_HOTSPOT.points}
            fill={MODAL_HOTSPOT.color}
            fillOpacity={isProfileHovered ? 0.22 : 0}
            stroke={MODAL_HOTSPOT.color}
            strokeWidth={isProfileHovered ? 2.5 : 0}
            strokeOpacity={isProfileHovered ? 0.9 : 0}
            style={{
              filter: isProfileHovered
                ? `drop-shadow(0 0 8px ${MODAL_HOTSPOT.color})`
                : "none",
              transition: "fill-opacity 0.2s ease, stroke-width 0.15s ease, filter 0.2s ease",
              willChange: "fill-opacity, filter",
            }}
          />
        </g>
      </svg>

      {/* 프로필 모달 */}
      {profileVisible && (
        <ProfileModal onClose={() => setProfileVisible(false)} />
      )}

      {/* 안내도 다시보기 버튼 (우하단) */}
      <button
        onClick={() => {
          localStorage.removeItem("village-welcome-seen");
          setShowWelcome(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          background:    "rgba(201,168,76,0.12)",
          border:        "1px solid rgba(201,168,76,0.3)",
          color:         "rgba(201,168,76,0.65)",
          backdropFilter: "blur(10px)",
          boxShadow:     "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        🗺 안내도
      </button>

      {/* 첫 방문 안내 모달 */}
      {showWelcome && (
        <WelcomeScrollModal onClose={closeWelcome} />
      )}
    </main>
  );
}
