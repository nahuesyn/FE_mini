import { useEffect, useRef, useState } from 'react';

// Positions derived from Carrer.png design file (viewBox 0 0 920 460)
const CAREER = [
  { year: '2021', label: ['스타일쉐어', '크리에이터'],          x: 100, y: 210 }, // 0 – leftmost
  { year: '2025', label: ['현대백화점', '크리에이터'],           x: 270, y: 180 }, // 1
  { year: '2024', label: ['무신사', '크리에이터'],              x: 430, y: 125 }, // 2 – top hub
  { year: '2025', label: ['서브카테고리·시즌', '에이커스 1기'],  x: 455, y: 280 }, // 3
  { year: '2025', label: ['247시리즈', '앰버서더'],             x: 605, y: 158 }, // 4
  { year: '2026', label: ['스파오', '챌린저스 1기'],            x: 637, y: 318 }, // 5 – rightmost
];

// Connections matching the design (all go left → right in x)
const CONNS = [
  [0, 1], // 스타일쉐어 → 현대백화점
  [1, 2], // 현대백화점 → 무신사 (top hub)
  [2, 4], // 무신사 → 247시리즈
  [2, 3], // 무신사 → 서브카테고리
  [3, 5], // 서브카테고리 → 스파오
];

export default function Career({ visible, isLeaving }) {
  const [show, setShow] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [nodesVisible, setNodesVisible] = useState([]);
  const [active, setActive] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    if (visible) {
      timersRef.current.push(setTimeout(() => setShow(true), 80));
      timersRef.current.push(setTimeout(() => setDrawn(true), 400));
      CAREER.forEach((_, i) => {
        timersRef.current.push(
          setTimeout(() => setNodesVisible(prev => [...prev, i]), 900 + i * 280)
        );
      });
    } else {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setShow(false);
      setDrawn(false);
      setNodesVisible([]);
      setActive(null);
    }
  }, [visible]);

  const lineLengths = CONNS.map(([a, b]) =>
    Math.hypot(CAREER[b].x - CAREER[a].x, CAREER[b].y - CAREER[a].y)
  );

  const nodeOpacity = (i) => {
    if (!nodesVisible.includes(i)) return 0;
    if (active === null) return 1;
    return active === i ? 1 : 0.2;
  };

  const lineOpacity = (a, b) => {
    if (active === null) return 1;
    return active === a || active === b ? 0.85 : 0.1;
  };

  return (
    <section
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden gap-4"
      style={{
        backgroundImage: "url('/bg_triple.jpg')",
        backgroundSize: 'auto 300%',
        backgroundPosition: 'center bottom',
        transform: isLeaving
          ? 'scale(2.6)'
          : show ? 'scale(1)' : 'scale(1.4)',
        opacity: isLeaving ? 0 : show ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="absolute inset-0 bg-black/42 z-0" />

      <p className="relative z-10 font-orbitron text-xs tracking-[0.35em]"
        style={{ color: 'rgba(168,200,255,0.55)' }}>
        CAREER CONSTELLATION
      </p>

      {/* Horizontally scrollable on mobile so constellation stays readable */}
      <div className="relative z-10 w-full max-w-[960px] overflow-x-auto scroll-hide">
        <div style={{ minWidth: '820px', height: '460px' }}>
        <svg viewBox="0 0 920 460" className="w-full h-full overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {CONNS.map(([a, b], i) => {
            const len = lineLengths[i];
            return (
              <line
                key={i}
                x1={CAREER[a].x} y1={CAREER[a].y}
                x2={CAREER[b].x} y2={CAREER[b].y}
                stroke="rgba(168,200,255,0.65)"
                strokeWidth="1.5"
                filter="url(#glow)"
                strokeDasharray={len}
                strokeDashoffset={drawn ? 0 : len}
                style={{
                  opacity: lineOpacity(a, b),
                  transition: `stroke-dashoffset 0.75s ease ${i * 0.4 + 0.1}s, opacity 0.4s ease`,
                }}
              />
            );
          })}

          {/* Nodes */}
          {CAREER.map((d, i) => {
            const isActive = active === i;
            return (
              <g
                key={i}
                onClick={() => setActive(isActive ? null : i)}
                style={{
                  cursor: 'pointer',
                  opacity: nodeOpacity(i),
                  transition: 'opacity 0.4s ease',
                }}
              >
                <circle cx={d.x} cy={d.y} r={isActive ? 24 : 18}
                  fill={isActive ? 'rgba(106,180,255,0.13)' : 'rgba(106,180,255,0.06)'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <circle
                  cx={d.x} cy={d.y}
                  r={isActive ? 11 : 7}
                  fill={isActive ? 'rgba(106,180,255,0.95)' : 'rgba(168,200,255,0.55)'}
                  stroke="rgba(168,200,255,0.9)"
                  strokeWidth="1.5"
                  filter={isActive ? 'url(#glowStrong)' : 'url(#glow)'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x={d.x} y={d.y - 18} textAnchor="middle"
                  fill="rgba(168,200,255,0.75)" fontSize="9"
                  fontFamily="Orbitron,sans-serif">
                  {d.year}
                </text>
                {d.label.map((line, li) => (
                  <text key={li} x={d.x} y={d.y + 24 + li * 15}
                    textAnchor="middle"
                    fill={isActive ? 'rgba(232,244,255,1)' : 'rgba(232,244,255,0.8)'}
                    fontSize="11" fontFamily="Noto Sans KR,sans-serif"
                    fontWeight={isActive ? '700' : '400'}
                    style={{ transition: 'all 0.3s ease' }}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
        </div>
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs tracking-widest float-hint"
        style={{ color: 'rgba(168,200,255,0.55)' }}>
        ↓ 스크롤하여 포트폴리오 보기
      </p>
    </section>
  );
}
