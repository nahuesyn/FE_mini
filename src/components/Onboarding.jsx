import { useEffect, useState } from 'react';

const LAND_PORTFOLIO_URL = 'https://village-portfolio.pages.dev/';

// SVG viewBox 0 0 100 100 좌표 (%)
// 새 배경 기준: 하늘(상단)·대지(건물+해변 중간)·바다(우측 하단)
const ZONES = [
  {
    id: 'sky',
    // Follows the upper red boundary: tree/building silhouette -> mountain ridge -> horizon.
    points: '0,0 100,0 100,65.3 75,65.3 64.6,64.1 60.7,61.3 54.8,61.2 47,56.2 43.9,56.9 37.4,52.6 34.7,50.1 29.5,51 25.7,49.9 23,47.3 21,40.5 19.7,37.8 17.4,37.5 16.4,39.3 16,42.1 13.5,41.2 13.5,36.1 10.7,32.6 8.6,32.6 7,27.2 5.2,22.2 2.5,20.5 0,20.7',
    hoverFill: 'rgba(120,180,255,0.10)',
    label: '하 늘',
    labelX: '65%',
    labelY: '18%',
    labelColor: '#c8e8ff',
    hint: '클릭하여 하늘 세계로',
    target: 'input',
  },
  {
    id: 'land',
    // Between the upper red boundary and the lower beach/sea boundary.
    points: '0,20.7 2.5,20.5 5.2,22.2 7,27.2 8.6,32.6 10.7,32.6 13.5,36.1 13.5,41.2 16,42.1 16.4,39.3 17.4,37.5 19.7,37.8 21,40.5 23,47.3 25.7,49.9 29.5,51 34.7,50.1 37.4,52.6 43.9,56.9 47,56.2 54.8,61.2 60.7,61.3 64.6,64.1 75,65.3 100,65.3 74.8,65.3 68,65 60.7,63.9 53,64.5 49,67.5 45,71 44,75.2 45,80.2 48,85.2 53,91 58,96 62.9,100 0,100',
    hoverFill: 'rgba(60,160,60,0.11)',
    label: '대 지',
    labelX: '24%',
    labelY: '72%',
    labelColor: '#b0e8a0',
    hint: '클릭하여 대지 세계로',
    target: null,
    href: LAND_PORTFOLIO_URL,
  },
  {
    id: 'sea',
    // Follows the lower red boundary: beach curve -> sea horizon.
    points: '44,75.2 45,71 49,67.5 53,64.5 60.7,63.9 68,65 74.8,65.3 100,65.3 100,100 62.9,100 58,96 53,91 48,85.2 45,80.2',
    hoverFill: 'rgba(0,80,210,0.13)',
    label: '바 다',
    labelX: '78%',
    labelY: '74%',
    labelColor: '#80c8ff',
    hint: '준비 중',
    target: null,
  },
];

export default function Onboarding({ onEnter, isLeaving }) {
  const [visible, setVisible] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const visibleTimer = setTimeout(() => setVisible(true), 100);
    const introTimer = setTimeout(() => setIntroDone(true), 2800);

    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(introTimer);
    };
  }, []);

  const handleClick = (zone) => {
    if (zone.href) {
      window.location.assign(zone.href);
      return;
    }

    if (zone.target) {
      onEnter(zone.target);
    } else {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/온보딩화면.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: isLeaving ? 'scale(2.6)' : visible ? 'scale(1)' : 'scale(1.08)',
        opacity: isLeaving ? 0 : visible ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.6s ease, transform 1.6s ease',
      }}
    >
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* 상단 성운 글로우 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 65% 25%, rgba(20,50,120,0.28) 0%, transparent 70%)',
        }}
      />

      {/* SVG 구역 */}
      <svg
        className="absolute inset-0 w-full h-full z-[5]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          pointerEvents: introDone ? 'auto' : 'none',
        }}
      >
        {ZONES.map((zone) => (
          <polygon
            key={zone.id}
            points={zone.points}
            fill={hovered === zone.id ? zone.hoverFill : 'transparent'}
            style={{ cursor: introDone ? 'pointer' : 'default', transition: 'fill 0.35s ease' }}
            onClick={() => handleClick(zone)}
            onMouseEnter={() => setHovered(zone.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {/* 구역 hover 라벨 */}
      {ZONES.map((zone) => {
        const isHov = hovered === zone.id;
        return (
          <div
            key={zone.id + '-label'}
            className="absolute z-[10] pointer-events-none flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: zone.labelX,
              top: zone.labelY,
              opacity: isHov ? 1 : 0,
              transform: `translate(-50%, -50%) translateY(${isHov ? '0' : '8px'})`,
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <p
              className="font-bold tracking-[0.28em] text-xl"
              style={{
                color: zone.labelColor,
                textShadow: `0 0 28px ${zone.labelColor}, 0 0 60px ${zone.labelColor}`,
              }}
            >
              {zone.label}
            </p>
            <p className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {zone.hint}
            </p>
          </div>
        );
      })}

      {/* 중앙 텍스트 — 디자인 레퍼런스 기준 */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[8] pointer-events-none"
        style={{
          opacity: !introDone ? 0 : visible ? 1 : 0,
          transform: `translateY(${introDone ? '0' : '10px'})`,
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <div className="text-center px-6">
          <h1
            className="font-bold leading-snug mb-4 text-white"
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 4.2rem)',
              textShadow: '0 2px 32px rgba(0,0,0,0.8), 0 0 60px rgba(168,200,255,0.3)',
              letterSpacing: '0',
            }}
          >
            당신의 세계는<br />
            어디에서 시작되나요?
          </h1>
          <p
            className="text-sm sm:text-base float-hint"
            style={{ color: 'rgba(220,235,255,0.75)' }}
          >
            하늘 · 대지 · 바다 중 하나를 선택하세요
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 z-[12] flex items-center justify-center pointer-events-none"
        style={{
          opacity: introDone ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      >
        <div className="onboarding-intro text-center px-6">
          <img
            src="/Letrio_Logo.png"
            alt="Le Trio"
            className="onboarding-intro-logo mx-auto w-64 invert sm:w-88 md:w-96"
          />
        </div>
      </div>

      {/* 준비 중 토스트 */}
      <div
        className="fixed top-1/2 left-1/2 z-[100] px-6 py-3 rounded-full text-sm tracking-wider pointer-events-none"
        style={{
          background: 'rgba(4,12,35,0.88)',
          border: '1px solid rgba(168,200,255,0.3)',
          backdropFilter: 'blur(12px)',
          color: 'rgba(200,230,255,0.9)',
          opacity: toast ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${toast ? 1 : 0.9})`,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        🚧 준비 중입니다
      </div>
    </section>
  );
}
