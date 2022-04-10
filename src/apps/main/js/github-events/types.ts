export const Events = {
    Create: "CreateEvent",
    Push: "PushEvent",
    PullRequest: "PullRequestEvent",
    Wiki: "GollumEvent",
    Issue: "IssuesEvent",
    Release: "ReleaseEvent",
};

export type Url = string;

export type Language = {
    name: string;
    bytes: number;
};

export type Repository = {
    id: number;
    name: string;
    description: string;
    url: Url;
    license?: string;
    languages: Language[];
    payload: any;
};

export type Event = {
    type: string;
};

export type PrivateEvent = Event;

export type PublicEvent = Event & {
    id: string;
    repository: Repository;
    payload: EventPayload;
};

export function isPublicEvent(event: Event): event is PublicEvent {
    return (event as PublicEvent).id !== undefined;
}

export function isPrivateEvent(event: Event): event is PrivateEvent {
    return !isPublicEvent(event);
}

export type Group = {};

export type PrivateGroup = Group & {
    events: PrivateEvent[];
};

export type PublicGroup = Group & {
    name: string;
    url: Url;
    events: PublicEvent[];
    commits: Commit[];
};

export function getCommits(event: PublicEvent): Commit[] {
    if (event.type == Events.Push) {
        return event.payload as Commit[];
    }
    return [];
}

export function isPublicGroup(group: Group): group is PublicGroup {
    return (group as PublicGroup).name !== undefined;
}

type EventPayload = {};

export type CreateEventPayload = EventPayload & {
    type: string;
    ref: string;
};

export type IssueEventPayload = EventPayload & {
    number: number;
    url: Url;
    closed_at: string;
};

export type PullRequestPayload = EventPayload & {
    number: number;
    url: Url;
    merged_at: string;
    addition_count: number;
    deletion_count: number;
    changed_files_count: number;
};

export type Commit = {
    sha: string;
    message: string;
    url: Url;
};

type WikiEdit = {
    name: string;
    url: Url;
    action: string;
};
