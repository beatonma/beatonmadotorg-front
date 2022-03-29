import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { loadJson } from "./util";

const ID_CONTAINER = "related_media";
const ID_MEDIA_VIEWER_WRAPPER = "media_viewer_wrapper";
const ID_MEDIA_VIEWER = "media_viewer";

const IMAGE_FILE_TYPES = [
    ".apng",
    ".avif",
    ".gif",
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".webp",
];

const VIDEO_FILE_TYPES = [".mp4", ".webm"];

export function RelatedMediaApp() {
    ReactDOM.render(<RelatedMedia />, document.getElementById(ID_CONTAINER));
}

function RelatedMedia() {
    const [files, setFiles] = useState(null);
    const [appID, setAppID] = useState(null);

    useEffect(() => {
        loadJson(`/api/related_media/?url=${window.location.pathname}`)
            .then(data => data.files)
            .then(setFiles);
    }, []);

    useEffect(() => {
        const matches = /app\/([\w.-]+)$/.exec(window.location.pathname);
        if (matches) {
            setAppID(matches[1]);
        }
    }, []);

    if (files && files.length > 0) {
        return <MediaViewer appID={appID} files={files} />;
    } else {
        return null;
    }
}

function MediaViewer(props) {
    useEffect(setEventHandlers, []);

    return (
        <div className="card animate-visibility">
            <div className="card-content">
                <h3>Media</h3>
                <div id={ID_MEDIA_VIEWER_WRAPPER}>
                    <div id={ID_MEDIA_VIEWER}>
                        {props.files.map(file => (
                            <MediaItem file={file} key={file.url} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MediaItem(props) {
    const file = props.file;

    const isVideo = isVideoFile(file.url);
    const isImage = isImageFile(file.url);

    const mediaProps = {
        file: file,
        description: getAccessibilityDescription(
            props.appID,
            file,
            isVideo,
            isImage
        ),
    };

    return (
        <div className="media-viewer-item">
            {isImage ? <Image {...mediaProps} /> : <Video {...mediaProps} />}
            <Description file={file} />
        </div>
    );
}

function Description(props) {
    const description = props.file.description;

    if (description == null) {
        return <></>;
    }
    return (
        <div className="related-media-description">
            {props.file.description}
        </div>
    );
}

function Image(props) {
    return (
        <img
            className="related-image"
            src={props.file.url}
            alt={props.description}
            aria-label={props.description}
        />
    );
}

function Video(props) {
    return (
        <video
            className="related-video"
            src={props.file.url}
            alt={props.description}
            aria-label={props.description}
            autoPlay={true}
            loop
            controls
            muted
        />
    );
}

function isVideoFile(filename) {
    return VIDEO_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
}

function isImageFile(filename) {
    return IMAGE_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
}

function getAccessibilityDescription(appID, file, isVideo, isImage) {
    if (file.description) {
        return file.description;
    } else if (isVideo) {
        return appID ? `Video for app ${appID}` : "Related video";
    } else if (isImage) {
        return appID ? `Image for app ${appID}` : "Related image";
    }

    return "";
}

function getMediaWrapper() {
    return document.getElementById(ID_MEDIA_VIEWER_WRAPPER);
}

function getMediaViewer() {
    return document.getElementById(ID_MEDIA_VIEWER);
}

function setEventHandlers() {
    getMediaWrapper().addEventListener("click", toggleFullscreen);

    const viewer = getMediaViewer();
    viewer.addEventListener("wheel", e => {
        e.preventDefault();
        viewer.scrollBy(e.deltaY, 0);
    });
}

function toggleFullscreen() {
    const wrapper = getMediaWrapper();
    if (wrapper) {
        wrapper.classList.toggle("fullscreen");
    }
}
