import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { microformats } from "./microformats";
import { formatDate, loadJson } from "./util";

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
            .then((data: ApiResponse) => data.notes)
            .then(setItems);
    }, []);

    return (
        <NotesLayout>
            <NotesContent items={items} />
        </NotesLayout>
    );
}

type NotesLayoutProps = {
    children?: React.ReactNode;
};
function NotesLayout(props: NotesLayoutProps) {
    return (
        <>
            <h3>Notes</h3>
            <div className="notes">{props.children}</div>
        </>
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

type NoteProps = {
    note: Note;
    media?: Media;
    key: any;
};
function Note(props: NoteProps) {
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

type MediaProps = {
    media?: Media;
};
function Media(props: MediaProps) {
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
                src={`https://beatonma.org${url}`}
                alt={description}
                aria-label={description}
                className="media"
            />
        );
    }
}
