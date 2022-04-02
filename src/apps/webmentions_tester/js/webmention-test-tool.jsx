import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Dropdown } from "../../main/js/react/dropdown";
import { Label } from "../../main/js/react/label";
import { classNames } from "../../main/js/react/props";
import { Row } from "../../main/js/react/row";
import { loadJson, getCsrfToken, formatTimeDelta } from "../../main/js/util";

const CONTAINER = "#webmentions_testing_tool";
const endpoint = "active/";

export function WebmentionTesterApp(dom = document) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        ReactDOM.render(<WebmentionsTester />, container);
    }
}

function WebmentionsTester() {
    const [refreshFlag, setRefreshFlag] = useState(true);

    const refresh = () => setRefreshFlag(!refreshFlag);

    return (
        <div>
            <CreateTempMention onSubmit={refresh} />
            <ActiveMentions onChange={refreshFlag} refresh={refresh} />
        </div>
    );
}

function TooSoon() {
    return (
        <div className="webmention-tester-form">
            <h1>Welcome!</h1>
            But I'm afraid the tool isn't quite ready yet :( Check back in a
            couple of days!
        </div>
    );
}

function ActiveMentions(props) {
    const [ttl, setTtl] = useState(0);
    const [mentions, setMentions] = useState([]);

    useEffect(() => {
        loadJson(endpoint).then(data => {
            setTtl(data.ttl);

            const mentions = data.mentions;
            const uniqueUrlMentions = [
                ...new Map(mentions.map(item => [item["url"], item])).values(),
            ];

            setMentions(uniqueUrlMentions);
        });
    }, [props.onChange]);

    const timeout = formatTimeDelta(ttl, {
        verbose: true,
    });
    const requestUpdate = callback => {
        setTimeout(() => {
            props.refresh();
            callback();
        }, 500);
    };

    return (
        <section>
            <div className="active-mentions">
                <Row className="vertical-bottom">
                    <h3 className="row-item">Active mentions</h3>
                    <Label>{`Temporary mentions submitted in the last ${timeout}`}</Label>
                </Row>
                <div className="flex-row">
                    <SampleActiveMention
                        ttl={ttl}
                        expanded={mentions.length == 0}
                    />
                    {mentions.map(m => (
                        <ActiveMention
                            {...m}
                            key={m.submitted_at}
                            requestUpdate={requestUpdate}
                        />
                    ))}
                    {}
                </div>
            </div>
        </section>
    );
}

function SampleActiveMention(props) {
    const submittedAt = new Date();
    const expiresAt = new Date(submittedAt.seconds + props.ttl);
    const expiresIn = props.ttl;

    const sampleData = {
        url: "https://beatonma.org",
        submitted_at: submittedAt,
        expires_at: expiresAt,
        expires_in: expiresIn,
        status: {
            successful: true,
            status_code: 202,
            message: "The target server accepted the webmention.",
            source_url: "/webmentions_tester/",
            target_url: "https://beatonma.org",
            endpoint: "https://beatonma.org:443/webmention/",
        },
    };

    return (
        <ActiveMention
            {...sampleData}
            className="webmention-tester-sample"
            label="Sample"
            expanded={props.expanded}
        />
    );
}

function ActiveMention(props) {
    const [awaitingTask, setAwaitingTask] = useState(true);

    useEffect(() => {
        if (props.status === null && props.requestUpdate) {
            props.requestUpdate(() => setAwaitingTask(!awaitingTask));
        }
    }, [props.status, awaitingTask]);

    return (
        <div
            className={`webmention-tester-temp card preview-wide`}
            title={`Submitted at ${props.submitted_at}`}
        >
            <div className={classNames(props, "card-content")}>
                <Row className="flex-row-space-between">
                    <a href={`${props.url}`}>{props.url}</a>
                    <div>
                        <Label className="webmention-tester-temp-label">
                            {props.label}
                        </Label>

                        <Label>
                            Expires: {formatTimeDelta(props.expires_in)}
                        </Label>
                    </div>
                </Row>
                <MentionStatus
                    status={props.status}
                    expanded={props.expanded}
                />
            </div>
        </div>
    );
}

function MentionStatus(props) {
    if (props.status == null)
        return (
            <Row className="vertical-center">
                <span className="material-icons refresh">refresh</span>
                <div>Status unknown - please wait a moment...</div>
            </Row>
        );

    const {
        successful,
        status_code,
        message,
        source_url,
        target_url,
        endpoint,
    } = props.status;

    const successMessage = successful ? (
        <Row className="vertical-center">
            <span className="material-icons">check</span>
            <span>Accepted by server</span>
        </Row>
    ) : (
        <Row className="vertical-center">
            <span className="material-icons warn">close</span>
            <span>Rejected by server</span>
        </Row>
    );

    return (
        <Dropdown title={successMessage} expanded={props.expanded}>
            <table className="webmention-tester-status">
                <tbody>
                    <StatusTableRow label="Code" content={status_code} />
                    <StatusTableRow label="Message" content={message} />
                    <StatusTableRow label="Source" content={source_url} />
                    <StatusTableRow label="Target" content={target_url} />
                    <StatusTableRow label="Endpoint" content={endpoint} />
                </tbody>
            </table>
        </Dropdown>
    );
}

function StatusTableRow(props) {
    return (
        <tr>
            <td>
                <Label>{props.label}</Label>
            </td>
            <td>
                <span className="webmention-tester-status-content">
                    {props.content}
                </span>
            </td>
        </tr>
    );
}

function CreateTempMention(props) {
    const [url, setUrl] = useState("");
    const [isError, setIsError] = useState(false);

    const post = () => {
        create(endpoint, { url: url })
            .then(response => {
                if (response.status == 400) {
                    throw "Validation failure";
                }

                console.log(`OK ${JSON.stringify(response)}`);
                setUrl("");
                setIsError(false);
                props.onSubmit();
            })
            .catch(err => {
                console.error(err);
                setIsError(true);
            });
    };

    const onKeyPress = event => {
        setIsError(false);
        if (event.key == "Enter") {
            event.preventDefault();
            post();
        }
    };

    return (
        <section>
            <h3>Temporary mentions</h3>
            <p>Submit a link to your content to test your Webmentions setup!</p>
            <ul>
                <li>
                    Your link will appear on this page for a while (until it
                    expires).
                </li>
                <li>
                    Your webmentions endpoint should immediately receive a
                    notification that this page has mentioned your page.
                </li>
            </ul>

            {/* <TooSoon /> */}

            <div className="webmention-tester-form">
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://mysite.example/my-article/"
                    onKeyUp={onKeyPress}
                />
                <button onClick={post}>Submit</button>
                <ErrorMessage show={isError} />
            </div>

            <p>
                If your page mentions this page, it should appear{" "}
                <a href="#related_content">below</a>.
            </p>
        </section>
    );
}

function ErrorMessage(props) {
    if (props.show) {
        return <div>Please check your URL - validation failed.</div>;
    } else {
        return null;
    }
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
