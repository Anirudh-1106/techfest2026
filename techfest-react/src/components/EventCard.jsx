import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function EventCard({ id, name, fee, seats, onRegistered }) {
    const [seatsLeft, setSeatsLeft] = useState(seats);
    const [registering, setRegistering] = useState(false);
    const [msg, setMsg] = useState("");
    const [isError, setIsError] = useState(false);

    const { addToCart } = useContext(CartContext);
    const { token, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleRegister() {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        if (seatsLeft <= 0) return;

        setRegistering(true);
        setMsg("");
        setIsError(false);

        try {
            const response = await fetch("http://localhost:5000/api/registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ eventId: id })
            });

            const data = await response.json();

            if (!response.ok) {
                setMsg(data.message || "Registration failed");
                setIsError(true);
                setRegistering(false);
                return;
            }

            setSeatsLeft((prev) => Math.max(0, prev - 1));
            setMsg("✓ Registered successfully!");
            setIsError(false);

            addToCart({
                id: id,
                name: name,
                fee: fee
            });

            if (onRegistered) {
                onRegistered();
            }
        } catch (err) {
            setMsg("Error connecting to server");
            setIsError(true);
        } finally {
            setRegistering(false);
        }
    }

    return (
        <div className="event-card">
            <h3>{name}</h3>

            <p>Registration Fee: ₹{fee}</p>

            <p>Available Seats: <strong>{seatsLeft}</strong></p>

            {msg && (
                <p style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: isError ? "#b42318" : "#2e7d32",
                    margin: "8px 0"
                }}>
                    {msg}
                </p>
            )}

            {seatsLeft === 0 ? (
                <p style={{ color: "#b42318", fontWeight: "bold" }}>SOLD OUT</p>
            ) : (
                <button
                    onClick={handleRegister}
                    disabled={registering}
                >
                    {registering ? "Registering..." : (isLoggedIn ? "Register" : "Login to Register")}
                </button>
            )}
        </div>
    );
}

export default EventCard;