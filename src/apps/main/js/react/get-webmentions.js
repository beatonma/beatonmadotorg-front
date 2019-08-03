const mentions = (() => {
    function getWebmentions() {
        const url = new URL(window.location.protocol + '//' + window.location.host + '/webmention/get');
        url.searchParams.append('url', window.location.pathname);
        fetch(url, {
            method: 'GET',
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (!data['mentions']) {
                return;
            }
            buildViews(data['mentions']);
        }).catch((err) => {
            console.log(err);
        })
    }

    function buildViews(mentions) {
        if (mentions.length == 0) {
            return;
        }
        ReactDOM.render(
            <MentionsContainer
                mentions={mentions} />,
            document.getElementById('mentions'));
    }

    function MentionsContainer(props) {
        function renderMentions(mentions) {
            return mentions.map((m) => 
                <Webmention key={m.published} webmention={m}/>
            );
        }

        if (props.mentions) {
            return (
                <div className="card">
                    <div className="card-content">
                        <h3>Mentions</h3>
                        {renderMentions(props.mentions)}
                    </div>
                </div>
            );
        }
    }

    function Webmention(props) {
        const mention = props.webmention;
        const avatarStyle = {
            backgroundImage: `url(${mention.hcard.avatar})`
        };
        return (
            <div className="mention-mini">
                <div className="tooltip">
                    <a className="mention-source" aria-label="Mention source" href={"" + mention.source_url }>
                        <div className="avatar mention-avatar" style={avatarStyle}></div>
                    </a>
                    <div className="tooltip-popup hcard-popup">
                        <div className="hcard-popup flex-row-start">
                            <a className="hcard-homepage" aria-label="Mention author homepage" href={"" + mention.hcard.homepage }>
                                <div className="hcard-content">
                                    <div className="hcard-name">{mention.hcard.name}</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    getWebmentions();

    return {
        'get': getWebmentions
    }
})();