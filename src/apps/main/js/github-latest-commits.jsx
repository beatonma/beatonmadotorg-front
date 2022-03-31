import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { loadJson, isSameDay, formatDate } from "./util";

const MAX_MESSAGES_PER_REPO = 5;
const MESSAGE_CHAR_LIMIT = 140;
const URL = "/api/github_latest/";
const CONTAINER_ID = "github_recent";

export function GithubLatestCommitsApp() {
    ReactDOM.render(
        <GithubLatestCommits />,
        document.getElementById(CONTAINER_ID)
    );
}

function GithubLatestCommits() {
    const [commits, setCommits] = useState(null);

    useEffect(() => {
        loadJson(URL)
            .then(data => data.commits)
            .then(compressCommits)
            .then(commits => {
                if (commits.length > 0) {
                    document
                        .getElementById(CONTAINER_ID)
                        .classList.add("preview-list-container");
                }

                return commits;
            })
            .then(setCommits);
    }, []);

    if (commits != null) {
        return (
            <>
                <h3>Recent activity:</h3>
                <div className="github-recent">
                    {commits.map(commit => (
                        <Commit key={commit.end} commit={commit} />
                    ))}
                </div>
            </>
        );
    } else {
        return null;
    }
}

/**
 * Combine multiple events for a public repo into a single grouped event.
 */
class PublicBucket {
    constructor(commit) {
        this.name = commit.repo.name;
        this.repo = commit.repo;
        this.start = commit.created_at;
        this.end = commit.created_at;
        this.changes = commit.changes;
        this.change_count = commit.change_count;
        this.languages = commit.languages;
    }

    add(commit) {
        this.start = commit.created_at;
        this.changes.push(...commit.changes);
        this.change_count += commit.change_count;
        this.languages = Object.assign(this.languages, commit.languages);
    }
}

/**
 * Combine multiple events for a private repo into a single grouped event.
 */
class PrivateBucket {
    constructor(commit) {
        this.name = commit.repo.name;
        this.repo = commit.repo;
        this.start = commit.created_at;
        this.end = commit.created_at;
        this.change_count = commit.change_count;
        this.languages = commit.languages;
    }

    add(commit) {
        this.start = commit.created_at;
        this.change_count += commit.change_count;
        this.languages = Object.assign(this.languages, commit.languages);
    }
}

const compressCommits = groupCommitsByRepo;

/**
 * Group commits by repo and sort with most recent first.
 */
function groupCommitsByRepo(commits) {
    let combined = [];
    let bucket = null;

    function newBucket(commit) {
        return commit.public
            ? new PublicBucket(commit)
            : new PrivateBucket(commit);
    }

    commits.sort((a, b) => a.repo.name.localeCompare(b.repo.name));

    commits.forEach(c => {
        if (bucket === null) {
            bucket = newBucket(c);
            return;
        } else if (c.repo.name === bucket.name) {
            bucket.add(c);
        } else {
            combined.push(bucket);
            bucket = newBucket(c);
        }
    });

    if (bucket != null) {
        combined.push(bucket);
    }
    combined.sort((a, b) => a.end.localeCompare(b.end)).reverse();

    return combined;
}

function formatTimestampString(_start, _end) {
    const start = new Date(_start);
    const end = new Date(_end);

    if (isSameDay(start, end)) {
        return formatDate(end);
    } else {
        return formatDate(start) + " - " + formatDate(end);
    }
}

function Commit(props) {
    if (props.commit instanceof PublicBucket) {
        return <PublicCommit {...props} />;
    } else {
        return <PrivateCommit {...props} />;
    }
}

function PublicCommit(props) {
    return (
        <div className="github-recent-commit">
            <div className="v1-row">
                <span
                    className="github-recent-public-icon"
                    title="Public repository"
                    role="img"
                    aria-label="Public repository"
                >
                    @@include('svg/public.svg')
                </span>
                <a
                    href={"" + props.commit.repo.url}
                    className="github-recent-repo"
                >
                    {props.commit.repo.name}
                </a>
                <a href={props.commit.repo.url + "/commits/"}>
                    <RepoMetadata commit={props.commit} />
                </a>
            </div>
            <CommitMessages changes={props.commit.changes} />
        </div>
    );
}

function CommitMessages(props) {
    const visitedMessages = [];
    const uniqueMessages = props.changes
        .filter(item => {
            const result =
                item.message && visitedMessages.indexOf(item.message) == -1;
            visitedMessages.push(item.message);
            return result;
        })
        .slice(0, MAX_MESSAGES_PER_REPO)
        .map(change => {
            if (change.message.length > MESSAGE_CHAR_LIMIT) {
                change.message =
                    change.message.slice(0, MESSAGE_CHAR_LIMIT) + "…";
            }
            return change;
        });

    return (
        <div className="github-recent-public-messages">
            {uniqueMessages.map(change => (
                <GitCommitMessage
                    key={change.sha}
                    message={change.message}
                    url={change.url}
                />
            ))}
        </div>
    );
}

function PrivateCommit(props) {
    return (
        <div className="github-recent-private">
            <span
                className="github-recent-private-icon"
                title="Private repository"
                role="img"
                aria-label="Private repository"
            >
                @@include('svg/private.svg')
            </span>
            <span className="github-recent-repo">{props.commit.repo.name}</span>
            <RepoMetadata commit={props.commit} />
        </div>
    );
}

function RepoMetadata(props) {
    return (
        <span className="github-recent-repo-meta">
            <CommitCount
                change_count={props.commit.change_count}
                timestamp={formatTimestampString(
                    props.commit.start,
                    props.commit.end
                )}
            />
        </span>
    );
}
function CommitCount(props) {
    return (
        <span className="github-recent-commit-count" title={props.timestamp}>
            {props.change_count}{" "}
            {props.change_count == 1 ? " commit" : " commits"}
        </span>
    );
}

function Languages(props) {
    const languages = Object.keys(props.languages);
    if (languages.length == 0) {
        return null;
    }
    return (
        <span
            className="github-recent-languages"
            title={languages.length + " languages: " + languages.join(", ")}
        >
            <span className="github-recent-languages-icon">
                @@include('svg/code.svg')
            </span>
            {"" + languages.length}
        </span>
    );
}

function GitCommitMessage(props) {
    return (
        <div className="github-recent-commit-message">
            <a className="primary" href={props.url} title="View on Github">
                {props.message}
            </a>
        </div>
    );
}
