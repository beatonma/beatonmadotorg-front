const commits = (() => {
    function Commit(props) {
        function renderCommitMessages(changes) {
            return changes.map((change) =>
                <GitCommitMessage
                    key={change.sha}
                    message={change.message} />
            );
        }

        return (
            <div className="github-recent-commit">
                <a href={"" + props.commit.repo.url} className="github-recent-repo">{props.commit.repo.name}</a>
                {renderCommitMessages(props.commit.changes)}
            </div>
        );
    }

    class GitCommitMessage extends React.Component {
        render() {
            return (
                <div className="github-commit-message">
                    {this.props.message}
                </div>
            )
        }
    }

    class GithubLatestCommits extends React.Component {
        renderCommits(commits) {
            return commits.map(c => 
                <Commit
                    key={c.created_at}
                    commit={c} />
            );
        }

        render() {
            return (
                <div className="card-content">
                    <h3>Commits:</h3>
                    {this.renderCommits(this.props.commits)}
                </div>
            )
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
            buildViews(data['commits']);
        }).catch((err) => {
            console.log('Error getting recent commits:' + err);
        })
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