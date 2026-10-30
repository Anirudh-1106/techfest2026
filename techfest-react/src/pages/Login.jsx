import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid credentials");
                setLoading(false);
                return;
            }

            login(data.token, { name: data.name, role: data.role });
            navigate("/events");
        } catch (err) {
            setError("Could not connect to server. Ensure backend is running.");
            setLoading(false);
        }
    }

    return (
        <main className="registration-page">
            <h1>User Login</h1>
            <p style={{ marginBottom: "30px", color: "#666" }}>
                Login to register for events and manage your TechFest 2026 activities.
            </p>

            <form onSubmit={handleSubmit}>
                {error && <p className="error-msg" style={{ marginBottom: "20px" }}>{error}</p>}

                <div>
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        placeholder="e.g. student@techfest.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p style={{ marginTop: "20px", color: "#555" }}>
                    Don't have an account? <Link to="/register" style={{ color: "#a85c27", fontWeight: "bold" }}>Register here</Link>
                </p>
            </form>
        </main>
    );
}

export default Login;

