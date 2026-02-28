import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResearchDashboard.css';
import { useAuth } from './AuthContext';
import logoEmblem from './assets/logo.png';

/* ── Sidebar main nav ── */
const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teaching', label: 'Teaching', icon: '📘' },
    { id: 'research', label: 'Research', icon: '🔬', expandable: true },
    { id: 'expertise', label: 'Expertise\n/Value Addition', icon: '📈' },
    { id: 'admin', label: 'Administration', icon: '🏛️' },
    { id: 'interpersonal', label: 'Interpersonal', icon: '👥' },
];

/* ── Research sub-nav ── */
const researchSubItems = [
    { id: 'paper-publication', label: 'Paper Publication', icon: '📄' },
    { id: 'phd-scholars', label: 'Guiding Ph.D Scholars', icon: '🎓' },
    { id: 'books-chapters', label: 'Books / Chapters / Conference', icon: '📚' },
    { id: 'patents', label: 'Patents', icon: '🏅' },
    { id: 'novel-products', label: 'Novel Products / Technology', icon: '💡' },
    { id: 'project-consultancy', label: 'Project Consultancy', icon: '📋' },
    { id: 'scopus-citations', label: 'Scopus citations score', icon: '🔴' },
];

/* ══════════════════════════════════════════════════════════════
   2.1 Paper Publication
   ══════════════════════════════════════════════════════════════ */
const journalCategories = [
    'Select',
    'IEEE / ASME / ASCE / ACM / FT-50 / Scopus Top-10%',
    'SCIE and Scopus (Q1/Q2)',
    'SCIE / Scopus (Q1/Q2)',
    'Scopus (Q3/Q4) / ESCI',
];

function PaperPublication({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, articleDetails: '', category: 'Select', jcrImpactFactor: '', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'category') {
            const pts = val.includes('Top-10%') ? 25 : val.includes('SCIE and Scopus') ? 20 : val.includes('SCIE / Scopus') ? 15 : val.includes('ESCI') ? 10 : 0;
            updated[i].points = pts;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">📄</span>Research – Paper Publication</h2>
            <div className="rd-info-box">
                <h4>2.1 Paper publication:</h4>
                <p>IEEE / ASME / ASCE / ACM / FT-50 / Scopus Top-10% - 25 Points + IF</p>
                <p>SCIE and Scopus (Q1/Q2) - 20 Points + IF</p>
                <p>SCIE / Scopus (Q1/Q2) - 15 Points + IF</p>
                <p>Scopus (Q3/Q4) / ESCI - 10 Points + IF</p>
                <em>(IF – JCR 2025 impact factor will be considered for points)</em>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Article details in IEEE format</th>
                                <th>Category of the Journal</th>
                                <th>JCR Impact Factor</th>
                                <th>Upload PDF</th>
                                <th>Points claimed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><textarea className="rd-textarea" placeholder="Enter article details" value={row.articleDetails} onChange={e => update(i, 'articleDetails', e.target.value)} /></td>
                                    <td>
                                        <select className="rd-select" value={row.category} onChange={e => update(i, 'category', e.target.value)}>
                                            {journalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td><input className="rd-input" type="text" value={row.jcrImpactFactor} onChange={e => update(i, 'jcrImpactFactor', e.target.value)} /></td>
                                    <td><button className="rd-upload-btn" type="button"><span className="rd-upload-icon">📎</span> Upload</button></td>
                                    <td><span className="rd-points">{row.points.toFixed(2)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Paper Publication')}>💾 SAVE</button></div>
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points : {totalPoints.toFixed(2)}</div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.2 Guiding Ph.D Scholars
   ══════════════════════════════════════════════════════════════ */
function GuidingPhDScholars({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, name: '', university: '', monthYear: '', status: 'Select', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'status') {
            updated[i].points = val === 'Awarded' ? 20 : val === 'Pursuing' ? 2 : 0;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">🎓</span>2.2 Guiding Ph.D Scholars</h2>
            <div className="rd-info-box">
                <h4>2.2 Guiding Ph.D Scholars:</h4>
                <p>Pursuing – 2 Points</p>
                <p>Awarded – 20 Points</p>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name of the Research Scholar (FT/PT)</th>
                                <th>University</th>
                                <th>Month & Year of Admission / Award</th>
                                <th>Pursuing / Awarded</th>
                                <th>Upload PDF</th>
                                <th>Points claimed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><input className="rd-input" type="text" value={row.name} onChange={e => update(i, 'name', e.target.value)} /></td>
                                    <td><input className="rd-input" type="text" value={row.university} onChange={e => update(i, 'university', e.target.value)} /></td>
                                    <td><input className="rd-input" type="text" value={row.monthYear} onChange={e => update(i, 'monthYear', e.target.value)} /></td>
                                    <td>
                                        <select className="rd-select" value={row.status} onChange={e => update(i, 'status', e.target.value)}>
                                            <option value="Select">Select</option>
                                            <option value="Pursuing">Pursuing</option>
                                            <option value="Awarded">Awarded</option>
                                        </select>
                                    </td>
                                    <td><button className="rd-upload-btn" type="button"><span className="rd-upload-icon">📎</span> Upload</button></td>
                                    <td><span className="rd-points">{row.points}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Guiding Ph.D Scholars')}>💾 SAVE</button></div>
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points : {totalPoints}</div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.3 Books / Chapters / Conference Proceedings
   ══════════════════════════════════════════════════════════════ */
const bookCategories = ['Select', 'ISBN Book', 'ISBN Book Chapter', 'Scopus Conference Proceedings'];

function BooksChaptersConference({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, details: '', category: 'Select', publisher: '', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'category') {
            updated[i].points = val === 'ISBN Book' ? 10 : val === 'ISBN Book Chapter' ? 5 : val === 'Scopus Conference Proceedings' ? 5 : 0;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">📚</span>2.3 Books / Chapters / Conference Proceedings</h2>
            <div className="rd-info-box">
                <h4>2.3 Books / Chapters / Scopus Conference Proceedings</h4>
                <p>ISBN Book – 10 Points</p>
                <p>ISBN Book Chapter – 5 Points</p>
                <p>Scopus Conference Proceedings – 5 Points</p>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Details of Books / Chapter / Conference Proceedings published along with ISBN / ISSN number</th>
                                <th>Category (Book / Chapter / Proceedings)</th>
                                <th>Publisher</th>
                                <th>Upload PDF</th>
                                <th>Points claimed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><textarea className="rd-textarea" value={row.details} onChange={e => update(i, 'details', e.target.value)} /></td>
                                    <td>
                                        <select className="rd-select" value={row.category} onChange={e => update(i, 'category', e.target.value)}>
                                            {bookCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td><input className="rd-input" type="text" value={row.publisher} onChange={e => update(i, 'publisher', e.target.value)} /></td>
                                    <td><button className="rd-upload-btn" type="button"><span className="rd-upload-icon">📎</span> Upload</button></td>
                                    <td><span className="rd-points">{row.points}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Books / Chapters / Conference')}>💾 SAVE</button></div>
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points (Max: 10) : {totalPoints}</div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.4 Patents Published / Granted
   ══════════════════════════════════════════════════════════════ */
function PatentsPublished({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, title: '', country: '', status: '', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'status') {
            updated[i].points = val === 'Granted' ? 20 : val === 'Published' ? 5 : 0;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">🏅</span>2.4 Patents Published / Granted</h2>
            <div className="rd-info-box">
                <h4>2.4 Patents Published / Granted</h4>
                <p>(Published – 5 points, Granted – 20 points)</p>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Patent Title along with Number and Date</th>
                                <th>Patent filed Country</th>
                                <th>Published / Granted</th>
                                <th>Upload PDF</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><input className="rd-input" type="text" placeholder="Enter Patent Title" value={row.title} onChange={e => update(i, 'title', e.target.value)} /></td>
                                    <td><input className="rd-input" type="text" placeholder="Enter Country" value={row.country} onChange={e => update(i, 'country', e.target.value)} /></td>
                                    <td>
                                        <select className="rd-select" value={row.status} onChange={e => update(i, 'status', e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="Published">Published</option>
                                            <option value="Granted">Granted</option>
                                        </select>
                                    </td>
                                    <td><button className="rd-upload-btn" type="button"><span className="rd-upload-icon">📎</span> Upload</button></td>
                                    <td><span className="rd-points">{row.points}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Patents Published / Granted')}>💾 SAVE</button></div>
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points : {totalPoints}</div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.5 Novel Products / Technology
   ══════════════════════════════════════════════════════════════ */
function NovelProducts({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, details: '', status: '', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'status') {
            updated[i].points = val === 'Developed' ? 10 : val === 'Implemented' ? 15 : 0;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">💡</span>2.5 Novel products / Technology</h2>
            <div className="rd-info-box">
                <h4>2.5 Novel products / Technology</h4>
                <p>(Select Developed / Implemented for automatic points)</p>
                <p>(For PI and Co-PIs)</p>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Details of the Novel Product / Technology</th>
                                <th>Developed / Implemented</th>
                                <th>Upload PDF</th>
                                <th>Points claimed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><input className="rd-input" type="text" placeholder="Enter details" value={row.details} onChange={e => update(i, 'details', e.target.value)} style={{ minWidth: 260 }} /></td>
                                    <td>
                                        <select className="rd-select" value={row.status} onChange={e => update(i, 'status', e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="Developed">Developed</option>
                                            <option value="Implemented">Implemented</option>
                                        </select>
                                    </td>
                                    <td><button className="rd-upload-btn" type="button"><span className="rd-upload-icon">📎</span> Upload</button></td>
                                    <td><span className="rd-points">{row.points}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Novel Products / Technology')}>💾 SAVE</button></div>
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points : {totalPoints}</div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.6 Project / Consultancy Proposals
   ══════════════════════════════════════════════════════════════ */
function ProjectConsultancy({ rows, setRows, onSave }) {
    const addRow = () => setRows(prev => [...prev, {
        sno: prev.length + 1, details: '', status: '', totalWorth: '', file: null, points: 0
    }]);
    const removeRow = () => { if (rows.length > 1) setRows(prev => prev.slice(0, -1)); };
    const update = (i, field, val) => {
        const updated = [...rows];
        updated[i] = { ...updated[i], [field]: val };
        if (field === 'status' || field === 'totalWorth') {
            const status = field === 'status' ? val : updated[i].status;
            const worth = field === 'totalWorth' ? Number(val) : Number(updated[i].totalWorth);
            if (status === 'Shortlisted') updated[i].points = 5;
            else if (status === 'Sanctioned') updated[i].points = (worth || 0) * 5;
            else updated[i].points = 0;
        }
        setRows(updated);
    };
    const totalPoints = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

    return (
        <>
            <h2 className="rd-page-title"><span className="rd-page-title-icon">📋</span>2.6 Project / Consultancy Proposals</h2>
            <div className="rd-info-box">
                <h4>2.6 Project / Consultancy Proposals:</h4>
                <p>Shortlisted – 5 points, Sanctioned – 5 points/Lakh</p>
                <em>(For PI and Co-PIs) (Other than AUS)</em>
            </div>
            <div className="rd-section-card">
                <div className="rd-table-wrap">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Details of Project / Consultancy</th>
                                <th>Funding Agency / Industry</th>
                                <th>Total Worth (Lakh)</th>
                                <th>Points Claimed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.sno}</td>
                                    <td><textarea className="rd-textarea" placeholder="Enter project details" value={row.details} onChange={e => update(i, 'details', e.target.value)} /></td>
                                    <td>
                                        <select className="rd-select" value={row.status} onChange={e => update(i, 'status', e.target.value)}>
                                            <option value="">Select Status</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Sanctioned">Sanctioned</option>
                                        </select>
                                    </td>
                                    <td><input className="rd-input" type="number" value={row.totalWorth} onChange={e => update(i, 'totalWorth', e.target.value)} /></td>
                                    <td><span className="rd-points">{(row.points || 0).toFixed(2)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="rd-actions">
                    <button className="rd-add-row-btn" onClick={addRow}>+ Add Row</button>
                    {rows.length > 1 && <button className="rd-remove-row-btn" onClick={removeRow}>− Remove Row</button>}
                </div>
                <div className="rd-assessment-bar">Self-Assessment Points : {totalPoints.toFixed(2)}</div>
                <div className="rd-actions" style={{ paddingTop: 0 }}>
                    <div className="rd-actions-right"><button className="rd-save-btn" onClick={() => onSave('Project / Consultancy Proposals')}>💾 SAVE</button></div>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   2.7 & 2.8 Scopus Score Details
   ══════════════════════════════════════════════════════════════ */
function calcHIndexPoints(h2024, h2025) {
    const diff = h2025 - h2024;
    if (diff <= 0) return 0;
    if (h2025 < 5) return 1;
    if (h2025 <= 10) return 2;
    return 4 * diff;
}

function ScopusCitations({ scopusData, setScopusData, onSave }) {
    const citationPoints = ((Number(scopusData.citationCount) || 0) * 0.2);
    const hIndexPoints = calcHIndexPoints(Number(scopusData.hIndex2024) || 0, Number(scopusData.hIndex2025) || 0);
    const totalScopus = citationPoints + hIndexPoints;

    const updateField = (field, val) => setScopusData(prev => ({ ...prev, [field]: val }));

    return (
        <>
            {/* Page header bar */}
            <div className="rd-scopus-header">
                <h2>Scopus Score Details</h2>
            </div>

            {/* 2.7 Citation Score */}
            <div className="rd-info-box" style={{ borderLeftColor: '#e87722', background: 'linear-gradient(135deg, #fffbeb, #ffe0b2)' }}>
                <h4 style={{ color: '#e65100' }}>2.7 Scopus Citation Score Points</h4>
                <p style={{ color: '#bf360c' }}>(0.2 point / citation in 2025)</p>
            </div>
            <div className="rd-section-card">
                <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                        <input
                            className="rd-input"
                            type="number"
                            placeholder="Enter Citation Count For Calendar Year"
                            value={scopusData.citationCount}
                            onChange={e => updateField('citationCount', e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#43a047', fontSize: 20 }}>✅</span>
                            <strong>{citationPoints.toFixed(2)}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2.8 h-index Score */}
            <div className="rd-info-box" style={{ borderLeftColor: '#e87722', background: 'linear-gradient(135deg, #fffbeb, #ffe0b2)', marginTop: 24 }}>
                <h4 style={{ color: '#e65100' }}>2.8 Scopus h-index Score Points</h4>
                <p style={{ color: '#bf360c' }}>({'<5 → 1pt | 5–10 → 2pt | >10 → 4pt per raise'})</p>
            </div>
            <div className="rd-section-card">
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        className="rd-input"
                        type="number"
                        placeholder="h-index in 2024"
                        value={scopusData.hIndex2024}
                        onChange={e => updateField('hIndex2024', e.target.value)}
                    />
                    <input
                        className="rd-input"
                        type="number"
                        placeholder="h-index in 2025"
                        value={scopusData.hIndex2025}
                        onChange={e => updateField('hIndex2025', e.target.value)}
                    />
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <span style={{ color: '#43a047', fontSize: 20 }}>✅</span>
                        <strong>Points: {hIndexPoints}</strong>
                    </div>
                </div>
            </div>

            {/* Scopus Total */}
            <div className="rd-scopus-total">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4 style={{ color: '#e65100', margin: '0 0 4px', fontSize: 15 }}>Scopus Total Points (2.7 + 2.8)</h4>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>Total: {totalScopus.toFixed(2)}</span>
                    </div>
                    <button className="rd-save-btn" onClick={() => onSave('Scopus Score Details')}>💾 SAVE</button>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   Main Research Dashboard
   ══════════════════════════════════════════════════════════════ */
export default function ResearchDashboard() {
    const [activeSubSection, setActiveSubSection] = useState('paper-publication');
    const [researchOpen, setResearchOpen] = useState(true);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    /* ── State for each section's rows ── */
    const [paperRows, setPaperRows] = useState([
        { sno: 1, articleDetails: '', category: 'Select', jcrImpactFactor: '', file: null, points: 0 },
    ]);
    const [phdRows, setPhdRows] = useState([
        { sno: 1, name: '', university: '', monthYear: '', status: 'Select', file: null, points: 0 },
    ]);
    const [bookRows, setBookRows] = useState([
        { sno: 1, details: '', category: 'Select', publisher: '', file: null, points: 0 },
    ]);
    const [patentRows, setPatentRows] = useState([
        { sno: 1, title: '', country: '', status: '', file: null, points: 0 },
    ]);
    const [novelRows, setNovelRows] = useState([
        { sno: 1, details: '', status: '', file: null, points: 0 },
    ]);
    const [consultancyRows, setConsultancyRows] = useState([
        { sno: 1, details: '', status: '', totalWorth: '', file: null, points: 0 },
    ]);
    const [scopusData, setScopusData] = useState({
        citationCount: '', hIndex2024: '', hIndex2025: '',
    });

    const handleLogout = () => { logout(); navigate('/'); };
    const handleSave = (sectionName) => alert(`${sectionName} saved successfully!`);

    const handleMainNav = (id) => {
        if (id === 'dashboard') navigate('/faculty-dashboard');
        else if (id === 'teaching') navigate('/teaching-dashboard');
        else if (id === 'research') setResearchOpen(prev => !prev);
        else if (id === 'expertise') navigate('/expertise-dashboard');
    };

    /* ── Render active sub-section ── */
    const renderSection = () => {
        switch (activeSubSection) {
            case 'paper-publication':
                return <PaperPublication rows={paperRows} setRows={setPaperRows} onSave={handleSave} />;
            case 'phd-scholars':
                return <GuidingPhDScholars rows={phdRows} setRows={setPhdRows} onSave={handleSave} />;
            case 'books-chapters':
                return <BooksChaptersConference rows={bookRows} setRows={setBookRows} onSave={handleSave} />;
            case 'patents':
                return <PatentsPublished rows={patentRows} setRows={setPatentRows} onSave={handleSave} />;
            case 'novel-products':
                return <NovelProducts rows={novelRows} setRows={setNovelRows} onSave={handleSave} />;
            case 'project-consultancy':
                return <ProjectConsultancy rows={consultancyRows} setRows={setConsultancyRows} onSave={handleSave} />;
            case 'scopus-citations':
                return <ScopusCitations scopusData={scopusData} setScopusData={setScopusData} onSave={handleSave} />;
            default:
                return <PaperPublication rows={paperRows} setRows={setPaperRows} onSave={handleSave} />;
        }
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
                    {mainNavItems.map((item) => (
                        <div key={item.id}>
                            <button
                                className={`fd-nav-item ${item.id === 'research' ? 'fd-nav-item--active' : ''}`}
                                onClick={() => handleMainNav(item.id)}
                            >
                                <span className="fd-nav-icon">{item.icon}</span>
                                <span className="fd-nav-label">{item.label}</span>
                                {item.expandable && (
                                    <span className={`fd-nav-arrow ${researchOpen ? 'fd-nav-arrow--open' : 'fd-nav-arrow--closed'}`}>▾</span>
                                )}
                            </button>

                            {/* Research sub-items */}
                            {item.id === 'research' && (
                                <div className={`fd-nav-sub ${researchOpen ? 'fd-nav-sub--open' : ''}`}>
                                    {researchSubItems.map((sub) => (
                                        <button
                                            key={sub.id}
                                            className={`fd-nav-sub-item ${activeSubSection === sub.id ? 'fd-nav-sub-item--active' : ''}`}
                                            onClick={() => setActiveSubSection(sub.id)}
                                        >
                                            <span className="fd-nav-sub-icon">{sub.icon}</span>
                                            {sub.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="fd-main">
                <header className="fd-topbar">
                    <h1 className="fd-topbar-title">Research Dashboard</h1>
                    <div className="fd-topbar-actions">
                        <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
                        <div className="fd-avatar" title={currentUser?.name}>
                            {currentUser?.name?.[0] || '👤'}
                        </div>
                    </div>
                </header>

                <div className="rd-content">
                    <div className="rd-section-badge">
                        SECTION 2 : Research (80 Points)
                    </div>
                    {renderSection()}
                </div>
            </main>
        </div>
    );
}
