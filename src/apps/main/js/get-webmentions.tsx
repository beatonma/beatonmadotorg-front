import React, { useState, useEffect } from "react";
import { loadJson } from "./util";
import { createRoot } from "react-dom/client";

const CONTAINER = "#mentions";
const getContainerElement = () => document.getElementById("mentions");

interface HCard {
    name: string;
    avatar?: string;
    homepage: string;
}
interface Mention {
    hcard: HCard;
    quote?: string;
    source_url: string;
    published: string;
    type: string;
}

export async function WebmentionsApp(dom: Document | Element) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        const root = createRoot(container);
        root.render(<Webmentions />);
    }
}

function Webmentions() {
    const [mentions, setMentions] = useState(null);
    const [showWhenEmpty, setShowWhenEmpty] = useState(false);

    useEffect(() => {
        // If data-show-when-empty is defined, allow rendering even when there are no mentions to display.
        if (
            typeof getContainerElement().dataset.showWhenEmpty !== "undefined"
        ) {
            setShowWhenEmpty(true);
        }
    }, []);

    useEffect(() => {
        const url = new URL(
            `${window.location.protocol}//${window.location.host}/webmention/get`
        );
        url.searchParams.append("url", window.location.pathname);

        loadJson(url.href)
            .then(data => data.mentions)
            .then((mentions: Mention[]) => {
                let keys: string[] = [];
                let unique = mentions.filter(x => {
                    if (keys.includes(x.source_url)) return false;
                    else {
                        keys.push(x.source_url);
                        return true;
                    }
                });
                return unique;
            })
            .then(setMentions)
            .catch(console.error);
    }, []);

    if (mentions) {
        return (
            <MentionsContainer
                mentions={mentions}
                showWhenEmpty={showWhenEmpty}
            />
        );
    }
    return null;
}

interface MentionsContainerProps {
    mentions: Mention[];
    showWhenEmpty: boolean;
}
function MentionsContainer(props: MentionsContainerProps) {
    const { mentions, showWhenEmpty } = props;
    const isEmpty = mentions.length == 0;

    if (isEmpty && !showWhenEmpty) {
        return null;
    }

    const [title, setTitle] = useState("Mentions");
    const [emptyMessage, setEmptyMessage] = useState("Nobody :(");

    useEffect(() => {
        const dataset = getContainerElement().dataset;
        const customTitle = isEmpty ? dataset.titleWhenEmpty : dataset.title;
        if (typeof customTitle !== "undefined") {
            setTitle(customTitle);
        }

        const customEmptyMessage = dataset.emptyMessage;
        if (typeof customEmptyMessage !== "undefined") {
            setEmptyMessage(customEmptyMessage);
        }
    }, []);

    const content = isEmpty ? (
        <div className="mentions-empty">{emptyMessage}</div>
    ) : (
        mentions.map(m => <Webmention key={m.published} mention={m} />)
    );

    return (
        <>
            <h3 data-animate-in={true}>{title}</h3>
            <div className="mentions" data-animate-in={true}>
                {content}
            </div>
        </>
    );
}

interface MentionProps {
    mention: Mention;
}
function Webmention(props: MentionProps) {
    const { mention } = props;
    const hasQuote = mention.quote !== null;

    return (
        <a
            className="mention"
            title={mention.source_url}
            href={mention.source_url}
            data-quoted={hasQuote}
        >
            <HCardInfo hcard={mention.hcard} sourceUrl={mention.source_url} />
            <Quote quote={mention.quote} />
        </a>
    );
}

interface HCardProps {
    hcard?: HCard;
    sourceUrl: string;
}
function HCardInfo(props: HCardProps) {
    const { hcard, sourceUrl } = props;
    if (!hcard) return <NullHcard url={sourceUrl} />;

    const { name, avatar, homepage } = hcard;

    return (
        <div className="mention-hcard">
            <Avatar name={name} url={avatar} />
            {name}
        </div>
    );
}

interface NullHcardProps {
    url: string;
}
function NullHcard(props: NullHcardProps) {
    const { url } = props;

    try {
        const host = new URL(url).host.replace("www.", "");

        return (
            <div className="mention-hcard">
                <div className="mention-avatar-null">{host[0]}</div>
                {host}
            </div>
        );
    } catch {
        return (
            <div className="mention-hcard">
                <div className="mention-avatar-null">?</div>
                Unknown
            </div>
        );
    }
}

interface AvatarProps {
    name: string;
    url?: string;
}
function Avatar(props: AvatarProps) {
    const { name, url } = props;

    if (!url) return null;

    return (
        <img loading="lazy" src={url} className="mention-avatar" alt={name} />
    );
}

interface QuoteProps {
    quote?: string;
}
function Quote(props: QuoteProps) {
    const { quote } = props;
    if (!quote) return null;

    return <div className="mention-quote">{quote}</div>;
}
