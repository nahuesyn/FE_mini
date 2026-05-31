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

function createCareerNodes(careerData) {
  if (!careerData?.length) return CAREER;

  // Supabase format: has x, y, label_line1, label_line2
  if ('label_line1' in careerData[0]) {
    return careerData.map((c) => ({
      year: c.year ?? '',
      label: [c.label_line1, c.label_line2].filter(Boolean),
      x: c.x ?? 100,
      y: c.y ?? 200,
    }));
  }

  // InputPage format: year, title, description
  const filled = careerData.filter((c) => c.year || c.title || c.description);
  if (!filled.length) return CAREER;

  return filled.map((career, index) => {
    const base = CAREER[index] ?? { x: 100 + index * 135, y: index % 2 === 0 ? 170 : 285 };
    return { ...base, year: career.year || 'YEAR', label: [career.title, career.description].filter(Boolean) };
  });
}

function buildConnections(careerData, careerConnections) {
  // Supabase connections: [{ from_order, to_order }, ...]
  if (careerConnections?.length) {
    return careerConnections.map((c) => [c.from_order, c.to_order]);
  }
  // Supabase career data → use default CONNS if node count matches
  if (careerData?.length && 'label_line1' in (careerData[0] ?? {})) {
    return CONNS;
  }
  // InputPage: linear connections
  const nodes = createCareerNodes(careerData);
  if (nodes.length <= 1) return [];
  return nodes.slice(1).map((_, i) => [i, i + 1]);
}

export default function Career({ visible, isLeaving, careerData, careerConnections }) {
  const [show, setShow] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [nodesVisible, setNodesVisible] = useState([]);
  const [active, setActive] = useState(null);
  const timersRef = useRef([]);
  const careers = createCareerNodes(careerData);
  const connections = buildConnections(careerData, careerConnections);

  useEffect(() => {
    if (visible) {
      timersRef.current.push(setTimeout(() => setShow(true), 80));
      timersRef.current.push(setTimeout(() => setDrawn(true), 400));
      careers.forEach((_, i) => {
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
  }, [visible, careers.length]);

  const lineLengths = connections.map(([a, b]) =>
    Math.hypot(careers[b].x - careers[a].x, careers[b].y - careers[a].y)
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
        backgroundImage: [
          'linear-gradient(90deg, rgba(2,8,24,0.52) 0%, rgba(2,8,24,0.12) 28%, rgba(2,8,24,0.12) 72%, rgba(2,8,24,0.52) 100%)',
          'radial-gradient(ellipse 70% 72% at 50% 45%, rgba(2,8,24,0.02) 0%, rgba(2,8,24,0.36) 100%)',
          "url('/bg_triple.jpg')",
        ].join(', '),
        backgroundSize: 'cover, cover, cover',
        backgroundPosition: 'center, center, center top',
        transform: isLeaving
          ? 'scale(2.6)'
          : show ? 'scale(1)' : 'scale(1.4)',
        opacity: isLeaving ? 0 : show ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="absolute inset-0 bg-black/36 z-0" />

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
          {connections.map(([a, b], i) => {
            const len = lineLengths[i];
            return (
              <line
                key={i}
                x1={careers[a].x} y1={careers[a].y}
                x2={careers[b].x} y2={careers[b].y}
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
          {careers.map((d, i) => {
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
