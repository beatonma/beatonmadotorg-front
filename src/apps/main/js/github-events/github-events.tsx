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
    Events,
    IssueEventPayload,
    PullRequestPayload,
    ReleasePayload,
    CreateEventPayload,
    PrivateEvent,
    isPublicEvent,
} from "./types";
import { Repository } from "./types/common";
import { PushPayload, WikiPayload } from "./types/payload";
import { LargeFeedItem } from "../components/feed-item";

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
            .then(filterEvents)
            .then(setGroups);
    }, []);

    if (groups == null) {
        return <LoadingSpinner />;
    } else {
        return (
            <LargeFeedItem
                title={
                    <a href="https://github.com/beatonma">github/beatonma</a>
                }
                parentID={CONTAINER}
            >
                <div className="github-events">
                    {groups.map((group: Group, index: number) => (
                        <EventGroup key={index} {...group} />
                    ))}
                </div>
            </LargeFeedItem>
        );
    }
}

export function filterEvents(events: Event[]): Group[] {
    const groups: Group[] = [];

    let previousEvent: Event = null;
    let previousTimestamp: Date = null;

    // Private events only
    let privateEvents: PrivateEvent[] = [];

    // Public events only
    let previousRepo: Repository = null;
    let createEvents: CreateEventPayload[] = [];
    let issueEvents: IssueEventPayload[] = [];
    let releaseEvents: ReleasePayload[] = [];
    let pullEvents: PullRequestPayload[] = [];
    let pushEvents: PushPayload = [];
    let wikiEditEvents: WikiPayload = [];

    function savePublicGroup() {
        groups.push({
            repository: previousRepo,
            timestamp: previousTimestamp,
            createEvents: createEvents,
            issueEvents: issueEvents,
            releaseEvents: releaseEvents,
            pullEvents: pullEvents,
            pushEvents: pushEvents,
            wikiEditEvents: wikiEditEvents,
        });

        createEvents = [];
        issueEvents = [];
        releaseEvents = [];
        pullEvents = [];
        pushEvents = [];
        wikiEditEvents = [];
        previousTimestamp = null;
    }

    function savePrivateGroup() {
        groups.push({
            timestamp: previousTimestamp,
            events: privateEvents,
        });
        privateEvents = [];
        previousTimestamp = null;
    }

    function handlePublicEvent(event: PublicEvent) {
        if (isPrivateEvent(previousEvent)) {
            // Save previous, start new group.
            savePrivateGroup();
        } else if (
            isPublicEvent(previousEvent) &&
            previousRepo?.id != event.repository?.id
        ) {
            savePublicGroup();
        }

        switch (event.type) {
            case Events.Create:
                createEvents.push(event.payload as CreateEventPayload);
                break;
            case Events.Issue:
                issueEvents.push(event.payload as IssueEventPayload);
                break;
            case Events.PullRequest:
                pullEvents.push(event.payload as PullRequestPayload);
                break;
            case Events.Release:
                releaseEvents.push(event.payload as ReleasePayload);
                break;

            case Events.Push:
                pushEvents = pushEvents.concat(event.payload as PushPayload);
                break;
            case Events.Wiki:
                wikiEditEvents = wikiEditEvents.concat(
                    event.payload as WikiPayload
                );
                break;
        }

        previousRepo = event.repository;
    }

    function handlePrivateEvent(event: PrivateEvent) {
        if (isPublicEvent(previousEvent)) {
            savePublicGroup();
        }

        privateEvents.push(event);
        previousRepo = null;
    }

    events.forEach(event => {
        if (isPublicEvent(event)) {
            handlePublicEvent(event);
        } else if (isPrivateEvent(event)) {
            handlePrivateEvent(event);
        } else {
            throw "Unexpected event appears to be neither PublicEvent nor PrivateEvent";
        }

        const timestamp = new Date(event.created_at);
        if (previousTimestamp == null || timestamp > previousTimestamp) {
            previousTimestamp = timestamp;
        }

        previousEvent = event;
    });

    if (isPublicEvent(previousEvent)) {
        savePublicGroup();
    } else {
        savePrivateGroup();
    }

    return groups;
}
