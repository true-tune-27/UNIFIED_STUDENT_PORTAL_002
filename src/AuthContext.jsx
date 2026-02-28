import { createContext, useContext, useState, useEffect } from 'react';
import { initUsers } from './auth';

const AuthContext = createContext(null);

const SESSION_KEY = 'aditya_session';

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    });

    useEffect(() => {
        initUsers();
    }, []);

    const login = (user) => {
        setCurrentUser(user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
