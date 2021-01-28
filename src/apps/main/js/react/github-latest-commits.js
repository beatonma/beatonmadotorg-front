const commits = (() => {
    const MAX_RENDER_MESSAGES = 5;

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

    function getRecentGithubCommits() {
        const url = '/api/github_latest/';
        fetch(url, {
            method: 'GET',
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (!data['commits']) {
                return;
            }
            const commits = compressCommits(data['commits']);
            buildViews(commits);
        }).catch((err) => {
            console.log('Error getting recent commits:' + err);
        });
    }

    function compressCommits(commits) {
        return groupCommitsByRepo(commits);
    }

    /**
     * Group commits by repo and sort with most recent first.
     */
    function groupCommitsByRepo(commits) {
        let combined = [];
        let bucket = null;

        function newBucket(commit) {
            return commit.public ? new PublicBucket(commit) : new PrivateBucket(commit);
        }
        commits.sort((a, b) => a.repo.name.localeCompare(b.repo.name));

        commits.forEach((c) => {
            if (bucket === null) {
                bucket = newBucket(c);
                return;
            }
            else if (c.repo.name === bucket.name) {
                bucket.add(c);
            }
            else {
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
        }
        else {
            return formatDate(start) + " - " + formatDate(end);
        }
    }

    /*
     * Rendering
     */

    function buildViews(commits) {
        ReactDOM.render(
            <GithubLatestCommits
                commits={commits} />,
            document.getElementById('github_recent'));
    }

    function GithubLatestCommits(props) {
        function renderCommits(commits) {
            let rendered = [];

            commits.forEach((c) => {
                if (c instanceof PublicBucket) {
                    rendered.push(
                        <PublicCommit
                            key={c.end}
                            commit={c} />
                    );
                } else if (c instanceof PrivateBucket) {
                    rendered.push(
                        <PrivateCommit
                            key={c.end}
                            commit={c} />
                    );
                }
            });
            return rendered;
        }

        return (
            <div class="preview-list-container">
                <h3>Recent activity:</h3>
                <div className="github-recent">
                    {renderCommits(props.commits)}
                </div>
            </div>
        )
    }

    function PublicCommit(props) {
        function renderCommitMessages(changes) {
            let uniqueMessages = [];
            const uniqueChanges = changes.filter(item => {
                const result = item.message && uniqueMessages.indexOf(item.message) == -1;
                uniqueMessages.push(item.message);
                return result;
            });

            return (
                <div class="github-recent-public-messages">
                    {uniqueChanges.slice(0, MAX_RENDER_MESSAGES).map((change) =>
                        <GitCommitMessage
                            key={change.sha}
                            message={change.message}
                            url={change.url} />
                    )}
                </div>
            )
        }

        return (
            <div className="github-recent-commit">
                <span className="github-recent-public-icon" title="Public repository" role="img" aria-label="Public repository">
                     @@include('src/apps/main/templates/svg/public.svg', {"id": "", "class": ""})
                </span>
                <a href={"" + props.commit.repo.url} className="github-recent-repo">
                    {props.commit.repo.name}
                </a><a href={props.commit.repo.url + "/commits/"}><RepoMetadata commit={props.commit}/></a>
                {renderCommitMessages(props.commit.changes)}
            </div>
        );
    }

    function PrivateCommit(props) {
        return (
            <div className="github-recent-private">
                <span className="github-recent-private-icon" title="Private repository" role="img" aria-label="Private repository">
                     @@include('src/apps/main/templates/svg/private.svg', {"id": "", "class": ""})
                </span>
                <span className="github-recent-repo">{props.commit.repo.name}</span><RepoMetadata commit={props.commit}/>
            </div>
        );
    }

    function RepoMetadata(props) {
        return (
            <span className="github-recent-repo-meta">
                <CommitCount change_count={props.commit.change_count} timestamp={formatTimestampString(props.commit.start, props.commit.end)}/>
            </span>
        );
    }
    function CommitCount(props) {
        return (
            <span className="github-recent-commit-count" title={props.timestamp}>
                {props.change_count} {(props.change_count == 1 ? " commit" : " commits")}
            </span>
        );
    }

    function Languages(props) {
        const languages = Object.keys(props.languages);
        if (languages.length == 0) {
            return (null);
        }
        return (
            <span className="github-recent-languages" title={languages.length + " languages: " + languages.join(', ')}>
                <span className="github-recent-languages-icon">
                    @@include('src/apps/main/templates/svg/code.svg', {"id": "", "class": ""})
                </span>
                {"" + languages.length} 
            </span>
        );
    }

    function GitCommitMessage(props) {
        return (
            <div className="github-recent-commit-message">
                <a className="primary"  href={props.url} title="View on Github">{props.message}</a>
            </div>
        );
    }

    if (document.getElementById('github_recent')) {
        getRecentGithubCommits();
    }

    return {
        'load': getRecentGithubCommits
    }
})();