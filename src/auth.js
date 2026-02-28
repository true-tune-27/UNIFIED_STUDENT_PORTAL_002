/* ═══════════════════════════════════════════════════════
   MOCK USER DATABASE + AUTH HELPERS
   Roles: Faculty | SuperAdmin
   AdminRoles: null | 'Coordinator' | 'HOD' | 'Dean'
   ═══════════════════════════════════════════════════════ */

const LS_KEY = 'aditya_users_v1';

/* ── Default users ── */
const DEFAULT_USERS = [
    {
        id: 'FAC001',
        email: 'faculty@aditya.edu',
        password: 'faculty123',
        name: 'Dr. T. Neelima',
        dept: 'CSE',
        designation: 'Associate Professor',
        phone: '+91 9963850771',
        role: 'Faculty',
        adminRole: null,
    },
    {
        id: 'FAC002',
        email: 'coord@aditya.edu',
        password: 'coord123',
        name: 'Dr. R. Kumar',
        dept: 'ECE',
        designation: 'Assistant Professor',
        phone: '+91 9876543210',
        role: 'Faculty',
        adminRole: 'Coordinator',
    },
    {
        id: 'FAC003',
        email: 'hod@aditya.edu',
        password: 'hod123',
        name: 'Dr. S. Patel',
        dept: 'IT',
        designation: 'Professor',
        phone: '+91 9988776655',
        role: 'Faculty',
        adminRole: 'HOD',
    },
    {
        id: 'FAC004',
        email: 'dean@aditya.edu',
        password: 'dean123',
        name: 'Dr. A. Sharma',
        dept: 'MECH',
        designation: 'Professor',
        phone: '+91 9998887776',
        role: 'Faculty',
        adminRole: 'Dean',
    },
    {
        id: 'ADM001',
        email: 'admin@aditya.edu',
        password: 'admin123',
        name: 'Super Admin',
        dept: 'Administration',
        designation: 'System Administrator',
        phone: '+91 9000000001',
        role: 'SuperAdmin',
        adminRole: null,
    },
];

/* ── Load users from localStorage (persists role assignments) ── */
function loadUsers() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return DEFAULT_USERS;
}

/* ── Save user list back to localStorage ── */
function saveUsers(users) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(users));
    } catch (_) { /* ignore */ }
}

/* ── Init users on first load ── */
export function initUsers() {
    if (!localStorage.getItem(LS_KEY)) {
        saveUsers(DEFAULT_USERS);
    }
}

/* ── Get user by credentials ── */
export function getUserByCredentials(email, password) {
    const users = loadUsers();
    return users.find(u => u.email === email && u.password === password) || null;
}

/* ── Get all faculty users (for super admin panel) ── */
export function getAllFaculty() {
    return loadUsers().filter(u => u.role === 'Faculty');
}

/* ── Update a user's adminRole ── */
export function updateUserAdminRole(userId, adminRole) {
    const users = loadUsers();
    const updated = users.map(u => u.id === userId ? { ...u, adminRole } : u);
    saveUsers(updated);
    return updated.find(u => u.id === userId);
}
