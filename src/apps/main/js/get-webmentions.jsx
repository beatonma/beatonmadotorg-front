import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { loadJson } from "./util";

const getContainerElement = () => document.getElementById("mentions");

export function WebmentionsApp() {
    ReactDOM.render(<Webmentions mentions={mentions} />, getContainerElement());
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

        loadJson(url)
            .then(data => data.mentions)
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

function MentionsContainer(props) {
    const mentions = props.mentions;
    const showWhenEmpty = props.showWhenEmpty;
    const isEmpty = mentions.length == 0;

    if (isEmpty && !showWhenEmpty) {
        return null;
    }

    const [title, setTitle] = useState("This page has been mentioned by:");
    const [emptyMessage, setEmptyMessage] = useState("Nobody :(");
    const cardExists = document.getElementById("related_content");

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

    useEffect(() => {
        // Insert into existing card if available, or create new card if none
        if (!cardExists) {
            getContainerElement().classList.add("card");
        }
    }, []);

    const content = isEmpty ? (
        <div className="mentions-empty">{emptyMessage}</div>
    ) : (
        mentions.map(m => <Webmention key={m.published} webmention={m} />)
    );

    return (
        <div className={"overflow" + (cardExists ? "" : " card-content")}>
            <h3>{title}</h3>
            <div className="row mentions">{content}</div>
        </div>
    );
}

function Webmention(props) {
    const mention = props.webmention;
    const avatarStyle = {
        backgroundImage: `url(${
            mention.hcard?.avatar || "/static/images/icon/ic_no-avatar.svg"
        })`,
    };
    return (
        <div className="mention-mini" title={mention?.quote}>
            <div className="tooltip">
                <a
                    className="mention-source"
                    aria-label="Mention source"
                    href={mention.source_url || ""}
                >
                    <div
                        className="avatar mention-avatar"
                        style={avatarStyle}
                    ></div>
                </a>
                <div className="tooltip-popup hcard-popup">
                    <div className="hcard-popup flex-row-start">
                        <a
                            className="hcard-homepage"
                            aria-label="Mention author homepage"
                            href={mention.hcard?.homepage || ""}
                        >
                            <div className="hcard-content">
                                <div className="hcard-name">
                                    {mention.hcard?.name ||
                                        mention.hcard?.homepage ||
                                        "Somebody?"}
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
