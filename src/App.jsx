import { Routes, Route } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import SkyApp from './sky/SkyApp';
import LandApp from './land/LandApp';
import SeaApp from './sea/SeaApp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/sky/*" element={<SkyApp />} />
      <Route path="/land/*" element={<LandApp />} />
      <Route path="/sea" element={<SeaApp />} />
    </Routes>
  );
}
