
// 광장 첫 진입 시 표시되는 환영 모달 — 어서오세요

import { useState } from "react";

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
        .wsc-overlay { animation: ${closing ? "overlayOut" : "overlayIn"} 0.38s ease forwards; }
        .wsc-scroll  { transform-origin: center center; animation: ${closing ? "scrollClose" : "scrollOpen"} 0.52s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wsc-content { animation: contentIn 0.38s ease forwards 0.38s; opacity: 0; }
      `}</style>

      <div className="wsc-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(8,4,1,0.78)", backdropFilter: "blur(4px)" }}>

        <div className="wsc-scroll w-full" style={{ maxWidth: 360 }}>
          <ScrollRoll top />

          <div style={{
            background: "linear-gradient(170deg, #fdf3d8 0%, #f2dfa8 40%, #f7e9c4 100%)",
            padding: "0 36px",
          }}>
            <div className="wsc-content">

              {/* 본문 */}
              <div className="text-center py-10 flex flex-col items-center gap-4">
                {/* 장식 */}
                <div className="flex items-center gap-3 w-full">
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c8a054)" }} />
                  <span style={{ color: "#c8a054", fontSize: 13 }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c8a054)" }} />
                </div>

                <h1 style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#3d2108",
                  letterSpacing: "0.04em",
                }}>
                  어서오세요
                </h1>

                <p style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  color: "#7a5020",
                  letterSpacing: "0.06em",
                }}>
                  Welcome
                </p>

                <div className="flex items-center gap-3 w-full">
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c8a054)" }} />
                  <span style={{ color: "#c8a054", fontSize: 13 }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c8a054)" }} />
                </div>

                {/* 입장 버튼 */}
                <button onClick={handleClose}
                  className="mt-2 px-10 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition hover:scale-105 active:scale-95"
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
