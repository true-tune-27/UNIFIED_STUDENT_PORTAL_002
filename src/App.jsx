import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import FacultyDashboard from './FacultyDashboard';
import TeachingDashboard from './TeachingDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/teaching-dashboard" element={<TeachingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
