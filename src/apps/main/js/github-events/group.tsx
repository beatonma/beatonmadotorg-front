import React from "react";
import { pluralize } from "../plurals";
import { formatDate } from "../util";
import { Commits } from "./events";
import { CreateEvent } from "./events/create";
import { IssueEvent } from "./events/issue";
import { MergedPullRequest } from "./events/pull-request";
import { WikiEvents } from "./events/wiki";
import {
    Group,
    PrivateGroup,
    PublicGroup,
    isPublicGroup,
    PublicEvent,
    Events,
    Commit,
    SimpleEvent,
    CreateEventPayload,
    IssueEventPayload,
    WikiEdit,
    PullRequestPayload,
    ReleasePayload,
} from "./types";
import { ReleaseEvent } from "./events/release";

export function EventGroup(group: Group) {
    if (isPublicGroup(group)) {
        return <PublicEventGroup {...group} />;
    } else {
        return <PrivateEventGroup {...(group as PrivateGroup)} />;
    }
}

function PublicEventGroup(group: PublicGroup) {
    const latestUpdate: string = ""; // getLatestUpdate(group);
    const formattedDate = ""; //formatDate(latestUpdate);
    const repo = group.repository;

    return (
        <div className="github-group">
            <div className="github-group-header">
                <div className="github-repository-name">
                    <a href={repo.url}>{repo.name}</a>
                </div>
                <time dateTime={latestUpdate}>{formattedDate}</time>
            </div>
            <EventsList events={group.events} />
            {/* <Commits commits={group.commits} /> */}
        </div>
    );
}

function PrivateEventGroup(group: PrivateGroup) {
    const count = group.events.length;
    return (
        <div className="github-group">
            <div className="private">
                {count} {pluralize("event", count)} in private repositories.
            </div>
        </div>
    );
}

// function getLatestUpdate(group: PrivateGroup | PublicGroup): string {
//     const dates = group.events.map(event => event.created_at);
//     dates.sort((a: any, b: any) => a - b);

//     return dates[0];
// }

interface EventsListProps {
    events: SimpleEvent[];
}
function EventsList(props: EventsListProps) {
    const events = props.events;

    return (
        <>
            {events.map((event, index) => {
                switch (event.type) {
                    case Events.Push:
                        return (
                            <Commits
                                key={index}
                                commits={event.payload as Commit[]}
                            />
                        );
                    case Events.Create:
                        return (
                            <CreateEvent
                                key={index}
                                event={event.payload as CreateEventPayload}
                            />
                        );
                    case Events.Issue:
                        return (
                            <IssueEvent
                                key={index}
                                event={event.payload as IssueEventPayload}
                            />
                        );
                    case Events.PullRequest:
                        return (
                            <MergedPullRequest
                                key={index}
                                request={event.payload as PullRequestPayload}
                            />
                        );

                    case Events.Release:
                        return (
                            <ReleaseEvent
                                key={index}
                                release={event.payload as ReleasePayload}
                            />
                        );

                    case Events.Wiki:
                        return (
                            <WikiEvents
                                key={index}
                                edits={event.payload as WikiEdit[]}
                            />
                        );
                    default:
                        throw `Unexpected event.type: ${event.type}`;
                }
            })}
        </>
    );
}
