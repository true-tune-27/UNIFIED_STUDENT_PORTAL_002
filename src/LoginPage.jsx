import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useAuth } from './AuthContext';
import { getUserByCredentials } from './auth';
import logoEmblem from './assets/logo.png';
import bgVideo from './assets/Clz video 1.mp4';

/* ── SVG inline icons ─────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ── Reusable Login Form ──────────────────────────────────── */
function LoginForm({ role, onSubmit }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ role, userId, password });
  };

  return (
    <form className="lp-form" onSubmit={handleSubmit}>
      <div className="lp-field">
        <div className="lp-input-wrap">
          <span className="lp-input-icon"><MailIcon /></span>
          <input
            id={`${role}-userId`}
            type="text"
            placeholder={role === 'student' ? 'Student ID / Email' : 'Faculty ID / Email'}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
      </div>

      <div className="lp-field">
        <div className="lp-input-wrap">
          <span className="lp-input-icon"><LockIcon /></span>
          <input
            id={`${role}-password`}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="button" className="lp-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle">
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="lp-extras">
        <label className="lp-remember"><input type="checkbox" /> Remember for 30 days</label>
        <a href="#forgot" className="lp-forgot">Forgot password?</a>
      </div>

      <button type="submit" className="lp-submit-btn">
        <span className="lp-btn-shine" />
        {role === 'student' ? 'Login' : 'Login'}
      </button>
    </form>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function LoginPage() {
  const [activeRole, setActiveRole] = useState('student');
  const [introEnded, setIntroEnded] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Intro sequence ends after 3 seconds
    const timer = setTimeout(() => {
      setIntroEnded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = ({ role, userId, password }) => {
    if (role === 'faculty') {
      const user = getUserByCredentials(userId, password);
      if (user) {
        login(user);
        if (user.role === 'SuperAdmin') navigate('/super-admin');
        else navigate('/faculty-dashboard');
      } else {
        alert('Invalid credentials!\n\nTry:\n• faculty@aditya.edu / faculty123\n• coord@aditya.edu / coord123\n• hod@aditya.edu / hod123\n• dean@aditya.edu / dean123\n• admin@aditya.edu / admin123');
      }
    } else {
      const user = getUserByCredentials(userId, password);
      if (user && user.role === 'Student') {
        login(user);
        navigate('/student-dashboard');
      } else {
        alert('Invalid student credentials!\n\nDemo:\n• student@aditya.edu / student123');
      }
    }
  };

  return (
    <div className="lp-page">
      {/* ── Background Video & Overlay ── */}
      <video className="lp-bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="lp-overlay"></div>

      {/* ── Intro Sequence Branding ── */}
      <div className={`lp-intro-overlay ${introEnded ? 'hidden' : ''}`}>
        <img src={logoEmblem} alt="Aditya University Logo" className="lp-intro-logo" />
        <h1 className="lp-intro-title">ADITYA UNIVERSITY</h1>
        <p className="lp-intro-subtitle">Learning · Innovation · Excellence</p>
      </div>

      <div className={`lp-card ${introEnded ? 'visible' : ''}`}>
        {/* ═══════ LOGIN FORM ═══════ */}
        <div className="lp-left">
          <div className="lp-left-inner">
            {/* Logo */}
            <div className="lp-logo-area">
              <img src={logoEmblem} alt="Aditya University" className="lp-logo" />
            </div>

            <h1 className="lp-heading">Welcome Back</h1>
            <p className="lp-sub">Please enter your details to sign in.</p>

            {/* Role Tabs */}
            <div className="lp-tabs">
              <button className={`lp-tab ${activeRole === 'student' ? 'active' : ''}`} onClick={() => setActiveRole('student')} type="button">
                🎓 Student
              </button>
              <button className={`lp-tab ${activeRole === 'faculty' ? 'active' : ''}`} onClick={() => setActiveRole('faculty')} type="button">
                👨‍🏫 Faculty
              </button>
              <div className="lp-tab-indicator" style={{ transform: activeRole === 'faculty' ? 'translateX(100%)' : 'translateX(0)' }} />
            </div>

            {/* Sliding Forms */}
            <div className="lp-slider-viewport">
              <div className="lp-slider-track" style={{ transform: activeRole === 'faculty' ? 'translateX(-50%)' : 'translateX(0)' }}>
                <div className="lp-slider-panel"><LoginForm role="student" onSubmit={handleLogin} /></div>
                <div className="lp-slider-panel"><LoginForm role="faculty" onSubmit={handleLogin} /></div>
              </div>
            </div>
            {/* Removed the small footer to keep it minimal, or we can keep it */}
          </div>
        </div>
      </div>
    </div>
  );
}
