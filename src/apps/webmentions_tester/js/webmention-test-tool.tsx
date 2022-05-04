import React, { useState, useEffect, KeyboardEvent } from "react";
import ReactDOM from "react-dom";
import { Dropdown, Label, Row } from "../../main/js/components";
import { ClassNameProps, classNames } from "../../main/js/components/props";
import { loadJson, getCsrfToken, formatTimeDelta } from "../../main/js/util";

const CONTAINER = "#webmentions_testing_tool";
const endpoint = "active/";

export function WebmentionTesterApp(dom: Document | Element) {
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

interface MentionStatus {
    successful: boolean;
    status_code: number;
    message: string;
    source_url: string;
    target_url: string;
    endpoint: string;
}

interface ActiveMention {
    url: string;
    submitted_at: string | Date;
    expires_at: string | Date;
    expires_in: number;
    status: MentionStatus;
}

interface ActiveMentionsProps {
    onChange: boolean;
    refresh: () => void;
}
function ActiveMentions(props: ActiveMentionsProps) {
    const [ttl, setTtl] = useState(0);
    const [mentions, setMentions] = useState([]);

    const { refresh, onChange } = props;

    useEffect(() => {
        loadJson(endpoint).then(data => {
            setTtl(data.ttl);

            const mentions: ActiveMention[] = data.mentions;
            const uniqueUrlMentions = [
                ...new Map(mentions.map(item => [item.url, item])).values(),
            ];

            setMentions(uniqueUrlMentions);
        });
    }, [onChange]);

    const timeout = formatTimeDelta(ttl, {
        verbose: true,
    });
    const requestUpdate = (callback: () => void) => {
        setTimeout(() => {
            refresh();
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

interface SampleActiveMentionProps {
    ttl: number;
    expanded: boolean;
}
function SampleActiveMention(props: SampleActiveMentionProps) {
    const submittedAt = new Date();
    const expiresAt = new Date(
        Math.round(submittedAt.getTime() / 1000) + props.ttl
    );
    const expiresIn = props.ttl;

    const sampleData: ActiveMention = {
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
            mention={sampleData}
            className="webmention-tester-sample"
            label="Sample"
            expanded={props.expanded}
        />
    );
}

interface ActiveMentionProps extends ClassNameProps {
    requestUpdate?: (callback: () => void) => void;
    mention: ActiveMention;
    status?: MentionStatus;
    expanded: boolean;
    label?: string;
}
function ActiveMention(props: ActiveMentionProps) {
    const [awaitingTask, setAwaitingTask] = useState(true);

    const { mention, requestUpdate, status, expanded } = props;

    useEffect(() => {
        if (status === null && requestUpdate) {
            requestUpdate(() => setAwaitingTask(!awaitingTask));
        }
    }, [status, awaitingTask]);

    return (
        <div
            className={`webmention-tester-temp card preview-wide`}
            title={`Submitted at ${props.mention.submitted_at}`}
        >
            <div className={classNames(props, "card-content")}>
                <Row className="flex-row-space-between">
                    <a href={`${props.mention.url}`}>{mention.url}</a>
                    <div>
                        <Label className="webmention-tester-temp-label">
                            {props.label}
                        </Label>

                        <Label>
                            Expires: {formatTimeDelta(mention.expires_in)}
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

interface MentionStatusProps {
    status?: MentionStatus;
    expanded: boolean;
}
function MentionStatus(props: MentionStatusProps) {
    const { status, expanded } = props;

    if (status === null) {
        return (
            <Row className="vertical-center">
                <span className="material-icons refresh">refresh</span>
                <div>Status unknown - please wait a moment...</div>
            </Row>
        );
    }

    const successMessage = status.successful ? (
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
        <Dropdown title={successMessage} expandedDefault={expanded}>
            <table className="webmention-tester-status">
                <tbody>
                    <StatusTableRow label="Code" content={status.status_code} />
                    <StatusTableRow label="Message" content={status.message} />
                    <StatusTableRow
                        label="Source"
                        content={status.source_url}
                    />
                    <StatusTableRow
                        label="Target"
                        content={status.target_url}
                    />
                    <StatusTableRow
                        label="Endpoint"
                        content={status.endpoint}
                    />
                </tbody>
            </table>
        </Dropdown>
    );
}

interface StatusTableRowProps {
    label: string;
    content: any;
}
function StatusTableRow(props: StatusTableRowProps) {
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

interface CreateTempMentionProps {
    onSubmit: () => void;
}
function CreateTempMention(props: CreateTempMentionProps) {
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

    const onKeyPress = (event: KeyboardEvent) => {
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

interface ErrorMessageProps {
    show: boolean;
}
function ErrorMessage(props: ErrorMessageProps) {
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

function create(url: string, data: any) {
    return fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "same-origin",
        headers: headers,
        body: JSON.stringify(data),
    });
}
