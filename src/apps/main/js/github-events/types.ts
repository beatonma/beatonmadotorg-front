export const Events = {
    Create: "CreateEvent",
    Push: "PushEvent",
    PullRequest: "PullRequestEvent",
    Wiki: "GollumEvent",
    Issue: "IssuesEvent",
    Release: "ReleaseEvent",
};

type Url = string;

type Language = {
    name: string;
    bytes: number;
};

type Repository = {
    id: number;
    name: string;
    description: string;
    url: Url;
    license?: string;
    languages: Language[];
    payload: any;
};

export interface Event {
    type: string;
    created_at: string;
}

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

export interface Group {}

export type PrivateGroup = Group & {
    events: PrivateEvent[];
};

export type SimpleEvent = {
    type: string;
    payload: EventPayload | Commit[] | WikiEdit[];
};

export type PublicGroup = Group & {
    repository: Repository;
    events: SimpleEvent[];
};

export function isPublicGroup(group: Group): group is PublicGroup {
    return (group as PublicGroup).repository !== undefined;
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

export type WikiEdit = {
    name: string;
    url: Url;
    action: string;
};

export type ReleasePayload = EventPayload & {
    name: string;
    url: Url;
    description: string;
    published_at: string;
};
