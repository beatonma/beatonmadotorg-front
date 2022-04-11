import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { LoadingSpinner } from "../components";
import { loadJson } from "../util";
import { EventGroup } from "./group";
import {
    Event,
    PublicEvent,
    Group,
    isPrivateEvent,
    PublicGroup,
    Commit,
    Events,
    IssueEventPayload,
    PullRequestPayload,
    ReleasePayload,
    SimpleEvent,
    CreateEventPayload,
    WikiEdit,
} from "./types";

const URL = "/api/github-events/";
const CONTAINER = "#github_recent";

export function GithubEventsApp(dom = document) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        ReactDOM.render(<GithubEvents />, container);
    }
}

function GithubEvents() {
    const [groups, setGroups] = useState(null);

    useEffect(() => {
        loadJson(URL)
            .then(data => data.events)
            .then(groupEvents)
            .then(setGroups);
    }, []);

    if (groups == null) {
        return <LoadingSpinner />;
    } else {
        return (
            <>
                <a href="https://github.com/beatonma">
                    <h3>github/beatonma</h3>
                </a>
                <div className="github-events">
                    {groups.map((group: Group, index: number) => (
                        <EventGroup key={index} {...group} />
                    ))}
                </div>
            </>
        );
    }
}

export function groupEvents(events: Event[]): Group[] {
    const groups: Group[] = [];
    let currentGroup: Event[] = [];
    let isPrivate: boolean = null;
    let previousRepoName: string = null;

    function saveGroup() {
        if (currentGroup.length > 0) {
            if (isPrivate) {
                groups.push({ events: currentGroup });
            } else {
                const compressed = createPublicGroup(
                    currentGroup as PublicEvent[]
                );
                if (compressed) {
                    groups.push(compressed);
                }
            }
        }
        currentGroup = [];
        previousRepoName = null;
    }

    events.forEach((event: Event) => {
        if (isPrivateEvent(event)) {
            if (isPrivate === false) {
                // Previous event was public, this one is private.
                saveGroup();
            }
            isPrivate = true;
            currentGroup.push(event);
        } else {
            const repoName = (event as PublicEvent).repository.name;
            if (isPrivate === true) {
                // Previous event was private, this one is public.
                saveGroup();
            }
            if (previousRepoName != null && previousRepoName != repoName) {
                // This event belongs to a different repository from the previous one.
                saveGroup();
            }
            previousRepoName = repoName;
            isPrivate = false;
            currentGroup.push(event);
        }
    });
    saveGroup();

    return groups;
}

function createPublicGroup(events: PublicEvent[]): PublicGroup {
    const repo = events[0].repository;
    let compressedEvents: SimpleEvent[] = [];

    events.forEach(event => {
        switch (event.type) {
            case Events.Push:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as Commit[],
                });
                break;

            case Events.Create:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as CreateEventPayload,
                });
                break;

            case Events.Issue:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as IssueEventPayload,
                });
                break;

            case Events.PullRequest:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as PullRequestPayload,
                });
                break;

            case Events.Release:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as ReleasePayload,
                });
                break;

            case Events.Wiki:
                compressedEvents.push({
                    type: event.type,
                    payload: event.payload as WikiEdit[],
                });
                break;

            default:
                throw `Unexpected event.type: ${event.type}`;
        }
    });

    if (compressedEvents.length == 0) return null;
    else {
        return {
            repository: repo,
            events: compressedEvents,
        };
    }
}
