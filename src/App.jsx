import { useState, useCallback, useRef } from 'react';
import StarCanvas from './components/StarCanvas';
import NavDots from './components/NavDots';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import Career from './components/Career';
import Portfolio from './components/Portfolio';
import InputPage from './components/InputPage';

const SECTIONS = ['onboarding', 'input', 'profile', 'career', 'portfolio'];

export default function App() {
  const [current, setCurrent] = useState('onboarding');
  const [leaving, setLeaving] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [inputData, setInputData] = useState(null);
  const scrollLock = useRef(false);

  const navigateTo = useCallback((target) => {
    if (transitioning || target === current) return;
    setTransitioning(true);
    const fromSection = current;

    setLeaving(fromSection);

    // t=650ms: switch to new section (zoom-in starts)
    setTimeout(() => setCurrent(target), 650);

    // t=950ms: remove leaving section from DOM
    setTimeout(() => setLeaving(null), 950);

    // t=1800ms: unlock navigation
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
      {current !== 'onboarding' && (
        <button
          type="button"
          onClick={() => navigateTo('onboarding')}
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
          <img
            src="/Letrio_Logo.png"
            alt="Le Trio"
            className="w-9 opacity-90 invert transition duration-300 hover:opacity-100 sm:w-10"
          />
        </button>
      )}
      <NavDots current={current} onNavigate={navigateTo} />

      <div className="absolute inset-0" style={{ display: isVisible('onboarding') ? 'block' : 'none' }}>
        <Onboarding onEnter={navigateTo} isLeaving={leaving === 'onboarding'} />
      </div>
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
        <Profile
          visible={current === 'profile'}
          isLeaving={leaving === 'profile'}
          profileData={inputData?.profile}
        />
      </div>

      <div className="absolute inset-0" style={{ display: isVisible('career') ? 'block' : 'none' }}>
        <Career
          visible={current === 'career'}
          isLeaving={leaving === 'career'}
          careerData={inputData?.careers}
        />
      </div>

      <div className="absolute inset-0" style={{ display: isVisible('portfolio') ? 'block' : 'none' }}>
        <Portfolio
          visible={current === 'portfolio'}
          isLeaving={leaving === 'portfolio'}
          portfolioData={inputData?.portfolios}
        />
      </div>
    </div>
  );
}
