import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import './CoordinatorDashboard.css';
import logoEmblem from './assets/logo.png';
import { useAuth } from './AuthContext';
import { getEventRegistrations, saveEventStatus, getCustomEvents, addCustomEvent, getDeletedEvents, addDeletedEvent, getAttendance, markAttendance, removeAttendance, getAttendanceMap } from './db';

/* ══════════════════════════════════════════════════════════════
   MOCK DATA – Events & Registered Students
   ══════════════════════════════════════════════════════════════ */
const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML'];
const YEARS = ['I', 'II', 'III', 'IV'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const NATURES = ['Workshop', 'Seminar', 'Cultural', 'Technical', 'Sports', 'Webinar', 'Hackathon'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const VENUES = ['KL Rao Bhavan', 'Seminar Hall A', 'Seminar Hall B', 'Auditorium', 'Sports Complex', 'Open Air Theatre', 'Library Hall', 'Lab Block'];

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
            phone: `+91 ${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}@aditya.edu.in`,
            registeredDate: eventDate,
            isWinner: false,
        });
    }
    return students;
}

const DEFAULT_CRITERIA = { gender: 'all', years: [], branches: [], nationalities: [], regions: [], isPaid: false, fee: 0 };

const INITIAL_EVENTS = [
    { id: 1, name: 'AI Workshop 2026', nature: 'Workshop', date: '2026-02-15', venue: 'Seminar Hall A', club: 'AI Club', coordinator: 'Dr. Smith', description: 'Workshop on AI fundamentals', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA }, students: generateStudents(25, '2026-02-15') },
    { id: 2, name: 'Cultural Fest', nature: 'Cultural', date: '2026-02-20', venue: 'Auditorium', club: 'Cultural Club', coordinator: 'Dr. Priya', description: 'Annual cultural festival', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, gender: 'female', regions: ['Kerala', 'Andhra Pradesh'] }, students: generateStudents(40, '2026-02-20') },
    { id: 3, name: 'Tech Seminar', nature: 'Seminar', date: '2026-03-05', venue: 'KL Rao Bhavan', club: 'Tech Club', coordinator: 'Dr. Ravi', description: 'Technical seminar on emerging tech', facultyName: 'Dr. T. Neelima', registrationOpen: false, criteria: { ...DEFAULT_CRITERIA }, students: generateStudents(18, '2026-03-05') },
    { id: 4, name: 'Hackathon 2026', nature: 'Hackathon', date: '2026-03-15', venue: 'Lab Block', club: 'Coding Club', coordinator: 'Dr. Kumar', description: '24-hour coding hackathon', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, isPaid: true, fee: 200 }, students: generateStudents(50, '2026-03-15') },
    { id: 5, name: 'Sports Day', nature: 'Sports', date: '2026-01-28', venue: 'Sports Complex', club: 'Sports Club', coordinator: 'Dr. Singh', description: 'Annual sports meet', facultyName: 'Dr. T. Neelima', registrationOpen: false, criteria: { ...DEFAULT_CRITERIA, gender: 'male', years: ['II', 'III', 'IV'] }, students: generateStudents(35, '2026-01-28') },
    { id: 6, name: 'Web Dev Bootcamp', nature: 'Workshop', date: '2026-03-08', venue: 'Lab Block', club: 'Web Dev Club', coordinator: 'Dr. Meena', description: 'Full-stack web development bootcamp', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, nationalities: ['Indian'], isPaid: true, fee: 150 }, students: generateStudents(30, '2026-03-08') },
    { id: 7, name: 'IoT Expo', nature: 'Technical', date: '2026-03-22', venue: 'KL Rao Bhavan', club: 'IoT Club', coordinator: 'Dr. Arjun', description: 'Internet of Things exhibition', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA }, students: generateStudents(20, '2026-03-22') },
    { id: 8, name: 'Robotics Challenge', nature: 'Technical', date: '2026-04-05', venue: 'Lab Block', club: 'Robotics Club', coordinator: 'Dr. Lakshmi', description: 'Inter-college robotics competition', facultyName: 'Dr. T. Neelima', registrationOpen: true, criteria: { ...DEFAULT_CRITERIA, nationalities: ['Indian', 'Nepali', 'Zimbabwean'], years: ['III', 'IV'], isPaid: true, fee: 500 }, students: generateStudents(15, '2026-04-05') },
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
    { key: 'attended', label: 'Attended', sortable: false },
    { key: 'isWinner', label: 'Winner?', sortable: false },
];

const ROWS_PER_PAGE = 15;

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function CoordinatorDashboard({ embedded = false }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    /* ── sidebar state ── */
    const [events, setEvents] = useState(() => {
        const deleted = getDeletedEvents();
        return [...INITIAL_EVENTS, ...getCustomEvents()].filter(e => !deleted.includes(e.id));
    });
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openYears, setOpenYears] = useState({ '2026': true });
    const [openMonths, setOpenMonths] = useState({});

    /* ── live DB sync: merge student registrations from shared localStorage ── */
    const [liveDbRegs, setLiveDbRegs] = useState(() => {
        try { const r = localStorage.getItem('aditya_event_registrations_v1'); return r ? JSON.parse(r) : []; } catch { return []; }
    });

    useEffect(() => {
        const onStorage = () => {
            try {
                const raw = localStorage.getItem('aditya_event_registrations_v1');
                setLiveDbRegs(raw ? JSON.parse(raw) : []);
            } catch { setLiveDbRegs([]); }
        };
        window.addEventListener('storage', onStorage);
        // also poll every 2s for same-tab updates
        const timer = setInterval(onStorage, 2000);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(timer); };
    }, []);

    /* merge live DB students into an event's students array */
    const mergeEventStudents = useCallback((ev) => {
        const dbStudents = liveDbRegs.filter(r => r.eventId === ev.id);
        const existingRolls = new Set(ev.students.map(s => s.rollNo));
        const newStudents = dbStudents
            .filter(r => !existingRolls.has(r.rollNo))
            .map(r => ({
                id: r._id, name: r.studentName, rollNo: r.rollNo,
                branch: r.branch, year: r.year, phone: r.phone,
                email: r.email, registeredDate: r.registeredAt?.slice(0, 10),
                isWinner: r.isWinner || false, isLive: true,
            }));
        return { ...ev, students: [...ev.students, ...newStudents] };
    }, [liveDbRegs]);
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

    const location = useLocation();

    /* ── active section & dropdown ── */
    const [activeSection, setActiveSection] = useState(location.state?.section || 'dashboard'); // 'upcoming' | 'calendar' | 'dashboard'
    const [eventsDropdownOpen, setEventsDropdownOpen] = useState(true);

    /* ── calendar navigation ── */
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [calFilter, setCalFilter] = useState('all');

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);

    /* ── QR Scanner state ── */
    const [scanResult, setScanResult] = useState(null);
    const [scannerRunning, setScannerRunning] = useState(false);
    const [scanToast, setScanToast] = useState(null);
    const [scanEventId, setScanEventId] = useState(null); // coordinator picks event first
    const scannerRef = useRef(null);
    const scannerDivId = 'cd-qr-reader';

    /* ── Attendance state ── */
    const [attendanceMap, setAttendanceMap] = useState(() => getAttendanceMap());

    useEffect(() => {
        const refreshAttendance = () => setAttendanceMap(getAttendanceMap());
        window.addEventListener('storage', refreshAttendance);
        const timer = setInterval(refreshAttendance, 2000);
        return () => { window.removeEventListener('storage', refreshAttendance); clearInterval(timer); };
    }, []);

    /* ── Process scanned/looked-up data ── */
    const processScanData = useCallback((data) => {
        // load student photo from localStorage
        let photo = '';
        try { photo = localStorage.getItem(`aditya_student_photo_${data.rollNo}`) || ''; } catch { }

        // Check if student is registered for the selected event
        const allRegs = JSON.parse(localStorage.getItem('aditya_event_registrations_v1') || '[]');
        const regMatch = allRegs.find(r =>
            r.rollNo?.toLowerCase() === data.rollNo?.toLowerCase() &&
            r.eventId === scanEventId
        );

        // Check if already marked present (duplicate)
        const currentAttendance = getAttendanceMap();
        const alreadyPresent = (currentAttendance[scanEventId] || []).includes(data.rollNo);

        setScanResult({
            ...data,
            photo,
            isRegistered: !!regMatch,
            isDuplicate: alreadyPresent,
            regDetails: regMatch || null,
        });
    }, [scanEventId]);

    /* ── Start QR scanner ── */
    const startScanner = useCallback(async () => {
        if (scannerRef.current) return;
        if (!scanEventId) {
            setScanToast('⚠️ Please select an event first');
            setTimeout(() => setScanToast(null), 3000);
            return;
        }
        setScanResult(null);
        const html5QrCode = new Html5Qrcode(scannerDivId);
        scannerRef.current = html5QrCode;
        try {
            await html5QrCode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        processScanData(data);
                        html5QrCode.stop().then(() => {
                            scannerRef.current = null;
                            setScannerRunning(false);
                        }).catch(() => {});
                    } catch {
                        setScanResult({ error: true, raw: decodedText });
                    }
                },
                () => { /* ignore scan failures */ }
            );
            setScannerRunning(true);
        } catch (err) {
            console.error('Scanner start error:', err);
            scannerRef.current = null;
        }
    }, [scanEventId, processScanData]);

    /* ── Stop QR scanner ── */
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch { }
            scannerRef.current = null;
            setScannerRunning(false);
        }
    }, []);

    /* ── Cleanup on unmount ── */
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, []);

    /* ── Handle mark attendance ── */
    const handleMarkAttendance = useCallback((eventId, rollNo) => {
        markAttendance(eventId, rollNo);
        setAttendanceMap(getAttendanceMap());
        setScanResult(prev => prev ? { ...prev, isDuplicate: true } : prev);
        setScanToast(`✅ ${rollNo} marked PRESENT`);
        setTimeout(() => setScanToast(null), 3000);
    }, []);

    /* ── Manual roll / token lookup ── */
    const [manualInput, setManualInput] = useState('');
    const [scanMode, setScanMode] = useState('webcam'); // 'webcam' | 'device' | 'manual'
    const [deviceInput, setDeviceInput] = useState('');
    const deviceInputRef = useRef(null);
    const handleManualLookup = useCallback(() => {
        const query = manualInput.trim();
        if (!query) return;
        if (!scanEventId) {
            setScanToast('⚠️ Please select an event first');
            setTimeout(() => setScanToast(null), 3000);
            return;
        }
        try {
            const allRegs = JSON.parse(localStorage.getItem('aditya_event_registrations_v1') || '[]');
            // Search by rollNo or token in the selected event
            const match = allRegs.find(r =>
                r.eventId === scanEventId &&
                (r.rollNo?.toLowerCase() === query.toLowerCase() ||
                 r.qrToken?.toLowerCase().startsWith(query.toLowerCase()))
            );
            if (match) {
                processScanData({
                    student: match.studentName,
                    rollNo: match.rollNo,
                    eventId: match.eventId,
                    event: match.eventName || events.find(e => e.id === match.eventId)?.name || '',
                    date: match.eventDate || events.find(e => e.id === match.eventId)?.date || '',
                    venue: match.venue || events.find(e => e.id === match.eventId)?.venue || '',
                    registeredAt: match.registeredAt,
                    token: match.qrToken,
                });
                setManualInput('');
            } else {
                // Maybe not registered for this event? Check globally
                const globalMatch = allRegs.find(r =>
                    r.rollNo?.toLowerCase() === query.toLowerCase() ||
                    r.qrToken?.toLowerCase().startsWith(query.toLowerCase())
                );
                if (globalMatch) {
                    const evName = events.find(e => e.id === scanEventId)?.name || 'selected event';
                    setScanToast(`⚠️ ${globalMatch.rollNo} is NOT registered for ${evName}`);
                } else {
                    setScanToast(`❌ No registration found for "${query}"`);
                }
                setTimeout(() => setScanToast(null), 4000);
            }
        } catch {
            setScanToast('❌ Error reading registrations');
            setTimeout(() => setScanToast(null), 3000);
        }
    }, [manualInput, scanEventId, events, processScanData]);

    /* ── Handle external QR scanner device input ── */
    const handleDeviceScan = useCallback((rawInput) => {
        const text = rawInput.trim();
        if (!text) return;
        if (!scanEventId) {
            setScanToast('⚠️ Please select an event first');
            setTimeout(() => setScanToast(null), 3000);
            return;
        }
        try {
            // External scanners output the QR JSON string
            const data = JSON.parse(text);
            processScanData(data);
        } catch {
            // If not JSON, treat as roll number lookup
            setManualInput(text);
            // Trigger manual lookup logic inline
            try {
                const allRegs = JSON.parse(localStorage.getItem('aditya_event_registrations_v1') || '[]');
                const match = allRegs.find(r =>
                    r.eventId === scanEventId &&
                    (r.rollNo?.toLowerCase() === text.toLowerCase() ||
                     r.qrToken?.toLowerCase().startsWith(text.toLowerCase()))
                );
                if (match) {
                    processScanData({
                        student: match.studentName,
                        rollNo: match.rollNo,
                        eventId: match.eventId,
                        event: match.eventName || events.find(e => e.id === match.eventId)?.name || '',
                        date: match.eventDate || events.find(e => e.id === match.eventId)?.date || '',
                        venue: match.venue || events.find(e => e.id === match.eventId)?.venue || '',
                        registeredAt: match.registeredAt,
                        token: match.qrToken,
                    });
                } else {
                    setScanToast(`❌ No registration found for "${text}"`);
                    setTimeout(() => setScanToast(null), 3000);
                }
            } catch {
                setScanToast('❌ Error reading scan data');
                setTimeout(() => setScanToast(null), 3000);
            }
        }
        setDeviceInput('');
    }, [scanEventId, events, processScanData]);

    /* ── registration criteria modal state ── */
    const [showCriteriaModal, setShowCriteriaModal] = useState(false);
    const [criteriaEventId, setCriteriaEventId] = useState(null);
    /* draft criteria fields */
    const [draftGender, setDraftGender] = useState('all');
    const [draftYears, setDraftYears] = useState([]);
    const [draftBranches, setDraftBranches] = useState([]);
    const [draftNationalities, setDraftNationalities] = useState([]);
    const [draftRegions, setDraftRegions] = useState([]);
    const [draftIsPaid, setDraftIsPaid] = useState(false);
    const [draftFee, setDraftFee] = useState(0);
    const [draftNatInput, setDraftNatInput] = useState('');
    const [draftRegInput, setDraftRegInput] = useState('');

    /* ── new event form (calendar) ── */
    const [newEvName, setNewEvName] = useState('');
    const [newEvDate, setNewEvDate] = useState('');
    const [newEvVenue, setNewEvVenue] = useState('KL Rao Bhavan');
    const [newEvClub, setNewEvClub] = useState('');
    const [newEvCoordinator, setNewEvCoordinator] = useState('');
    const [newEvDescription, setNewEvDescription] = useState('');

    /* ── modify event form ── */
    const [modifyEventId, setModifyEventId] = useState(null);
    const [modifyName, setModifyName] = useState('');
    const [modifyDate, setModifyDate] = useState('');
    const [modifyVenue, setModifyVenue] = useState('KL Rao Bhavan');
    const [modifyClub, setModifyClub] = useState('');
    const [modifyCoordinator, setModifyCoordinator] = useState('');

    /* ── derived ── */
    const selectedEvent = useMemo(() => {
        const ev = events.find(e => e.id === selectedEventId) || null;
        return ev ? mergeEventStudents(ev) : null;
    }, [events, selectedEventId, mergeEventStudents]);

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
        addDeletedEvent(id);
        setEvents(prev => prev.filter(e => e.id !== id));
        if (selectedEventId === id) setSelectedEventId(null);
        setDeleteConfirmId(null);
    };



    const toggleRegistration = () => {
        if (!selectedEventId) return;
        const ev = events.find(e => e.id === selectedEventId);
        if (!ev) return;
        if (ev.registrationOpen) {
            // closing: direct toggle
            setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, registrationOpen: false } : e));
            saveEventStatus(selectedEventId, { registrationOpen: false });
        } else {
            // opening: show criteria modal first
            const c = ev.criteria || DEFAULT_CRITERIA;
            setCriteriaEventId(ev.id);
            setDraftGender(c.gender || 'all');
            setDraftYears(c.years || []);
            setDraftBranches(c.branches || []);
            setDraftNationalities(c.nationalities || []);
            setDraftRegions(c.regions || []);
            setDraftIsPaid(c.isPaid || false);
            setDraftFee(c.fee || 0);
            setDraftNatInput('');
            setDraftRegInput('');
            setShowCriteriaModal(true);
        }
    };

    const handleSaveCriteria = () => {
        setEvents(prev => prev.map(e =>
            e.id === criteriaEventId
                ? {
                    ...e,
                    registrationOpen: true,
                    criteria: {
                        gender: draftGender,
                        years: draftYears,
                        branches: draftBranches,
                        nationalities: draftNationalities,
                        regions: draftRegions,
                        isPaid: draftIsPaid,
                        fee: draftIsPaid ? Number(draftFee) : 0,
                    }
                }
                : e
        ));
        setShowCriteriaModal(false);
        setCriteriaEventId(null);
        // persist to shared DB so student dashboard reflects the new status
        saveEventStatus(criteriaEventId, {
            registrationOpen: true,
            criteria: {
                gender: draftGender,
                years: draftYears,
                branches: draftBranches,
                nationalities: draftNationalities,
                regions: draftRegions,
                isPaid: draftIsPaid,
                fee: draftIsPaid ? Number(draftFee) : 0,
            }
        });
    };

    /* toggle helpers for year/branch multi-select */
    const toggleDraftYear = (yr) => setDraftYears(prev => prev.includes(yr) ? prev.filter(y => y !== yr) : [...prev, yr]);
    const toggleDraftBranch = (br) => setDraftBranches(prev => prev.includes(br) ? prev.filter(b => b !== br) : [...prev, br]);

    /* tag input helpers */
    const addNatTag = () => {
        const v = draftNatInput.trim();
        if (!v || draftNationalities.includes(v)) return;
        setDraftNationalities(prev => [...prev, v]);
        setDraftNatInput('');
    };
    const addRegTag = () => {
        const v = draftRegInput.trim();
        if (!v || draftRegions.includes(v)) return;
        setDraftRegions(prev => [...prev, v]);
        setDraftRegInput('');
    };

    const toggleWinner = (studentId) => {
        if (!selectedEventId) return;
        setEvents(prev => prev.map(e => {
            if (e.id !== selectedEventId) return e;
            return {
                ...e,
                students: e.students.map(s => s.id === studentId ? { ...s, isWinner: !s.isWinner } : s)
            };
        }));
    };

    const handleGenerateCertificates = () => {
        setShowCertificateModal(true);
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

    /* ── calendar view data (navigable) ── */
    const calendarData = useMemo(() => {
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter(ev => ev.date === dateStr);
            days.push({ day: d, date: dateStr, events: dayEvents });
        }
        return days;
    }, [events, calMonth, calYear]);

    /* ── filtered events for calendar sidebar ── */
    const filteredCalEvents = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        switch (calFilter) {
            case 'upcoming': return events.filter(e => new Date(e.date) >= now);
            case 'modified': return events.filter(e => e.modified);
            case 'completed': return events.filter(e => new Date(e.date) < now);
            default: return events;
        }
    }, [events, calFilter]);

    /* ── upcoming events with urgency ── */
    const upcomingEvents = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        return events
            .filter(e => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(e => {
                const diff = Math.ceil((new Date(e.date) - now) / (1000 * 60 * 60 * 24));
                let urgency = 'scheduled';
                if (diff <= 10) urgency = 'critical';
                else if (diff <= 15) urgency = 'warning';
                else if (diff <= 30) urgency = 'approaching';
                return { ...e, daysUntil: diff, urgency };
            });
    }, [events]);

    /* ── calendar month navigation ── */
    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    };

    /* ── new event from calendar modal ── */
    const handleAddNewEvent = () => {
        if (!newEvName.trim() || !newEvDate) return;
        const newEv = {
            id: Date.now(), name: newEvName.trim(), nature: 'Workshop', date: newEvDate,
            venue: newEvVenue, club: newEvClub, coordinator: newEvCoordinator,
            description: newEvDescription, facultyName: newEvCoordinator || 'Dr. T. Neelima',
            registrationOpen: true, students: [],
            criteria: {
                gender: draftGender,
                years: draftYears,
                branches: draftBranches,
                nationalities: draftNationalities,
                regions: draftRegions,
                isPaid: draftIsPaid,
                fee: draftIsPaid ? Number(draftFee) : 0,
            }
        };
        addCustomEvent(newEv);
        setEvents(prev => [...prev, newEv]);
        setShowNewEventModal(false);
        setNewEvName(''); setNewEvDate(''); setNewEvVenue('KL Rao Bhavan');
        setNewEvClub(''); setNewEvCoordinator(''); setNewEvDescription('');
        setDraftGender('all'); setDraftYears([]); setDraftBranches([]); setDraftNationalities([]); setDraftRegions([]); setDraftIsPaid(false); setDraftFee(0); setDraftNatInput(''); setDraftRegInput('');
    };

    /* ── modify event handler ── */
    const handleModifyEvent = () => {
        if (!modifyEventId) return;
        setEvents(prev => prev.map(e =>
            e.id === modifyEventId
                ? { ...e, name: modifyName, date: modifyDate, venue: modifyVenue, club: modifyClub, coordinator: modifyCoordinator, modified: true }
                : e
        ));
        setShowModifyModal(false);
    };

    const openModifyModal = () => {
        setShowModifyModal(true);
        if (events.length > 0) {
            const ev = events[0];
            setModifyEventId(ev.id); setModifyName(ev.name); setModifyDate(ev.date);
            setModifyVenue(ev.venue || 'KL Rao Bhavan'); setModifyClub(ev.club || '');
            setModifyCoordinator(ev.coordinator || ev.facultyName || '');
        }
    };

    const selectModifyEvent = (id) => {
        const ev = events.find(e => e.id === parseInt(id));
        if (ev) {
            setModifyEventId(ev.id); setModifyName(ev.name); setModifyDate(ev.date);
            setModifyVenue(ev.venue || 'KL Rao Bhavan'); setModifyClub(ev.club || '');
            setModifyCoordinator(ev.coordinator || ev.facultyName || '');
        }
    };

    /* ══════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════ */
    /* ── Embedded mode: just main content, no sidebar/layout wrapper ── */
    const sidebarJSX = (
        <aside className="cd-sidebar">
            {/* header + dropdown */}
            <div className="cd-sidebar-header" onClick={() => setEventsDropdownOpen(v => !v)} style={{ cursor: 'pointer' }}>
                <img src={logoEmblem} alt="Club" className="cd-sidebar-logo" />
                <div className="cd-sidebar-info">
                    <h2>Coordinator Panel</h2>
                    <p>HEAD: {profile.name.toUpperCase()}</p>
                </div>
                <span className={`cd-dropdown-arrow ${eventsDropdownOpen ? 'open' : ''}`}>▶</span>
            </div>

            {/* dropdown items */}
            {eventsDropdownOpen && (
                <div className="cd-dropdown-items">
                    <button className={`cd-dropdown-item ${activeSection === 'upcoming' ? 'active' : ''}`} onClick={() => { setActiveSection('upcoming'); stopScanner(); }}>
                        <span className="cd-dropdown-item-icon">🔔</span> Upcoming Events
                    </button>
                    <button className={`cd-dropdown-item ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => { setActiveSection('calendar'); stopScanner(); }}>
                        <span className="cd-dropdown-item-icon">📅</span> Event Calendar
                    </button>
                    <button className={`cd-dropdown-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveSection('dashboard'); stopScanner(); }}>
                        <span className="cd-dropdown-item-icon">📊</span> Events Dashboard
                    </button>
                    <button className={`cd-dropdown-item ${activeSection === 'scanQr' ? 'active' : ''}`} onClick={() => { setActiveSection('scanQr'); setScanResult(null); }}>
                        <span className="cd-dropdown-item-icon">📷</span> Scan QR / Attendance
                    </button>
                </div>
            )}

            {activeSection === 'dashboard' && (
                <>
                    {/* search */}
                    <div className="cd-search">
                        <div className="cd-search-wrap">
                            <span className="cd-search-icon">🔍</span>
                            <input placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    {/* event tree */}
                    <div className="cd-event-tree">
                        {Object.keys(eventTree).sort((a, b) => b - a).map(yr => (
                            <div key={yr} className="cd-tree-year">
                                <button className="cd-tree-year-btn" onClick={() => toggleYear(yr)}>
                                    <span className={`arrow ${openYears[yr] ? 'open' : ''}`}>▶</span>
                                    {yr}
                                    <span className="cd-tree-year-count">{Object.values(eventTree[yr]).reduce((s, arr) => s + arr.length, 0)}</span>
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
                                                                    <button className="cd-tree-event" onClick={() => { setSelectedEventId(ev.id); setCurrentPage(1); setSortStack([]); setFilters({}); }}>
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

    const renderCriteriaFields = () => (
        <div className="cd-criteria-grid">
            {/* ── GENDER ── */}
            <div className="cd-criteria-section">
                <p className="cd-criteria-section-label">👤 Gender Restriction</p>
                <div className="cd-criteria-gender-group">
                    {[{ v: 'all', label: '🌐 All', color: '#6366f1' }, { v: 'male', label: '♂ Boys Only', color: '#2196f3' }, { v: 'female', label: '♀ Girls Only', color: '#e91e63' }].map(o => (
                        <button
                            key={o.v}
                            className={`cd-criteria-gender-btn ${draftGender === o.v ? 'active' : ''}`}
                            style={draftGender === o.v ? { background: o.color, color: '#fff', borderColor: o.color } : {}}
                            onClick={() => setDraftGender(o.v)}
                        >{o.label}</button>
                    ))}
                </div>
            </div>

            {/* ── YEAR ── */}
            <div className="cd-criteria-section">
                <p className="cd-criteria-section-label">🎓 Year of Study <span className="cd-criteria-hint">(none = all years)</span></p>
                <div className="cd-criteria-checkbox-grid">
                    {YEARS.map(yr => (
                        <label key={yr} className={`cd-criteria-chip-check ${draftYears.includes(yr) ? 'active' : ''}`}>
                            <input type="checkbox" checked={draftYears.includes(yr)} onChange={() => toggleDraftYear(yr)} />
                            {yr} Year
                        </label>
                    ))}
                </div>
            </div>

            {/* ── BRANCH ── */}
            <div className="cd-criteria-section cd-criteria-section-wide">
                <p className="cd-criteria-section-label">🏷️ Branch / Department <span className="cd-criteria-hint">(none = all branches)</span></p>
                <div className="cd-criteria-checkbox-grid cd-criteria-branch-grid">
                    {BRANCHES.map(br => (
                        <label key={br} className={`cd-criteria-chip-check ${draftBranches.includes(br) ? 'active' : ''}`}>
                            <input type="checkbox" checked={draftBranches.includes(br)} onChange={() => toggleDraftBranch(br)} />
                            {br}
                        </label>
                    ))}
                </div>
            </div>

            {/* ── NATIONALITY ── */}
            <div className="cd-criteria-section">
                <p className="cd-criteria-section-label">🌍 Nationality <span className="cd-criteria-hint">(none = open to all)</span></p>
                <div className="cd-criteria-tag-row">
                    <input
                        className="cd-criteria-tag-input"
                        placeholder="e.g. Indian, Nepali…"
                        value={draftNatInput}
                        onChange={e => setDraftNatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addNatTag()}
                    />
                    <button className="cd-criteria-add-btn" onClick={addNatTag}>+</button>
                </div>
                <div className="cd-criteria-tags">
                    {draftNationalities.map(n => (
                        <span key={n} className="cd-criteria-tag cd-criteria-tag-nat">
                            {n}
                            <button onClick={() => setDraftNationalities(prev => prev.filter(x => x !== n))}>×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── REGION / STATE ── */}
            <div className="cd-criteria-section">
                <p className="cd-criteria-section-label">📍 Region / State <span className="cd-criteria-hint">(none = all regions)</span></p>
                <div className="cd-criteria-tag-row">
                    <input
                        className="cd-criteria-tag-input"
                        placeholder="e.g. Kerala, Andhra Pradesh…"
                        value={draftRegInput}
                        onChange={e => setDraftRegInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addRegTag()}
                    />
                    <button className="cd-criteria-add-btn" onClick={addRegTag}>+</button>
                </div>
                <div className="cd-criteria-tags">
                    {draftRegions.map(r => (
                        <span key={r} className="cd-criteria-tag cd-criteria-tag-reg">
                            {r}
                            <button onClick={() => setDraftRegions(prev => prev.filter(x => x !== r))}>×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── PAID / FREE ── */}
            <div className="cd-criteria-section">
                <p className="cd-criteria-section-label">💳 Entry Type</p>
                <div className="cd-criteria-paid-row">
                    <button
                        className={`cd-criteria-paid-btn ${!draftIsPaid ? 'active free' : ''}`}
                        onClick={() => setDraftIsPaid(false)}
                    >🆓 Free</button>
                    <button
                        className={`cd-criteria-paid-btn ${draftIsPaid ? 'active paid' : ''}`}
                        onClick={() => setDraftIsPaid(true)}
                    >💰 Paid</button>
                </div>
                {draftIsPaid && (
                    <div className="cd-criteria-fee-row">
                        <span className="cd-criteria-fee-symbol">₹</span>
                        <input
                            type="number"
                            className="cd-criteria-fee-input"
                            placeholder="Enter fee amount"
                            value={draftFee}
                            min={0}
                            onChange={e => setDraftFee(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const renderCriteriaSummary = () => (
        <div className="cd-criteria-summary">
            <span className="cd-criteria-summary-label">Preview:</span>
            {draftGender !== 'all' && <span className="cd-cbadge cd-cbadge-gender">{draftGender === 'male' ? '♂ Boys Only' : '♀ Girls Only'}</span>}
            {draftYears.length > 0 && <span className="cd-cbadge cd-cbadge-year">🎓 {draftYears.join(', ')}</span>}
            {draftBranches.length > 0 && <span className="cd-cbadge cd-cbadge-branch">🏷️ {draftBranches.join(', ')}</span>}
            {draftNationalities.length > 0 && <span className="cd-cbadge cd-cbadge-nat">🌍 {draftNationalities.join(', ')}</span>}
            {draftRegions.length > 0 && <span className="cd-cbadge cd-cbadge-reg">📍 {draftRegions.join(', ')}</span>}
            {draftIsPaid && <span className="cd-cbadge cd-cbadge-paid">💰 ₹{draftFee}</span>}
            {draftGender === 'all' && draftYears.length === 0 && draftBranches.length === 0 && draftNationalities.length === 0 && draftRegions.length === 0 && !draftIsPaid && (
                <span className="cd-cbadge cd-cbadge-open">🌐 Open to All</span>
            )}
        </div>
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
            {/* Upload Method Modal */}
            {showUploadModal && (
                <div className="cd-modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="cd-modal" onClick={e => e.stopPropagation()}>
                        <button className="cd-modal-close" onClick={() => setShowUploadModal(false)}>×</button>
                        <h3 className="cd-modal-title" style={{ textAlign: 'center' }}>Select Upload Method</h3>
                        <div className="cd-upload-grid">
                            <button className="cd-upload-card" onClick={() => { /* PDF upload */ }}>
                                <span className="cd-upload-card-icon" style={{ color: '#e53935' }}>📄</span>
                                <span>Upload PDF</span>
                            </button>
                            <button className="cd-upload-card" onClick={() => { /* Word upload */ }}>
                                <span className="cd-upload-card-icon" style={{ color: '#1565c0' }}>📝</span>
                                <span>Upload Word Doc</span>
                            </button>
                            <button className="cd-upload-card" onClick={() => { /* Excel upload */ }}>
                                <span className="cd-upload-card-icon" style={{ color: '#2e7d32' }}>📊</span>
                                <span>Upload Excel Sheet</span>
                            </button>
                            <button className="cd-upload-card" onClick={() => {
                                setShowUploadModal(false);
                                setDraftGender('all'); setDraftYears([]); setDraftBranches([]); setDraftNationalities([]); setDraftRegions([]); setDraftIsPaid(false); setDraftFee(0); setDraftNatInput(''); setDraftRegInput('');
                                setShowNewEventModal(true);
                            }}>
                                <span className="cd-upload-card-icon" style={{ color: '#f57c00' }}>📋</span>
                                <span>Upload New Event</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* New Event Modal */}
            {showNewEventModal && (
                <div className="cd-modal-overlay" onClick={() => setShowNewEventModal(false)}>
                    <div className="cd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90vw' }}>
                        <button className="cd-modal-close" onClick={() => setShowNewEventModal(false)}>×</button>
                        <h3 className="cd-modal-title">Upload New Event</h3>
                        <div className="cd-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label>Event Name</label>
                                    <input placeholder="e.g. AI Hackathon" value={newEvName} onChange={e => setNewEvName(e.target.value)} />
                                    <label>Date</label>
                                    <input type="date" value={newEvDate} onChange={e => setNewEvDate(e.target.value)} />
                                    <label>Venue</label>
                                    <select value={newEvVenue} onChange={e => setNewEvVenue(e.target.value)} className="cd-modal-select">
                                        {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label>Club / Department</label>
                                    <input placeholder="e.g. Eco Club" value={newEvClub} onChange={e => setNewEvClub(e.target.value)} />
                                    <label>Coordinator</label>
                                    <input placeholder="e.g. Dr. Smith" value={newEvCoordinator} onChange={e => setNewEvCoordinator(e.target.value)} />
                                    <label>Description</label>
                                    <textarea placeholder="Brief event details..." value={newEvDescription} onChange={e => setNewEvDescription(e.target.value)} className="cd-modal-textarea" style={{ minHeight: '104px' }} />
                                </div>
                            </div>

                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            <h4 style={{ marginBottom: '10px', color: '#1e293b' }}>Registration Criteria</h4>
                            {renderCriteriaFields()}
                            {renderCriteriaSummary()}

                        </div>
                        <button className="cd-modal-full-btn" onClick={handleAddNewEvent}>Add Event</button>
                    </div>
                </div>
            )}
            {/* Modify Event Modal */}
            {showModifyModal && (
                <div className="cd-modal-overlay" onClick={() => setShowModifyModal(false)}>
                    <div className="cd-modal" onClick={e => e.stopPropagation()}>
                        <button className="cd-modal-close" onClick={() => setShowModifyModal(false)}>×</button>
                        <h3 className="cd-modal-title">Modify Event</h3>
                        <div className="cd-modal-body">
                            <label style={{ color: '#c62828' }}>Select Event to Modify</label>
                            <select value={modifyEventId || ''} onChange={e => selectModifyEvent(e.target.value)} className="cd-modal-select">
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>)}
                            </select>
                            <label>Event Name</label>
                            <input value={modifyName} onChange={e => setModifyName(e.target.value)} />
                            <div className="cd-modify-dates">
                                <div className="cd-modify-date-col">
                                    <label>Actual Date</label>
                                    <input type="text" value={events.find(e => e.id === modifyEventId)?.date || ''} disabled className="cd-date-disabled" />
                                </div>
                                <div className="cd-modify-date-col">
                                    <label>Updated Date</label>
                                    <input type="date" value={modifyDate} onChange={e => setModifyDate(e.target.value)} />
                                </div>
                            </div>
                            <label>Venue</label>
                            <select value={modifyVenue} onChange={e => setModifyVenue(e.target.value)} className="cd-modal-select">
                                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <label>Club</label>
                            <input value={modifyClub} onChange={e => setModifyClub(e.target.value)} />
                            <label>Coordinator</label>
                            <input value={modifyCoordinator} onChange={e => setModifyCoordinator(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}
            {/* Certificate Generation Modal */}
            {showCertificateModal && selectedEvent && (() => {
                const evAttendance = attendanceMap[selectedEvent.id] || [];
                const presentStudents = selectedEvent.students.filter(s => evAttendance.includes(s.rollNo));
                const absentStudents = selectedEvent.students.filter(s => !evAttendance.includes(s.rollNo));
                const presentWinners = presentStudents.filter(s => s.isWinner);
                const presentParticipants = presentStudents.filter(s => !s.isWinner);
                return (
                    <div className="cd-modal-overlay" onClick={() => setShowCertificateModal(false)}>
                        <div className="cd-modal" onClick={e => e.stopPropagation()}>
                            <button className="cd-modal-close" onClick={() => setShowCertificateModal(false)}>×</button>
                            <h3 className="cd-modal-title">Generate Certificates</h3>
                            <div className="cd-modal-body" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                                <p style={{ fontSize: '16px', color: '#1e3a5f', marginBottom: '8px' }}>
                                    Certificates for <strong>{selectedEvent.name}</strong>
                                </p>
                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                                    Only students marked <strong>Present</strong> are eligible for certificates.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '20px 0', flexWrap: 'wrap' }}>
                                    <div style={{ background: '#e8f5e9', padding: '15px 22px', borderRadius: '12px', border: '1px solid #c8e6c9' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{presentWinners.length}</div>
                                        <div style={{ fontSize: '12px', color: '#388e3c' }}>Winners (Present)</div>
                                    </div>
                                    <div style={{ background: '#e3f2fd', padding: '15px 22px', borderRadius: '12px', border: '1px solid #bbdefb' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>{presentParticipants.length}</div>
                                        <div style={{ fontSize: '12px', color: '#1976d2' }}>Participants (Present)</div>
                                    </div>
                                    <div style={{ background: '#fef2f2', padding: '15px 22px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c' }}>{absentStudents.length}</div>
                                        <div style={{ fontSize: '12px', color: '#dc2626' }}>Absent (No Cert)</div>
                                    </div>
                                </div>
                                {presentStudents.length === 0 && (
                                    <p style={{ fontSize: '13px', color: '#b91c1c', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                                        ⚠️ No students marked present. Scan QR codes to mark attendance first.
                                    </p>
                                )}
                            </div>
                            <button
                                className="cd-modal-full-btn"
                                disabled={presentStudents.length === 0}
                                style={presentStudents.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                onClick={() => {
                                    setTimeout(() => setShowCertificateModal(false), 800);
                                }}
                            >
                                {presentStudents.length === 0 ? 'No Eligible Students' : `Generate ${presentStudents.length} Certificate${presentStudents.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                );
            })()}
            {/* ══════════ REGISTRATION CRITERIA MODAL ══════════ */}
            {showCriteriaModal && (
                <div className="cd-modal-overlay" onClick={() => setShowCriteriaModal(false)}>
                    <div className="cd-criteria-modal" onClick={e => e.stopPropagation()}>
                        <button className="cd-modal-close" onClick={() => setShowCriteriaModal(false)}>×</button>
                        <div className="cd-criteria-modal-header">
                            <span className="cd-criteria-modal-icon">🛡️</span>
                            <div>
                                <h3 className="cd-criteria-modal-title">Set Registration Criteria</h3>
                                <p className="cd-criteria-modal-sub">{events.find(e => e.id === criteriaEventId)?.name} — Define eligibility restrictions before opening registration</p>
                            </div>
                        </div>

                        {renderCriteriaFields()}
                        {renderCriteriaSummary()}

                        <button className="cd-criteria-save-btn" onClick={handleSaveCriteria}>
                            ✅ Save & Open Registration
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    const mainJSX = (
        <main className="cd-main" style={embedded ? { marginLeft: 0 } : undefined}>

            {/* ── SCAN QR / ATTENDANCE VIEW ── */}
            {activeSection === 'scanQr' && (
                <div className="cd-scan-section">
                    <h2 className="cd-section-title">📷 Scan QR Code — Mark Attendance</h2>
                    <p className="cd-section-subtitle">Select an event, then scan or enter a student’s roll number to verify and mark attendance.</p>

                    {scanToast && <div className="cd-scan-toast">{scanToast}</div>}

                    {/* Event Selector */}
                    <div className="cd-scan-event-selector">
                        <label className="cd-scan-event-label">🎫 Select Event for Attendance</label>
                        <select
                            className="cd-scan-event-dropdown"
                            value={scanEventId || ''}
                            onChange={e => { setScanEventId(e.target.value ? Number(e.target.value) : null); setScanResult(null); stopScanner(); }}
                        >
                            <option value="">-- Choose an event --</option>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.name} ({ev.date}) — {mergeEventStudents(ev).students.length} registered</option>
                            ))}
                        </select>
                        {scanEventId && (() => {
                            const ev = events.find(e => e.id === scanEventId);
                            const att = attendanceMap[scanEventId] || [];
                            const merged = ev ? mergeEventStudents(ev) : null;
                            const totalStudents = merged?.students?.length || 0;
                            return (
                                <div className="cd-scan-event-stats">
                                    <span className="cd-scan-event-stat">📊 {totalStudents} registered</span>
                                    <span className="cd-scan-event-stat present">✅ {att.length} present</span>
                                    <span className="cd-scan-event-stat absent">❌ {totalStudents - att.length} remaining</span>
                                </div>
                            );
                        })()}
                    </div>

                    {!scanEventId ? (
                        <div className="cd-scan-placeholder">
                            <div className="cd-scan-placeholder-icon">🎯</div>
                            <p>Please <strong>select an event above</strong> to start scanning.</p>
                            <p className="cd-scan-placeholder-hint">You must choose which event you’re taking attendance for before using the scanner.</p>
                        </div>
                    ) : (
                        <>
                        {/* Three-mode tabs */}
                        <div className="cd-scan-mode-tabs">
                            <button className={`cd-scan-mode-tab ${scanMode === 'webcam' ? 'active' : ''}`} onClick={() => { setScanMode('webcam'); setScanResult(null); }}>
                                <span className="cd-scan-mode-icon">📷</span>
                                <span className="cd-scan-mode-label">Webcam</span>
                                <span className="cd-scan-mode-desc">Laptop / Phone camera</span>
                            </button>
                            <button className={`cd-scan-mode-tab ${scanMode === 'device' ? 'active' : ''}`} onClick={() => { setScanMode('device'); setScanResult(null); stopScanner(); setTimeout(() => deviceInputRef.current?.focus(), 100); }}>
                                <span className="cd-scan-mode-icon">🔌</span>
                                <span className="cd-scan-mode-label">Scanner Device</span>
                                <span className="cd-scan-mode-desc">USB / Bluetooth QR reader</span>
                            </button>
                            <button className={`cd-scan-mode-tab ${scanMode === 'manual' ? 'active' : ''}`} onClick={() => { setScanMode('manual'); setScanResult(null); stopScanner(); }}>
                                <span className="cd-scan-mode-icon">⌨️</span>
                                <span className="cd-scan-mode-label">Manual Entry</span>
                                <span className="cd-scan-mode-desc">Type Roll No / Token</span>
                            </button>
                        </div>

                        <div className="cd-scan-layout">
                            {/* Input area based on mode */}
                            <div className="cd-scanner-area">

                                {/* MODE 1: Webcam */}
                                {scanMode === 'webcam' && (
                                    <>
                                        <div id={scannerDivId} className="cd-scanner-preview" />
                                        <div className="cd-scanner-controls">
                                            {!scannerRunning ? (
                                                <button className="cd-scan-start-btn" onClick={startScanner}>📷 Start Camera</button>
                                            ) : (
                                                <button className="cd-scan-stop-btn" onClick={stopScanner}>⏹ Stop Camera</button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* MODE 2: External Scanner Device */}
                                {scanMode === 'device' && (
                                    <div className="cd-device-scan-area">
                                        <div className="cd-device-icon">🔌</div>
                                        <h3 className="cd-device-title">External QR Scanner Ready</h3>
                                        <p className="cd-device-desc">Connect your USB/Bluetooth QR scanner device. Point it at a student’s QR code — the data will be captured automatically below.</p>
                                        <div className="cd-device-input-wrap">
                                            <input
                                                ref={deviceInputRef}
                                                className="cd-device-input"
                                                placeholder="Scanner output will appear here..."
                                                value={deviceInput}
                                                onChange={e => setDeviceInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleDeviceScan(deviceInput);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <div className="cd-device-pulse"></div>
                                        </div>
                                        <p className="cd-device-hint">💡 The input field above is auto-focused. When your scanner reads a QR code, it types the data and presses Enter automatically.</p>
                                    </div>
                                )}

                                {/* MODE 3: Manual Entry */}
                                {scanMode === 'manual' && (
                                    <div className="cd-manual-entry-area">
                                        <div className="cd-manual-entry-icon">⌨️</div>
                                        <h3 className="cd-manual-entry-title">Manual Lookup</h3>
                                        <p className="cd-manual-entry-desc">Enter the student’s Roll Number or Registration Token ID to look up their details.</p>
                                        <div className="cd-manual-input-row">
                                            <input
                                                className="cd-manual-input"
                                                placeholder="e.g. CS22A1042 or token..."
                                                value={manualInput}
                                                onChange={e => setManualInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                                                autoFocus
                                            />
                                            <button className="cd-manual-search-btn" onClick={handleManualLookup}>🔍 Lookup</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scan result card */}
                            {scanResult && !scanResult.error && (
                                <div className={`cd-scan-result-card ${scanResult.isDuplicate ? 'cd-scan-duplicate' : scanResult.isRegistered ? '' : 'cd-scan-not-registered'}`}>

                                    {scanResult.isDuplicate && (
                                        <div className="cd-scan-duplicate-banner">
                                            ⚠️ ALREADY SCANNED — Duplication Detected!
                                        </div>
                                    )}
                                    {!scanResult.isRegistered && !scanResult.isDuplicate && (
                                        <div className="cd-scan-not-reg-banner">
                                            ❌ NOT REGISTERED for this event
                                        </div>
                                    )}
                                    {scanResult.isRegistered && !scanResult.isDuplicate && (
                                        <div className="cd-scan-verified-banner">
                                            ✅ Registration Verified
                                        </div>
                                    )}

                                    <div className="cd-scan-result-header">
                                        <div className="cd-scan-photo">
                                            {scanResult.photo
                                                ? <img src={scanResult.photo} alt={scanResult.student} />
                                                : <span className="cd-scan-photo-fallback">{scanResult.student?.charAt(0) || '?'}</span>
                                            }
                                        </div>
                                        <div className="cd-scan-info">
                                            <h3>{scanResult.student}</h3>
                                            <span className="cd-scan-roll">{scanResult.rollNo}</span>
                                        </div>
                                    </div>
                                    <div className="cd-scan-details-grid">
                                        <div className="cd-scan-detail"><span>🎫 Event</span><strong>{scanResult.event || events.find(e => e.id === scanEventId)?.name || 'N/A'}</strong></div>
                                        <div className="cd-scan-detail"><span>📅 Date</span><strong>{scanResult.date ? new Date(scanResult.date).toLocaleDateString('en-IN') : events.find(e => e.id === scanEventId)?.date || 'N/A'}</strong></div>
                                        <div className="cd-scan-detail"><span>📍 Venue</span><strong>{scanResult.venue || events.find(e => e.id === scanEventId)?.venue || 'N/A'}</strong></div>
                                        <div className="cd-scan-detail"><span>🕐 Registered</span><strong>{scanResult.registeredAt ? new Date(scanResult.registeredAt).toLocaleString('en-IN') : 'N/A'}</strong></div>
                                    </div>
                                    {scanResult.token && <div className="cd-scan-token">Token: {scanResult.token?.slice(0, 24)}…</div>}

                                    <div className="cd-scan-actions">
                                        {scanResult.isDuplicate ? (
                                            <div className="cd-scan-already-marked">✅ Already Marked Present — Duplicate Scan</div>
                                        ) : scanResult.isRegistered ? (
                                            <button className="cd-scan-mark-btn" onClick={() => handleMarkAttendance(scanEventId, scanResult.rollNo)}>
                                                ✅ Mark as PRESENT
                                            </button>
                                        ) : (
                                            <div className="cd-scan-error-msg">❌ Student is NOT registered for this event. Cannot mark attendance.</div>
                                        )}
                                        <button className="cd-scan-another-btn" onClick={() => {
                                            setScanResult(null);
                                            if (scanMode === 'webcam') startScanner();
                                            else if (scanMode === 'device') { setDeviceInput(''); setTimeout(() => deviceInputRef.current?.focus(), 100); }
                                            else setManualInput('');
                                        }}>
                                            🔄 Scan Next Student
                                        </button>
                                    </div>
                                </div>
                            )}

                            {scanResult && scanResult.error && (
                                <div className="cd-scan-result-card cd-scan-error">
                                    <h3>❌ Invalid QR Code</h3>
                                    <p>The scanned code is not a valid student registration QR.</p>
                                    <button className="cd-scan-another-btn" onClick={() => { setScanResult(null); if (scanMode === 'webcam') startScanner(); }}>🔄 Try Again</button>
                                </div>
                            )}

                            {!scanResult && scanMode === 'webcam' && !scannerRunning && (
                                <div className="cd-scan-placeholder">
                                    <div className="cd-scan-placeholder-icon">📱</div>
                                    <p>Click <strong>Start Camera</strong> to scan a student’s QR code.</p>
                                    <p className="cd-scan-placeholder-hint">Scanning for: <strong>{events.find(e => e.id === scanEventId)?.name}</strong></p>
                                </div>
                            )}
                        </div>
                        </>
                    )}
                </div>
            )}

            {/* ── UPCOMING EVENTS VIEW ── */}
            {activeSection === 'upcoming' && (
                <div className="cd-upcoming-section">
                    <h2 className="cd-section-title">🔔 Upcoming Events</h2>
                    <p className="cd-section-subtitle">Events color-coded by urgency: <span className="cd-legend-dot critical" /> ≤10 days &nbsp; <span className="cd-legend-dot warning" /> ≤15 days &nbsp; <span className="cd-legend-dot approaching" /> ≤30 days &nbsp; <span className="cd-legend-dot scheduled" /> &gt;30 days</p>
                    {upcomingEvents.length === 0 ? (
                        <div className="cd-table-empty"><div className="cd-table-empty-icon">📋</div><p>No upcoming events.</p></div>
                    ) : (
                        <div className="cd-upcoming-grid">
                            {upcomingEvents.map(ev => (
                                <div key={ev.id} className={`cd-upcoming-card ${ev.urgency}`}>
                                    <div className="cd-upcoming-card-header">
                                        <span className={`cd-upcoming-badge ${ev.urgency}`}>{ev.daysUntil === 0 ? 'Today' : `${ev.daysUntil} day${ev.daysUntil !== 1 ? 's' : ''}`}</span>
                                        <span className={`cd-upcoming-status ${ev.registrationOpen ? 'open' : 'closed'}`}>{ev.registrationOpen ? '🟢 Open' : '🔴 Closed'}</span>
                                    </div>
                                    <h3 className="cd-upcoming-name">{ev.name}</h3>
                                    <div className="cd-upcoming-meta">
                                        <span>📅 {ev.date}</span>
                                        <span>📍 {ev.venue || 'TBD'}</span>
                                        <span>🏷️ {ev.nature}</span>
                                    </div>
                                    <div className="cd-upcoming-meta">
                                        <span>👤 {ev.coordinator || ev.facultyName}</span>
                                        <span>👥 {ev.students.length} registered</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── CALENDAR VIEW ── */}
            {activeSection === 'calendar' && (
                <div className="cd-cal-page">
                    {/* Left: Event Filter */}
                    <div className="cd-cal-filter-panel">
                        <h3 className="cd-cal-filter-title">Event Filter</h3>
                        {[
                            { key: 'all', label: 'All Events', icon: '📋', count: events.length },
                            { key: 'upcoming', label: 'Upcoming', icon: '📅', count: events.filter(e => new Date(e.date) >= new Date()).length },
                            { key: 'modified', label: 'Modified', icon: '✏️', count: events.filter(e => e.modified).length },
                            { key: 'completed', label: 'Completed', icon: '🏆', count: events.filter(e => new Date(e.date) < new Date()).length },
                        ].map(f => (
                            <button key={f.key} className={`cd-cal-filter-item ${calFilter === f.key ? 'active' : ''}`} onClick={() => setCalFilter(f.key)}>
                                <span className="cd-cal-filter-icon">{f.icon}</span>
                                <span>{f.label}</span>
                                <span className={`cd-cal-filter-badge ${f.key}`}>{f.count}</span>
                            </button>
                        ))}
                        <div className="cd-cal-legend">
                            <span><span className="cd-legend-dot" style={{ background: '#4caf50' }} /> Events scheduled for future.</span>
                            <span><span className="cd-legend-dot" style={{ background: '#2196f3' }} /> Dates or venues have changed.</span>
                            <span><span className="cd-legend-dot" style={{ background: '#ff9800' }} /> Past events.</span>
                        </div>
                        <div className="cd-cal-admin-actions">
                            <h4>ADMIN ACTIONS</h4>
                            <button className="cd-cal-upload-btn" onClick={() => setShowUploadModal(true)}>☁️ Upload</button>
                            <button className="cd-cal-modify-btn" onClick={openModifyModal}>✏️ Modify Event</button>
                        </div>
                    </div>
                    {/* Right: Calendar Grid */}
                    <div className="cd-cal-grid-container">
                        <div className="cd-cal-nav">
                            <button className="cd-cal-nav-btn" onClick={prevMonth}>❮</button>
                            <h2 className="cd-cal-month-title">{MONTHS[calMonth]} {calYear}</h2>
                            <button className="cd-cal-nav-btn" onClick={nextMonth}>❯</button>
                        </div>
                        <div className="cd-cal-grid">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                                <div key={d} className={`cd-cal-day-header ${i === 5 ? 'fri' : ''}`}>{d}</div>
                            ))}
                            {calendarData.map((cell, i) => (
                                <div key={i} className={`cd-cal-cell ${cell ? '' : 'empty'}`}>
                                    {cell && (
                                        <>
                                            <span className="cd-cal-day-num">{cell.day}</span>
                                            {cell.events.map(ev => (
                                                <div key={ev.id} className="cd-cal-event-dot" title={ev.name} onClick={() => { setSelectedEventId(ev.id); setActiveSection('dashboard'); }}>
                                                    {ev.name.length > 12 ? ev.name.slice(0, 12) + '…' : ev.name}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── EVENTS DASHBOARD VIEW (existing) ── */}
            {activeSection === 'dashboard' && (<>
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

                    {/* ── CRITERIA BADGES ── */}
                    {selectedEvent && selectedEvent.criteria && (() => {
                        const c = selectedEvent.criteria;
                        const hasCriteria =
                            c.gender !== 'all' ||
                            c.years?.length > 0 ||
                            c.branches?.length > 0 ||
                            c.nationalities?.length > 0 ||
                            c.regions?.length > 0 ||
                            c.isPaid;
                        return hasCriteria ? (
                            <div className="cd-criteria-badges-row">
                                <span className="cd-criteria-badges-label">🛡️ Criteria:</span>
                                {c.gender !== 'all' && <span className="cd-cbadge cd-cbadge-gender">{c.gender === 'male' ? '♂ Boys Only' : '♀ Girls Only'}</span>}
                                {c.years?.length > 0 && <span className="cd-cbadge cd-cbadge-year">🎓 {c.years.join(', ')} Year</span>}
                                {c.branches?.length > 0 && <span className="cd-cbadge cd-cbadge-branch">🏷️ {c.branches.join(', ')}</span>}
                                {c.nationalities?.length > 0 && <span className="cd-cbadge cd-cbadge-nat">🌍 {c.nationalities.join(', ')}</span>}
                                {c.regions?.length > 0 && <span className="cd-cbadge cd-cbadge-reg">📍 {c.regions.join(', ')}</span>}
                                {c.isPaid && <span className="cd-cbadge cd-cbadge-paid">💰 ₹{c.fee} Entry Fee</span>}
                                <button
                                    className="cd-criteria-edit-link"
                                    onClick={toggleRegistration}
                                    title="Edit criteria (will close and re-open registration)"
                                >✏️ Edit Criteria</button>
                            </div>
                        ) : null;
                    })()}

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

                            <button className="cd-export-btn" onClick={handleGenerateCertificates}>
                                🎓 Generate Certificates
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
                                    {pageData.length > 0 ? pageData.map((row, i) => {
                                        const isAttended = selectedEvent && (attendanceMap[selectedEvent.id] || []).includes(row.rollNo);
                                        return (
                                        <tr key={row.id} style={row.isLive ? { background: 'rgba(34,197,94,0.06)', borderLeft: '3px solid #22c55e' } : {}}>
                                            {ALL_COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                                                <td key={col.key}>
                                                    {col.key === 'sno' ? (currentPage - 1) * ROWS_PER_PAGE + i + 1 :
                                                        col.key === 'attended' ? (
                                                            <span
                                                                className={`cd-attendance-badge ${isAttended ? 'present' : 'absent'}`}
                                                                onClick={() => {
                                                                    if (isAttended) {
                                                                        removeAttendance(selectedEvent.id, row.rollNo);
                                                                    } else {
                                                                        markAttendance(selectedEvent.id, row.rollNo);
                                                                    }
                                                                    setAttendanceMap(getAttendanceMap());
                                                                }}
                                                                style={{ cursor: 'pointer' }}
                                                                title={isAttended ? 'Click to mark absent' : 'Click to mark present'}
                                                            >
                                                                {isAttended ? '✅ Present' : '❌ Absent'}
                                                            </span>
                                                        ) :
                                                        col.key === 'isWinner' ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="cd-winner-checkbox"
                                                                    checked={!!row.isWinner}
                                                                    onChange={() => toggleWinner(row.id)}
                                                                    style={{ transform: 'scale(1.4)', margin: '0 5px' }}
                                                                />
                                                                <span style={{ fontSize: '11px', color: row.isWinner ? '#2e7d32' : 'transparent', fontWeight: 'bold' }}>WINNER</span>
                                                            </div>
                                                        ) : col.key === 'name' ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {row[col.key]}
                                                                {row.isLive && <span style={{ fontSize: '9px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '1px 6px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>🟢 Live</span>}
                                                            </span>
                                                        ) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    );}) : (
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
            </>)}
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
