import { createContext, useState, useEffect, useMemo } from "react";
import { API_URL } from "../config";

export const AuthContext = createContext();

// The JWT lives in an httpOnly cookie set by the server, so it is never
// written to localStorage where an XSS script could read it.
// The copy kept here is in memory only (lost on refresh) and is used as a
// Bearer fallback for browsers that block cross-site cookies.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Restore the session from the cookie on page load
    useEffect(() => {
        fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.user) setUser(data.user);
            })
            .catch(() => {});
    }, []);

    const login = (tokenData, userData) => {
        setToken(tokenData);
        setUser(userData);
    };

    const logout = () => {
        fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include"
        }).catch(() => {});
        setToken(null);
        setUser(null);
    };

    const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

    return (
        <AuthContext.Provider value={{ user, token, authHeaders, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}
