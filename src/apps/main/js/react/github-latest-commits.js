const commits = (() => {
    function GithubLatestCommits(props) {
        function renderCommits(commits) {
            return commits.map(c => 
                <PublicCommit
                    key={c.created_at}
                    commit={c} />
            );
        }

        return (
            <div className="card-content">
                <h3>Commits:</h3>
                {renderCommits(props.commits)}
            </div>
        )
    }

    function Timestamp(props) {
        return <time class="dt-updated label" datetime={"" + new Date(props.timestamp)}>
            {formatDate(new Date(props.timestamp))}
        </time>
    }

    function PublicCommit(props) {
        function renderCommitMessages(changes) {
            return changes.map((change) =>
                <GitCommitMessage
                    key={change.sha}
                    message={change.message} />
            );
        }

        function renderTimestamp(commit) {
            if (formatDate(new Date(commit.start)) == formatDate(new Date(commit.end))) {
                return <Timestamp timestamp={commit.start} />
            }
            else {
                return <span>
                    <Timestamp timestamp={commit.start} /> - <Timestamp timestamp={commit.end} />
                </span>
            }
        }

        return (
            <div className="github-recent-commit">
                <a href={"" + props.commit.repo.url} className="github-recent-repo">
                    {props.commit.repo.name}
                </a> {renderTimestamp(props.commit)}
                {renderCommitMessages(props.commit.changes)}
            </div>
        );
    }

    function PrivateCommitGroup(props) {

    }

    function GitCommitMessage(props) {
        return (
            <div className="github-commit-message">
                - {props.message}
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
        }).catch((err) => {
            console.log('Error getting recent commits:' + err);
        })
    }

    function compressCommits(commits) {
        let compressed = [];

        // Group consecutive commits to same repo
        let bucket = {
            name: null,
            repo: null,
            start: null,
            end: null,
            changes: [],
            changeCount: 0,
            public: null
        };

        commits.forEach((c) => {
            if (bucket.name === c.repo.name) {
                // Update existing bucket
                bucket.start = c.created_at;
                bucket.changes.push(...c.changes);
                bucket.changeCount += c.changeCount;
            }
            else {
                // Store old bucket
                if (bucket.name != null) {
                    compressed.push(bucket);
                }

                bucket = {
                    name: c.repo.name,
                    repo: c.repo,
                    start: c.created_at,
                    end: c.created_at,
                    changes: c.changes,
                    change_count: c.change_count,
                    public: c.public
                };
            }
        });
        if (bucket.name != null) {
            compressed.push(bucket);
        }

        // TODO combine private repos and show commit count

        return compressed;
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