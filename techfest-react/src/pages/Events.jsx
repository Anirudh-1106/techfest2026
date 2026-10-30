import { useState, useEffect } from "react";
import EventList from "../components/EventList";
import { API_URL } from "../config";

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const fetchEvents = () => {
        setLoading(true);
        fetch(`${API_URL}/api/events`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch events from backend");
                }
                return res.json();
            })
            .then((data) => {
                setEvents(data);
                setLoading(false);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Could not connect to the events server");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(function (event) {
        const matchesSearch =
            (event.name || "")
                .toLowerCase()
                .includes(searchText.toLowerCase());

        const matchesCategory =
            selectedCategory === "" ||
            event.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="events-page">
            <h1>TechFest Events</h1>
            <p style={{ marginBottom: "25px", color: "#666" }}>
                Live events powered by the MongoDB backend
            </p>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchText}
                    onChange={function (event) {
                        setSearchText(event.target.value);
                    }}
                />

                <select
                    value={selectedCategory}
                    onChange={function (event) {
                        setSelectedCategory(event.target.value);
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                </select>
            </div>

            {loading && (
                <p className="loading-msg">Loading events from server...</p>
            )}

            {error && (
                <div style={{ marginTop: "20px" }}>
                    <p className="error-msg">{error}</p>
                    <button
                        onClick={fetchEvents}
                        style={{ marginTop: "10px" }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {!loading && !error && filteredEvents.length === 0 && (
                <p style={{ marginTop: "30px", color: "#777" }}>
                    No events match your criteria.
                </p>
            )}

            {!loading && !error && filteredEvents.length > 0 && (
                <EventList events={filteredEvents} onEventRegistered={fetchEvents} />
            )}
        </main>
    );
}

export default Events;