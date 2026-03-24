/* ═══════════════════════════════════════════════════════════════
   db.js  –  Shared localStorage store (simulates MongoDB)
   
   Document shape mirrors a Mongo collection "registrations":
   {
     _id          : string  (unique token / UUID)
     studentId    : string
     eventId      : number
     studentName  : string
     rollNo       : string
     branch       : string
     year         : string
     phone        : string
     email        : string
     registeredAt : ISO string
     qrToken      : string  (same as _id, encoded in QR)
     isWinner     : boolean
   }
   ═══════════════════════════════════════════════════════════════ */

const LS_KEY = 'aditya_event_registrations_v1';

/** Generate a simple UUID-like token */
export function genToken() {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }) + '-' + Date.now().toString(36);
}

/** Load all registrations from localStorage */
export function getRegistrations() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return [];
}

/** Save a new student registration */
export function saveRegistration(studentProfile, event) {
    const regs = getRegistrations();
    // Prevent duplicate
    const exists = regs.find(r => r.studentId === studentProfile.rollNo && r.eventId === event.id);
    if (exists) return exists;

    const token = genToken();
    const doc = {
        _id: token,
        studentId: studentProfile.rollNo,
        eventId: event.id,
        studentName: studentProfile.name,
        rollNo: studentProfile.rollNo,
        branch: studentProfile.branch,
        year: studentProfile.year,
        phone: studentProfile.phone,
        email: studentProfile.email,
        registeredAt: new Date().toISOString(),
        qrToken: token,
        isWinner: false,
    };
    regs.push(doc);
    try { localStorage.setItem(LS_KEY, JSON.stringify(regs)); } catch (_) { }
    // Fire a storage event so the coordinator tab can react
    window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY }));
    return doc;
}

/** Remove a registration (withdraw) */
export function removeRegistration(studentId, eventId) {
    const regs = getRegistrations().filter(
        r => !(r.studentId === studentId && r.eventId === eventId)
    );
    try { localStorage.setItem(LS_KEY, JSON.stringify(regs)); } catch (_) { }
    window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY }));
}

/** Get all registrations for a specific event */
export function getEventRegistrations(eventId) {
    return getRegistrations().filter(r => r.eventId === eventId);
}

/** Get all registrations by a specific student */
export function getStudentRegistrations(studentId) {
    return getRegistrations().filter(r => r.studentId === studentId);
}

/** Check if a student is registered for an event */
export function isStudentRegistered(studentId, eventId) {
    return getRegistrations().some(r => r.studentId === studentId && r.eventId === eventId);
}

/* ═══════════════════════════════════════════════════════════════
   EVENT STATUS OVERRIDES
   Coordinators write here; Student Dashboard reads.
   Shape: { [eventId]: { registrationOpen: bool, criteria: {} } }
   ═══════════════════════════════════════════════════════════════ */
const LS_EVENT_KEY = 'aditya_event_statuses_v1';

export function getEventStatuses() {
    try {
        const raw = localStorage.getItem(LS_EVENT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function saveEventStatus(eventId, patch) {
    const all = getEventStatuses();
    all[eventId] = { ...(all[eventId] || {}), ...patch };
    try { localStorage.setItem(LS_EVENT_KEY, JSON.stringify(all)); } catch { }
    // notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: LS_EVENT_KEY }));
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM EVENTS
   Coordinators create events here; Student Dashboard reads.
   ═══════════════════════════════════════════════════════════════ */
const LS_CUSTOM_EVENTS_KEY = 'aditya_custom_events_v1';

export function getCustomEvents() {
    try {
        const raw = localStorage.getItem(LS_CUSTOM_EVENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function addCustomEvent(event) {
    const all = getCustomEvents();
    all.push(event);
    try { localStorage.setItem(LS_CUSTOM_EVENTS_KEY, JSON.stringify(all)); } catch { }
    // notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: LS_CUSTOM_EVENTS_KEY }));
}

/* ═══════════════════════════════════════════════════════════════
   DELETED EVENTS
   Coordinators delete events here; Student Dashboard hides them.
   ═══════════════════════════════════════════════════════════════ */
const LS_DELETED_EVENTS_KEY = 'aditya_deleted_events_v1';

export function getDeletedEvents() {
    try {
        const raw = localStorage.getItem(LS_DELETED_EVENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function addDeletedEvent(eventId) {
    const all = getDeletedEvents();
    if (!all.includes(eventId)) {
        all.push(eventId);
        try { localStorage.setItem(LS_DELETED_EVENTS_KEY, JSON.stringify(all)); } catch { }
        window.dispatchEvent(new StorageEvent('storage', { key: LS_DELETED_EVENTS_KEY }));
    }
}

/* ═══════════════════════════════════════════════════════════════
   ATTENDANCE TRACKING
   Coordinators mark attendance here after scanning QR.
   Shape: { [eventId]: [rollNo1, rollNo2, ...] }
   ═══════════════════════════════════════════════════════════════ */
const LS_ATTENDANCE_KEY = 'aditya_attendance_v1';

export function getAttendanceMap() {
    try {
        const raw = localStorage.getItem(LS_ATTENDANCE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function getAttendance(eventId) {
    const map = getAttendanceMap();
    return map[eventId] || [];
}

export function markAttendance(eventId, rollNo) {
    const map = getAttendanceMap();
    if (!map[eventId]) map[eventId] = [];
    if (!map[eventId].includes(rollNo)) {
        map[eventId].push(rollNo);
        try { localStorage.setItem(LS_ATTENDANCE_KEY, JSON.stringify(map)); } catch { }
        window.dispatchEvent(new StorageEvent('storage', { key: LS_ATTENDANCE_KEY }));
    }
}

export function removeAttendance(eventId, rollNo) {
    const map = getAttendanceMap();
    if (!map[eventId]) return;
    map[eventId] = map[eventId].filter(r => r !== rollNo);
    try { localStorage.setItem(LS_ATTENDANCE_KEY, JSON.stringify(map)); } catch { }
    window.dispatchEvent(new StorageEvent('storage', { key: LS_ATTENDANCE_KEY }));
}

