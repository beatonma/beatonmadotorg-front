import React from "react";
import { CreateEventPayload } from "../types";

interface CreateEventProps {
    event: CreateEventPayload;
}

export function CreateEvent(props: CreateEventProps) {
    const event = props.event;
    return (
        <div className="github-event" data-type="create">
            New {event.type}: <code>{event.ref}</code>
        </div>
    );
}
