import { Routes, Route } from 'react-router-dom';
import './land.css';
import VillagePage from './app/page.jsx';
import LibraryPage from './app/library/page.jsx';
import MuseumPage from './app/museum/page.jsx';
import GardenPage from './app/garden/page.jsx';
import AdminPage from './app/admin/page.jsx';
import AdminDashPage from './app/admin/dash/page.jsx';
import AdminGreenhousePage from './app/admin/greenhouse/page.jsx';
import AdminStudyPage from './app/admin/study/page.jsx';

export default function LandApp() {
  return (
    <Routes>
      <Route path="/" element={<VillagePage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/museum" element={<MuseumPage />} />
      <Route path="/garden" element={<GardenPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/dash" element={<AdminDashPage />} />
      <Route path="/admin/greenhouse" element={<AdminGreenhousePage />} />
      <Route path="/admin/study" element={<AdminStudyPage />} />
    </Routes>
  );
}
