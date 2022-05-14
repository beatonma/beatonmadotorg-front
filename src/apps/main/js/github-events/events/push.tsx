import React from "react";
import { Commit } from "../types";
import { pluralize } from "../../plurals";
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
                header={`${commits.length} ${pluralize(
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
            className="github-commit"
            icon={
                <a href={commit.url} title={commit.url}>
                    link
                </a>
            }
            dangerousHtml={commit.message}
        />
    );
}
