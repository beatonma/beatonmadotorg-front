import React from "react";
import { PullRequestPayload } from "../types";
import { Badge } from "./badge";

interface PullRequestsProps {
    events: PullRequestPayload[];
}
export function MergedPullRequests(props: PullRequestsProps) {
    return (
        <>
            {props.events.map((event, index) => (
                <MergedPullRequest key={index} request={event} />
            ))}
        </>
    );
}

interface PullProps {
    request: PullRequestPayload;
}
function MergedPullRequest(props: PullProps) {
    const request = props.request;

    return (
        <Badge
            className="merge"
            url={request.url}
            icon="merge"
            issue={request.number}
            title={`Merged #${request.number}`}
        />
    );
}
