"use client";

// 광장 첫 진입 시 표시되는 마을 초대장 모달
// 두루마리 펼치기 애니메이션 + 초대장 디자인

import { useState } from "react";

/* ─── 장소 목록 — 왼쪽 col / 오른쪽 col ─── */
const LEFT_PLACES = [
  { icon: "📋", label: "게시판", sub: "자기소개",    desc: "광장 게시판을 클릭하면 저를 소개합니다", color: "#b45309" },
  { icon: "🏠", label: "내 방",  sub: "관리자 공간", desc: "투두 · 온실 · 학습기록 · 대시보드",     color: "#78716c" },
];
const RIGHT_PLACES = [
  { icon: "📚", label: "도서관", sub: "학습 기록실",     desc: "날짜별 공부 시간과 노트를 한눈에",   color: "#d97706" },
  { icon: "🌳", label: "정원",   sub: "공부 나무",       desc: "공부할수록 쑥쑥 자라는 나의 나무",   color: "#16a34a" },
  { icon: "🖼️", label: "미술관", sub: "프로젝트 전시실", desc: "진행 중이거나 완성한 프로젝트들",    color: "#2563eb" },
];

/* ─── 두루마리 위아래 롤 장식 ─── */
function ScrollRoll({ top }) {
  return (
    <div style={{
      height: 20,
      background: "linear-gradient(180deg, #c8a054 0%, #a07038 50%, #c8a054 100%)",
      borderRadius: top ? "6px 6px 0 0" : "0 0 6px 6px",
      boxShadow: top
        ? "inset 0 -3px 6px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.2)"
        : "inset 0 3px 6px rgba(0,0,0,0.25), 0 -3px 8px rgba(0,0,0,0.2)",
    }} />
  );
}

/* ─── 장식 구분선 ─── */
function Divider({ symbol = "✦" }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(160,112,56,0.4))" }} />
      <span style={{ color: "#c8a054", fontSize: 10 }}>{symbol}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(160,112,56,0.4))" }} />
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function WelcomeScrollModal({ onClose }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 380);
  };

  return (
    <>
      <style>{`
        @keyframes overlayIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes overlayOut { from { opacity: 1; } to { opacity: 0; } }

        @keyframes scrollOpen {
          0%   { transform: scaleY(0.03); opacity: 0.6; }
          60%  { transform: scaleY(1.03); }
          100% { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes scrollClose {
          from { transform: scaleY(1);    opacity: 1; }
          to   { transform: scaleY(0.03); opacity: 0; }
        }

        @keyframes contentIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        .wsc-overlay {
          animation: ${closing ? "overlayOut" : "overlayIn"} 0.38s ease forwards;
        }
        .wsc-scroll {
          transform-origin: center center;
          animation: ${closing ? "scrollClose" : "scrollOpen"} 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .wsc-content {
          animation: contentIn 0.38s ease forwards 0.38s;
          opacity: 0;
        }
      `}</style>

      {/* 오버레이 */}
      <div className="wsc-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(8,4,1,0.78)", backdropFilter: "blur(4px)" }}>

        {/* 두루마리 */}
        <div className="wsc-scroll w-full" style={{ maxWidth: 460 }}>

          <ScrollRoll top />

          {/* 본문 */}
          <div style={{
            background: "linear-gradient(170deg, #fdf3d8 0%, #f2dfa8 40%, #f7e9c4 100%)",
            padding: "0 36px",
          }}>
            <div className="wsc-content">

              {/* 헤더 */}
              <div className="text-center pt-7 pb-3">
                <h1 style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#3d2108",
                  letterSpacing: "0.06em",
                  lineHeight: 1.15,
                }}>
                  welcome
                </h1>
                <p className="text-sm mt-2" style={{ color: "#7a5020", fontFamily: "Georgia, serif" }}>
                  우리 마을에 오신 것을 환영합니다.
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div style={{ width: 50, height: 1, background: "linear-gradient(to right, transparent, #c8a054)" }} />
                  <span style={{ color: "#c8a054", fontSize: 13 }}>✦</span>
                  <div style={{ width: 50, height: 1, background: "linear-gradient(to left, transparent, #c8a054)" }} />
                </div>
              </div>

              {/* 장소 목록 — 좌/우 2열 */}
              <div className="flex gap-4 my-4">
                {/* 왼쪽: 게시판, 내 방 */}
                <div className="flex flex-col gap-3 flex-1">
                  {LEFT_PLACES.map((p) => (
                    <div key={p.label} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${p.color}18`, border: `1px solid ${p.color}44` }}>
                        <span style={{ fontSize: 15 }}>{p.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight"
                          style={{ color: "#3d2108", fontFamily: "Georgia, serif" }}>{p.label}</p>
                        <p className="text-xs leading-tight" style={{ color: "#a07038" }}>{p.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 세로 구분선 */}
                <div style={{ width: 1, background: "rgba(160,112,56,0.2)", flexShrink: 0 }} />
                {/* 오른쪽: 도서관, 정원, 미술관 */}
                <div className="flex flex-col gap-3 flex-1">
                  {RIGHT_PLACES.map((p) => (
                    <div key={p.label} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${p.color}18`, border: `1px solid ${p.color}44` }}>
                        <span style={{ fontSize: 15 }}>{p.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight"
                          style={{ color: "#3d2108", fontFamily: "Georgia, serif" }}>{p.label}</p>
                        <p className="text-xs leading-tight" style={{ color: "#a07038" }}>{p.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              {/* 입장 버튼 */}
              <div className="flex justify-center py-5">
                <button onClick={handleClose}
                  className="px-10 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #c8a054 0%, #9a7030 100%)",
                    color: "#fef6e0",
                    border: "1.5px solid #e8c870",
                    boxShadow: "0 4px 18px rgba(160,112,56,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                    fontFamily: "Georgia, serif",
                    letterSpacing: "0.15em",
                  }}>
                  Enter
                </button>
              </div>

            </div>
          </div>

          <ScrollRoll />
        </div>
      </div>
    </>
  );
}
