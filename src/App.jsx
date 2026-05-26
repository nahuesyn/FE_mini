import { useState, useCallback, useRef } from 'react';
import StarCanvas from './components/StarCanvas';
import NavDots from './components/NavDots';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import Career from './components/Career';
import Portfolio from './components/Portfolio';

const SECTIONS = ['onboarding', 'profile', 'career', 'portfolio'];

export default function App() {
  const [current, setCurrent] = useState('onboarding');
  const [leaving, setLeaving] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
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
      <NavDots current={current} onNavigate={navigateTo} />

      <div className="absolute inset-0" style={{ display: isVisible('onboarding') ? 'block' : 'none' }}>
        <Onboarding onEnter={navigateTo} isLeaving={leaving === 'onboarding'} />
      </div>

      <div className="absolute inset-0" style={{ display: isVisible('profile') ? 'block' : 'none' }}>
        <Profile visible={current === 'profile'} isLeaving={leaving === 'profile'} />
      </div>

      <div className="absolute inset-0" style={{ display: isVisible('career') ? 'block' : 'none' }}>
        <Career visible={current === 'career'} isLeaving={leaving === 'career'} />
      </div>

      <div className="absolute inset-0" style={{ display: isVisible('portfolio') ? 'block' : 'none' }}>
        <Portfolio visible={current === 'portfolio'} isLeaving={leaving === 'portfolio'} />
      </div>
    </div>
  );
}
