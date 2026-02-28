import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './HODDashboard.css';
import logoEmblem from './assets/logo.png';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'expertise', label: 'Expertise/Value Add', icon: '📈' },
    { id: 'hod', label: 'HOD Panel', icon: '🏛️' },
];

/* ── Mock department data ── */
const DEPT_STATS = [
    { label: 'Total Faculty', value: 18, icon: '👨‍🏫', color: '#0f172a' },
    { label: 'Avg Teaching %', value: '76%', icon: '📘', color: '#0f766e' },
    { label: 'Avg Research Pts', value: 48, icon: '🔬', color: '#7e22ce' },
    { label: 'Pending Approvals', value: 4, icon: '⏳', color: '#d97706' },
];

const FACULTY_LIST = [
    { name: 'Dr. T. Neelima', id: 'FAC001', dept: 'CSE', teach: 68, research: 52, value: 14, total: 134 },
    { name: 'Dr. R. Rao', id: 'FAC005', dept: 'CSE', teach: 74, research: 60, value: 18, total: 152 },
    { name: 'Dr. M. Iyer', id: 'FAC006', dept: 'CSE', teach: 55, research: 40, value: 10, total: 105 },
    { name: 'Dr. P. Singh', id: 'FAC007', dept: 'CSE', teach: 80, research: 72, value: 20, total: 172 },
    { name: 'Dr. K. Reddy', id: 'FAC008', dept: 'CSE', teach: 62, research: 44, value: 12, total: 118 },
];

function ScoreBadge({ value, max }) {
    const pct = Math.round((value / max) * 100);
    const color = pct >= 75 ? '#0f766e' : pct >= 50 ? '#d97706' : '#e53935';
    return (
        <span className="hod-score-badge" style={{ background: color + '18', color, borderColor: color + '44' }}>
            {value}/{max}
        </span>
    );
}

export default function HODDashboard() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleNav = (id) => {
        if (id === 'dashboard') navigate('/faculty-dashboard');
        if (id === 'teaching') navigate('/teaching-dashboard');
        if (id === 'research') navigate('/research-dashboard');
        if (id === 'expertise') navigate('/expertise-dashboard');
    };

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="fd-layout">
            {/* SIDEBAR – reuses fd-* shared styles */}
            <aside className="fd-sidebar">
                <div className="fd-sidebar-header">
                    <img src={logoEmblem} alt="Aditya" className="fd-sidebar-logo" />
                    <span className="fd-sidebar-title">Faculty Portfolio</span>
                </div>
                <nav className="fd-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`fd-nav-item ${item.id === 'hod' ? 'fd-nav-item--active' : ''}`}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="fd-nav-icon">{item.icon}</span>
                            <span className="fd-nav-label">{item.label}</span>
                            {item.id === 'hod' && (
                                <span className="hod-role-chip">HOD</span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN */}
            <main className="fd-main">
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">HOD Dashboard — {currentUser?.dept || 'CSE'} Department</h1>
                    <div className="fd-topbar-actions">
                        <span className="hod-topbar-role">🏛️ Head of Department</span>
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                <div className="hod-content">
                    {/* Welcome banner */}
                    <div className="hod-banner">
                        <div>
                            <h2 className="hod-banner-title">Department Overview</h2>
                            <p className="hod-banner-sub">Welcome, {currentUser?.name} · HOD View · Academic Year 2025–26</p>
                        </div>
                        <div className="hod-banner-icon">🏛️</div>
                    </div>

                    {/* Stats */}
                    <div className="hod-stats-row">
                        {DEPT_STATS.map(s => (
                            <div key={s.label} className="hod-stat-card" style={{ borderTopColor: s.color }}>
                                <span className="hod-stat-icon">{s.icon}</span>
                                <div>
                                    <p className="hod-stat-value" style={{ color: s.color }}>{s.value}</p>
                                    <p className="hod-stat-label">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Faculty Performance Table */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Faculty Performance — {currentUser?.dept || 'CSE'}</h3>
                        <div className="fd-table-wrap">
                            <table className="fd-table">
                                <thead>
                                    <tr>
                                        <th>Faculty ID</th>
                                        <th>Name</th>
                                        <th>Teaching (Max 80)</th>
                                        <th>Research (Max 80)</th>
                                        <th>Value Add (Max 20)</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FACULTY_LIST.map(f => (
                                        <tr key={f.id}>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{f.id}</td>
                                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</td>
                                            <td><ScoreBadge value={f.teach} max={80} /></td>
                                            <td><ScoreBadge value={f.research} max={80} /></td>
                                            <td><ScoreBadge value={f.value} max={20} /></td>
                                            <td style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{f.total}</td>
                                            <td>
                                                <span className={`hod-status-pill ${f.total >= 150 ? 'good' : f.total >= 120 ? 'avg' : 'low'}`}>
                                                    {f.total >= 150 ? '✅ Excellent' : f.total >= 120 ? '⚠️ Average' : '❌ Needs Improvement'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="hod-actions-row">
                        <div className="hod-action-card">
                            <span className="hod-action-icon">📋</span>
                            <div>
                                <p className="hod-action-title">Pending Approvals</p>
                                <p className="hod-action-sub">4 faculty submissions awaiting review</p>
                            </div>
                            <button className="hod-action-btn">Review →</button>
                        </div>
                        <div className="hod-action-card">
                            <span className="hod-action-icon">📊</span>
                            <div>
                                <p className="hod-action-title">Generate Report</p>
                                <p className="hod-action-sub">Download department performance summary</p>
                            </div>
                            <button className="hod-action-btn">Download →</button>
                        </div>
                        <div className="hod-action-card">
                            <span className="hod-action-icon">📤</span>
                            <div>
                                <p className="hod-action-title">Submit to Dean</p>
                                <p className="hod-action-sub">Forward consolidated report to Dean</p>
                            </div>
                            <button className="hod-action-btn">Submit →</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
