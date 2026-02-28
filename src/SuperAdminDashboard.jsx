import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFaculty, updateUserAdminRole } from './auth';
import { useAuth } from './AuthContext';
import './SuperAdminDashboard.css';
import logoEmblem from './assets/logo.png';

const ADMIN_ROLE_OPTIONS = ['None', 'Coordinator', 'HOD', 'Dean'];

const roleColors = {
    Coordinator: { bg: '#f0f9ff', color: '#115e59', border: '#80cbc4' },
    HOD: { bg: '#f1f5f9', color: '#0f172a', border: '#94a3b8' },
    Dean: { bg: '#fffbeb', color: '#e65100', border: '#ffcc80' },
    None: { bg: '#f5f5f5', color: '#94a3b8', border: '#e0e0e0' },
};

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [pendingRoles, setPendingRoles] = useState({});
    const [savedMsg, setSavedMsg] = useState('');

    useEffect(() => {
        const f = getAllFaculty();
        setFaculty(f);
        const init = {};
        f.forEach(u => { init[u.id] = u.adminRole || 'None'; });
        setPendingRoles(init);
    }, []);

    const handleRoleChange = (userId, newRole) => {
        setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
    };

    const handleSaveAll = () => {
        faculty.forEach(u => {
            const role = pendingRoles[u.id];
            updateUserAdminRole(u.id, role === 'None' ? null : role);
        });
        setSavedMsg('✓ Role assignments saved successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
        setFaculty(getAllFaculty());
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const counts = {
        total: faculty.length,
        coordinator: faculty.filter(f => f.adminRole === 'Coordinator').length,
        hod: faculty.filter(f => f.adminRole === 'HOD').length,
        dean: faculty.filter(f => f.adminRole === 'Dean').length,
    };

    return (
        <div className="sa-layout">
            {/* SIDEBAR */}
            <aside className="sa-sidebar">
                <div className="sa-sidebar-header">
                    <img src={logoEmblem} alt="Aditya" className="sa-sidebar-logo" />
                    <div>
                        <span className="sa-sidebar-title">Super Admin</span>
                        <span className="sa-sidebar-sub">Role Management</span>
                    </div>
                </div>
                <nav className="sa-nav">
                    <button className="sa-nav-item sa-nav-item--active">
                        <span className="sa-nav-icon">👥</span>
                        <span>Faculty Roles</span>
                    </button>
                </nav>
                <div className="sa-sidebar-footer">
                    <button className="sa-logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="sa-main">
                {/* Top bar */}
                <header className="sa-topbar">
                    <div>
                        <h1 className="sa-topbar-title">Role Assignment Panel</h1>
                        <p className="sa-topbar-sub">Assign administrative roles to faculty members</p>
                    </div>
                    <div className="sa-topbar-badge">🔐 Super Admin</div>
                </header>

                <div className="sa-content">
                    {/* Stats row */}
                    <div className="sa-stats-row">
                        {[
                            { label: 'Total Faculty', value: counts.total, icon: '👨‍🏫', color: '#0f172a' },
                            { label: 'Coordinators', value: counts.coordinator, icon: '🎯', color: '#0f766e' },
                            { label: 'HODs', value: counts.hod, icon: '🏛️', color: '#475569' },
                            { label: 'Deans', value: counts.dean, icon: '👑', color: '#d97706' },
                        ].map(s => (
                            <div key={s.label} className="sa-stat-card" style={{ borderTopColor: s.color }}>
                                <div className="sa-stat-icon">{s.icon}</div>
                                <div>
                                    <p className="sa-stat-value" style={{ color: s.color }}>{s.value}</p>
                                    <p className="sa-stat-label">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table card */}
                    <div className="sa-table-card">
                        <div className="sa-table-header">
                            <h2 className="sa-table-title">Faculty Members</h2>
                            <div className="sa-table-actions">
                                {savedMsg && <span className="sa-saved-msg">{savedMsg}</span>}
                                <button className="sa-save-btn" onClick={handleSaveAll}>
                                    💾 Save All Changes
                                </button>
                            </div>
                        </div>

                        <div className="sa-table-wrap">
                            <table className="sa-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                        <th>Email</th>
                                        <th>Current Role</th>
                                        <th>Assign Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faculty.map(u => {
                                        const pending = pendingRoles[u.id] || 'None';
                                        const rc = roleColors[pending] || roleColors.None;
                                        return (
                                            <tr key={u.id}>
                                                <td className="sa-id-cell">{u.id}</td>
                                                <td className="sa-name-cell">
                                                    <div className="sa-faculty-avatar">{u.name[0]}</div>
                                                    {u.name}
                                                </td>
                                                <td>{u.dept}</td>
                                                <td>{u.designation}</td>
                                                <td className="sa-email-cell">{u.email}</td>
                                                <td>
                                                    <span
                                                        className="sa-role-badge"
                                                        style={{ background: rc.bg, color: rc.color, border: `1.5px solid ${rc.border}` }}
                                                    >
                                                        {u.adminRole || 'Faculty Only'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        className="sa-role-select"
                                                        value={pending}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                    >
                                                        {ADMIN_ROLE_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
