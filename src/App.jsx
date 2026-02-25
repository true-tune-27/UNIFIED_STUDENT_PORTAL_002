import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import FacultyDashboard from './FacultyDashboard';
import TeachingDashboard from './TeachingDashboard';
import ResearchDashboard from './ResearchDashboard';
import ExpertiseDashboard from './ExpertiseDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/teaching-dashboard" element={<TeachingDashboard />} />
        <Route path="/research-dashboard" element={<ResearchDashboard />} />
        <Route path="/expertise-dashboard" element={<ExpertiseDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
