import React from "react";
import { pluralize } from "../plurals";
import {
    Group,
    PrivateGroup,
    PublicGroup,
    isPublicGroup,
    isPrivateGroup,
} from "./types";
import {
    Commits,
    CreateEvents,
    IssueEvents,
    MergedPullRequests,
} from "./events";
import { WikiEvents } from "./events/wiki";
import { formatDate } from "../util";
import { TextWithIcon } from "../components/text-with-icon";

export function EventGroup(group: Group) {
    if (isPublicGroup(group)) {
        return <PublicEventGroup {...group} />;
    } else if (isPrivateGroup(group)) {
        return <PrivateEventGroup {...group} />;
    } else {
        throw `Unexpected group type: ${group}`;
    }
}

function PublicEventGroup(group: PublicGroup) {
    const formattedDate = formatDate(group.timestamp);
    const repo = group.repository;

    return (
        <div className="github-group">
            <div className="github-group-header">
                <div className="github-repository-name">
                    <a href={repo.url}>{repo.name}</a>
                </div>
                <time dateTime={group.timestamp.toISOString()}>
                    {formattedDate}
                </time>
            </div>

            <div className="github-event-badges">
                <IssueEvents events={group.issueEvents} />
                <MergedPullRequests events={group.pullEvents} />
            </div>

            <CreateEvents events={group.createEvents} />
            <WikiEvents edits={group.wikiEditEvents} />
            <Commits commits={group.pushEvents} />
        </div>
    );
}

function PrivateEventGroup(group: PrivateGroup) {
    const count = group.events.length;
    return (
        <div className="github-group">
            <div className="private">
                <TextWithIcon
                    icon="lock"
                    text={`${count} ${pluralize(
                        "event",
                        count
                    )} in private repositories.`}
                />
            </div>
        </div>
    );
}
