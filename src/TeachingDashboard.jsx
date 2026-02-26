import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeachingDashboard.css';
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

/* ── Points scoring rules ── */
const scoringRules = {
    passPercent: '≥95% → 20 pts, ≥85 & <95 → 15 pts, ≥75 & <85 → 10 pts, ≥70 & <75 → 5 pts',
    feedback: '≥80% → 20 pts, ≥70 & <80 → 15 pts, ≥60 & <70 → 10 pts, ≥50 & <60 → 5 pts',
    proctoring: '≥80% → 20 pts, ≥70 & <80 → 15 pts, ≥60 & <70 → 10 pts, ≥50 & <60 → 5 pts',
    coAttainment: '100% → 20 pts, 80% → 15 pts, 60% → 10 pts, 40% → 5 pts',
};

/* ── Helper: calculate points from pass percentage ── */
function calcPassPoints(pct) {
    if (pct >= 95) return 20;
    if (pct >= 85) return 15;
    if (pct >= 75) return 10;
    if (pct >= 70) return 5;
    return 0;
}
function calcFeedbackPoints(pct) {
    if (pct >= 80) return 20;
    if (pct >= 70) return 15;
    if (pct >= 60) return 10;
    if (pct >= 50) return 5;
    return 0;
}
function calcCOPoints(pct) {
    if (pct >= 100) return 20;
    if (pct >= 80) return 15;
    if (pct >= 60) return 10;
    if (pct >= 40) return 5;
    return 0;
}

/* ── Mock data ── */
const initialMockData = {
    userId: 'FAC2024001',
    passPercent: [
        { sno: 1, course: 'Data Structures', semBranch: '3-CSE-A', appeared: 65, passed: 62 },
        { sno: 2, course: 'Operating Systems', semBranch: '5-CSE-B', appeared: 58, passed: 54 },
        { sno: 3, course: 'Computer Networks', semBranch: '5-CSE-A', appeared: 60, passed: 55 },
        { sno: 4, course: 'DBMS', semBranch: '3-CSE-C', appeared: 70, passed: 68 },
    ],
    feedback: [
        { sno: 1, course: 'Data Structures', semBranch: '3-CSE-A', appeared: 65, feedbackPct: 85 },
        { sno: 2, course: 'Operating Systems', semBranch: '5-CSE-B', appeared: 58, feedbackPct: 72 },
        { sno: 3, course: 'Computer Networks', semBranch: '5-CSE-A', appeared: 60, feedbackPct: 78 },
        { sno: 4, course: 'DBMS', semBranch: '3-CSE-C', appeared: 70, feedbackPct: 90 },
    ],
    proctoring: [
        { sno: 1, course: 'Data Structures', semBranch: '3-CSE-A', appeared: 65, passed: 60 },
        { sno: 2, course: 'Operating Systems', semBranch: '5-CSE-B', appeared: 58, passed: 50 },
        { sno: 3, course: 'Computer Networks', semBranch: '5-CSE-A', appeared: 60, passed: 52 },
        { sno: 4, course: 'DBMS', semBranch: '3-CSE-C', appeared: 70, passed: 65 },
    ],
    coAttainment: [
        { sno: 1, course: 'Data Structures', semBranch: '3-CSE-A', appeared: 65, passed: 58 },
        { sno: 2, course: 'Operating Systems', semBranch: '5-CSE-B', appeared: 58, passed: 52 },
        { sno: 3, course: 'Computer Networks', semBranch: '5-CSE-A', appeared: 60, passed: 48 },
        { sno: 4, course: 'DBMS', semBranch: '3-CSE-C', appeared: 70, passed: 63 },
    ],
};

/* ── Reusable Section Table Component ── */
function SectionTable({ title, subtitle, rows, setRows, type, onSave }) {
    const handleChange = (idx, field, value) => {
        const updated = [...rows];
        updated[idx] = { ...updated[idx], [field]: value === '' ? '' : Number(value) };
        setRows(updated);
    };

    const getPassPct = (row) => {
        if (type === 'feedback') return row.feedbackPct || 0;
        if (!row.appeared || row.appeared === 0) return 0;
        return ((row.passed / row.appeared) * 100).toFixed(1);
    };

    const getPoints = (row) => {
        const pct = type === 'feedback' ? (row.feedbackPct || 0) : (row.appeared > 0 ? (row.passed / row.appeared) * 100 : 0);
        if (type === 'coAttainment') return calcCOPoints(pct);
        if (type === 'feedback') return calcFeedbackPoints(pct);
        return calcPassPoints(pct);
    };

    return (
        <div className="td-section-card">
            <div className="td-section-header">
                <h3 className="td-section-title">{title}</h3>
                <p className="td-section-subtitle">{subtitle}</p>
            </div>
            <div className="td-table-wrap">
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Course Name</th>
                            <th>Sem-Branch-Sec</th>
                            <th>{type === 'feedback' ? 'No.of Students' : 'No.of Students Appeared(A)'}</th>
                            {type !== 'feedback' && <th>No.of Students Passed (B)</th>}
                            <th>{type === 'feedback' ? 'Pass Percentage (B/A*100)' : 'Pass Percentage (B/A*100)'}</th>
                            <th>Points Claimed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.sno}>
                                <td>{row.sno}</td>
                                <td>{row.course}</td>
                                <td>{row.semBranch}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="td-input"
                                        value={row.appeared}
                                        onChange={(e) => handleChange(i, 'appeared', e.target.value)}
                                    />
                                </td>
                                {type !== 'feedback' && (
                                    <td>
                                        <input
                                            type="number"
                                            className="td-input"
                                            value={row.passed}
                                            onChange={(e) => handleChange(i, 'passed', e.target.value)}
                                        />
                                    </td>
                                )}
                                <td>
                                    {type === 'feedback' ? (
                                        <input
                                            type="number"
                                            className="td-input"
                                            value={row.feedbackPct}
                                            onChange={(e) => handleChange(i, 'feedbackPct', e.target.value)}
                                        />
                                    ) : (
                                        <span className="td-computed">{getPassPct(row)}%</span>
                                    )}
                                </td>
                                <td>
                                    <span className="td-points">{getPoints(row)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="td-section-footer">
                <button className="td-save-btn" onClick={() => onSave?.(title)}>Save Section</button>
            </div>
        </div>
    );
}

/* ── Main Component ── */
export default function TeachingDashboard() {
    const [activeNav, setActiveNav] = useState('teaching');
    const [userId, setUserId] = useState(initialMockData.userId);
    const navigate = useNavigate();

    const [passPercent, setPassPercent] = useState(initialMockData.passPercent);
    const [feedback, setFeedback] = useState(initialMockData.feedback);
    const [proctoring, setProctoring] = useState(initialMockData.proctoring);
    const [coAttainment, setCOAttainment] = useState(initialMockData.coAttainment);

    const handleLogout = () => navigate('/');
    const handleBack = () => navigate('/faculty-dashboard');

    const handleSave = (sectionName) => {
        alert(`${sectionName} saved successfully!`);
    };

    /* ── Compute averages for summary ── */
    const avgPoints = (rows, type) => {
        if (rows.length === 0) return 0;
        const total = rows.reduce((sum, row) => {
            const pct = type === 'feedback'
                ? (row.feedbackPct || 0)
                : (row.appeared > 0 ? (row.passed / row.appeared) * 100 : 0);
            if (type === 'coAttainment') return sum + calcCOPoints(pct);
            if (type === 'feedback') return sum + calcFeedbackPoints(pct);
            return sum + calcPassPoints(pct);
        }, 0);
        return (total / rows.length).toFixed(1);
    };

    const summaryData = [
        { label: '1.1 Pass %', avg: avgPoints(passPercent, 'passPercent') },
        { label: '1.2 Feedback', avg: avgPoints(feedback, 'feedback') },
        { label: '1.3 Proctoring', avg: avgPoints(proctoring, 'proctoring') },
        { label: '1.4 CO Attainment', avg: avgPoints(coAttainment, 'coAttainment') },
    ];
    const totalAvg = (summaryData.reduce((s, d) => s + Number(d.avg), 0) / summaryData.length).toFixed(1);

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
                                if (item.id === 'dashboard') navigate('/faculty-dashboard');
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
                    <h1 className="fd-topbar-title">Teaching Dashboard</h1>
                    <div className="fd-topbar-actions">
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar">👤</div>
                    </div>
                </header>

                {/* content */}
                <div className="td-content">
                    {/* User ID bar */}
                    <div className="td-userid-bar">
                        <input
                            type="text"
                            className="td-userid-input"
                            placeholder="Enter User ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <button className="td-go-btn">GO</button>
                    </div>

                    {/* Section header */}
                    <div className="td-section-badge">
                        SECTION 1 : Teaching (80 Points)
                    </div>

                    {/* 1.1 Course Average Pass Percentage */}
                    <SectionTable
                        title="1.1 Course Average Pass Percentage (Theory Only)"
                        subtitle={scoringRules.passPercent}
                        rows={passPercent}
                        setRows={setPassPercent}
                        type="passPercent"
                        onSave={handleSave}
                    />

                    {/* 1.2 Course Feedback */}
                    <SectionTable
                        title="1.2 Course Feedback (Theory Only)"
                        subtitle={scoringRules.feedback}
                        rows={feedback}
                        setRows={setFeedback}
                        type="feedback"
                        onSave={handleSave}
                    />

                    {/* 1.3 Proctoring Students Average Pass Percentage */}
                    <SectionTable
                        title="1.3 Proctoring Students Average Pass Percentage"
                        subtitle={scoringRules.proctoring}
                        rows={proctoring}
                        setRows={setProctoring}
                        type="proctoring"
                        onSave={handleSave}
                    />

                    {/* 1.4 CO Attainment */}
                    <SectionTable
                        title="1.4 CO Attainment (Theory Only)"
                        subtitle={scoringRules.coAttainment}
                        rows={coAttainment}
                        setRows={setCOAttainment}
                        type="coAttainment"
                        onSave={handleSave}
                    />

                    {/* Teaching Summary */}
                    <div className="td-summary-card">
                        <h3 className="td-summary-title">Teaching Summary</h3>
                        <table className="td-summary-table">
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    <th>Average Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((row) => (
                                    <tr key={row.label}>
                                        <td>{row.label}</td>
                                        <td>{row.avg}</td>
                                    </tr>
                                ))}
                                <tr className="td-summary-total">
                                    <td>TOTAL TEACHING Average Points</td>
                                    <td>{totalAvg}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
