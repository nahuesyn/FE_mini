import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StarCanvas from './StarCanvas';
import NavDots from './NavDots';
import Profile from './Profile';
import Career from './Career';
import Portfolio from './Portfolio';
import InputPage from './InputPage';

const SECTIONS = ['input', 'profile', 'career', 'portfolio'];

export default function SkyApp() {
  const [current, setCurrent] = useState('input');
  const [leaving, setLeaving] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [inputData, setInputData] = useState(null);
  const scrollLock = useRef(false);
  const navigate = useNavigate();

  const navigateTo = useCallback((target) => {
    if (transitioning || target === current) return;
    setTransitioning(true);
    const fromSection = current;
    setLeaving(fromSection);
    setTimeout(() => setCurrent(target), 650);
    setTimeout(() => setLeaving(null), 950);
    setTimeout(() => setTransitioning(false), 1800);
  }, [transitioning, current]);

  const handleWheel = useCallback((e) => {
    if (scrollLock.current || transitioning || e.deltaY < 30) return;
    const idx = SECTIONS.indexOf(current);
    if (idx < SECTIONS.length - 1) {
      scrollLock.current = true;
      navigateTo(SECTIONS[idx + 1]);
      setTimeout(() => { scrollLock.current = false; }, 1800);
    }
  }, [current, transitioning, navigateTo]);

  const isVisible = (sec) => sec === current || sec === leaving;

  return (
    <div className="relative w-full h-screen overflow-hidden" onWheel={handleWheel}>
      <StarCanvas />
      {/* 홈으로 버튼 */}
      <button
        type="button"
        onClick={() => navigate('/')}
        title="처음 화면으로"
        aria-label="처음 화면으로 이동"
        className="fixed left-5 top-5 z-[160] grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/14 sm:left-7 sm:top-7 sm:h-16 sm:w-16"
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.16)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 34px rgba(0,0,0,0.28), 0 0 26px rgba(232,244,255,0.08)',
          opacity: 0.96,
        }}
      >
        <img src="/Letrio_Logo.png" alt="Le Trio" className="w-9 opacity-90 invert transition duration-300 hover:opacity-100 sm:w-10" />
      </button>

      <NavDots current={current} onNavigate={navigateTo} />

      <div className="absolute inset-0" style={{ display: isVisible('input') ? 'block' : 'none' }}>
        <InputPage
          visible={current === 'input'}
          isLeaving={leaving === 'input'}
          onComplete={(data) => {
            setInputData(data);
            navigateTo('profile');
          }}
        />
      </div>
      <div className="absolute inset-0" style={{ display: isVisible('profile') ? 'block' : 'none' }}>
        <Profile visible={current === 'profile'} isLeaving={leaving === 'profile'} profileData={inputData?.profile} />
      </div>
      <div className="absolute inset-0" style={{ display: isVisible('career') ? 'block' : 'none' }}>
        <Career visible={current === 'career'} isLeaving={leaving === 'career'} careerData={inputData?.careers} />
      </div>
      <div className="absolute inset-0" style={{ display: isVisible('portfolio') ? 'block' : 'none' }}>
        <Portfolio visible={current === 'portfolio'} isLeaving={leaving === 'portfolio'} portfolioData={inputData?.portfolios} />
      </div>
    </div>
  );
}
