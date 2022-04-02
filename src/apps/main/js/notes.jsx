import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import microformats from "./microformats";
import { formatDate, loadJson } from "./util";

const URL = "/api/notes/";
const CONTAINER = "#notes";

export function NotesApp(dom = document) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        ReactDOM.render(<Notes />, container);
    }
}

function Notes() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        loadJson(URL)
            .then(data => data.notes)
            .then(setItems);
    }, []);

    return (
        <NotesLayout>
            <NotesContent items={items} />
        </NotesLayout>
    );
}

function NotesLayout(props) {
    return (
        <>
            <h3>Notes</h3>
            <div className="notes">{props.children}</div>
        </>
    );
}

function NotesContent(props) {
    const items = props.items;
    if (items != null) {
        return (
            <>
                {items.map(item => (
                    <Note
                        note={item.note}
                        media={item.media}
                        key={item.note.url}
                    />
                ))}
            </>
        );
    } else {
        return <div className="loading-spinner"></div>;
    }
}

function Note(props) {
    const note = props.note;
    const formattedDate = formatDate(note.timestamp);

    return (
        <div className={`note ${microformats.entry}`}>
            <div
                className={`${microformats.entry}`}
                dangerouslySetInnerHTML={{ __html: note.content }}
            ></div>

            <time
                className={microformats.datePublished}
                dateTime={note.timestamp}
                title={formattedDate}
            >
                {formattedDate}
            </time>

            <Media media={props.media} />
        </div>
    );
}

function Media(props) {
    const media = props.media;
    if (!media) return null;

    return (
        <div className="media-wrapper">
            <a href={media.url} title={`Open ${media.type}`} className="noanim">
                <MediaView media={media} />
            </a>
        </div>
    );
}

function MediaView(props) {
    const { url, description, type } = { ...props.media };

    if (type == "video") {
        return (
            <video
                src={url}
                className="media"
                alt={description}
                aria-label={description}
                muted
                autoPlay
            ></video>
        );
    } else if (type == "audio") {
        return (
            <audio
                src={url}
                className="media"
                alt={description}
                aria-label={description}
                controls
            ></audio>
        );
    } else if (type == "image") {
        return (
            <img
                src={`https://beatonma.org${url}`}
                alt={description}
                aria-label={description}
                className="media"
            />
        );
    }
}
