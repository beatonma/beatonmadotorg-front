import React from "react";
import { IssueEventPayload } from "../types";
import { Badge } from "./badge";

interface IssueEventsProps {
    events: IssueEventPayload[];
}
export function IssueEvents(props: IssueEventsProps) {
    return (
        <>
            {props.events.map((event, index) => (
                <IssueEvent key={index} event={event} />
            ))}
        </>
    );
}

interface IssueProps {
    event: IssueEventPayload;
}
function IssueEvent(props: IssueProps) {
    const { url, number, ...rest } = props.event;

    return (
        <Badge
            className="issue"
            url={url}
            icon="done"
            issue={number}
            title={`Closed #${number}`}
            {...rest}
        />
    );
}
