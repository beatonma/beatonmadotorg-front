import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { loadJson } from "./util";

const CONTAINER = "#related_media";
const MEDIA_VIEWER_WRAPPER_ID = "media_viewer_wrapper";
const MEDIA_VIEWER_ID = "media_viewer";

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

interface File {
    url: string;
    description: string;
    type: "image" | "video";
}
interface FileProps {
    file: File;
}

export function RelatedMediaApp(dom: Document | Element) {
    const container = dom.querySelector(CONTAINER);

    if (container) {
        ReactDOM.render(<RelatedMedia />, container);
    }
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

interface MediaViewerProps {
    appID?: string;
    files: File[];
}
function MediaViewer(props: MediaViewerProps) {
    const [fullscreen, setFullscreen] = useState(false);
    const { appID, files, ...rest } = props;

    useEffect(() => {
        handleScrolling(fullscreen);
    }, [fullscreen]);

    return (
        <>
            <h3>Media</h3>
            <div
                id={MEDIA_VIEWER_WRAPPER_ID}
                data-fullscreen={fullscreen}
                onClick={() => {
                    if (fullscreen) setFullscreen(false);
                }}
            >
                <div id={MEDIA_VIEWER_ID} data-fullscreen={fullscreen}>
                    {files.map(file => (
                        <MediaItem
                            file={file}
                            appID={appID}
                            key={file.url}
                            data-fullscreen={fullscreen}
                            onClick={() => setFullscreen(true)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

interface MediaItemProps extends FileProps {
    appID: string;
    onClick: () => void;
}
function MediaItem(props: MediaItemProps) {
    const { file, appID, ...rest } = props;

    const isVideo = isVideoFile(file.url);
    const isImage = isImageFile(file.url);

    const mediaProps = {
        file: file,
        description: getAccessibilityDescription(appID, file, isVideo, isImage),
    };

    return (
        <div className="media-viewer-item" {...rest}>
            {isImage ? <Image {...mediaProps} /> : <Video {...mediaProps} />}
            <Description file={file} />
        </div>
    );
}

function Description(props: FileProps) {
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

interface MediaProps extends FileProps {
    description: string;
}
function Image(props: MediaProps) {
    return (
        <img
            loading="lazy"
            className="related-image"
            src={props.file.url}
            alt={props.description}
            aria-label={props.description}
        />
    );
}

function Video(props: MediaProps) {
    return (
        <video
            className="related-video"
            src={props.file.url}
            aria-label={props.description}
            autoPlay={true}
            loop
            controls
            muted
        />
    );
}

function isVideoFile(filename: string) {
    return VIDEO_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
}

function isImageFile(filename: string) {
    return IMAGE_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
}

function getAccessibilityDescription(
    appID: string,
    file: File,
    isVideo: boolean,
    isImage: boolean
) {
    if (file.description) {
        return file.description;
    } else if (isVideo) {
        return appID ? `Video for app ${appID}` : "Related video";
    } else if (isImage) {
        return appID ? `Image for app ${appID}` : "Related image";
    }

    return "";
}

// function getMediaWrapper() {
//     return document.getElementById(MEDIA_VIEWER_WRAPPER_ID);
// }

function getMediaViewer() {
    return document.getElementById(MEDIA_VIEWER_ID);
}

// function setEventHandlers() {
//     // getMediaWrapper().addEventListener("click", toggleFullscreen);
//
//     const viewer = getMediaViewer();
//     viewer.addEventListener("wheel", e => {
//         e.preventDefault();
//         viewer.scrollBy(e.deltaY, 0);
//     });
// }
//
// function toggleFullscreen() {
//     const wrapper = getMediaWrapper();
//     if (wrapper) {
//         wrapper.dataset.fullscreen
//         // wrapper.classList.toggle("fullscreen");
//     }
// }

function handleScrolling(fullscreen: boolean) {
    const viewer = getMediaViewer();
    let focussedItemIndex = 0;
    let scrolling = false;

    viewer.addEventListener("wheel", e => {
        if (scrolling) {
            e.preventDefault();
            return;
        }

        const delta = e.deltaY;

        const horizontalScroll = () => {
            e.preventDefault();

            const children = viewer.children;
            const numChildren = children.length;

            if (delta > 0) {
                focussedItemIndex = Math.min(
                    focussedItemIndex + 1,
                    numChildren - 1
                );
            } else if (delta < 0) {
                focussedItemIndex = Math.max(0, focussedItemIndex - 1);
            }
            const focussedChild = children[focussedItemIndex] as HTMLElement;

            viewer.scrollTo({
                top: 0,
                left: focussedChild.offsetLeft - viewer.offsetLeft,
                behavior: "smooth",
            });
            scrolling = true;

            setTimeout(() => {
                // Briefly prevent scrolling to allow smooth-scroll to finish.
                scrolling = false;
            }, 200);
        };

        if (fullscreen) {
            horizontalScroll();
            return;
        }

        if (viewer.scrollLeft === 0 && delta < 0) {
            // Scroll up when at start of view -> scroll up normally
            return;
        }

        if (
            viewer.scrollLeft + viewer.offsetWidth >= viewer.scrollWidth &&
            delta > 0
        ) {
            // Scroll down when at end of view -> scroll down normally.
            return;
        }
        // Otherwise, scroll horizontally.
        horizontalScroll();
    });
}
