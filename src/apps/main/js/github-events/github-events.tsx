import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { LoadingSpinner } from "../components/loading";
import { loadJson } from "../util";
import { EventGroup } from "./group";
import { Event, PublicEvent, Group, isPrivateEvent, getCommits } from "./types";

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
                <h3>github/beatonma</h3>
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

    function reset() {
        if (currentGroup.length > 0) {
            if (isPrivate) {
                groups.push({ events: currentGroup });
            } else {
                const repoUrl = (currentGroup[0] as PublicEvent).repository.url;
                const commits = currentGroup.reduce((acc, event) => {
                    return acc.concat(getCommits(event as PublicEvent));
                }, []);

                groups.push({
                    name: previousRepoName,
                    url: repoUrl,
                    events: currentGroup,
                    commits: commits,
                });
            }
        }
        currentGroup = [];
        previousRepoName = null;
    }

    events.forEach((event: Event) => {
        if (isPrivateEvent(event)) {
            if (isPrivate === false) {
                // Previous event was public, this one is private.
                reset();
            }
            isPrivate = true;
            currentGroup.push(event);
        } else {
            const asPublic = event as PublicEvent;
            if (isPrivate === true) {
                // Previous event was private, this one is public.
                reset();
            }
            if (
                previousRepoName != null &&
                previousRepoName != asPublic.repository.name
            ) {
                // This event belongs to a different repository from the previous one.
                reset();
            }
            previousRepoName = asPublic.repository.name;
            isPrivate = false;
            currentGroup.push(event);
        }
    });
    reset();

    return groups;
}
