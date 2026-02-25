import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacultyDashboard.css';
import logoEmblem from './assets/logo.png';

/* ── Sidebar nav items ── */
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬', expandable: true },
    { id: 'expertise', label: 'Expertise\n/Value Addition', icon: '📈' },
    { id: 'admin', label: 'Administration', icon: '🏛️' },
    { id: 'interpersonal', label: 'Interpersonal', icon: '👥' },
];

/* ── Category data ── */
const categories = [
    { id: 'teaching', label: 'Teaching', max: 80, score: 0, icon: '📋', color: '#ff6b6b' },
    { id: 'research', label: 'Research', max: 80, score: 0, icon: '📄', color: '#ff8c42' },
    { id: 'value', label: 'Value Addition', max: 20, score: 0, icon: '📈', color: '#ffa94d' },
    { id: 'admin', label: 'Administration', max: 20, score: 0, icon: '⚙️', color: '#ff6b6b' },
    { id: 'interpersonal', label: 'Interpersonal Skills', max: 50, score: 0, icon: '⭐', color: '#ff8c42' },
];

export default function FacultyDashboard() {
    const [activeNav, setActiveNav] = useState('dashboard');
    const navigate = useNavigate();

    const totalWithout = categories.filter(c => c.id !== 'interpersonal').reduce((s, c) => s + c.score, 0);
    const totalWithoutMax = categories.filter(c => c.id !== 'interpersonal').reduce((s, c) => s + c.max, 0);
    const grandTotal = categories.reduce((s, c) => s + c.score, 0);
    const grandTotalMax = categories.reduce((s, c) => s + c.max, 0);

    const handleLogout = () => {
        navigate('/');
    };

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
                            onClick={() => {
                                setActiveNav(item.id);
                                if (item.id === 'teaching') navigate('/teaching-dashboard');
                                if (item.id === 'research') navigate('/research-dashboard');
                                if (item.id === 'expertise') navigate('/expertise-dashboard');
                            }}
                        >
                            <span className="fd-nav-icon">{item.icon}</span>
                            <span className="fd-nav-label">{item.label}</span>
                            {item.expandable && <span className="fd-nav-arrow">▾</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="fd-main">
                {/* top bar */}
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">Faculty Portfolio</h1>
                    <div className="fd-topbar-actions">
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar">👤</div>
                    </div>
                </header>

                {/* content area */}
                <div className="fd-content">
                    {/* banner */}
                    <div className="fd-banner">
                        <div>
                            <h2 className="fd-banner-title">Faculty Performance Portfolio</h2>
                            <p className="fd-banner-sub">Annual Review (2025–26)</p>
                        </div>
                    </div>

                    {/* score cards */}
                    <div className="fd-cards">
                        {categories.map((cat) => (
                            <div key={cat.id} className="fd-card">
                                <div className="fd-card-top">
                                    <span className="fd-card-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
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
                            <span className="fd-summary-label">Total Score : {totalWithout} / {totalWithoutMax}</span>
                            <div className="fd-summary-bar">
                                <div
                                    className="fd-summary-bar-fill"
                                    style={{ width: `${totalWithoutMax > 0 ? (totalWithout / totalWithoutMax) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="fd-summary-item">
                            <span className="fd-summary-label">Grand Total : {grandTotal} / {grandTotalMax}</span>
                            <div className="fd-summary-bar fd-summary-bar--grand">
                                <div
                                    className="fd-summary-bar-fill fd-summary-bar-fill--grand"
                                    style={{ width: `${grandTotalMax > 0 ? (grandTotal / grandTotalMax) * 100 : 0}%` }}
                                />
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
