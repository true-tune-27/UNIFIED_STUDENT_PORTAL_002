import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './StudentDashboard.css';
import logoEmblem from './assets/logo.png';
import { useAuth } from './AuthContext';
import {
    saveRegistration, removeRegistration,
    getStudentRegistrations, getEventStatuses
} from './db';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
const NATURES = ['Workshop', 'Seminar', 'Cultural', 'Technical', 'Sports', 'Webinar', 'Hackathon'];
const NATURE_ICONS = {
    Workshop: '🔧', Seminar: '📢', Cultural: '🎭', Technical: '⚙️',
    Sports: '🏅', Webinar: '🌐', Hackathon: '💻', default: '📌'
};
const NATURE_COLORS = {
    Workshop: '#7c3aed', Seminar: '#0369a1', Cultural: '#be185d',
    Technical: '#b45309', Sports: '#15803d', Webinar: '#0891b2',
    Hackathon: '#dc2626', default: '#475569'
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_CRITERIA = { gender: 'all', years: [], branches: [], nationalities: [], regions: [], isPaid: false, fee: 0 };

const EVENTS = [
    { id: 1, name: 'AI Workshop 2026', nature: 'Workshop', date: '2026-02-15', venue: 'Seminar Hall A', club: 'AI Club', coordinator: 'Dr. Smith', description: 'Hands-on workshop on AI fundamentals with Python & TensorFlow.', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA } },
    { id: 2, name: 'Cultural Fest', nature: 'Cultural', date: '2026-02-20', venue: 'Auditorium', club: 'Cultural Club', coordinator: 'Dr. Priya', description: 'Annual cultural festival with dance, music, and art exhibitions.', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, gender: 'female', regions: ['Kerala', 'Andhra Pradesh'] } },
    { id: 3, name: 'Tech Seminar', nature: 'Seminar', date: '2026-03-05', venue: 'KL Rao Bhavan', club: 'Tech Club', coordinator: 'Dr. Ravi', description: 'Technical seminar on emerging tech — AI, Quantum Computing & Blockchain.', facultyName: 'Dr. T. Neelima', registrationOpen: false, criteria: { ...DEFAULT_CRITERIA } },
    { id: 4, name: 'Hackathon 2026', nature: 'Hackathon', date: '2026-03-15', venue: 'Lab Block', club: 'Coding Club', coordinator: 'Dr. Kumar', description: '24-hour coding hackathon. Form teams and build innovative solutions.', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, isPaid: true, fee: 200 } },
    { id: 5, name: 'Sports Day', nature: 'Sports', date: '2026-01-28', venue: 'Sports Complex', club: 'Sports Club', coordinator: 'Dr. Singh', description: 'Annual sports meet with track & field, cricket, football & more.', facultyName: 'Dr. T. Neelima', registrationOpen: false, criteria: { ...DEFAULT_CRITERIA, gender: 'male', years: ['II', 'III', 'IV'] } },
    { id: 6, name: 'Web Dev Bootcamp', nature: 'Workshop', date: '2026-03-08', venue: 'Lab Block', club: 'Web Dev Club', coordinator: 'Dr. Meena', description: 'Full-stack bootcamp covering React, Node.js, and MongoDB.', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, nationalities: ['Indian'], isPaid: true, fee: 150 } },
    { id: 7, name: 'IoT Expo', nature: 'Technical', date: '2026-03-22', venue: 'KL Rao Bhavan', club: 'IoT Club', coordinator: 'Dr. Arjun', description: 'Internet of Things exhibition — smart devices and automation.', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA } },
    { id: 8, name: 'Robotics Challenge', nature: 'Technical', date: '2026-04-05', venue: 'Lab Block', club: 'Robotics Club', coordinator: 'Dr. Lakshmi', description: 'Inter-college robotics competition — design, build, and battle!', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, nationalities: ['Indian', 'Nepali', 'Zimbabwean'], years: ['III', 'IV'], isPaid: true, fee: 500 } },
];

const STUDENT_PROFILE = {
    name: 'Ravi Kumar', rollNo: 'CS22A1042', branch: 'CSE', year: 'III',
    gender: 'male', nationality: 'Indian', region: 'Andhra Pradesh',
    email: 'ravi.kumar@aditya.edu.in', phone: '+91 9876543210',
    section: 'A', semester: 'V', cgpa: '8.7',
};

const ACADEMIC_CERTS = [
    { id: 'ac1', title: 'Bonafide Certificate', desc: 'Confirms your student status at Aditya University.', icon: '📜', color: '#0369a1' },
    { id: 'ac2', title: 'Fee Receipt', desc: 'Official receipt for tuition fee payment.', icon: '🧾', color: '#15803d' },
    { id: 'ac3', title: 'Official Transcript', desc: 'Complete academic record with CGPA and grades.', icon: '📋', color: '#7c3aed' },
    { id: 'ac4', title: 'Character Certificate', desc: 'Certificate of good conduct issued by Head of Dept.', icon: '⭐', color: '#b45309' },
    { id: 'ac5', title: 'Migration Certificate', desc: 'Required for admission to other universities.', icon: '🎓', color: '#be185d' },
];
const TECHNICAL_CERTS = [
    { id: 'tc1', title: 'NPTEL Certification', desc: 'National Programme on Technology Enhanced Learning.', icon: '🏅', color: '#dc2626' },
    { id: 'tc2', title: 'Coursera Certificate', desc: 'Online course completion from Coursera platform.', icon: '🌐', color: '#0891b2' },
    { id: 'tc3', title: 'Python Proficiency', desc: 'Certified Python programming — Level II.', icon: '🐍', color: '#15803d' },
    { id: 'tc4', title: 'Cloud Computing (AWS)', desc: 'AWS Fundamentals cloud certification.', icon: '☁️', color: '#b45309' },
];
const SPORTS_CERTS = [
    { id: 'sc1', title: 'Inter-College Champion', desc: 'Winner at the Annual Inter-College Sports Meet.', icon: '🏆', color: '#b45309' },
    { id: 'sc2', title: 'Best Athlete Award', desc: 'Recognised as Best Athlete for 2025 season.', icon: '🥇', color: '#eab308' },
];
const CULTURAL_CERTS = [
    { id: 'cc1', title: 'Cultural Excellence', desc: 'Excellence in cultural performance at Fest 2025.', icon: '🎭', color: '#be185d' },
    { id: 'cc2', title: 'Music Competition – 1st', desc: '1st Place at the Annual Music Competition.', icon: '🎵', color: '#7c3aed' },
];

/* ══════════════════════════════════════════════════════════════
   ELIGIBILITY CHECKER
   ══════════════════════════════════════════════════════════════ */
function checkEligibility(event, student) {
    const c = event.criteria || DEFAULT_CRITERIA;
    const issues = [];
    if (c.gender !== 'all' && c.gender !== student.gender)
        issues.push(`Gender restriction: ${c.gender} only`);
    if (c.years?.length > 0 && !c.years.includes(student.year))
        issues.push(`Year restriction: ${c.years.join(', ')} only`);
    if (c.branches?.length > 0 && !c.branches.includes(student.branch))
        issues.push(`Branch restriction: ${c.branches.join(', ')} only`);
    if (c.nationalities?.length > 0 && !c.nationalities.includes(student.nationality))
        issues.push(`Nationality restriction: ${c.nationalities.join(', ')} only`);
    if (c.regions?.length > 0 && !c.regions.includes(student.region))
        issues.push(`Region restriction: ${c.regions.join(', ')} only`);
    return { eligible: issues.length === 0, issues };
}

/* ══════════════════════════════════════════════════════════════
   CERTIFICATE DOWNLOAD (canvas)
   ══════════════════════════════════════════════════════════════ */
function downloadCertificate(studentName, title, subtitle, type = 'Participation') {
    const canvas = document.createElement('canvas');
    canvas.width = 1050; canvas.height = 740;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 1050, 740);
    bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1050, 740);

    // Gold border
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 1018, 708);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 994, 684);

    // Corner ornaments
    const corners = [[40, 40], [1010, 40], [40, 700], [1010, 700]];
    corners.forEach(([x, y]) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    });

    // University name
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('ADITYA UNIVERSITY', 525, 80);

    // Certificate heading
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px Georgia';
    ctx.fillText('CERTIFICATE OF ' + type.toUpperCase(), 525, 112);

    // Decorative line
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(150, 130); ctx.lineTo(900, 130); ctx.stroke();

    // "This is to certify"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Georgia';
    ctx.fillText('This is to proudly certify that', 525, 200);

    // Student name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Georgia';
    ctx.fillText(studentName, 525, 270);

    // Underline name
    const nameW = ctx.measureText(studentName).width;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(525 - nameW / 2, 282); ctx.lineTo(525 + nameW / 2, 282); ctx.stroke();

    // Body text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Georgia';
    ctx.fillText('has successfully', 525, 330);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px Georgia';
    ctx.fillText(title, 525, 375);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Georgia';
    ctx.fillText(subtitle, 525, 415);

    // Second decorative line
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(150, 590); ctx.lineTo(900, 590); ctx.stroke();

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Georgia';
    ctx.fillText(`Issued on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 525, 620);

    // Signatures area
    ctx.fillStyle = '#94a3b8'; ctx.font = '13px Georgia'; ctx.textAlign = 'left';
    ctx.fillText('__________________', 100, 670);
    ctx.fillText('Principal', 120, 695);
    ctx.textAlign = 'right';
    ctx.fillText('__________________', 950, 670);
    ctx.fillText('Head of Department', 920, 695);

    // Download
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function StudentDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const student = STUDENT_PROFILE;

    /* ── event status overrides from coordinator (localStorage) ── */
    const [eventStatuses, setEventStatuses] = useState(() => getEventStatuses());

    // poll every 2s + listen cross-tab
    useEffect(() => {
        const refresh = () => setEventStatuses(getEventStatuses());
        window.addEventListener('storage', refresh);
        const timer = setInterval(refresh, 2000);
        return () => { window.removeEventListener('storage', refresh); clearInterval(timer); };
    }, []);

    // merge coordinator overrides into the static event list
    const liveEvents = useMemo(() =>
        EVENTS.map(ev => {
            const override = eventStatuses[ev.id];
            if (!override) return ev;
            return {
                ...ev,
                registrationOpen: override.registrationOpen ?? ev.registrationOpen,
                criteria: override.criteria ?? ev.criteria,
            };
        }),
        [eventStatuses]);

    /* ── registered IDs (driven from db.js) ── */
    const [dbRegs, setDbRegs] = useState(() => getStudentRegistrations(student.rollNo));
    const registeredIds = useMemo(() => dbRegs.map(r => r.eventId), [dbRegs]);

    /* listen for cross-tab localStorage changes (from coord dashboard or other student) */
    useEffect(() => {
        const onStorage = () => setDbRegs(getStudentRegistrations(student.rollNo));
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [student.rollNo]);

    /* ── nav state ── */
    const [eventsDropOpen, setEventsDropOpen] = useState(true);
    const [certsDropOpen, setCertsDropOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('allEvents');
    const [certCategory, setCertCategory] = useState('event');

    const nav = useCallback((section) => {
        setActiveSection(section);
        setSelectedEvent(null);
    }, []);

    /* ── event UI state ── */
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterNature, setFilterNature] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    /* ── modals ── */
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerTarget, setRegisterTarget] = useState(null);
    const [qrDoc, setQrDoc] = useState(null); // after registration
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [toast, setToast] = useState(null);
    const qrCanvasRef = useRef(null);

    /* ── calendar ── */
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    /* ── toast helper ── */
    const showToast = useCallback((msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* ── filtered events ── */
    const filteredEvents = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        return liveEvents.filter(ev => {
            if (searchTerm && !ev.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !ev.club.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterNature !== 'all' && ev.nature !== filterNature) return false;
            if (filterStatus === 'open' && !ev.registrationOpen) return false;
            if (filterStatus === 'closed' && ev.registrationOpen) return false;
            if (filterStatus === 'upcoming' && new Date(ev.date) < now) return false;
            if (filterStatus === 'past' && new Date(ev.date) >= now) return false;
            if (filterStatus === 'registered' && !registeredIds.includes(ev.id)) return false;
            return true;
        });
    }, [liveEvents, searchTerm, filterNature, filterStatus, registeredIds]);

    /* ── upcoming events ── */
    const upcomingEvents = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        return liveEvents
            .filter(e => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(e => {
                const diff = Math.ceil((new Date(e.date) - now) / 86400000);
                const urgency = diff <= 7 ? 'critical' : diff <= 15 ? 'warning' : diff <= 30 ? 'approaching' : 'scheduled';
                return { ...e, daysUntil: diff, urgency };
            });
    }, [liveEvents]);

    /* ── calendar ── */
    const calendarDays = useMemo(() => {
        const dim = new Date(calYear, calMonth + 1, 0).getDate();
        const fd = new Date(calYear, calMonth, 1).getDay();
        const days = [];
        for (let i = 0; i < fd; i++) days.push(null);
        for (let d = 1; d <= dim; d++) {
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, date: dateStr, events: liveEvents.filter(ev => ev.date === dateStr) });
        }
        return days;
    }, [calMonth, calYear, liveEvents]);

    const prevMonth = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
    const nextMonth = () => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

    /* ── stats ── */
    const stats = useMemo(() => ({
        total: liveEvents.length,
        open: liveEvents.filter(e => e.registrationOpen).length,
        registered: registeredIds.length,
        upcoming: upcomingEvents.length,
    }), [liveEvents, registeredIds.length, upcomingEvents.length]);

    /* ── REGISTRATION ── */
    const openRegisterModal = (ev) => { setRegisterTarget(ev); setShowRegisterModal(true); };

    const confirmRegister = () => {
        if (!registerTarget) return;
        const doc = saveRegistration(student, registerTarget);
        setDbRegs(getStudentRegistrations(student.rollNo));
        setShowRegisterModal(false);
        setQrDoc({ ...doc, eventName: registerTarget.name, eventDate: registerTarget.date, venue: registerTarget.venue });
        showToast(`Registered for ${registerTarget.name}!`);
        setRegisterTarget(null);
    };

    const unregister = (eventId) => {
        removeRegistration(student.rollNo, eventId);
        setDbRegs(getStudentRegistrations(student.rollNo));
        showToast('Withdrawn from event.');
    };

    /* ── DOWNLOAD QR ── */
    const downloadQR = () => {
        const canvas = document.querySelector('#sd-qr-canvas canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `Registration_QR_${student.rollNo}_${qrDoc?.eventName?.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    /* ═════════════════════════════════════════════════════
       EVENT DETAIL PANEL
       ═════════════════════════════════════════════════════ */
    const renderEventDetail = (ev) => {
        const { eligible, issues } = checkEligibility(ev, student);
        const isReg = registeredIds.includes(ev.id);
        const c = ev.criteria || DEFAULT_CRITERIA;
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const isPast = new Date(ev.date) < now;
        const icon = NATURE_ICONS[ev.nature] || NATURE_ICONS.default;
        const color = NATURE_COLORS[ev.nature] || NATURE_COLORS.default;

        return (
            <div className="sd-detail-panel">
                <button className="sd-back-btn" onClick={() => setSelectedEvent(null)}>← Back</button>
                <div className="sd-detail-hero" style={{ '--event-color': color }}>
                    <div className="sd-detail-hero-icon">{icon}</div>
                    <div className="sd-detail-hero-info">
                        <div className="sd-detail-nature-badge" style={{ background: color }}>{ev.nature}</div>
                        <h2 className="sd-detail-title">{ev.name}</h2>
                        <p className="sd-detail-coordinator">Coordinated by <strong>{ev.coordinator}</strong> · {ev.club}</p>
                    </div>
                    <div className="sd-detail-status-badge" data-open={ev.registrationOpen}>
                        {ev.registrationOpen ? '🟢 Registration Open' : '🔴 Registration Closed'}
                    </div>
                </div>

                <div className="sd-detail-body">
                    <div className="sd-detail-meta-grid">
                        {[
                            { icon: '📅', label: 'Date', val: new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                            { icon: '📍', label: 'Venue', val: ev.venue },
                            { icon: '🏢', label: 'Club', val: ev.club },
                            { icon: '👤', label: 'Faculty', val: ev.facultyName },
                            ...(c.isPaid ? [{ icon: '💰', label: 'Entry Fee', val: `₹${c.fee}`, cls: 'sd-meta-fee' }] : [])
                        ].map(m => (
                            <div className="sd-meta-item" key={m.label}>
                                <span className="sd-meta-icon">{m.icon}</span>
                                <div><span className="sd-meta-label">{m.label}</span><span className={`sd-meta-val ${m.cls || ''}`}>{m.val}</span></div>
                            </div>
                        ))}
                    </div>

                    <div className="sd-detail-desc"><h4>About this Event</h4><p>{ev.description}</p></div>

                    <div className="sd-criteria-panel">
                        <h4 className="sd-criteria-title">📋 Registration Criteria</h4>
                        <div className="sd-criteria-tags">
                            {c.gender !== 'all' && <span className="sd-criteria-tag gender">{c.gender === 'male' ? '♂ Males only' : '♀ Females only'}</span>}
                            {c.years?.length > 0 && <span className="sd-criteria-tag year">🎓 Year: {c.years.join(', ')}</span>}
                            {c.branches?.length > 0 && <span className="sd-criteria-tag branch">🏫 Branch: {c.branches.join(', ')}</span>}
                            {c.nationalities?.length > 0 && <span className="sd-criteria-tag nat">🌍 Nationality: {c.nationalities.join(', ')}</span>}
                            {c.regions?.length > 0 && <span className="sd-criteria-tag region">📍 Region: {c.regions.join(', ')}</span>}
                            {c.isPaid && <span className="sd-criteria-tag paid">💰 Paid: ₹{c.fee}</span>}
                            {c.gender === 'all' && !c.years?.length && !c.branches?.length && !c.nationalities?.length && !c.regions?.length && !c.isPaid &&
                                <span className="sd-criteria-tag open">✅ Open to All</span>}
                        </div>
                    </div>

                    <div className={`sd-eligibility-box ${eligible ? 'eligible' : 'ineligible'}`}>
                        <div className="sd-elig-icon">{eligible ? '✅' : '❌'}</div>
                        <div>
                            <div className="sd-elig-title">{eligible ? 'You are Eligible!' : 'Not Eligible'}</div>
                            {!eligible && <ul className="sd-elig-issues">{issues.map((iss, i) => <li key={i}>{iss}</li>)}</ul>}
                        </div>
                    </div>

                    <div className="sd-detail-actions">
                        {isReg ? (
                            <div className="sd-registered-block">
                                <div className="sd-registered-badge">✅ You are Registered!</div>
                                {!isPast && <button className="sd-btn-unregister" onClick={() => unregister(ev.id)}>Withdraw Registration</button>}
                                <button className="sd-btn-qr-view" onClick={() => {
                                    const doc = getStudentRegistrations(student.rollNo).find(r => r.eventId === ev.id);
                                    if (doc) setQrDoc({ ...doc, eventName: ev.name, eventDate: ev.date, venue: ev.venue });
                                }}>📲 View QR</button>
                            </div>
                        ) : (
                            <button className="sd-btn-register" disabled={!ev.registrationOpen || !eligible || isPast} onClick={() => openRegisterModal(ev)}>
                                {isPast ? '⏰ Event Ended' : !ev.registrationOpen ? '🔒 Registration Closed' : !eligible ? '🚫 Not Eligible' : '🎯 Register Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* ═════════════════════════════════════════════════════
       CERTIFICATES SECTION
       ═════════════════════════════════════════════════════ */
    const CERT_TABS = [
        { key: 'event', label: '🏆 Event', icon: '🎖️' },
        { key: 'academic', label: '📜 Academic', icon: '📜' },
        { key: 'technical', label: '🔬 Technical', icon: '⚙️' },
        { key: 'sports', label: '🏅 Sports', icon: '🏅' },
        { key: 'cultural', label: '🎭 Cultural', icon: '🎭' },
    ];

    const registeredEvents = EVENTS.filter(e => registeredIds.includes(e.id));

    const renderCertCard = (cert, onDownload) => (
        <div className="sd-cert-card" key={cert.id}>
            <div className="sd-cert-icon" style={{ color: cert.color }}>{cert.icon}</div>
            <div className="sd-cert-info">
                <div className="sd-cert-title">{cert.title}</div>
                <div className="sd-cert-desc">{cert.desc}</div>
            </div>
            <div className="sd-cert-actions">
                <button className="sd-cert-btn preview" onClick={() => onDownload('Preview')}>👁 Preview</button>
                <button className="sd-cert-btn download" onClick={onDownload}>⬇ Download</button>
            </div>
        </div>
    );

    const renderCertificates = () => (
        <div className="sd-certs-section">
            <div className="sd-certs-tabs">
                {CERT_TABS.map(t => (
                    <button key={t.key} className={`sd-cert-tab ${certCategory === t.key ? 'active' : ''}`} onClick={() => setCertCategory(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="sd-certs-body">
                {certCategory === 'event' && (
                    liveEvents.filter(e => registeredIds.includes(e.id)).length === 0 ? (
                        <div className="sd-empty"><span>🎖️</span><p>Register for events to earn event certificates.</p><button className="sd-btn-go-events" onClick={() => { setActiveSection('allEvents'); setEventsDropOpen(true); }}>Browse Events</button></div>
                    ) : (
                        <div className="sd-certs-list">
                            {liveEvents.filter(e => registeredIds.includes(e.id)).map(ev => (
                                <div className="sd-cert-card event-cert" key={ev.id}>
                                    <div className="sd-cert-color-bar" style={{ background: NATURE_COLORS[ev.nature] }} />
                                    <div className="sd-cert-icon">{NATURE_ICONS[ev.nature]}</div>
                                    <div className="sd-cert-info">
                                        <div className="sd-cert-title">{ev.name}</div>
                                        <div className="sd-cert-desc">{ev.nature} · {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {ev.venue}</div>
                                        <span className="sd-cert-type-badge">Participation Certificate</span>
                                    </div>
                                    <div className="sd-cert-actions">
                                        <button className="sd-cert-btn download" onClick={() =>
                                            downloadCertificate(student.name, `participated in ${ev.name}`, `${ev.nature} | ${ev.venue} | ${new Date(ev.date).toLocaleDateString('en-IN')}`, 'Participation')
                                        }>⬇ Download</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
                {certCategory === 'academic' && (
                    <div className="sd-certs-list">
                        {ACADEMIC_CERTS.map(c => renderCertCard(c, () => downloadCertificate(student.name, c.title, `Aditya University · ${student.branch} · ${new Date().getFullYear()}`, 'Achievement')))}
                    </div>
                )}
                {certCategory === 'technical' && (
                    <div className="sd-certs-list">
                        {TECHNICAL_CERTS.map(c => renderCertCard(c, () => downloadCertificate(student.name, c.title, `Technical Proficiency · ${new Date().getFullYear()}`, 'Achievement')))}
                    </div>
                )}
                {certCategory === 'sports' && (
                    <div className="sd-certs-list">
                        {SPORTS_CERTS.map(c => renderCertCard(c, () => downloadCertificate(student.name, c.title, `Sports & Athletics · Aditya University`, 'Achievement')))}
                    </div>
                )}
                {certCategory === 'cultural' && (
                    <div className="sd-certs-list">
                        {CULTURAL_CERTS.map(c => renderCertCard(c, () => downloadCertificate(student.name, c.title, `Cultural Activities · Aditya University`, 'Achievement')))}
                    </div>
                )}
            </div>
        </div>
    );

    /* ═════════════════════════════════════════════════════
       UPCOMING SECTION
       ═════════════════════════════════════════════════════ */
    const renderUpcoming = () => (
        <div className="sd-upcoming-section">
            {upcomingEvents.length === 0
                ? <div className="sd-empty"><span>📭</span><p>No upcoming events.</p></div>
                : <div className="sd-upcoming-list">
                    {upcomingEvents.map(ev => (
                        <div key={ev.id} className={`sd-upcoming-row urgency-${ev.urgency}`}>
                            <div className="sd-upcoming-urgency-bar" />
                            <div className="sd-upcoming-date-block">
                                <div className="sd-upc-day">{new Date(ev.date).getDate()}</div>
                                <div className="sd-upc-month">{MONTHS[new Date(ev.date).getMonth()].slice(0, 3)}</div>
                                <div className={`sd-upc-days-left urgency-${ev.urgency}`}>{ev.daysUntil}d</div>
                            </div>
                            <div className="sd-upcoming-info">
                                <div className="sd-upc-name">{ev.name}</div>
                                <div className="sd-upc-meta">
                                    <span>{NATURE_ICONS[ev.nature]} {ev.nature}</span>
                                    <span>📍 {ev.venue}</span>
                                    <span>👤 {ev.coordinator}</span>
                                    {ev.criteria?.isPaid && <span>💰 ₹{ev.criteria.fee}</span>}
                                </div>
                                <div className="sd-upc-desc">{ev.description.slice(0, 80)}…</div>
                            </div>
                            <div className="sd-upcoming-actions">
                                <span className={`sd-reg-badge ${ev.registrationOpen ? 'open' : 'closed'}`}>{ev.registrationOpen ? 'Open' : 'Closed'}</span>
                                <button className="sd-btn-view" onClick={() => setSelectedEvent(ev)}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>}
        </div>
    );

    /* ═════════════════════════════════════════════════════
       CALENDAR SECTION
       ═════════════════════════════════════════════════════ */
    const renderCalendar = () => (
        <div className="sd-calendar-section">
            <div className="sd-cal-header">
                <button className="sd-cal-nav-btn" onClick={prevMonth}>‹</button>
                <h3>{MONTHS[calMonth]} {calYear}</h3>
                <button className="sd-cal-nav-btn" onClick={nextMonth}>›</button>
            </div>
            <div className="sd-cal-grid">
                {DAY_LABELS.map(d => <div key={d} className="sd-cal-day-label">{d}</div>)}
                {calendarDays.map((cell, i) => (
                    <div key={i} className={`sd-cal-cell ${!cell ? 'empty' : ''} ${cell?.events?.length ? 'has-events' : ''}`}>
                        {cell && <>
                            <span className="sd-cal-day-num">{cell.day}</span>
                            {cell.events.map(ev => (
                                <button key={ev.id} className="sd-cal-event-pill"
                                    style={{ '--pill-color': NATURE_COLORS[ev.nature] || '#475569' }}
                                    onClick={() => setSelectedEvent(ev)} title={ev.name}>
                                    {ev.name.length > 12 ? ev.name.slice(0, 12) + '…' : ev.name}
                                </button>
                            ))}
                        </>}
                    </div>
                ))}
            </div>
            <div className="sd-cal-legend">
                {Object.entries(NATURE_COLORS).filter(([k]) => k !== 'default').map(([nat, col]) => (
                    <span key={nat} className="sd-legend-item">
                        <span className="sd-legend-dot" style={{ background: col }} />{nat}
                    </span>
                ))}
            </div>
        </div>
    );

    /* ═════════════════════════════════════════════════════
       MY REGISTRATIONS SECTION
       ═════════════════════════════════════════════════════ */
    const renderMyRegistrations = () => (
        <div className="sd-myreg-section">
            {registeredIds.length === 0
                ? <div className="sd-empty"><span>🎟️</span><p>No registrations yet.</p><button className="sd-btn-go-events" onClick={() => { nav('allEvents'); setEventsDropOpen(true); }}>Browse Events</button></div>
                : <div className="sd-myreg-list">
                    {liveEvents.filter(e => registeredIds.includes(e.id)).map(ev => {
                        const now = new Date(); now.setHours(0, 0, 0, 0);
                        const isPast = new Date(ev.date) < now;
                        const regDoc = dbRegs.find(r => r.eventId === ev.id);
                        return (
                            <div key={ev.id} className="sd-myreg-card">
                                <div className="sd-myreg-color-bar" style={{ background: NATURE_COLORS[ev.nature] || '#475569' }} />
                                <div className="sd-myreg-icon">{NATURE_ICONS[ev.nature] || '📌'}</div>
                                <div className="sd-myreg-info">
                                    <div className="sd-myreg-name">{ev.name}</div>
                                    <div className="sd-myreg-meta">
                                        <span>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span>📍 {ev.venue}</span>
                                        <span className="sd-nature-chip" style={{ background: NATURE_COLORS[ev.nature] + '22', color: NATURE_COLORS[ev.nature] }}>{ev.nature}</span>
                                        {ev.criteria?.isPaid && <span className="sd-paid-chip">💰 ₹{ev.criteria.fee}</span>}
                                        {regDoc && <span className="sd-reg-time">🕐 {new Date(regDoc.registeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                                    </div>
                                </div>
                                <div className="sd-myreg-actions">
                                    {isPast && <span className="sd-past-badge">Completed</span>}
                                    <button className="sd-btn-view" onClick={() => setSelectedEvent(ev)}>Details</button>
                                    <button className="sd-btn-view" style={{ color: '#818cf8' }} onClick={() => {
                                        if (regDoc) setQrDoc({ ...regDoc, eventName: ev.name, eventDate: ev.date, venue: ev.venue });
                                    }}>📲 QR</button>
                                    {!isPast && <button className="sd-btn-unregister sm" onClick={() => unregister(ev.id)}>Withdraw</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>}
        </div>
    );

    /* ═════════════════════════════════════════
       FULL RENDER
       ═════════════════════════════════════════ */
    return (
        <div className="sd-root">

            {/* ═══ SIDEBAR ═══ */}
            <aside className="sd-sidebar">
                <div className="sd-sidebar-brand">
                    <img src={logoEmblem} alt="Logo" className="sd-brand-logo" />
                    <div>
                        <div className="sd-brand-name">Student Portal</div>
                        <div className="sd-brand-sub">Aditya University</div>
                    </div>
                </div>

                <div className="sd-student-card">
                    <div className="sd-student-avatar">{student.name.charAt(0)}</div>
                    <div className="sd-student-info">
                        <div className="sd-student-name">{student.name}</div>
                        <div className="sd-student-roll">{student.rollNo}</div>
                        <div className="sd-student-meta">{student.branch} · Year {student.year}</div>
                    </div>
                    <button className="sd-profile-btn" onClick={() => setShowProfileModal(true)} title="View Profile">👤</button>
                </div>

                <nav className="sd-nav">

                    {/* ── Events dropdown ── */}
                    <button className="sd-nav-group-btn" onClick={() => setEventsDropOpen(v => !v)}>
                        <span className="sd-nav-icon">🗓️</span>
                        <span className="sd-nav-label">Events</span>
                        {stats.upcoming > 0 && <span className="sd-nav-badge">{stats.upcoming}</span>}
                        <span className={`sd-nav-arrow ${eventsDropOpen ? 'open' : ''}`}>▶</span>
                    </button>

                    {eventsDropOpen && (
                        <div className="sd-nav-dropdown">
                            {[
                                { key: 'allEvents', icon: '📋', label: 'All Events' },
                                { key: 'upcoming', icon: '🔔', label: 'Upcoming', badge: stats.upcoming },
                                { key: 'calendar', icon: '📅', label: 'Calendar' },
                                { key: 'myregistrations', icon: '✅', label: 'My Registrations', badge: stats.registered },
                            ].map(item => (
                                <button key={item.key}
                                    className={`sd-nav-sub ${activeSection === item.key ? 'active' : ''}`}
                                    onClick={() => nav(item.key)}>
                                    <span>{item.icon}</span>
                                    <span className="sd-nav-sub-label">{item.label}</span>
                                    {item.badge > 0 && <span className="sd-nav-badge sm">{item.badge}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Certificates dropdown ── */}
                    <button className="sd-nav-group-btn" onClick={() => setCertsDropOpen(v => !v)}>
                        <span className="sd-nav-icon">🎓</span>
                        <span className="sd-nav-label">Certificates</span>
                        <span className={`sd-nav-arrow ${certsDropOpen ? 'open' : ''}`}>▶</span>
                    </button>

                    {certsDropOpen && (
                        <div className="sd-nav-dropdown">
                            {[
                                { key: 'event', icon: '🏆', label: 'Event Certificates' },
                                { key: 'academic', icon: '📜', label: 'Academic Certificates' },
                                { key: 'technical', icon: '⚙️', label: 'Technical Certificates' },
                                { key: 'sports', icon: '🏅', label: 'Sports Certificates' },
                                { key: 'cultural', icon: '🎭', label: 'Cultural Certificates' },
                            ].map(item => (
                                <button key={item.key}
                                    className={`sd-nav-sub ${activeSection === 'certificates' && certCategory === item.key ? 'active' : ''}`}
                                    onClick={() => { setCertCategory(item.key); nav('certificates'); }}>
                                    <span>{item.icon}</span>
                                    <span className="sd-nav-sub-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </nav>

                <div className="sd-sidebar-footer">
                    <button className="sd-btn-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="sd-main">
                {/* Header */}
                <header className="sd-header">
                    <div className="sd-header-title">
                        {activeSection === 'allEvents' && '🗓️ All Events'}
                        {activeSection === 'upcoming' && '🔔 Upcoming Events'}
                        {activeSection === 'calendar' && '📅 Event Calendar'}
                        {activeSection === 'myregistrations' && '✅ My Registrations'}
                        {activeSection === 'certificates' && '🎓 Certificates'}
                    </div>
                    <div className="sd-header-stats">
                        <div className="sd-stat"><span className="sd-stat-num">{stats.total}</span><span className="sd-stat-label">Total</span></div>
                        <div className="sd-stat"><span className="sd-stat-num sd-stat-green">{stats.open}</span><span className="sd-stat-label">Open</span></div>
                        <div className="sd-stat"><span className="sd-stat-num sd-stat-blue">{stats.registered}</span><span className="sd-stat-label">Registered</span></div>
                        <div className="sd-stat"><span className="sd-stat-num sd-stat-orange">{stats.upcoming}</span><span className="sd-stat-label">Upcoming</span></div>
                    </div>
                </header>

                {/* Toast */}
                {toast && <div className="sd-toast">🎉 {toast}</div>}

                {/* All Events */}
                {activeSection === 'allEvents' && (
                    selectedEvent ? renderEventDetail(selectedEvent) : (
                        <div className="sd-events-section">
                            <div className="sd-filters-bar">
                                <div className="sd-search-wrap">
                                    <span className="sd-search-icon">🔍</span>
                                    <input className="sd-search" placeholder="Search events or clubs…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <select className="sd-filter-select" value={filterNature} onChange={e => setFilterNature(e.target.value)}>
                                    <option value="all">All Types</option>
                                    {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <select className="sd-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="open">Open Registration</option>
                                    <option value="closed">Closed</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="past">Past</option>
                                    <option value="registered">Registered</option>
                                </select>
                                {(searchTerm || filterNature !== 'all' || filterStatus !== 'all') && (
                                    <button className="sd-clear-btn" onClick={() => { setSearchTerm(''); setFilterNature('all'); setFilterStatus('all'); }}>✕ Clear</button>
                                )}
                            </div>
                            {filteredEvents.length === 0
                                ? <div className="sd-empty"><span>🎪</span><p>No events found.</p></div>
                                : <div className="sd-events-grid">
                                    {filteredEvents.map(ev =>
                                        <EventCard key={ev.id} ev={ev} student={student} registeredIds={registeredIds}
                                            onView={() => setSelectedEvent(ev)}
                                            onRegister={() => openRegisterModal(ev)}
                                            onUnregister={() => unregister(ev.id)} />
                                    )}
                                </div>}
                        </div>
                    )
                )}

                {activeSection === 'upcoming' && (selectedEvent ? renderEventDetail(selectedEvent) : renderUpcoming())}
                {activeSection === 'calendar' && (selectedEvent ? renderEventDetail(selectedEvent) : renderCalendar())}
                {activeSection === 'myregistrations' && (selectedEvent ? renderEventDetail(selectedEvent) : renderMyRegistrations())}
                {activeSection === 'certificates' && renderCertificates()}
            </main>

            {/* ═══ REGISTER CONFIRM MODAL ═══ */}
            {showRegisterModal && registerTarget && (() => {
                const { eligible, issues } = checkEligibility(registerTarget, student);
                const c = registerTarget.criteria || DEFAULT_CRITERIA;
                return (
                    <div className="sd-modal-overlay" onClick={() => setShowRegisterModal(false)}>
                        <div className="sd-modal" onClick={e => e.stopPropagation()}>
                            <button className="sd-modal-close" onClick={() => setShowRegisterModal(false)}>×</button>
                            <div className="sd-modal-icon">{NATURE_ICONS[registerTarget.nature] || '📌'}</div>
                            <h3 className="sd-modal-title">Confirm Registration</h3>
                            <p className="sd-modal-sub"><strong>{registerTarget.name}</strong></p>
                            <div className="sd-modal-details">
                                <div className="sd-modal-row"><span>📅 Date</span><span>{new Date(registerTarget.date).toLocaleDateString('en-IN')}</span></div>
                                <div className="sd-modal-row"><span>📍 Venue</span><span>{registerTarget.venue}</span></div>
                                <div className="sd-modal-row"><span>👤 Coordinator</span><span>{registerTarget.coordinator}</span></div>
                                {c.isPaid && <div className="sd-modal-row fee"><span>💰 Entry Fee</span><span>₹{c.fee}</span></div>}
                            </div>
                            {!eligible && (
                                <div className="sd-modal-ineligible">❌ You do not meet the eligibility criteria:
                                    <ul>{issues.map((iss, i) => <li key={i}>{iss}</li>)}</ul>
                                </div>
                            )}
                            <div className="sd-modal-actions">
                                <button className="sd-modal-cancel" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                                <button className="sd-modal-confirm" disabled={!eligible} onClick={confirmRegister}>
                                    {c.isPaid ? `Pay ₹${c.fee} & Register` : 'Confirm Registration'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ═══ QR CODE MODAL ═══ */}
            {qrDoc && (
                <div className="sd-modal-overlay" onClick={() => setQrDoc(null)}>
                    <div className="sd-qr-modal" onClick={e => e.stopPropagation()}>
                        <button className="sd-modal-close" onClick={() => setQrDoc(null)}>×</button>
                        <h3 className="sd-modal-title">📲 Registration QR Code</h3>
                        <p className="sd-modal-sub">{qrDoc.eventName}</p>

                        <div id="sd-qr-canvas" className="sd-qr-wrapper">
                            <QRCodeCanvas
                                value={JSON.stringify({
                                    token: qrDoc.qrToken,
                                    student: qrDoc.studentName,
                                    rollNo: qrDoc.rollNo,
                                    event: qrDoc.eventName,
                                    date: qrDoc.eventDate,
                                    venue: qrDoc.venue,
                                    registeredAt: qrDoc.registeredAt,
                                })}
                                size={200}
                                bgColor="#1a1d27"
                                fgColor="#818cf8"
                                level="H"
                            />
                        </div>

                        <div className="sd-qr-details">
                            <div className="sd-qr-row"><span>👤 Student</span><strong>{qrDoc.studentName}</strong></div>
                            <div className="sd-qr-row"><span>🎫 Roll No</span><strong>{qrDoc.rollNo}</strong></div>
                            <div className="sd-qr-row"><span>📅 Event Date</span><strong>{new Date(qrDoc.eventDate).toLocaleDateString('en-IN')}</strong></div>
                            <div className="sd-qr-row"><span>📍 Venue</span><strong>{qrDoc.venue}</strong></div>
                            <div className="sd-qr-row"><span>🕐 Registered</span><strong>{new Date(qrDoc.registeredAt).toLocaleString('en-IN')}</strong></div>
                            <div className="sd-qr-token">Token: {qrDoc.qrToken?.slice(0, 20)}…</div>
                        </div>

                        <button className="sd-qr-download-btn" onClick={downloadQR}>⬇ Download QR PNG</button>
                    </div>
                </div>
            )}

            {/* ═══ PROFILE MODAL ═══ */}
            {showProfileModal && (
                <div className="sd-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="sd-modal sd-profile-modal" onClick={e => e.stopPropagation()}>
                        <button className="sd-modal-close" onClick={() => setShowProfileModal(false)}>×</button>
                        <div className="sd-profile-avatar-lg">{student.name.charAt(0)}</div>
                        <h3 className="sd-modal-title">{student.name}</h3>
                        <div className="sd-profile-grid">
                            {[['Roll No', student.rollNo], ['Branch', student.branch], ['Year', student.year], ['Section', student.section], ['Semester', student.semester], ['CGPA', student.cgpa], ['Gender', student.gender], ['Nationality', student.nationality], ['Region', student.region]].map(([l, v]) => (
                                <div className="sd-profile-field" key={l}><label>{l}</label><span style={{ textTransform: 'capitalize' }}>{v}</span></div>
                            ))}
                            <div className="sd-profile-field full"><label>Email</label><span>{student.email}</span></div>
                            <div className="sd-profile-field full"><label>Phone</label><span>{student.phone}</span></div>
                        </div>
                        <p className="sd-profile-note">Your profile determines event eligibility. Contact admin to update.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   EVENT CARD COMPONENT
   ══════════════════════════════════════════════════════════════ */
function EventCard({ ev, student, registeredIds, onView, onRegister, onUnregister }) {
    const { eligible } = checkEligibility(ev, student);
    const isReg = registeredIds.includes(ev.id);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const isPast = new Date(ev.date) < now;
    const daysLeft = Math.ceil((new Date(ev.date) - now) / 86400000);
    const color = NATURE_COLORS[ev.nature] || NATURE_COLORS.default;
    const icon = NATURE_ICONS[ev.nature] || NATURE_ICONS.default;
    const c = ev.criteria || DEFAULT_CRITERIA;

    return (
        <div className={`sd-event-card ${isReg ? 'registered' : ''} ${!ev.registrationOpen ? 'closed' : ''}`}>
            <div className="sd-card-top-bar" style={{ background: color }} />
            <div className="sd-card-header">
                <div className="sd-card-icon" style={{ background: color + '22', color }}>{icon}</div>
                <div className="sd-card-badges">
                    <span className="sd-nature-chip" style={{ background: color + '22', color }}>{ev.nature}</span>
                    {isReg && <span className="sd-reg-chip">✅ Registered</span>}
                    {!isPast && !isReg && ev.registrationOpen && eligible && <span className="sd-eligible-chip">Eligible</span>}
                </div>
            </div>
            <h3 className="sd-card-title" onClick={onView}>{ev.name}</h3>
            <p className="sd-card-desc">{ev.description.length > 80 ? ev.description.slice(0, 80) + '...' : ev.description}</p>
            <div className="sd-card-meta">
                <span>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span>📍 {ev.venue}</span>
                {c.isPaid && <span className="sd-card-fee">💰 ₹{c.fee}</span>}
                {!isPast && <span className={`sd-card-days ${daysLeft <= 7 ? 'urgent' : daysLeft <= 15 ? 'soon' : ''}`}>{daysLeft}d left</span>}
                {isPast && <span className="sd-card-days past">Ended</span>}
            </div>
            <div className="sd-card-footer">
                <span className={`sd-card-reg-status ${ev.registrationOpen ? 'open' : 'closed'}`}>{ev.registrationOpen ? '● Open' : '● Closed'}</span>
                <div className="sd-card-actions">
                    <button className="sd-btn-view" onClick={onView}>View</button>
                    {isReg
                        ? <button className="sd-btn-unregister sm" onClick={onUnregister}>Withdraw</button>
                        : <button className="sd-btn-register sm" disabled={!ev.registrationOpen || !eligible || isPast} onClick={onRegister}>
                            {isPast ? 'Ended' : !ev.registrationOpen ? 'Closed' : !eligible ? 'Ineligible' : 'Register'}
                        </button>}
                </div>
            </div>
        </div>
    );
}
