import React from "react";
import { PullRequestPayload } from "../types";

interface PullRequestProps {
    request: PullRequestPayload;
}

export function MergedPullRequest(props: PullRequestProps) {
    const request = props.request;

    return (
        <a href={request.url}>
            <span
                className="github-event"
                data-type="pullrequest"
                title={`${request.changed_files_count} files changed`}
            >
                Merged #{request.number}
            </span>
        </a>
    );
}
