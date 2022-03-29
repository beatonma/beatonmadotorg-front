import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { render } from "react-dom";
import { formatDate } from "../../main/js/util";

const DashboardApp = () => {
    render(<Dashboard />, document.getElementById("dashboard_wrapper"));
};

const Dashboard = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        document.title = "Dashboard";
        fetch("status/", { method: "GET" })
            .then(response => response.json())
            .then(setStatus);
    }, []);

    if (status == null) return null;

    return (
        <>
            <h1>Dashboard</h1>
            <System system={status.system} />
            <Github github={status.github} />
            <div id="dashboard">
                <RecentViews views={status.views} />
                <RecentMentions mentions={status.mentions} />
                <RecentWebmail webmail={status.webmail} />
            </div>
            <Footer />
        </>
    );
};

const Github = props => {
    return (
        <div className="github">
            <span>
                <TimeStamp
                    label="Github cached at"
                    timestamp={props.github.cached_at}
                />{" "}
                |{" "}
                <TimeStamp
                    label="Valid until"
                    timestamp={props.github.valid_until}
                />
            </span>
        </div>
    );
};

const System = props => {
    return <div className="system">Uptime {props.system.uptime}</div>;
};

const RecentMentions = props => {
    return (
        <Group title="Recent mentions">
            {props.mentions.map(mention => (
                <Mention key={mention.published} mention={mention} />
            ))}
        </Group>
    );
};

const Mention = props => {
    const mention = props.mention;
    const source = new URL(mention.source_url);
    const target = new URL(mention.target_url);

    return (
        <div className="mention">
            <div className="row">
                <div className="hcard" title={mention.hcard?.name}>
                    <OptionalLink url={mention.hcard?.homepage}>
                        <div
                            className="avatar"
                            style={{
                                backgroundImage: `url(${
                                    mention.hcard?.avatar ||
                                    "/static/images/icon/ic_no-avatar.svg"
                                })`,
                            }}
                        ></div>
                    </OptionalLink>
                </div>
                <div>
                    <TimeStamp timestamp={mention.published} />
                    <div className="row">
                        <Url href={source.href} className="wm-source">
                            {source.hostname}
                        </Url>{" "}
                        <span className="material-icons">
                            keyboard_arrow_right
                        </span>{" "}
                        <Url href={target.href} className="wm-target">
                            {target.pathname}
                        </Url>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OptionalLink = props => {
    if (props.url) {
        return <a href={props.url} {...props} />;
    } else return <>{props.children}</>;
};

const RecentViews = props => {
    const [views, setViews] = useState([]);

    useEffect(() => {
        const collapsed = props.views.reduce((acc, x) => {
            if (acc.length == 0) {
                x.count = 1;
                acc.push(x);
                return acc;
            }
            const previous = acc.slice(-1)[0];
            if (previous.url == x.url) {
                previous.count += 1;
            } else {
                x.count = 1;
                acc.push(x);
            }
            return acc;
        }, []);
        setViews(collapsed);
    }, [props.views]);

    return (
        <Group title="Recent page views">
            {views.map(view => (
                <PageView view={view} key={view.timestamp} />
            ))}
        </Group>
    );
};

const PageView = props => {
    const view = props.view;
    const url = new URL(view.url);

    return (
        <a href={view.url}>
            <div
                href={view.url}
                key={view.timestamp}
                className="page-view row"
                title={`${view.device} | ${view.os} | ${view.browser}: ${view.ip}`}
            >
                <TimeStamp timestamp={view.timestamp} />
                <Url>{url.pathname}</Url>
                {view.count > 1 ? (
                    <div className="count">✕{view.count}</div>
                ) : (
                    <></>
                )}
            </div>
        </a>
    );
};

const RecentWebmail = props => {
    return (
        <Group title="Recent mail">
            {props.webmail.map(mail => (
                <Webmail mail={mail} key={mail.timestamp} />
            ))}
        </Group>
    );
};

const Webmail = props => {
    const mail = props.mail;

    return (
        <div
            className="webmail"
            title={`From ${mail.name} | Contact: ${mail.contact}`}
        >
            <TimeStamp timestamp={mail.timestamp} />
            <div className="row">
                <div className="webmail-name">{mail.name}</div>
                <div className="webmail-contact">{mail.contact}</div>
            </div>
            <div className="webmail-body">
                <LinkifyText>{mail.body}</LinkifyText>
            </div>
        </div>
    );
};

const Url = props => {
    const parts = props.children
        .replace("www.", "")
        .replace(".com", "")
        .split("");

    return (
        <OptionalLink url={props.href}>
            <div className={`url ${props.className || ""}`}>
                {parts.map((x, index) => {
                    if (x == "/")
                        return (
                            <span className="slash" key={index}>
                                {x}
                            </span>
                        );
                    else return <>{x}</>;
                })}
            </div>
        </OptionalLink>
    );
};

const LinkifyText = props => {
    const [linkified, setLinkified] = useState(null);
    const pattern = /((?:https?:\/\/)?(?:[\w-_.]+\.[\w-_./]+))/g;

    useEffect(() => {
        const split = props.children.split(pattern);

        setLinkified(
            split.map(x => {
                if (x.match(pattern)) {
                    const fixedUrl = x.startsWith("http") ? x : `https://${x}`;
                    try {
                        const url = new URL(fixedUrl);
                        return (
                            <>
                                [
                                <a
                                    className="linkified"
                                    title={url.href}
                                    href={url.href}
                                >
                                    {url.hostname}
                                </a>
                                ]
                            </>
                        );
                    } catch (e) {
                        console.log(`URL parsing error: ${x}: ${e}`);
                    }

                    return x;
                } else {
                    return x;
                }
            })
        );
    }, [props.children]);

    return <>{linkified}</>;
};

const Group = props => {
    return (
        <div className="group">
            <h3>{props.title}</h3>
            <div className="group-content">{props.children}</div>
        </div>
    );
};

const TimeStamp = props => {
    const timestamp = new Date(props.timestamp);

    const _date = formatDate(timestamp, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const date = _date == "Today" ? "" : _date;
    const time = timestamp.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <time className="timestamp" dateTime={timestamp}>
            {props.label} {date} {time}
        </time>
    );
};

const Footer = () => {
    return <footer></footer>;
};

DashboardApp();
