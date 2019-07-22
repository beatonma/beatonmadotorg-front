const commits = (() => {
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
            <div className="github-recent">
                <h3>Recent commits:</h3>
                {renderCommits(props.commits)}
            </div>
        )
    }

    function Timestamp(props) {
        return <time class="dt-updated github-recent-timestamp" datetime={"" + new Date(props.timestamp)}>
            {formatDate(new Date(props.timestamp))}
        </time>
    }

    function renderTimestamp(commit) {
        if (formatDate(new Date(commit.start)) == formatDate(new Date(commit.end))) {
            return <span className="github-recent-timestamp">
                <Timestamp timestamp={commit.start} />
            </span>
        }
        else {
            return <span className="github-recent-timestamp">
                <Timestamp timestamp={commit.start} /> - <Timestamp timestamp={commit.end} />
            </span>
        }
    }

    function PublicCommit(props) {
        function renderCommitMessages(changes) {
            return changes.map((change) =>
                <GitCommitMessage
                    key={change.sha}
                    message={change.message}
                    url={change.url} />
            );
        }

        return (
            <div className="github-recent-commit">
                <a href={"" + props.commit.repo.url} className="github-recent-repo">
                    {props.commit.repo.name}
                </a> <RepoMetadata commit={props.commit}/>
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
                <span className="github-recent-repo">{props.commit.repo.name}</span> <RepoMetadata commit={props.commit}/>
            </div>
        );
    }

    function RepoMetadata(props) {
        return (
            <span className="github-recent-repo-meta">
                <CommitCount change_count={props.commit.change_count}/> {renderTimestamp(props.commit)}
            </span>
        );
    }

    function CommitCount(props) {
        return (
            <span className="github-recent-commit-count" title={props.change_count + (props.change_count == 1 ? " commit" : " commits")}>
                {props.change_count}<span className="github-recent-commit-count-icon">
                @@include('src/apps/main/templates/svg/git-commit.svg', {"id": "", "class": ""})
                </span>
            </span>
        );
    }

    function GitCommitMessage(props) {
        return (
            <div className="github-recent-commit-message">
                {props.message} <a className="github-recent-link-icon" title="View commit on Github" href={props.url}>
                    @@include('src/apps/main/templates/svg/link.svg', {"id": "", "class": ""})
                </a>
            </div>
        );
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
        });
        // }).catch((err) => {
        //     console.log('Error getting recent commits:' + err);
        // });
    }

    function compressCommits(commits) {
        return combineConsecutiveCommits(commits);
    }

    class PublicBucket {
        constructor(commit) {
            this.name = commit.repo.name;
            this.repo = commit.repo;
            this.start = commit.created_at;
            this.end = commit.created_at;
            this.changes = commit.changes;
            this.change_count = commit.change_count;
        }

        add(commit) {
            this.start = commit.created_at;
            this.changes.push(...commit.changes);
            this.change_count += commit.change_count;
        }
    }

    class PrivateBucket {
        constructor(commit) {
            this.name = commit.repo.name;
            this.repo = commit.repo;
            this.start = commit.created_at;
            this.end = commit.created_at;
            this.change_count = commit.change_count;
        }

        add(commit) {
            this.start = commit.created_at;
            this.change_count += commit.change_count;
        }
    }

    /**
     * Reduce consecutive commits to a single repo into a single item
     */
    function combineConsecutiveCommits(commits) {
        let combined = [];
        let bucket = null;

        commits.forEach((c) => {
            if (bucket === null) {
                bucket = c.public ? new PublicBucket(c) : new PrivateBucket(c);
                return;
            }

            if (bucket instanceof PublicBucket) {
                if (c.repo.name === bucket.name) {
                    bucket.add(c);
                }
                else {
                    combined.push(bucket);
                    bucket = c.public ? new PublicBucket(c) : new PrivateBucket(c);
                }
            } else if (bucket instanceof PrivateBucket) {
                if (c.public) {
                    combined.push(bucket);
                    bucket = new PublicBucket(c);
                }
                else {
                    bucket.add(c);
                }
            }
        });
        if (bucket != null) {
            combined.push(bucket);
        }

        return combined;
    }

    function buildViews(commits) {
        ReactDOM.render(
            <GithubLatestCommits
                commits={commits} />,
            document.getElementById('github_recent'));
    }

    if (document.getElementById('github_recent')) {
        getRecentGithubCommits();
    }

    return {
        'load': getRecentGithubCommits
    }
})();