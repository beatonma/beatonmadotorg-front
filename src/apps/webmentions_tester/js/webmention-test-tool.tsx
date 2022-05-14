import React, {
    useState,
    useEffect,
    KeyboardEvent,
    HTMLAttributes,
} from "react";
import { Dropdown, Label, Row } from "../../main/js/components";
import { loadJson, getCsrfToken, formatTimeDelta } from "../../main/js/util";
import { MaterialIcon } from "../../main/js/components/icons";
import { createRoot } from "react-dom/client";

const CONTAINER = "#webmentions_testing_tool";
const ENDPOINT = "active/";

export function WebmentionTesterApp(dom: Document | Element) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        const root = createRoot(container);
        root.render(<WebmentionsTester />);
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
        loadJson(ENDPOINT).then(data => {
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
            <div className="header-row">
                <h2>Active mentions</h2>
                <Label>{`Temporary mentions submitted in the last ${timeout}`}</Label>
            </div>

            <div className="active-mentions">
                <SampleActiveMention
                    ttl={ttl}
                    expanded={mentions.length == 0}
                />
                {mentions.map(m => (
                    <ActiveMentionUI
                        mention={m}
                        key={m.submitted_at}
                        expanded={false}
                        requestUpdate={requestUpdate}
                    />
                ))}
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
        <ActiveMentionUI
            mention={sampleData}
            className="webmention-tester-sample"
            label="Sample"
            expanded={props.expanded}
        />
    );
}

interface ActiveMentionProps extends HTMLAttributes<any> {
    requestUpdate?: (callback: () => void) => void;
    mention: ActiveMention;
    expanded: boolean;
    label?: string;
}
function ActiveMentionUI(props: ActiveMentionProps) {
    const [awaitingTask, setAwaitingTask] = useState(true);

    const { mention, requestUpdate, label, expanded } = props;
    const status = mention?.status;

    useEffect(() => {
        if (status === null && requestUpdate) {
            requestUpdate(() => setAwaitingTask(!awaitingTask));
        }
    }, [status, awaitingTask]);

    return (
        <div className="active-mention">
            <div className="toolbar">
                <div>
                    <Label className="temp">{label}</Label>
                    <a href={`${mention.url}`}>{mention.url}</a>
                </div>

                <div className="right">
                    <Label>
                        Expires: {formatTimeDelta(mention.expires_in)}
                    </Label>
                </div>
            </div>

            <MentionStatusUI status={status} expanded={expanded} />
        </div>
    );
}

interface MentionStatusProps {
    status?: MentionStatus;
    expanded: boolean;
}
function MentionStatusUI(props: MentionStatusProps) {
    const { status, expanded } = props;

    if (status === null) {
        return (
            <Row>
                <MaterialIcon className="refresh">refresh</MaterialIcon>
                <div>Status unknown - please wait a moment...</div>
            </Row>
        );
    }

    const successMessage = status.successful ? (
        <Row>
            <MaterialIcon>check</MaterialIcon>
            <span>Accepted by server</span>
        </Row>
    ) : (
        <Row>
            <MaterialIcon className="warn">close</MaterialIcon>
            <span>Rejected by server</span>
        </Row>
    );

    return (
        <Dropdown header={successMessage} expandedDefault={expanded}>
            <table className="status">
                <tbody>
                    <StatusTableRow
                        label="Status"
                        content={status.status_code}
                    />
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
                <code className="status-content">{props.content}</code>
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
        create(ENDPOINT, { url: url })
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
        if (event.key === "Enter") {
            event.preventDefault();
            post();
        }
    };

    return (
        <section>
            <h2>Temporary mentions</h2>
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

            <div className="form">
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://mysite.example/my-article/"
                    onKeyUp={onKeyPress}
                    autoFocus
                />
                <button onClick={post}>Submit</button>
                <ErrorMessage show={isError} />
            </div>

            <p>
                If your page mentions this page, it should appear{" "}
                <a href="#related">below</a>.
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
