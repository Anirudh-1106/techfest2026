import { useState } from "react";
import { Link } from "react-router-dom";

function Registration() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        college: ""
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");

        const newErrors = {};

        if (formData.name.trim() === "") {
            newErrors.name = "Name is required.";
        }

        if (formData.email.trim() === "") {
            newErrors.email = "Email is required.";
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = "Enter a valid 10-digit mobile number.";
        }

        if (formData.college.trim() === "") {
            newErrors.college = "College name is required.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    setServerError(data.message || "Registration failed.");
                    setLoading(false);
                    return;
                }

                setIsSubmitted(true);
                setLoading(false);
            } catch (err) {
                setServerError("Could not connect to backend server. Make sure port 5000 is running.");
                setLoading(false);
            }
        }
    }

    if (isSubmitted) {
        return (
            <main className="registration-page">
                <h1>Registration Successful!</h1>
                <p>
                    Your account has been created in the TechFest database.
                    Passwords are safely stored as scrambled bcrypt hashes.
                </p>
                <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                    <Link to="/login">
                        <button type="button">Go to Login</button>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSubmitted(false);
                            setFormData({
                                name: "",
                                email: "",
                                password: "",
                                mobile: "",
                                college: ""
                            });
                        }}
                    >
                        Register Another Participant
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="registration-page">
            <h1>User Registration</h1>

            {serverError && (
                <p className="error-msg" style={{ marginBottom: "20px" }}>
                    {serverError}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <p>{errors.name}</p>
                </div>

                <div>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <p>{errors.email}</p>
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                    />
                    <p>{errors.password}</p>
                </div>

                <div>
                    <label>Mobile Number</label>
                    <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                    <p>{errors.mobile}</p>
                </div>

                <div>
                    <label>College / Institution</label>
                    <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                    />
                    <p>{errors.college}</p>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Submit Registration"}
                </button>

                <p style={{ marginTop: "20px", color: "#555" }}>
                    Already registered? <Link to="/login" style={{ color: "#a85c27", fontWeight: "bold" }}>Login here</Link>
                </p>
            </form>
        </main>
    );
}

export default Registration;