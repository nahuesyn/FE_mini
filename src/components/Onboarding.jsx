import { useEffect, useState } from 'react';

// SVG viewBox 0 0 100 100 좌표 (% 단위)
// 빨간 선 기준으로 산등성이/해안선을 따라 구역 분할
const ZONES = [
  {
    id: 'sky',
    // 하늘: 상단 전체 ~ 산등성이 첫 번째 선
    points: '0,0 100,0 100,58 73,56 55,53 40,45 28,35 17,41 0,38',
    hoverFill: 'rgba(120,180,255,0.10)',
    label: '하 늘',
    labelX: '55%',
    labelY: '28%',
    labelColor: '#c8e8ff',
    hint: '클릭하여 하늘 세계로',
    target: 'profile',
  },
  {
    id: 'land',
    // 대지: 첫 번째 선 ~ 두 번째 선 (해안선)
    points: '0,38 17,41 28,35 40,45 55,53 73,56 100,58 100,62 68,72 52,76 38,64 0,61',
    hoverFill: 'rgba(60,160,60,0.12)',
    label: '대 지',
    labelX: '13%',
    labelY: '55%',
    labelColor: '#b0e8a0',
    hint: '준비 중',
    target: null,
  },
  {
    id: 'sea',
    // 바다: 두 번째 선 ~ 화면 하단
    points: '0,61 38,64 52,76 68,72 100,62 100,100 0,100',
    hoverFill: 'rgba(0,80,210,0.14)',
    label: '바 다',
    labelX: '78%',
    labelY: '78%',
    labelColor: '#80c8ff',
    hint: '준비 중',
    target: null,
  },
];

export default function Onboarding({ onEnter, isLeaving }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleClick = (zone) => {
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
        backgroundImage: "url('/bg_onboarding.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: isLeaving ? 'scale(2.6)' : visible ? 'scale(1)' : 'scale(1.08)',
        opacity: isLeaving ? 0 : visible ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.6s ease, transform 1.6s ease',
      }}
    >
      {/* Base overlay */}
      <div className="absolute inset-0 bg-black/25 z-0" />

      {/* Nebula glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 55% 28%, rgba(20,50,120,0.32) 0%, transparent 70%)',
        }}
      />

      {/* SVG 구역 레이어 */}
      <svg
        className="absolute inset-0 w-full h-full z-[5]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {ZONES.map((zone) => (
          <polygon
            key={zone.id}
            points={zone.points}
            fill={hovered === zone.id ? zone.hoverFill : 'transparent'}
            style={{
              cursor: 'pointer',
              transition: 'fill 0.35s ease',
            }}
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
            <p
              className="text-xs tracking-widest"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {zone.hint}
            </p>
          </div>
        );
      })}

      {/* 중앙 텍스트 (hover 시 숨김) */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[8] pointer-events-none"
        style={{
          opacity: hovered ? 0 : visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div className="text-center px-6">
          <h1
            className="font-bold leading-relaxed mb-6"
            style={{
              fontSize: 'clamp(1.9rem, 4.5vw, 3.8rem)',
              textShadow: '0 0 40px rgba(168,200,255,0.55), 0 2px 20px rgba(0,0,0,0.9)',
            }}
          >
            "{' '}
            <span style={{ color: '#a8d8ff', textShadow: '0 0 28px rgba(168,200,255,0.9)' }}>
              하늘
            </span>
            , 대지, 바다 "<br />
            세계가 있습니다.<br />
            어디서부터 시작하시겠어요?
          </h1>
          <p
            className="text-sm tracking-widest float-hint"
            style={{ color: 'rgba(200,230,255,0.75)' }}
          >
            ▲ 하늘 · 대지 · 바다를 클릭하여 탐험하세요
          </p>
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
