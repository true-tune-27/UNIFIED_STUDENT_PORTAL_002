import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './DeanDashboard.css';
import logoEmblem from './assets/logo.png';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'expertise', label: 'Expertise/Value Add', icon: '📈' },
    { id: 'dean', label: 'Dean Panel', icon: '👑' },
];

const DEPT_SUMMARIES = [
    { dept: 'CSE', faculty: 18, avgScore: 142, topPerformer: 'Dr. P. Singh', trend: '+8%' },
    { dept: 'ECE', faculty: 14, avgScore: 128, topPerformer: 'Dr. R. Kumar', trend: '+5%' },
    { dept: 'IT', faculty: 12, avgScore: 136, topPerformer: 'Dr. S. Patel', trend: '+12%' },
    { dept: 'MECH', faculty: 10, avgScore: 118, topPerformer: 'Dr. A. Sharma', trend: '-2%' },
    { dept: 'CIVIL', faculty: 9, avgScore: 111, topPerformer: 'Dr. B. Nair', trend: '+3%' },
    { dept: 'EEE', faculty: 11, avgScore: 124, topPerformer: 'Dr. C. Reddy', trend: '+6%' },
];

const UNI_STATS = [
    { label: 'Total Faculty', value: 74, icon: '👨‍🏫', color: '#0f172a' },
    { label: 'Departments', value: 6, icon: '🏛️', color: '#0f766e' },
    { label: 'Avg University Score', value: '127', icon: '🎯', color: '#7e22ce' },
    { label: 'Publications (2026)', value: 142, icon: '📄', color: '#d97706' },
];

export default function DeanDashboard() {
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
            {/* SIDEBAR */}
            <aside className="fd-sidebar">
                <div className="fd-sidebar-header">
                    <img src={logoEmblem} alt="Aditya" className="fd-sidebar-logo" />
                    <span className="fd-sidebar-title">Faculty Portfolio</span>
                </div>
                <nav className="fd-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`fd-nav-item ${item.id === 'dean' ? 'fd-nav-item--active' : ''}`}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="fd-nav-icon">{item.icon}</span>
                            <span className="fd-nav-label">{item.label}</span>
                            {item.id === 'dean' && (
                                <span className="dean-role-chip">DEAN</span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN */}
            <main className="fd-main">
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">Dean Dashboard — University View</h1>
                    <div className="fd-topbar-actions">
                        <span className="dean-topbar-role">👑 Dean of Academics</span>
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                <div className="dean-content">
                    {/* Banner */}
                    <div className="dean-banner">
                        <div>
                            <h2 className="dean-banner-title">University Performance Overview</h2>
                            <p className="dean-banner-sub">Welcome, {currentUser?.name} · Dean View · Academic Year 2025–26</p>
                        </div>
                        <div className="dean-banner-icon">👑</div>
                    </div>

                    {/* Uni stats */}
                    <div className="dean-stats-row">
                        {UNI_STATS.map(s => (
                            <div key={s.label} className="dean-stat-card" style={{ borderTopColor: s.color }}>
                                <span className="dean-stat-icon">{s.icon}</span>
                                <div>
                                    <p className="dean-stat-value" style={{ color: s.color }}>{s.value}</p>
                                    <p className="dean-stat-label">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Department table */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Department-wise Performance Summary</h3>
                        <div className="fd-table-wrap">
                            <table className="fd-table">
                                <thead>
                                    <tr>
                                        <th>Department</th>
                                        <th>Faculty Count</th>
                                        <th>Avg Score</th>
                                        <th>Top Performer</th>
                                        <th>YoY Trend</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DEPT_SUMMARIES.map(d => {
                                        const isPositive = d.trend.startsWith('+');
                                        return (
                                            <tr key={d.dept}>
                                                <td style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{d.dept}</td>
                                                <td style={{ fontWeight: 600, color: '#475569' }}>{d.faculty}</td>
                                                <td>
                                                    <span className="dean-score-chip">{d.avgScore}</span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.topPerformer}</td>
                                                <td>
                                                    <span className={`dean-trend ${isPositive ? 'up' : 'down'}`}>
                                                        {isPositive ? '↑' : '↓'} {d.trend}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dean-bar-wrap">
                                                        <div
                                                            className="dean-bar-fill"
                                                            style={{ width: `${Math.min(100, (d.avgScore / 200) * 100)}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dean-actions-row">
                        {[
                            { icon: '📊', title: 'University Report', sub: 'Download full academic performance PDF' },
                            { icon: '📋', title: 'HOD Submissions', sub: '6 department reports pending review' },
                            { icon: '📤', title: 'Policy Circular', sub: 'Broadcast announcement to all HODs' },
                            { icon: '🏆', title: 'Awards & Recognition', sub: 'Identify top performers for awards' },
                        ].map(a => (
                            <div key={a.title} className="dean-action-card">
                                <span className="dean-action-icon">{a.icon}</span>
                                <div>
                                    <p className="dean-action-title">{a.title}</p>
                                    <p className="dean-action-sub">{a.sub}</p>
                                </div>
                                <button className="dean-action-btn">→</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
