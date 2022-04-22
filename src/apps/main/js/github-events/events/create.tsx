import React from "react";
import { CreateEventPayload } from "../types";

interface CreateEventsProps {
    events: CreateEventPayload[];
}
export function CreateEvents(props: CreateEventsProps) {
    return (
        <>
            {props.events.map((event, index) => (
                <CreateEvent key={index} event={event} />
            ))}
        </>
    );
}

interface CreateProps {
    event: CreateEventPayload;
}
function CreateEvent(props: CreateProps) {
    const event = props.event;
    return (
        <div className="github-event" data-type="create">
            New {event.type}: <code>{event.ref}</code>
        </div>
    );
}
