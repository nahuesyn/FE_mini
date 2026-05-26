import { useEffect, useRef, useState } from 'react';

// Video intrinsic dimensions (752 x 560, aspect ≈ 1.343)
const VIDEO_W = 752;
const VIDEO_H = 560;
const VIDEO_ASPECT = VIDEO_W / VIDEO_H;

// Star positions stored as % of the VIDEO FRAME (not screen),
// so they stay accurate across all viewport sizes.
const PROJECTS = [
  {
    name: 'Meet Us',
    icon: null,
    iconImg: '/MeetUslogo.png',
    iconBg: 'linear-gradient(135deg,#ff7043,#ff8a65)',
    url: 'https://meetus-sample1st.pages.dev',
    vx: 29.9,  // % inside video frame
    vy: 47.5,
  },
  {
    name: 'Picks',
    icon: null,
    iconImg: '/PicksIcon.png',
    iconBg: 'linear-gradient(135deg,#f48fb1,#e91e8c)',
    url: 'https://picks-three.vercel.app/onboarding',
    vx: 61,
    vy: 27.5,
  },
];

// Calculate where a video-frame % position lands on the actual screen
// given how object-cover crops the video.
function calcScreenPos(vx, vy, W, H) {
  const screenAspect = W / H;

  if (screenAspect >= VIDEO_ASPECT) {
    // Screen is wider than video → fit by width, crop top & bottom
    const scale = W / VIDEO_W;
    const displayedH = VIDEO_H * scale;
    const cropY = (displayedH - H) / 2;
    const screenY = ((vy / 100) * VIDEO_H * scale - cropY) / H * 100;
    return { x: vx, y: Math.max(3, Math.min(94, screenY)) };
  } else {
    // Screen is narrower than video → fit by height, crop left & right
    const scale = H / VIDEO_H;
    const displayedW = VIDEO_W * scale;
    const cropX = (displayedW - W) / 2;
    const screenX = ((vx / 100) * VIDEO_W * scale - cropX) / W * 100;
    return { x: Math.max(3, Math.min(94, screenX)), y: vy };
  }
}

export default function Portfolio({ visible, isLeaving }) {
  const [show, setShow] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const [positions, setPositions] = useState(
    PROJECTS.map(p => ({ x: p.vx, y: p.vy }))
  );
  const videoRef = useRef(null);
  const timersRef = useRef([]);

  // Recalculate dot positions whenever viewport resizes
  useEffect(() => {
    const update = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      setPositions(PROJECTS.map(p => calcScreenPos(p.vx, p.vy, W, H)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (visible) {
      timersRef.current.push(setTimeout(() => setShow(true), 80));
    } else {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setShow(false);
      setFrozen(false);
      setIconsVisible(false);
      setOpenItem(null);
      const video = videoRef.current;
      if (video) { video.pause(); video.currentTime = 0; }
    }
  }, [visible]);

  useEffect(() => {
    if (!show) return;
    const video = videoRef.current;
    if (!video) return;

    const freeze = () => {
      video.pause();
      setFrozen(true);
      timersRef.current.push(setTimeout(() => setIconsVisible(true), 400));
    };

    video.play().catch(() => { setFrozen(true); setIconsVisible(true); });
    video.addEventListener('ended', freeze);
    const safetyId = setTimeout(freeze, 10000);
    timersRef.current.push(safetyId);

    return () => video.removeEventListener('ended', freeze);
  }, [show]);

  return (
    <section
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        transform: isLeaving ? 'scale(2.6)' : show ? 'scale(1)' : 'scale(1.4)',
        opacity: isLeaving ? 0 : show ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/PortFolio.mp4"
        muted
        playsInline
        preload="auto"
      />

      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)',
          opacity: frozen ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      />

      <p className="absolute top-8 left-1/2 -translate-x-1/2 z-10 font-orbitron text-xs tracking-[0.35em]"
        style={{ color: 'rgba(168,200,255,0.45)' }}>
        PORTFOLIO STARS
      </p>

      {PROJECTS.map((item, i) => {
        const pos = positions[i];
        return (
          <div
            key={item.name}
            className="absolute z-[5] cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              opacity: iconsVisible ? 1 : 0,
              transition: `opacity 0.9s ease ${i * 0.55}s`,
            }}
            onClick={() => setOpenItem(openItem === i ? null : i)}
          >
            {/* Star dot */}
            <div
              className="w-4 h-4 rounded-full bg-white transition-all duration-300"
              style={{
                boxShadow: openItem === i
                  ? '0 0 20px 9px rgba(255,255,210,1), 0 0 55px 18px rgba(200,220,255,0.9)'
                  : '0 0 9px 4px rgba(255,255,210,0.85), 0 0 28px 9px rgba(200,220,255,0.55)',
                transform: openItem === i ? 'scale(1.5)' : 'scale(1)',
              }}
            />

            {/* Popup */}
            <div
              className="absolute bottom-7 left-1/2 w-52 rounded-2xl p-4"
              style={{
                transform: `translateX(-50%) translateY(${openItem === i ? '0' : '10px'})`,
                background: 'rgba(4,12,35,0.92)',
                border: '1px solid rgba(106,180,255,0.35)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 20px rgba(106,180,255,0.15)',
                opacity: openItem === i ? 1 : 0,
                pointerEvents: openItem === i ? 'all' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 overflow-hidden"
                style={{ background: item.iconBg }}
              >
                {item.iconImg
                  ? <img src={item.iconImg} alt={item.name} className="w-full h-full object-cover" />
                  : item.icon}
              </div>
              <p className="font-bold text-sm mb-2" style={{ color: '#e8f4ff' }}>{item.name}</p>
              {item.url === '#' ? (
                <span className="text-[11px]" style={{ color: 'rgba(168,200,255,0.5)' }}>링크 준비 중</span>
              ) : (
                <a
                  href={item.url} target="_blank" rel="noreferrer"
                  className="text-[11px] block truncate hover:underline"
                  style={{ color: 'var(--accent)', opacity: 0.85 }}
                  onClick={e => e.stopPropagation()}
                >
                  {item.url}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
