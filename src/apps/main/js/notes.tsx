import React, { useEffect, useState } from "react";
import { microformats } from "./microformats";
import { LoadingSpinner } from "./components/loading";
import { formatDate, loadJson } from "./util";
import { LargeFeedItem } from "./components/feed-item";
import { createRoot } from "react-dom/client";

const URL = "/api/notes/";
const CONTAINER = "#notes";

type Note = {
    content: string;
    url: string;
    timestamp: string;
    is_published: boolean;
};
type Media = {
    url: string;
    description?: string;
    type: string;
};
type NoteItem = {
    note: Note;
    media?: Media;
};
type ApiResponse = {
    notes: NoteItem[];
};

export function NotesApp(dom: Document | Element) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        const root = createRoot(container);
        root.render(<Notes />);
    }
}

function Notes() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        loadJson(URL)
            .then((data: ApiResponse) => data.notes)
            .then(setItems);
    }, []);

    return (
        <LargeFeedItem header="Notes" parentID={CONTAINER}>
            <div className="notes">
                <NotesContent items={items} />
            </div>
        </LargeFeedItem>
    );
}

type NotesContentProps = {
    items: NoteItem[];
};
function NotesContent(props: NotesContentProps) {
    const items = props.items;
    if (items != null) {
        return (
            <>
                {items.map(item => (
                    <NoteUI
                        note={item.note}
                        media={item.media}
                        key={item.note.url}
                    />
                ))}
            </>
        );
    } else {
        return <LoadingSpinner />;
    }
}

type NoteProps = {
    note: Note;
    media?: Media;
    key: any;
};
function NoteUI(props: NoteProps) {
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

            <MediaUI media={props.media} />
        </div>
    );
}

type MediaProps = {
    media?: Media;
};
function MediaUI(props: MediaProps) {
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

type MediaViewProps = {
    media: Media;
};
function MediaView(props: MediaViewProps) {
    const { url, description, type } = { ...props.media };

    if (type == "video") {
        return (
            <video
                src={url}
                className="media"
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
                aria-label={description}
                controls
            ></audio>
        );
    } else if (type == "image") {
        return (
            <img
                src={url}
                alt={description}
                aria-label={description}
                className="media"
            />
        );
    }
}
