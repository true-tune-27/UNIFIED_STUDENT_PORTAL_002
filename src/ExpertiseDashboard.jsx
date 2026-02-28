import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpertiseDashboard.css';
import { useAuth } from './AuthContext';
import logoEmblem from './assets/logo.png';

/* ── Sidebar nav (shared structure) ── */
const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬', expandable: true },
    { id: 'expertise', label: 'Expertise\n/Value Addition', icon: '📈' },
    { id: 'admin', label: 'Administration', icon: '🏛️' },
    { id: 'interpersonal', label: 'Interpersonal', icon: '👥' },
];

/* ── Dropdown options ── */
const eventOptions = [
    'Conference',
    'STTP / Refresher Course',
    'FDP / Symposium',
    'Guest Lecture / Workshop / Event',
];

const roleOptions = ['Organized', 'Resource Person', 'Participated'];

const expertiseTypeOptions = [
    'Member of BOG/GB/AC/BOS',
    'Editorial Board (SCIE/Q1/Q2)',
    'Editorial Board (ESCI/Q3/Q4)',
    'Awards (Govt/Top 2%)',
    'Awards (NGO/Others)',
    'Developed e-content',
    'Certification (40 hrs)',
    'Trained Students (Finals)',
    'Articles (Magazine/Newspaper)',
    'Research Facility',
    'NPTEL 12 Weeks',
    'NPTEL 8 Weeks',
    'NPTEL 4 Weeks',
    'Coursera (40 hrs)',
    'FDP/Seminar Grant',
];

/* ── Points calculation helpers ── */
function calcResourcePoints(event, role) {
    if (!event || !role) return 0;
    if (role === 'Organized') return 10;
    if (role === 'Resource Person') return 7;
    if (role === 'Participated') return 5;
    return 0;
}

function calcExpertisePoints(type) {
    if (!type) return 0;
    if (type.includes('BOG')) return 5;
    if (type.includes('SCIE/Q1/Q2')) return 5;
    if (type.includes('ESCI/Q3/Q4')) return 3;
    if (type.includes('Govt/Top 2%')) return 5;
    if (type.includes('NGO/Others')) return 3;
    if (type === 'Developed e-content') return 3;
    if (type === 'Certification (40 hrs)') return 3;
    if (type === 'Trained Students (Finals)') return 3;
    if (type.includes('Magazine')) return 2;
    if (type === 'Research Facility') return 3;
    if (type === 'NPTEL 12 Weeks') return 5;
    if (type === 'NPTEL 8 Weeks') return 3;
    if (type === 'NPTEL 4 Weeks') return 2;
    if (type === 'Coursera (40 hrs)') return 3;
    if (type === 'FDP/Seminar Grant') return 3;
    return 0;
}

/* ══════════════════════════════════════════════════════════════
   Main Expertise Dashboard
   ══════════════════════════════════════════════════════════════ */
export default function ExpertiseDashboard() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    /* ── 3.1 Faculty Resource Utilization rows ── */
    const [resourceRows, setResourceRows] = useState([
        { id: 1, event: 'Conference', role: 'Organized', duration: '', points: 10 },
    ]);

    /* ── 3.2 Faculty Expertise rows ── */
    const [expertiseRows, setExpertiseRows] = useState([
        { id: 1, type: 'Member of BOG/GB/AC/BOS', points: 5 },
    ]);

    /* ── 3.1 handlers ── */
    const addResourceRow = () => {
        setResourceRows(prev => [...prev, {
            id: prev.length + 1, event: '', role: '', duration: '', points: 0,
        }]);
    };
    const removeResourceRow = (index) => {
        setResourceRows(prev => prev.filter((_, i) => i !== index));
    };
    const updateResource = (index, field, value) => {
        setResourceRows(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            updated[index].points = calcResourcePoints(
                field === 'event' ? value : updated[index].event,
                field === 'role' ? value : updated[index].role
            );
            return updated;
        });
    };

    /* ── 3.2 handlers ── */
    const addExpertiseRow = () => {
        setExpertiseRows(prev => [...prev, {
            id: prev.length + 1, type: '', points: 0,
        }]);
    };
    const removeExpertiseRow = (index) => {
        setExpertiseRows(prev => prev.filter((_, i) => i !== index));
    };
    const updateExpertise = (index, field, value) => {
        setExpertiseRows(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            if (field === 'type') updated[index].points = calcExpertisePoints(value);
            return updated;
        });
    };

    /* ── Totals ── */
    const resourceTotal = Math.min(10, resourceRows.reduce((s, r) => s + (r.points || 0), 0));
    const expertiseTotal = Math.min(10, expertiseRows.reduce((s, r) => s + (r.points || 0), 0));

    /* ── Nav ── */
    const handleMainNav = (id) => {
        if (id === 'dashboard') navigate('/faculty-dashboard');
        else if (id === 'teaching') navigate('/teaching-dashboard');
        else if (id === 'research') navigate('/research-dashboard');
        else if (id === 'expertise') { /* already here */ }
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
                    {mainNavItems.map((item) => (
                        <button
                            key={item.id}
                            className={`fd-nav-item ${item.id === 'expertise' ? 'fd-nav-item--active' : ''}`}
                            onClick={() => handleMainNav(item.id)}
                        >
                            <span className="fd-nav-icon">{item.icon}</span>
                            <span className="fd-nav-label">{item.label}</span>
                            {item.expandable && <span className="fd-nav-arrow">▾</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── MAIN ── */}
            <main className="fd-main">
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">Expertise / Value Addition</h1>
                    <div className="fd-topbar-actions">
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                <div className="ed-content">
                    {/* Page Header */}
                    <div className="ed-page-header">
                        <h2 className="ed-page-title">Expertise Value Addition</h2>
                        <span className="ed-page-check">✔</span>
                    </div>

                    {/* ── 3.1 Faculty Resource Utilization ── */}
                    <div className="ed-section-block">
                        <h3 className="ed-section-title">3.1 Faculty Resource Utilization</h3>

                        {resourceRows.map((row, i) => (
                            <div className="ed-row" key={i}>
                                <div className="ed-field">
                                    <span className="ed-field-label">Event</span>
                                    <select
                                        className="ed-select"
                                        value={row.event}
                                        onChange={e => updateResource(i, 'event', e.target.value)}
                                    >
                                        <option value="">Select Event</option>
                                        {eventOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="ed-field">
                                    <span className="ed-field-label">Role</span>
                                    <select
                                        className="ed-select"
                                        value={row.role}
                                        onChange={e => updateResource(i, 'role', e.target.value)}
                                    >
                                        <option value="">Select Role</option>
                                        {roleOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="ed-field">
                                    <span className="ed-field-label">&nbsp;</span>
                                    <input
                                        className="ed-input"
                                        type="text"
                                        placeholder="Duration"
                                        value={row.duration}
                                        onChange={e => updateResource(i, 'duration', e.target.value)}
                                    />
                                </div>

                                <div className="ed-row-actions">
                                    <button className="ed-upload-btn" type="button">
                                        <span className="ed-upload-icon">📄</span> Upload
                                    </button>
                                    <span className="ed-points-badge">{row.points}</span>
                                    <button
                                        className="ed-delete-btn"
                                        type="button"
                                        onClick={() => removeResourceRow(i)}
                                        title="Delete row"
                                    >🗑</button>
                                </div>
                            </div>
                        ))}

                        <div className="ed-add-row">
                            <button className="ed-add-row-btn" onClick={addResourceRow}>+ Add Row</button>
                        </div>

                        <div className="ed-assessment-bar">
                            <span>Self-Assessment Points (Max: 10)</span>
                            <span className="ed-assessment-points">{resourceTotal}</span>
                        </div>
                    </div>

                    {/* ── 3.2 Faculty Expertise / Recognition / Contribution ── */}
                    <div className="ed-section-block">
                        <h3 className="ed-section-title">3.2 Faculty Expertise / Recognition / Contribution</h3>

                        {expertiseRows.map((row, i) => (
                            <div className="ed-row" key={i}>
                                <div className="ed-field ed-field--wide">
                                    <span className="ed-field-label">Expertise Type</span>
                                    <select
                                        className="ed-select"
                                        value={row.type}
                                        onChange={e => updateExpertise(i, 'type', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        {expertiseTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="ed-row-actions">
                                    <button className="ed-upload-btn" type="button">
                                        <span className="ed-upload-icon">📄</span> Upload
                                    </button>
                                    <span className="ed-points-badge">{row.points}</span>
                                    <button
                                        className="ed-delete-btn"
                                        type="button"
                                        onClick={() => removeExpertiseRow(i)}
                                        title="Delete row"
                                    >🗑</button>
                                </div>
                            </div>
                        ))}

                        <div className="ed-add-row">
                            <button className="ed-add-row-btn" onClick={addExpertiseRow}>+ Add Row</button>
                        </div>

                        <div className="ed-assessment-bar">
                            <span>Self-Assessment Points (Max: 10)</span>
                            <span className="ed-assessment-points">{expertiseTotal}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
