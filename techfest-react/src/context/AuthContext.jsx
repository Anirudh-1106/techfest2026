import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
    }, []);

    const login = (tokenData, userData) => {
        setToken(tokenData);
        setUser(userData);
        localStorage.setItem("token", tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        }).catch(() => {});
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

