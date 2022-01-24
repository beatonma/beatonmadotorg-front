import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { loadJson, getCsrfToken, formatTimeDelta } from "../../main/js/util";

const endpoint = "active/";

export function WebmentionTesterApp() {
    ReactDOM.render(
        <WebmentionsTester />,
        document.getElementById("webmentions_testing_tool")
    );
}

function WebmentionsTester() {
    const [refreshFlag, setRefreshFlag] = useState(true);

    const refresh = () => setRefreshFlag(!refreshFlag);

    return (
        <div>
            <Blurb />
            <ActiveMentions onChange={refreshFlag} />
            <CreateTempMention onSubmit={refresh} />
        </div>
    );
}

function Blurb() {
    return (
        <section>
            <div>TODO explain how this works</div>
        </section>
    );
}

function ActiveMentions(props) {
    const [ttl, setTtl] = useState(0);
    const [mentions, setMentions] = useState([]);

    useEffect(() => {
        loadJson(endpoint).then(data => {
            setTtl(data.ttl);
            setMentions(data.mentions);
        });
    }, [props.onChange]);

    if (mentions.length == 0) {
        return <div>No mentions</div>;
    }

    return (
        <section>
            <div className="active-mentions">
                <Row className="vertical-bottom">
                    <h3 className="row-item">Active mentions</h3>
                    <div className="label">{`Timeout: ${formatTimeDelta(ttl, {
                        verbose: true,
                    })}`}</div>
                </Row>
                {mentions.map(m => (
                    <ActiveMention {...m} key={m.submitted_at} />
                ))}
            </div>
        </section>
    );
}

function ActiveMention(props) {
    return (
        <div title={`Submitted at ${props.submitted_at}`}>
            <div>{props.url}</div>
            <div className="label">
                Expires: {formatTimeDelta(props.expires_in)}
            </div>
        </div>
    );
}

function CreateTempMention() {
    const [url, setUrl] = useState("");
    const [isError, setIsError] = useState(false);

    const post = () => {
        create(endpoint, { url: url })
            .then(response => {
                console.log(`OK ${JSON.stringify(response)}`);
                setUrl("");
                setIsError(false);
            })
            .error(err => setIsError(true));
    };

    const onKeyPress = event => {
        if (event.key == "Enter") {
            event.preventDefault();
            post();
        }
    };

    return (
        <section>
            <h3>Create temporary mention here</h3>
            <div>
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://mysite.example/my-article/"
                    onKeyUp={onKeyPress}
                />
                <button onClick={post}>Submit</button>
            </div>
        </section>
    );
}

function Row(props) {
    const className = props.className || "";

    return <div className={`row ${className}`}>{props.children}</div>;
}

function Label(props) {
    return <div className="label">{props.children}</div>;
}

const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
};

function create(url, data) {
    return fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "same-origin",
        headers: headers,
        body: JSON.stringify(data),
    });
}
