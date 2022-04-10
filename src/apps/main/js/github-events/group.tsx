import React from "react";
import { pluralize } from "../plurals";
import { Commits } from "./events";
import { Group, PrivateGroup, PublicGroup, isPublicGroup } from "./types";

export function EventGroup(group: Group) {
    if (isPublicGroup(group)) {
        return <PublicEventGroup {...group} />;
    } else {
        return <PrivateEventGroup {...(group as PrivateGroup)} />;
    }
}

function PublicEventGroup(group: PublicGroup) {
    return (
        <div className="github-group">
            <div className="github-repository-name">
                <a href={group.url}>{group.name}</a>
            </div>
            <Commits commits={group.commits} />
        </div>
    );
}

function PrivateEventGroup(group: PrivateGroup) {
    const count = group.events.length;
    return (
        <div className="github-group">
            {count} {pluralize("event", count)} in private repositories.
        </div>
    );
}
