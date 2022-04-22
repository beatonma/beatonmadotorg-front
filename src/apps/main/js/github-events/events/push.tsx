import React from "react";
import { pluralize } from "../../plurals";
import { Commit } from "../types";
import { Dropdown } from "../../components";
import { TextWithIcon } from "../../components/text-with-icon";

interface CommitProps {
    commits: Commit[];
}
export function Commits(props: CommitProps) {
    const commits = props.commits;

    if (commits.length > 0) {
        return (
            <Dropdown
                className="github-event"
                data-type="commits"
                title={`${commits.length} ${pluralize(
                    "commit",
                    commits.length
                )}`}
                expandedDefault={false}
            >
                {commits.map(commit => (
                    <CommitEvent key={commit.sha} {...commit} />
                ))}
            </Dropdown>
        );
    } else {
        return null;
    }
}

function CommitEvent(commit: Commit) {
    return (
        <TextWithIcon
            icon={
                <a href={commit.url} title={commit.url}>
                    link
                </a>
            }
            text={getCommitMessage(commit)}
        />
    );
    // return (
    //     <div className="github-commit">
    //         <a
    //             key={commit.sha}
    //             href={commit.url}
    //             title={commit.url}
    //             className="material-icons"
    //         >
    //             link
    //         </a>
    //         <span>&nbsp;</span>
    //         <div>{getCommitMessage(commit)}</div>
    //     </div>
    // );
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
