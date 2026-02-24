import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logoEmblem from './assets/logo.png';
import circleSun from './assets/circle.png';

/* ── SVG inline icons ─────────────────────────────────────── */
const UserIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

const StudentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
  </svg>
);

const FacultyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor={`${role}-userId`}>
          {role === 'student' ? 'Student ID' : 'Faculty ID'}
        </label>
        <div className="input-wrapper">
          <input
            id={`${role}-userId`}
            type="text"
            placeholder={
              role === 'student' ? 'Enter your Student ID' : 'Enter your Faculty ID'
            }
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
          />
          <UserIcon />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor={`${role}-password`}>Password</label>
        <div className="input-wrapper">
          <input
            id={`${role}-password`}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <LockIcon />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="form-extras">
        <label className="remember-me">
          <input type="checkbox" /> Remember me
        </label>
        <a href="#forgot" className="forgot-link">Forgot Password?</a>
      </div>

      <button type="submit" className="login-button">
        <span className="btn-shine" />
        {role === 'student' ? 'Student Login' : 'Faculty Login'}
      </button>
    </form>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function LoginPage() {
  const [activeRole, setActiveRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = ({ role, userId, password }) => {
    if (role === 'faculty') {
      if (userId === 'faculty@aditya.edu' && password === 'faculty123') {
        navigate('/faculty-dashboard');
      } else {
        alert('Invalid credentials!\n\nUse:\nID: faculty@aditya.edu\nPassword: faculty123');
      }
    } else {
      alert('Student dashboard coming soon!');
    }
  };

  return (
    <div className="login-page">
      {/* ═══════ LEFT HALF – About Aditya University ═══════ */}
      <div className="left-panel">
        <div className="left-content">
          {/* University logo */}
          <div className="logo-area">
            <img src={logoEmblem} alt="Aditya University" className="uni-logo" />
          </div>

          <h1 className="uni-name">
            <strong>ADITYA</strong> UNIVERSITY
          </h1>
          <p className="uni-tagline">Learning • Innovation • Excellence</p>

          <div className="uni-about">
            <h2>About Us</h2>
            <p>
              Aditya University is a premier institution committed to academic excellence,
              innovative research, and holistic development. With state-of-the-art facilities
              and a distinguished faculty, we empower students to become future leaders and
              change-makers.
            </p>
          </div>

          <div className="uni-stats">
            <div className="stat-item">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Faculty</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Programs</span>
            </div>
          </div>
        </div>


        {/* Decorative elements */}
        <div className="left-decor-circle left-decor-1"></div>
        <div className="left-decor-circle left-decor-2"></div>
      </div>

      {/* ═══════ RIGHT HALF – Login ═══════ */}
      <div className="right-panel">
        {/* Rotating sun anchored to left edge */}
        <div className="sun-edge-spinner">
          <img src={circleSun} alt="" className="sun-img" />
        </div>
        <div className="right-content">
          <p className="card-heading">Welcome Back</p>
          <h2 className="card-subheading">
            Sign in to <span>your account</span>
          </h2>

          {/* role tabs */}
          <div className="role-tabs">
            <button
              className={`role-tab ${activeRole === 'student' ? 'role-tab--active' : ''}`}
              onClick={() => setActiveRole('student')}
              type="button"
            >
              <StudentIcon /> Student
            </button>
            <button
              className={`role-tab ${activeRole === 'faculty' ? 'role-tab--active' : ''}`}
              onClick={() => setActiveRole('faculty')}
              type="button"
            >
              <FacultyIcon /> Faculty
            </button>
            <div
              className="tab-indicator"
              style={{
                transform: activeRole === 'faculty' ? 'translateX(100%)' : 'translateX(0)',
              }}
            />
          </div>

          {/* sliding forms */}
          <div className="slider-viewport">
            <div
              className="slider-track"
              style={{
                transform: activeRole === 'faculty' ? 'translateX(-50%)' : 'translateX(0)',
              }}
            >
              <div className="slider-panel">
                <LoginForm role="student" onSubmit={handleLogin} />
              </div>
              <div className="slider-panel">
                <LoginForm role="faculty" onSubmit={handleLogin} />
              </div>
            </div>
          </div>
        </div>

        <p className="login-footer">© 2026 Aditya University. All rights reserved.</p>
      </div>
    </div>
  );
}
