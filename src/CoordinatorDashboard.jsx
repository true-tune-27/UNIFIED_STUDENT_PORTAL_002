import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoordinatorDashboard.css';
import logoEmblem from './assets/logo.png';
import { useAuth } from './AuthContext';

/* ══════════════════════════════════════════════════════════════
   MOCK DATA – Events & Registered Students
   ══════════════════════════════════════════════════════════════ */
const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML'];
const YEARS = ['I', 'II', 'III', 'IV'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const NATURES = ['Workshop', 'Seminar', 'Cultural', 'Technical', 'Sports', 'Webinar', 'Hackathon'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateStudents(count, eventDate) {
    const firstNames = ['Arun', 'Bhavya', 'Charan', 'Divya', 'Esha', 'Farhan', 'Gita', 'Hari', 'Isha', 'Jaya',
        'Kiran', 'Lakshmi', 'Mani', 'Neha', 'Omkar', 'Priya', 'Ravi', 'Sita', 'Teja', 'Uma',
        'Varun', 'Wasim', 'Yamini', 'Zara', 'Anita', 'Bala', 'Chitra', 'Deepak', 'Ekta', 'Faisal'];
    const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Naidu', 'Patel', 'Singh', 'Rao', 'Gupta', 'Das', 'Joshi',
        'Mishra', 'Verma', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Choudhury', 'Bhat', 'Shetty', 'Hegde'];
    const students = [];
    for (let i = 0; i < count; i++) {
        const fn = randomFrom(firstNames);
        const ln = randomFrom(lastNames);
        const branch = randomFrom(BRANCHES);
        const year = randomFrom(YEARS);
        const section = randomFrom(SECTIONS);
        students.push({
            id: i + 1,
            name: `${fn} ${ln}`,
            rollNo: `${branch.substring(0, 2).toUpperCase()}${String(2020 + Math.floor(Math.random() * 6)).slice(2)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
            branch,
            year,
            section,
            phone: `+91 ${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}@aditya.edu.in`,
            registeredDate: eventDate,
        });
    }
    return students;
}

const INITIAL_EVENTS = [
    { id: 1, name: 'AI Workshop 2026', nature: 'Workshop', date: '2026-02-15', facultyName: 'Dr. T. Neelima', registrationOpen: true, students: generateStudents(25, '2026-02-15') },
    { id: 2, name: 'Cultural Fest', nature: 'Cultural', date: '2026-02-20', facultyName: 'Dr. T. Neelima', registrationOpen: true, students: generateStudents(40, '2026-02-20') },
    { id: 3, name: 'Tech Seminar', nature: 'Seminar', date: '2026-03-05', facultyName: 'Dr. T. Neelima', registrationOpen: false, students: generateStudents(18, '2026-03-05') },
    { id: 4, name: 'Hackathon 2026', nature: 'Hackathon', date: '2026-03-15', facultyName: 'Dr. T. Neelima', registrationOpen: true, students: generateStudents(50, '2026-03-15') },
    { id: 5, name: 'Sports Day', nature: 'Sports', date: '2026-01-28', facultyName: 'Dr. T. Neelima', registrationOpen: false, students: generateStudents(35, '2026-01-28') },
];

const INITIAL_MEMBERS = [
    { id: 1, name: 'Ravi Kumar', year: 'III', dept: 'CSE' },
    { id: 2, name: 'Priya Sharma', year: 'II', dept: 'ECE' },
    { id: 3, name: 'Teja Reddy', year: 'IV', dept: 'IT' },
];

/* column definitions */
const ALL_COLUMNS = [
    { key: 'sno', label: 'S.No', sortable: false },
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'rollNo', label: 'Roll No', sortable: true },
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'registeredDate', label: 'Reg. Date', sortable: true },
];

const ROWS_PER_PAGE = 15;

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function CoordinatorDashboard({ embedded = false }) {
    const navigate = useNavigate();

    /* ── sidebar state ── */
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newEventName, setNewEventName] = useState('');
    const [newEventNature, setNewEventNature] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newFacultyName, setNewFacultyName] = useState('Dr. T. Neelima');
    const [openYears, setOpenYears] = useState({ '2026': true });
    const [openMonths, setOpenMonths] = useState({});

    /* ── edit event state ── */
    const [editingEventId, setEditingEventId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editNature, setEditNature] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editFacultyName, setEditFacultyName] = useState('');

    /* ── delete confirm state ── */
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    /* ── profile state ── */
    const [profile] = useState({ name: 'Dr. T. Neelima', phone: '+91 9963850771', email: 'neelimat@adityauniversity.in' });

    /* ── members state ── */
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [newMemberText, setNewMemberText] = useState('');

    /* ── table state ── */
    const [sortStack, setSortStack] = useState([]); // multi-level sort: [{key, dir}]
    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [showColumns, setShowColumns] = useState(false);
    const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c => c.key));
    const [currentPage, setCurrentPage] = useState(1);

    /* ── active tab ── */
    const [activeTab, setActiveTab] = useState('events'); // 'events' | 'calendar'

    /* ── derived ── */
    const selectedEvent = events.find(e => e.id === selectedEventId) || null;

    /* ── events grouped by year/month ── */
    const eventTree = useMemo(() => {
        const filtered = events.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const tree = {};
        filtered.forEach(ev => {
            const d = new Date(ev.date);
            const yr = d.getFullYear();
            const mo = d.getMonth();
            if (!tree[yr]) tree[yr] = {};
            if (!tree[yr][mo]) tree[yr][mo] = [];
            tree[yr][mo].push(ev);
        });
        return tree;
    }, [events, searchTerm]);

    /* ── sorting logic (multi-level) ── */
    const handleSort = useCallback((key) => {
        setSortStack(prev => {
            const idx = prev.findIndex(s => s.key === key);
            if (idx === -1) return [...prev, { key, dir: 'asc' }];
            if (prev[idx].dir === 'asc') return prev.map((s, i) => i === idx ? { ...s, dir: 'desc' } : s);
            return prev.filter((_, i) => i !== idx); // remove on third click
        });
        setCurrentPage(1);
    }, []);

    /* ── quick sort chips ── */
    const handleQuickSort = useCallback((key) => {
        setSortStack(prev => {
            const only = prev.length === 1 && prev[0].key === key;
            if (!only) return [{ key, dir: 'asc' }];
            if (prev[0].dir === 'asc') return [{ key, dir: 'desc' }];
            return [];
        });
        setCurrentPage(1);
    }, []);

    /* ── processed data ── */
    const processedData = useMemo(() => {
        if (!selectedEvent) return [];
        let data = [...selectedEvent.students];

        // apply filters
        Object.entries(filters).forEach(([key, val]) => {
            if (!val) return;
            data = data.filter(row => {
                const cell = String(row[key] || '').toLowerCase();
                return cell.includes(val.toLowerCase());
            });
        });

        // apply multi-level sort
        if (sortStack.length > 0) {
            data.sort((a, b) => {
                for (const { key, dir } of sortStack) {
                    const av = String(a[key] || '').toLowerCase();
                    const bv = String(b[key] || '').toLowerCase();
                    if (av < bv) return dir === 'asc' ? -1 : 1;
                    if (av > bv) return dir === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [selectedEvent, filters, sortStack]);

    /* pagination */
    const totalPages = Math.max(1, Math.ceil(processedData.length / ROWS_PER_PAGE));
    const pageData = processedData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    /* ── handlers ── */
    const handleCreateEvent = () => {
        if (!newEventName.trim() || !newEventDate) return;
        const newEv = {
            id: Date.now(),
            name: newEventName.trim(),
            nature: newEventNature || 'Workshop',
            date: newEventDate,
            facultyName: newFacultyName || 'Dr. T. Neelima',
            registrationOpen: true,
            students: [],
        };
        setEvents(prev => [...prev, newEv]);
        setNewEventName('');
        setNewEventNature('');
        setNewEventDate('');
        setSelectedEventId(newEv.id);
    };

    /* ── edit event handlers ── */
    const startEditEvent = (ev) => {
        setEditingEventId(ev.id);
        setEditName(ev.name);
        setEditNature(ev.nature);
        setEditDate(ev.date);
        setEditFacultyName(ev.facultyName);
    };

    const saveEditEvent = () => {
        if (!editName.trim() || !editDate) return;
        setEvents(prev => prev.map(e =>
            e.id === editingEventId
                ? { ...e, name: editName.trim(), nature: editNature, date: editDate, facultyName: editFacultyName }
                : e
        ));
        setEditingEventId(null);
    };

    const cancelEditEvent = () => {
        setEditingEventId(null);
    };

    /* ── delete event ── */
    const handleDeleteEvent = (id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        if (selectedEventId === id) setSelectedEventId(null);
        setDeleteConfirmId(null);
    };

    /* ── upload events from CSV ── */
    const handleUploadEvents = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            const parsed = lines.slice(1).map((line, idx) => {
                const cols = line.split(',').map(s => s.trim().replace(/"/g, ''));
                return {
                    id: Date.now() + idx,
                    name: cols[0] || 'Imported Event',
                    nature: cols[1] || 'Workshop',
                    date: cols[2] || new Date().toISOString().split('T')[0],
                    facultyName: cols[3] || 'Dr. T. Neelima',
                    registrationOpen: true,
                    students: [],
                };
            });
            if (parsed.length > 0) setEvents(prev => [...prev, ...parsed]);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const toggleRegistration = () => {
        if (!selectedEventId) return;
        setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, registrationOpen: !e.registrationOpen } : e));
    };

    const handleFilterChange = (key, val) => {
        setFilters(prev => ({ ...prev, [key]: val }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({});
        setCurrentPage(1);
    };

    const toggleColumn = (key) => {
        setVisibleCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const exportCSV = () => {
        if (processedData.length === 0) return;
        const cols = ALL_COLUMNS.filter(c => visibleCols.includes(c.key));
        const header = cols.map(c => c.label).join(',');
        const rows = processedData.map((row, i) =>
            cols.map(c => c.key === 'sno' ? i + 1 : `"${row[c.key] || ''}"`).join(',')
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedEvent?.name || 'export'}_students.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddMember = () => {
        if (!newMemberText.trim()) return;
        const parts = newMemberText.split('-').map(s => s.trim());
        setMembers(prev => [...prev, { id: Date.now(), name: parts[0] || 'New', year: parts[1] || '', dept: parts[2] || '' }]);
        setNewMemberText('');
    };

    const handleUploadMembers = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            const parsed = lines.slice(1).map((line, idx) => {
                const cols = line.split(',').map(s => s.trim().replace(/"/g, ''));
                return { id: Date.now() + idx, name: cols[0] || '', year: cols[1] || '', dept: cols[2] || '' };
            });
            if (parsed.length > 0) setMembers(parsed);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDeleteMember = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const toggleYear = (yr) => setOpenYears(prev => ({ ...prev, [yr]: !prev[yr] }));
    const toggleMonth = (key) => setOpenMonths(prev => ({ ...prev, [key]: !prev[key] }));

    /* ── calendar view data ── */
    const calendarEvents = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter(ev => ev.date === dateStr);
            days.push({ day: d, date: dateStr, events: dayEvents });
        }
        return { year, month, days };
    }, [events]);

    /* ══════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════ */
    /* ── Embedded mode: just main content, no sidebar/layout wrapper ── */
    const sidebarJSX = (
        <aside className="cd-sidebar">
            {/* header */}
            <div className="cd-sidebar-header">
                <img src={logoEmblem} alt="Club" className="cd-sidebar-logo" />
                <div className="cd-sidebar-info">
                    <h2>Coordinator Panel</h2>
                    <p>HEAD: {profile.name.toUpperCase()}</p>
                </div>
            </div>

            {/* tabs */}
            <div className="cd-sidebar-tabs">
                <button className={`cd-sidebar-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                    📋 Events
                </button>
                <button className={`cd-sidebar-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                    📅 Calendar
                </button>
            </div>

            {activeTab === 'events' && (
                <>
                    {/* search */}
                    <div className="cd-search">
                        <div className="cd-search-wrap">
                            <span className="cd-search-icon">🔍</span>
                            <input
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* event form */}
                    <div className="cd-event-form">
                        <input placeholder="New Event Name" value={newEventName} onChange={e => setNewEventName(e.target.value)} />
                        <input
                            placeholder="Nature of Event (e.g. Workshop)"
                            list="nature-list"
                            value={newEventNature}
                            onChange={e => setNewEventNature(e.target.value)}
                        />
                        <datalist id="nature-list">
                            {NATURES.map(n => <option key={n} value={n} />)}
                        </datalist>
                        <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                        <input placeholder="Faculty Name" value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} />
                        <button className="cd-upload-btn" onClick={handleCreateEvent}>
                            ➕ Create Event
                        </button>
                        <label className="cd-import-events-btn">
                            📤 Import Events (CSV)
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUploadEvents} />
                        </label>
                    </div>

                    {/* event tree */}
                    <div className="cd-event-tree">
                        {Object.keys(eventTree).sort((a, b) => b - a).map(yr => (
                            <div key={yr} className="cd-tree-year">
                                <button className="cd-tree-year-btn" onClick={() => toggleYear(yr)}>
                                    <span className={`arrow ${openYears[yr] ? 'open' : ''}`}>▶</span>
                                    {yr}
                                    <span className="cd-tree-year-count">
                                        {Object.values(eventTree[yr]).reduce((s, arr) => s + arr.length, 0)}
                                    </span>
                                </button>
                                {openYears[yr] && (
                                    <div className="cd-tree-months">
                                        {Object.keys(eventTree[yr]).sort((a, b) => a - b).map(mo => {
                                            const monthKey = `${yr}-${mo}`;
                                            return (
                                                <div key={monthKey}>
                                                    <button className="cd-tree-month-btn" onClick={() => toggleMonth(monthKey)}>
                                                        <span className={`arrow ${openMonths[monthKey] ? 'open' : ''}`}>▶</span>
                                                        {MONTHS[mo]}
                                                        <span className="cd-tree-month-count">{eventTree[yr][mo].length}</span>
                                                    </button>
                                                    {openMonths[monthKey] && (
                                                        <div className="cd-tree-events">
                                                            {eventTree[yr][mo].map(ev => (
                                                                <div key={ev.id} className={`cd-tree-event-row ${selectedEventId === ev.id ? 'active' : ''}`}>
                                                                    <button
                                                                        className="cd-tree-event"
                                                                        onClick={() => { setSelectedEventId(ev.id); setCurrentPage(1); setSortStack([]); setFilters({}); }}
                                                                    >
                                                                        <span className={`cd-tree-event-dot ${ev.registrationOpen ? 'open' : 'closed'}`} />
                                                                        <span className="cd-tree-event-name">{ev.name}</span>
                                                                        <span className="cd-tree-event-count">{ev.students.length}</span>
                                                                    </button>
                                                                    <div className="cd-tree-event-actions">
                                                                        <button className="cd-tree-action-btn edit" title="Edit" onClick={(e) => { e.stopPropagation(); startEditEvent(ev); }}>✏️</button>
                                                                        <button className="cd-tree-action-btn delete" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(ev.id); }}>🗑️</button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'calendar' && (
                <div className="cd-calendar-view">
                    <div className="cd-calendar-header">
                        <h3>{MONTHS[calendarEvents.month]} {calendarEvents.year}</h3>
                    </div>
                    <div className="cd-calendar-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="cd-calendar-day-label">{d}</div>
                        ))}
                        {calendarEvents.days.map((cell, i) => (
                            <div key={i} className={`cd-calendar-cell ${cell ? '' : 'empty'} ${cell?.events.length > 0 ? 'has-events' : ''}`}>
                                {cell && (
                                    <>
                                        <span className="cd-calendar-day-num">{cell.day}</span>
                                        {cell.events.map(ev => (
                                            <div
                                                key={ev.id}
                                                className={`cd-calendar-event-pill ${ev.registrationOpen ? 'open' : 'closed'}`}
                                                onClick={() => { setSelectedEventId(ev.id); setActiveTab('events'); setCurrentPage(1); setSortStack([]); setFilters({}); }}
                                                title={ev.name}
                                            >
                                                {ev.name.length > 10 ? ev.name.slice(0, 10) + '…' : ev.name}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* footer */}
            <div className="cd-sidebar-footer">
                <button className="cd-btn-logout" onClick={() => { logout(); navigate('/'); }}>
                    Logout
                </button>
                <button className="cd-btn-grid" onClick={() => navigate('/faculty-dashboard')}>
                    Faculty View
                </button>
            </div>
        </aside>
    );

    const modalsJSX = (
        <>
            {editingEventId && (
                <div className="cd-modal-overlay" onClick={cancelEditEvent}>
                    <div className="cd-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="cd-modal-title">Edit Event</h3>
                        <div className="cd-modal-body">
                            <label>Event Name</label>
                            <input value={editName} onChange={e => setEditName(e.target.value)} />
                            <label>Nature</label>
                            <input list="edit-nature-list" value={editNature} onChange={e => setEditNature(e.target.value)} />
                            <datalist id="edit-nature-list">
                                {NATURES.map(n => <option key={n} value={n} />)}
                            </datalist>
                            <label>Date</label>
                            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                            <label>Faculty Name</label>
                            <input value={editFacultyName} onChange={e => setEditFacultyName(e.target.value)} />
                        </div>
                        <div className="cd-modal-actions">
                            <button className="cd-modal-cancel" onClick={cancelEditEvent}>Cancel</button>
                            <button className="cd-modal-save" onClick={saveEditEvent}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteConfirmId && (
                <div className="cd-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
                    <div className="cd-modal cd-modal-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="cd-modal-title">Delete Event?</h3>
                        <p className="cd-modal-text">
                            Are you sure you want to delete <strong>{events.find(e => e.id === deleteConfirmId)?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="cd-modal-actions">
                            <button className="cd-modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                            <button className="cd-modal-delete" onClick={() => handleDeleteEvent(deleteConfirmId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    const mainJSX = (
        <main className="cd-main" style={embedded ? { marginLeft: 0 } : undefined}>
            {/* top row: profile + members */}
            <div className="cd-top-row">
                {/* profile card */}
                <div className="cd-profile-card">
                    <span className="cd-profile-card-header">Coordinator Profile</span>
                    <button className="cd-profile-settings" title="Settings">⚙️</button>
                    <img src={logoEmblem} alt="Avatar" className="cd-profile-avatar" />
                    <div className="cd-profile-details">
                        <p className="name">{profile.name}</p>
                        <p className="info">📞 {profile.phone}</p>
                        <p className="info">✉️ {profile.email}</p>
                        <button className="cd-profile-update-btn">Update Profile</button>
                    </div>
                </div>

                {/* members card */}
                <div className="cd-members-card">
                    <p className="cd-members-card-header">Student Body Members</p>

                    <label className="cd-upload-excel-btn" style={{ cursor: 'pointer' }}>
                        📄 Upload Members (Excel)
                        <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleUploadMembers} />
                    </label>

                    <select className="cd-members-select">
                        <option>View Current Members ({members.length})</option>
                        {members.map(m => (
                            <option key={m.id}>{m.name} - {m.year} - {m.dept}</option>
                        ))}
                    </select>

                    <div className="cd-add-member-row">
                        <input
                            placeholder="Add New Member (Name - Year - Dept)"
                            value={newMemberText}
                            onChange={e => setNewMemberText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                        />
                        <button className="cd-add-member-btn" onClick={handleAddMember}>+</button>
                    </div>

                    {members.length > 0 && (
                        <button className="cd-delete-member-btn" onClick={() => { const last = members[members.length - 1]; if (last) handleDeleteMember(last.id); }}>
                            🗑️ Delete Selected Member
                        </button>
                    )}
                </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="cd-stats-row">
                <div className="cd-stat-card">
                    <span className="cd-stat-icon">📅</span>
                    <div>
                        <p className="cd-stat-value">{events.length}</p>
                        <p className="cd-stat-label">Total Events</p>
                    </div>
                </div>
                <div className="cd-stat-card">
                    <span className="cd-stat-icon">🟢</span>
                    <div>
                        <p className="cd-stat-value">{events.filter(e => e.registrationOpen).length}</p>
                        <p className="cd-stat-label">Open Registrations</p>
                    </div>
                </div>
                <div className="cd-stat-card">
                    <span className="cd-stat-icon">👥</span>
                    <div>
                        <p className="cd-stat-value">{events.reduce((s, e) => s + e.students.length, 0)}</p>
                        <p className="cd-stat-label">Total Registrations</p>
                    </div>
                </div>
                <div className="cd-stat-card">
                    <span className="cd-stat-icon">🔴</span>
                    <div>
                        <p className="cd-stat-value">{events.filter(e => !e.registrationOpen).length}</p>
                        <p className="cd-stat-label">Closed Events</p>
                    </div>
                </div>
            </div>

            {/* ── DATA TABLE ── */}
            <div className="cd-table-section">
                {/* header bar */}
                <div className="cd-table-header">
                    <div className="cd-table-title-area">
                        <h2 className="cd-table-title">
                            {selectedEvent ? selectedEvent.name : 'Registered Students'}
                        </h2>
                        <p className="cd-table-subtitle">
                            {selectedEvent
                                ? `${processedData.length} registered student${processedData.length !== 1 ? 's' : ''} • ${selectedEvent.nature} • ${selectedEvent.date}`
                                : 'Select an event from the sidebar to view registered students'
                            }
                        </p>
                    </div>

                    {selectedEvent && (
                        <div className={`cd-reg-toggle ${selectedEvent.registrationOpen ? 'open' : 'closed'}`}>
                            <span>{selectedEvent.registrationOpen ? '🟢 Registration Open' : '🔴 Registration Closed'}</span>
                            <label className="cd-reg-switch">
                                <input type="checkbox" checked={selectedEvent.registrationOpen} onChange={toggleRegistration} />
                                <span className="cd-reg-slider" />
                            </label>
                        </div>
                    )}
                </div>

                {/* toolbar */}
                {selectedEvent && (
                    <div className="cd-toolbar">
                        <span className="cd-toolbar-label">Sort:</span>
                        {['branch', 'year', 'section', 'registeredDate'].map(k => (
                            <button
                                key={k}
                                className={`cd-sort-chip ${sortStack.some(s => s.key === k) ? 'active' : ''}`}
                                onClick={() => handleQuickSort(k)}
                            >
                                <span className="chip-icon">{k === 'branch' ? '🏷️' : k === 'year' ? '🎓' : k === 'section' ? '📋' : '📅'}</span>
                                {k === 'registeredDate' ? 'Date' : k.charAt(0).toUpperCase() + k.slice(1)}
                                {sortStack.some(s => s.key === k) && (
                                    <span className="chip-dir">{sortStack.find(s => s.key === k)?.dir === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </button>
                        ))}
                        <button
                            className={`cd-sort-chip ${sortStack.length > 0 && !['branch', 'year', 'section', 'registeredDate'].some(k => sortStack.length === 1 && sortStack[0].key === k) ? 'active' : ''}`}
                            onClick={() => setSortStack([])}
                        >
                            <span className="chip-icon">⚙️</span>
                            Custom
                        </button>

                        <div className="cd-toolbar-divider" />

                        <button className={`cd-filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(v => !v)}>
                            🔽 Filter
                        </button>

                        <button className={`cd-columns-btn ${showColumns ? 'active' : ''}`} onClick={() => setShowColumns(v => !v)}>
                            📊 Columns
                        </button>

                        <button className="cd-export-btn" onClick={exportCSV}>
                            📥 Export CSV
                        </button>
                    </div>
                )}

                {/* active sort stack indicator */}
                {selectedEvent && sortStack.length > 0 && (
                    <div className="cd-sort-stack-bar">
                        <span className="cd-sort-stack-label">Active Sort:</span>
                        {sortStack.map((s, i) => (
                            <span key={s.key} className="cd-sort-stack-item">
                                <span className="cd-sort-priority">{i + 1}</span>
                                {s.key === 'registeredDate' ? 'Date' : s.key.charAt(0).toUpperCase() + s.key.slice(1)}
                                <span className="cd-sort-dir">{s.dir === 'asc' ? '↑' : '↓'}</span>
                                <button className="cd-sort-remove" onClick={() => setSortStack(prev => prev.filter((_, j) => j !== i))}>×</button>
                            </span>
                        ))}
                        <button className="cd-sort-clear" onClick={() => setSortStack([])}>Clear All</button>
                    </div>
                )}

                {/* filter panel */}
                {showFilters && selectedEvent && (
                    <div className="cd-filter-panel">
                        <div className="cd-filter-group">
                            <label>Name</label>
                            <input placeholder="Filter..." value={filters.name || ''} onChange={e => handleFilterChange('name', e.target.value)} />
                        </div>
                        <div className="cd-filter-group">
                            <label>Roll No</label>
                            <input placeholder="Filter..." value={filters.rollNo || ''} onChange={e => handleFilterChange('rollNo', e.target.value)} />
                        </div>
                        <div className="cd-filter-group">
                            <label>Branch</label>
                            <select value={filters.branch || ''} onChange={e => handleFilterChange('branch', e.target.value)}>
                                <option value="">All</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="cd-filter-group">
                            <label>Year</label>
                            <select value={filters.year || ''} onChange={e => handleFilterChange('year', e.target.value)}>
                                <option value="">All</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="cd-filter-group">
                            <label>Section</label>
                            <select value={filters.section || ''} onChange={e => handleFilterChange('section', e.target.value)}>
                                <option value="">All</option>
                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="cd-filter-group">
                            <label>Email</label>
                            <input placeholder="Filter..." value={filters.email || ''} onChange={e => handleFilterChange('email', e.target.value)} />
                        </div>
                        <button className="cd-clear-filters-btn" onClick={clearFilters}>✕ Clear All</button>
                    </div>
                )}

                {/* columns panel */}
                {showColumns && selectedEvent && (
                    <div className="cd-columns-panel">
                        {ALL_COLUMNS.map(col => (
                            <label key={col.key} className="cd-col-check">
                                <input
                                    type="checkbox"
                                    checked={visibleCols.includes(col.key)}
                                    onChange={() => toggleColumn(col.key)}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                )}

                {/* table */}
                <div className="cd-table-wrap">
                    {selectedEvent ? (
                        <table className="cd-table">
                            <thead>
                                <tr>
                                    {ALL_COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                                        <th
                                            key={col.key}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                                            className={sortStack.some(s => s.key === col.key) ? 'sorted' : ''}
                                        >
                                            {col.label}
                                            {col.sortable && (() => {
                                                const idx = sortStack.findIndex(s => s.key === col.key);
                                                if (idx === -1) return <span className="sort-indicator"> ↕</span>;
                                                const dir = sortStack[idx].dir;
                                                return (
                                                    <>
                                                        <span className="sort-indicator active">
                                                            {dir === 'asc' ? ' ↑' : ' ↓'}
                                                        </span>
                                                        {sortStack.length > 1 && <span className="sort-priority">{idx + 1}</span>}
                                                    </>
                                                );
                                            })()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.length > 0 ? pageData.map((row, i) => (
                                    <tr key={row.id}>
                                        {ALL_COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                                            <td key={col.key}>
                                                {col.key === 'sno' ? (currentPage - 1) * ROWS_PER_PAGE + i + 1 : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No students match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="cd-table-empty">
                            <div className="cd-table-empty-icon">📋</div>
                            <p>Select an event from the sidebar to view registered students.</p>
                        </div>
                    )}
                </div>

                {/* pagination */}
                {selectedEvent && processedData.length > ROWS_PER_PAGE && (
                    <div className="cd-pagination">
                        <span className="cd-pagination-info">
                            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, processedData.length)} of {processedData.length}
                        </span>
                        <div className="cd-pagination-controls">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) page = i + 1;
                                else if (currentPage <= 3) page = i + 1;
                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                else page = currentPage - 2 + i;
                                return (
                                    <button
                                        key={page}
                                        className={currentPage === page ? 'active' : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );

    if (embedded) {
        return (
            <>
                {modalsJSX}
                {sidebarJSX}
                {mainJSX}
            </>
        );
    }

    return (
        <div className="cd-layout">
            {modalsJSX}
            {sidebarJSX}
            {mainJSX}
        </div>
    );
}
