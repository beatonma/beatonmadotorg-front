import React, { useEffect, useState } from "react";
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
import { createRoot } from "react-dom/client";

const URL = "/api/github-events/";
const CONTAINER = "#github_recent";

export function GithubEventsApp(dom: Document | Element) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        const root = createRoot(dom.querySelector(CONTAINER));
        root.render(<GithubEvents />);
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
                // pushEvents = pushEvents.concat(event.payload as PushPayload);
                pushEvents = pushEvents.concat(
                    (event.payload as PushPayload).map(push => {
                        let msg = push.message
                            .replace(
                                /(https:\/\/[^\s]+\.[^\s]+)/g,
                                `<a href="$1">$1</a>`
                            ) // Linkify links
                            .replace(
                                /#(\d+)/g,
                                `<a href="${event.repository.url}/issues/$1/">#$1</a>`
                            ) // Linkify references to Github issues
                            .replace(/`([^\s]+)`/g, `<code>$1</code>`); // wrap text in `quotes` with code tags

                        if (msg.indexOf("\n\n") >= 0) {
                            // If msg has a title line, just use that.
                            msg = msg.split("\n\n")[0];
                        }

                        return {
                            sha: push.sha,
                            message: msg,
                            url: push.url,
                        };
                    })
                );

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
