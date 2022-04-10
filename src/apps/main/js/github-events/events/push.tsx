import React from "react";
import { pluralize } from "../../plurals";
import { Commit } from "../types";
import { Dropdown } from "../../components";
import { MaterialIcon } from "../../components/icons";

interface CommitProps {
    commits: Commit[];
}
export function Commits(props: CommitProps) {
    const commits = props.commits;
    if (commits.length > 0) {
        return (
            <Dropdown
                title={`${commits.length} ${pluralize(
                    "commit",
                    commits.length
                )}`}
                expandedDefault={false}
            >
                {commits.map(commit => (
                    <Commit key={commit.sha} {...commit} />
                ))}
            </Dropdown>
        );
    } else {
        return null;
    }
}

function Commit(commit: Commit) {
    return (
        <div className="github-commit">
            <a
                key={commit.sha}
                href={commit.url}
                title={commit.url}
                className="material-icons"
            >
                link
            </a>
            <span>{getCommitMessage(commit)}</span>
        </div>
    );
}

function getCommitMessage(commit: Commit): string {
    const msg = commit.message;
    if (msg.length < 64) {
        return msg;
    }
    if (msg.indexOf("\n\n") >= 0) {
        return msg.split("\n\n")[0];
    }
    return `${msg.slice(0, 64)}…`;
}
