import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacultyDashboard.css';
import logoEmblem from './assets/logo.png';
import { useAuth } from './AuthContext';

/* ── Base nav items ── */
const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬', expandable: true },
    { id: 'expertise', label: 'Expertise\n/Value Addition', icon: '📈' },
    { id: 'admin', label: 'Administration', icon: '🏛️' },
    { id: 'interpersonal', label: 'Interpersonal', icon: '👥' },
];

/* ── Role nav item appended based on adminRole ── */
const roleNavMap = {
    Coordinator: { id: 'coordinator', label: 'Coordinator Panel', icon: '🎯', chip: 'COORD', chipColor: '#0f766e' },
    HOD: { id: 'hod', label: 'HOD Panel', icon: '🏛️', chip: 'HOD', chipColor: '#0f172a' },
    Dean: { id: 'dean', label: 'Dean Panel', icon: '👑', chip: 'DEAN', chipColor: '#d97706' },
};

/* ── Category data ── */
const categories = [
    { id: 'teaching', label: 'Teaching', max: 80, score: 0, icon: '📋', color: '#475569' },
    { id: 'research', label: 'Research', max: 80, score: 0, icon: '📄', color: '#0f766e' },
    { id: 'value', label: 'Value Addition', max: 20, score: 0, icon: '📈', color: '#d97706' },
    { id: 'admin', label: 'Administration', max: 20, score: 0, icon: '⚙️', color: '#7e22ce' },
    { id: 'interpersonal', label: 'Interpersonal Skills', max: 50, score: 0, icon: '⭐', color: '#0284c7' },
];

export default function FacultyDashboard() {
    const [activeNav, setActiveNav] = useState('dashboard');
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    /* ── Build full nav list with optional role item ── */
    const roleItem = currentUser?.adminRole ? roleNavMap[currentUser.adminRole] : null;
    const navItems = roleItem ? [...baseNavItems, roleItem] : baseNavItems;

    const totalWithout = categories.filter(c => c.id !== 'interpersonal').reduce((s, c) => s + c.score, 0);
    const totalWithoutMax = categories.filter(c => c.id !== 'interpersonal').reduce((s, c) => s + c.max, 0);
    const grandTotal = categories.reduce((s, c) => s + c.score, 0);
    const grandTotalMax = categories.reduce((s, c) => s + c.max, 0);

    const handleNavClick = (id) => {
        setActiveNav(id);
        if (id === 'teaching') navigate('/teaching-dashboard');
        if (id === 'research') navigate('/research-dashboard');
        if (id === 'expertise') navigate('/expertise-dashboard');
        if (id === 'coordinator') navigate('/coordinator-dashboard');
        if (id === 'hod') navigate('/hod-dashboard');
        if (id === 'dean') navigate('/dean-dashboard');
    };

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="fd-layout">
            {/* ── SIDEBAR ── */}
            <aside className="fd-sidebar">
                <div className="fd-sidebar-header">
                    <img src={logoEmblem} alt="Aditya" className="fd-sidebar-logo" />
                    <span className="fd-sidebar-title">Faculty Portfolio</span>
                </div>

                <nav className="fd-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`fd-nav-item ${activeNav === item.id ? 'fd-nav-item--active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <span className="fd-nav-icon">{item.icon}</span>
                            <span className="fd-nav-label">{item.label}</span>
                            {item.expandable && <span className="fd-nav-arrow">▾</span>}
                            {item.chip && (
                                <span className="fd-role-chip" style={{ background: item.chipColor }}>
                                    {item.chip}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User info at bottom */}
                {currentUser && (
                    <div className="fd-sidebar-user">
                        <div className="fd-sidebar-user-avatar">{currentUser.name[0]}</div>
                        <div className="fd-sidebar-user-info">
                            <span className="fd-sidebar-user-name">{currentUser.name}</span>
                            <span className="fd-sidebar-user-role">
                                {currentUser.adminRole ? `Faculty · ${currentUser.adminRole}` : 'Faculty'}
                            </span>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="fd-main">
                {/* top bar */}
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">Faculty Performance Portfolio</h1>
                    <div className="fd-topbar-actions">
                        {currentUser?.adminRole && (
                            <span className="fd-topbar-role-badge">
                                {roleNavMap[currentUser.adminRole]?.icon} {currentUser.adminRole}
                            </span>
                        )}
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                {/* content area */}
                <div className="fd-content">
                    {/* banner */}
                    <div className="fd-banner">
                        <div>
                            <h2 className="fd-banner-title">
                                Welcome, {currentUser?.name || 'Faculty'}
                            </h2>
                            <p className="fd-banner-sub">
                                {currentUser?.designation || 'Faculty'} · {currentUser?.dept || '—'} · Annual Review (2025–26)
                            </p>
                        </div>
                    </div>

                    {/* score cards */}
                    <div className="fd-cards">
                        {categories.map((cat) => (
                            <div key={cat.id} className="fd-card">
                                <div className="fd-card-top">
                                    <span className="fd-card-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                                        {cat.icon}
                                    </span>
                                    <span className="fd-card-max">Max {cat.max}</span>
                                </div>
                                <h3 className="fd-card-label">{cat.label}</h3>
                                <p className="fd-card-score">Score: {cat.score}</p>
                                <div className="fd-card-bar">
                                    <div
                                        className="fd-card-bar-fill"
                                        style={{ width: `${cat.max > 0 ? (cat.score / cat.max) * 100 : 0}%`, background: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* performance summary */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Performance Summary</h3>
                        <div className="fd-summary-item">
                            <span className="fd-summary-label">
                                Total Score (without Interpersonal)
                                <strong>{totalWithout} / {totalWithoutMax}</strong>
                            </span>
                            <div className="fd-summary-bar">
                                <div className="fd-summary-bar-fill"
                                    style={{ width: `${totalWithoutMax > 0 ? (totalWithout / totalWithoutMax) * 100 : 0}%` }} />
                            </div>
                        </div>
                        <div className="fd-summary-item">
                            <span className="fd-summary-label">
                                Grand Total
                                <strong>{grandTotal} / {grandTotalMax}</strong>
                            </span>
                            <div className="fd-summary-bar fd-summary-bar--grand">
                                <div className="fd-summary-bar-fill fd-summary-bar-fill--grand"
                                    style={{ width: `${grandTotalMax > 0 ? (grandTotal / grandTotalMax) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* detailed breakdown table */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Detailed Performance Breakdown</h3>
                        <div className="fd-table-wrap">
                            <table className="fd-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Max</th>
                                        <th>Score</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td>{cat.label}</td>
                                            <td>{cat.max}</td>
                                            <td>{cat.score}</td>
                                            <td>{cat.max > 0 ? Math.round((cat.score / cat.max) * 100) : 0}%</td>
                                        </tr>
                                    ))}
                                    <tr className="fd-table-total">
                                        <td>Total (without Interpersonal)</td>
                                        <td>{totalWithoutMax}</td>
                                        <td>{totalWithout}</td>
                                        <td>{totalWithoutMax > 0 ? Math.round((totalWithout / totalWithoutMax) * 100) : 0}%</td>
                                    </tr>
                                    <tr className="fd-table-grand">
                                        <td>Grand Total</td>
                                        <td>{grandTotalMax}</td>
                                        <td>{grandTotal}</td>
                                        <td>{grandTotalMax > 0 ? Math.round((grandTotal / grandTotalMax) * 100) : 0}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
