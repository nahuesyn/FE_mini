const SECTIONS = ['onboarding', 'profile', 'career', 'portfolio'];
const LABELS = ['시작', '프로필', '경력', '포트폴리오'];

export default function NavDots({ current, onNavigate }) {
  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-4">
      {SECTIONS.map((sec, i) => (
        <button
          key={sec}
          onClick={() => onNavigate(sec)}
          title={LABELS[i]}
          className="group relative w-2 h-2 rounded-full border transition-all duration-300 cursor-pointer"
          style={{
            background: current === sec ? 'var(--accent)' : 'rgba(168,200,255,0.3)',
            borderColor: 'rgba(168,200,255,0.5)',
            boxShadow: current === sec ? '0 0 12px rgba(106,180,255,0.9)' : 'none',
            transform: current === sec ? 'scale(1.55)' : 'scale(1)',
          }}
        >
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] tracking-wider
            opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            style={{ color: 'rgba(168,200,255,0.8)' }}>
            {LABELS[i]}
          </span>
        </button>
      ))}
    </nav>
  );
}
