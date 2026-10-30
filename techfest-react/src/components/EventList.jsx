import EventCard from "./EventCard";

function EventList({ events, onEventRegistered }) {
    return (
        <div className="event-list">
            {events.map(function (event) {
                return (
                    <EventCard
                        key={event._id || event.id}
                        id={event._id || event.id}
                        name={event.name}
                        category={event.category}
                        fee={event.fee}
                        seats={event.seats}
                        date={event.date}
                        onRegistered={onEventRegistered}
                    />
                );
            })}
        </div>
    );
}

export default EventList;