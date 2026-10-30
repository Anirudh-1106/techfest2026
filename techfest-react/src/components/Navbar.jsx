import { Link } from "react-router-dom";
import { useContext } from "react";

import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { cartItems } = useContext(CartContext);
    const { user, isLoggedIn, logout } = useContext(AuthContext);

    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Cart ({cartItems.length})</Link>

            {isLoggedIn ? (
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ color: "#d88a4f", fontSize: "14px", fontWeight: "600" }}>
                        👤 {user?.name} {user?.role === "admin" && "(Admin)"}
                    </span>
                    <button
                        onClick={logout}
                        style={{ padding: "6px 14px", fontSize: "13px" }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            )}

            <button onClick={toggleTheme}>
                {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
        </nav>
    );
}

export default Navbar;