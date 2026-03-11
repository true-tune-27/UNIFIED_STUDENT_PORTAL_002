import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './DeanDashboard.css';
import logoEmblem from './assets/logo.png';
import {
    INITIAL_CLUBS_DATA,
    SAC_LEADERSHIP,
    SAC_MEMBERS,
    MOCK_EVENTS,
    MOCK_REPORTS_DATA
} from './data/studentAffairsData';

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
    { label: 'Avg University Score', value: '127', icon: '🎯', color: '#7e22ceff' },
    { label: 'Publications (2026)', value: 142, icon: '📄', color: '#d97706' },
];

// Views Dropdown Categories
const VIEW_OPTIONS = [
    { id: 'overview', label: 'University Overview', icon: '🎓' },
    { id: 'sac', label: 'Student Activity Council (SAC)', icon: '👥' },
    { id: 'extensions', label: 'Extension Activities', icon: '🤝' },
    { id: 'analytics', label: 'Visual Analytics', icon: '📈' },
    { id: 'reports', label: 'Consolidated Reports', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'calendar', label: 'Event Calendar', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export default function DeanDashboard() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [activeView, setActiveView] = useState('overview');
    const [isDeanSubmenuOpen, setIsDeanSubmenuOpen] = useState(true);

    // States for SAC
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sacFilter, setSacFilter] = useState('all');

    const handleNav = (id) => {
        if (id === 'dashboard') navigate('/faculty-dashboard');
        if (id === 'teaching') navigate('/teaching-dashboard');
        if (id === 'research') navigate('/research-dashboard');
        if (id === 'expertise') navigate('/expertise-dashboard');
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const renderOverview = () => (
        <>
            <div className="dean-banner">
                <div>
                    <h2 className="dean-banner-title">University Performance Overview</h2>
                    <p className="dean-banner-sub">Welcome, {currentUser?.name} · Dean View · Academic Year 2025–26</p>
                </div>
                <div className="dean-banner-icon">👑</div>
            </div>

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
                                        <td><span className="dean-score-chip">{d.avgScore}</span></td>
                                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.topPerformer}</td>
                                        <td>
                                            <span className={`dean-trend ${isPositive ? 'up' : 'down'}`}>
                                                {isPositive ? '↑' : '↓'} {d.trend}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="dean-bar-wrap">
                                                <div className="dean-bar-fill" style={{ width: `${Math.min(100, (d.avgScore / 200) * 100)}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </>
    );

    const renderSACLayout = () => {
        const categories = ["all", "Technical", "Non-technical", "Regional Club & Chapters", "Corporate Excellence Clubs", "Social Outreach Club"];
        const filteredClubs = Object.values(INITIAL_CLUBS_DATA).filter(club =>
            club.type === 'club' && (sacFilter === 'all' || club.broad_category === sacFilter)
        );

        return (
            <div className="sac-container">
                <div className="sac-header-block">
                    <div className="sac-title-row">
                        <h2 className="sac-header-title">👑 SAC Leadership</h2>
                        <button className="upload-sac-btn">
                            <span>📤</span> Update SAC
                        </button>
                    </div>

                    <div className="leadership-grid">
                        {Object.entries(SAC_LEADERSHIP).map(([key, ldr]) => (
                            <div key={key} className="leader-card">
                                <button className="btn-edit-leader">✏️</button>
                                <img src={ldr.img} alt={ldr.role} className="leader-img" />
                                <div className="leader-name">{ldr.name}</div>
                                <div className="leader-role">{ldr.role}</div>
                                <div className="leader-contact">🟢 {ldr.phone}</div>
                            </div>
                        ))}
                    </div>

                    <div className="members-section">
                        <div className="custom-select-wrapper" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className={`custom-select ${isDropdownOpen ? 'open' : ''}`}>
                                <div className="custom-select__trigger">
                                    <span>👥 SAC TEAM</span>
                                    <div className="arrow"></div>
                                </div>
                                <div className="custom-select-options">
                                    {SAC_MEMBERS.map((member, idx) => (
                                        <span key={idx} className="custom-option">{member}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="filters-row">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${sacFilter === cat ? 'active' : ''}`}
                            data-filter={cat}
                            onClick={() => setSacFilter(cat)}
                        >
                            {cat === 'all' ? 'All Clubs' : cat}
                        </button>
                    ))}
                </div>

                <div className="grid-system">
                    {filteredClubs.map(club => (
                        <div key={club.id} className="club-card">
                            <div className="card-img-box">
                                <img src={`/src/assets/student_affairs/${club.img}`} alt={club.name} />
                                <span className="category-tag">{club.category}</span>
                            </div>
                            <div className="card-body">
                                <div className="card-title">{club.name}</div>
                                <div className="card-head">
                                    <span>👔</span>
                                    <span>{club.head}</span>
                                </div>
                                <div className="card-footer">
                                    <span className="status">Active</span>
                                    <button className="btn-view">View Dashboard →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderExtensions = () => {
        const extensions = Object.values(INITIAL_CLUBS_DATA).filter(c => c.type === 'extension');
        return (
            <div className="sac-container">
                <div className="extensions-header">
                    <h2>Extension Activities & Sports</h2>
                    <span className="badge">Service & Fitness</span>
                </div>
                <div className="grid-system">
                    {extensions.map(club => (
                        <div key={club.id} className="club-card">
                            <div className="card-img-box">
                                <img src={`/src/assets/student_affairs/${club.img}`} alt={club.name} />
                                <span className="category-tag bg-green">{club.category}</span>
                            </div>
                            <div className="card-body">
                                <div className="card-title">{club.name}</div>
                                <div className="card-head">
                                    <span>🛡️</span>
                                    <span style={{ fontWeight: 600 }}>{club.head}</span>
                                </div>
                                <div className="contact-details">
                                    <div className="contact-row"><span>✉️</span> {club.email}</div>
                                    <div className="contact-row"><span>📞</span> {club.mobile}</div>
                                </div>
                                <div className="card-footer">
                                    <span className="status">Active</span>
                                    <button className="btn-view">View Dashboard →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPlaceholder = (title, icon, message) => (
        <div className="placeholder-view">
            <div className="placeholder-icon">{icon}</div>
            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    );

    const renderReports = () => {
        return (
            <div className="reports-container">
                <div className="reports-header-row">
                    <div>
                        <h2>5.1 Student Participation</h2>
                        <p>Dynamic report generated from uploaded files.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-pdf">📄 PDF</button>
                        <button className="btn-excel">📊 Excel</button>
                    </div>
                </div>
                <div className="reports-table-wrap">
                    <table className="reports-table header-5-1">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th style={{ textAlign: 'left' }}>Nature of the event</th>
                                <th>Civil</th><th>EEE</th><th>Mech</th><th>ECE</th><th>CSE</th>
                                <th>IT & DS</th><th>AIML</th><th>Agri</th><th>Min & PT</th>
                                <th className="td-total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_REPORTS_DATA['5.1'].map((row, i) => (
                                <tr key={i}>
                                    <td>{row['S.No']}</td>
                                    <td style={{ textAlign: 'left', fontWeight: 600 }}>{row.Name}</td>
                                    <td>{row.Civil}</td><td>{row.EEE}</td><td>{row.Mech}</td><td>{row.ECE}</td><td>{row.CSE}</td>
                                    <td>{row['IT & DS']}</td><td>{row.AIML}</td><td>{row.Agri}</td><td>{row['Min & PT']}</td>
                                    <td className="td-total">{row.Total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    };

    const renderNotifications = () => {
        return (
            <div className="notif-container">
                <div className="urgent-ticker">
                    <div className="ticker-label">URGENT UPDATES</div>
                    <div className="ticker-wrapper">
                        <div className="ticker-content">
                            {MOCK_EVENTS.filter(e => e.status === 'upcoming').map((e, idx) => (
                                <div key={idx} className="ticker-item">
                                    <span>⚡</span> <strong>{e.title}:</strong> {e.date} - Register Now!
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="notif-table-header">
                    <div className="col-1">S.No</div>
                    <div className="col-2">Date</div>
                    <div className="col-3">Notification</div>
                    <div className="col-4">Club</div>
                    <div className="col-5">Coordinator</div>
                </div>
                <div className="notif-list">
                    {MOCK_EVENTS.map((e, i) => (
                        <div key={i} className="notif-row">
                            <div className="col-1">{i + 1}.</div>
                            <div className="col-2">{e.date}</div>
                            <div className="col-3">
                                <strong>{e.title}</strong> {e.status === 'upcoming' && <span className="new-badge">NEW</span>}
                                <br /><span style={{ fontSize: '12px', color: '#666' }}>{e.desc}</span>
                            </div>
                            <div className="col-4">{e.club}</div>
                            <div className="col-5">{e.coord}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const renderCalendar = () => {
        return (
            <div className="calendar-view">
                <div className="cal-metrics">
                    <div className="cal-metric bg-green">
                        <h3>{MOCK_EVENTS.filter(e => e.status === 'upcoming').length}</h3><span>Upcoming</span>
                    </div>
                    <div className="cal-metric bg-blue">
                        <h3>{MOCK_EVENTS.filter(e => e.status === 'modified').length}</h3><span>Modified</span>
                    </div>
                    <div className="cal-metric bg-yellow">
                        <h3>{MOCK_EVENTS.filter(e => e.status === 'completed').length}</h3><span>Completed</span>
                    </div>
                </div>
                <div className="list-items-wrapper">
                    <h3 style={{ marginBottom: '15px' }}>Events List</h3>
                    {MOCK_EVENTS.map((e, i) => (
                        <div key={i} className={`list-card ${e.status}`}>
                            <div className="list-info">
                                <h3>{e.title}</h3>
                                <div className="list-meta">
                                    <span>📅 {e.date}</span>
                                    <span>📍 {e.venue}</span>
                                    <span>👥 {e.club}</span>
                                </div>
                            </div>
                            <button className="btn-details">Details</button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="fd-layout">
            <aside className="fd-sidebar">
                <div className="fd-sidebar-header">
                    <img src={logoEmblem} alt="Aditya" className="fd-sidebar-logo" />
                    <span className="fd-sidebar-title">Faculty Portfolio</span>
                </div>
                <nav className="fd-nav">
                    {navItems.map(item => (
                        <div key={item.id} className="fd-nav-item-container">
                            <button
                                className={`fd-nav-item ${item.id === 'dean' ? 'fd-nav-item--active' : ''}`}
                                onClick={() => {
                                    if (item.id === 'dean') {
                                        setIsDeanSubmenuOpen(!isDeanSubmenuOpen);
                                    } else {
                                        handleNav(item.id);
                                    }
                                }}
                            >
                                <span className="fd-nav-icon">{item.icon}</span>
                                <span className="fd-nav-label">{item.label}</span>
                                {item.id === 'dean' && (
                                    <>
                                        <span className="dean-role-chip">DEAN</span>
                                        <span className={`fd-nav-chevron ${isDeanSubmenuOpen ? 'open' : ''}`}>▼</span>
                                    </>
                                )}
                            </button>
                            {item.id === 'dean' && isDeanSubmenuOpen && (
                                <div className="fd-nav-submenu">
                                    {VIEW_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            className={`fd-nav-subitem ${activeView === opt.id ? 'active' : ''}`}
                                            onClick={() => setActiveView(opt.id)}
                                        >
                                            <span className="fd-nav-subicon">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="fd-main">
                <header className="fd-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 className="fd-topbar-title">Dean Dashboard</h1>
                    </div>
                    <div className="fd-topbar-actions">
                        <span className="dean-topbar-role">👑 Dean of Academics</span>
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                <div className="dean-content fade-in">
                    {activeView === 'overview' && renderOverview()}
                    {activeView === 'sac' && renderSACLayout()}
                    {activeView === 'extensions' && renderExtensions()}
                    {activeView === 'analytics' && renderPlaceholder('Visual Analytics', '📈', 'Analytics charts will be displayed here...')}
                    {activeView === 'reports' && renderReports()}
                    {activeView === 'notifications' && renderNotifications()}
                    {activeView === 'calendar' && renderCalendar()}
                    {activeView === 'settings' && renderPlaceholder('Settings', '⚙️', 'Dashboard settings and configuration...')}
                </div>
            </main>
        </div>
    );
}
