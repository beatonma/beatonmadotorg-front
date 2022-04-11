import React from "react";
import { IssueEventPayload } from "../types";

interface IssueEventProps {
    event: IssueEventPayload;
}

export function IssueEvent(props: IssueEventProps) {
    const event = props.event;

    return (
        <span className="github-event" data-type="issues">
            Closed <a href={event.url}>#{event.number}</a>
        </span>
    );
}
