import { useState, useEffect } from "react";

function Contact() {
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [feedbacks, setFeedbacks] = useState([
        {
            _id: "demo-1",
            name: "John Doe",
            comment: "TechFest 2026 website is sleek and responsive!",
            createdAt: new Date().toISOString()
        }
    ]);
    const [statusMsg, setStatusMsg] = useState("");
    const [isVulnerableMode, setIsVulnerableMode] = useState(false);

    // Fetch live feedback from backend
    useEffect(() => {
        fetch("http://localhost:5000/api/feedback")
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setFeedbacks(data);
                }
            })
            .catch(() => {
                // If backend not reachable, keep default feedback list
            });
    }, []);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setStatusMsg("Please enter feedback before submitting.");
            return;
        }

        const newFeedback = {
            name: name.trim() || "Anonymous",
            comment: comment.trim()
        };

        try {
            const res = await fetch("http://localhost:5000/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newFeedback)
            });

            if (res.ok) {
                const saved = await res.json();
                setFeedbacks([saved, ...feedbacks]);
                setStatusMsg("Feedback submitted successfully!");
            } else {
                // Fallback to local state if backend validation triggers
                setFeedbacks([{ _id: Date.now().toString(), ...newFeedback, createdAt: new Date().toISOString() }, ...feedbacks]);
                setStatusMsg("Feedback added locally.");
            }
        } catch (err) {
            // Local fallback
            setFeedbacks([{ _id: Date.now().toString(), ...newFeedback, createdAt: new Date().toISOString() }, ...feedbacks]);
            setStatusMsg("Feedback added locally (offline mode).");
        }

        setName("");
        setComment("");
    };

    return (
        <main className="contact-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "30px 20px" }}>
            <h1>Contact Us & Event Feedback</h1>
            <p style={{ color: "#666", marginBottom: "25px" }}>
                Have questions or feedback about TechFest 2026? Get in touch with our organizing team.
            </p>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "35px" }}>
                <div style={{ background: "#f8f9fa", padding: "18px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                    <h3 style={{ marginTop: 0 }}>Contact Details</h3>
                    <p><strong>Email:</strong> techfest2026@example.com</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Location:</strong> TechFest 2026 Campus</p>
                </div>
                <div style={{ background: "#f8f9fa", padding: "18px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                    <h3 style={{ marginTop: 0 }}>Event Support</h3>
                    <p>Contact the TechFest team for questions about event schedules, team guidelines, or campus access.</p>
                </div>
            </section>

            {/* OWASP XSS Demonstration Section */}
            <section style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "10px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "15px", gap: "10px" }}>
                    <h2 style={{ margin: 0, fontSize: "1.3rem" }}>💬 Participant Feedback Box</h2>
                    
                    {/* Security Toggle for Lab Demonstration */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: isVulnerableMode ? "#d9534f" : "#28a745" }}>
                            {isVulnerableMode ? "⚠️ Mode: Vulnerable (Unsafe HTML Render)" : "🛡️ Mode: Protected (Plain Text Escaped + Helmet)"}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsVulnerableMode(!isVulnerableMode)}
                            style={{
                                padding: "5px 12px",
                                fontSize: "0.8rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                cursor: "pointer",
                                background: isVulnerableMode ? "#f8d7da" : "#d4edda",
                                color: isVulnerableMode ? "#721c24" : "#155724"
                            }}
                            title="Toggle between vulnerable HTML rendering and secure text escaping for Experiment 5 demonstration"
                        >
                            Switch to {isVulnerableMode ? "Protected" : "Vulnerable"}
                        </button>
                    </div>
                </div>

                <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
                    Try submitting an XSS test payload such as <code>&lt;img src=x onerror=&quot;alert('hi')&quot;&gt;</code> or <code>&lt;script&gt;alert('hi')&lt;/script&gt;</code> to test the security defense.
                </p>

                {statusMsg && (
                    <div style={{ padding: "8px 12px", background: "#e8f4fd", color: "#0c5460", borderRadius: "5px", marginBottom: "15px", fontSize: "0.9rem" }}>
                        {statusMsg}
                    </div>
                )}

                <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "0.9rem" }}>Your Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Alex"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "0.9rem" }}>Feedback Message</label>
                        <textarea
                            id="feedback-box"
                            rows={3}
                            placeholder="Type feedback or XSS test payload here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            alignSelf: "flex-start",
                            padding: "10px 24px",
                            background: "#a85c27",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Submit Feedback
                    </button>
                </form>

                <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "8px", fontSize: "1.1rem" }}>Recent Feedback</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {feedbacks.map((item, idx) => (
                        <div
                            key={item._id || idx}
                            style={{
                                padding: "12px 16px",
                                background: "#fafafa",
                                border: "1px solid #eee",
                                borderRadius: "6px"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <strong style={{ color: "#333" }}>{item.name}</strong>
                                <small style={{ color: "#888" }}>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                </small>
                            </div>

                            {/* Vulnerable vs Protected Rendering Demonstration */}
                            {isVulnerableMode ? (
                                <div
                                    className="vulnerable-comment"
                                    dangerouslySetInnerHTML={{ __html: item.comment }}
                                    style={{ color: "#d9534f" }}
                                />
                            ) : (
                                <p className="safe-comment" style={{ margin: 0, color: "#444", wordBreak: "break-word" }}>
                                    {item.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Contact;