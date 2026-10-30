import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../config";

function Cart() {
    const { cartItems } = useContext(CartContext);
    const { authHeaders, isLoggedIn, user } = useContext(AuthContext);

    const [dbRegistrations, setDbRegistrations] = useState([]);
    const [loadingDb, setLoadingDb] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            setLoadingDb(true);
            fetch(`${API_URL}/api/registrations/my`, {
                credentials: "include",
                headers: authHeaders
            })
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setDbRegistrations(data);
                    }
                    setLoadingDb(false);
                })
                .catch(() => setLoadingDb(false));
        }
    }, [isLoggedIn, authHeaders]);

    const totalFee = cartItems.reduce(
        function (total, event) {
            return total + (event.fee || 0);
        },
        0
    );

    return (
        <main className="events-page">
            <h1>Your Cart & Registrations</h1>

            {/* Current Session Cart */}
            <section style={{ marginBottom: "50px" }}>
                <h2>Current Cart Items</h2>
                {cartItems.length === 0 ? (
                    <p style={{ color: "#777" }}>Your cart is empty. Browse events to register.</p>
                ) : (
                    <>
                        <div className="event-list">
                            {cartItems.map(function (event, index) {
                                return (
                                    <div className="event-card" key={index}>
                                        <h3>{event.name}</h3>
                                        <p>Registration Fee: ₹{event.fee}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <h2 style={{ marginTop: "20px" }}>Total Fee: ₹{totalFee}</h2>
                    </>
                )}
            </section>

            {/* Database Registrations */}
            <section style={{ borderTop: "1px solid #ddd", paddingTop: "35px" }}>
                <h2>My Confirmed Registrations (from Database)</h2>

                {!isLoggedIn ? (
                    <p style={{ color: "#777" }}>
                        <Link to="/login" style={{ color: "#a85c27", fontWeight: "bold" }}>Login</Link> to view your confirmed registrations saved in MongoDB.
                    </p>
                ) : loadingDb ? (
                    <p>Loading confirmed registrations...</p>
                ) : dbRegistrations.length === 0 ? (
                    <p style={{ color: "#777" }}>No confirmed registrations found for {user?.name}. Register for an event on the Events page.</p>
                ) : (
                    <div className="event-list">
                        {dbRegistrations.map((reg) => (
                            <div className="event-card" key={reg._id}>
                                <h3>{reg.event?.name}</h3>
                                <p>Category: <strong>{reg.event?.category}</strong></p>
                                <p>Fee: ₹{reg.event?.fee}</p>
                                <p style={{ fontSize: "12px", color: "#888" }}>
                                    Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Cart;