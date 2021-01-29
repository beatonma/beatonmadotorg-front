const mediaViewer = (() => {
    const ID_CONTAINER = "related_media";
    const ID_MEDIA_VIEWER_WRAPPER = 'media_viewer_wrapper';
    const ID_MEDIA_VIEWER = 'media_viewer';

    const IMAGE_FILE_TYPES = [
        '.apng',
        '.avif',
        '.gif',
        '.jpg',
        '.jpeg',
        '.png',
        '.svg',
        '.webp',
    ];

    const VIDEO_FILE_TYPES = [
        '.mp4',
        '.webm',
    ];

    function loadMedia() {
        const matches = /app\/([\w.-]+)$/.exec(window.location.pathname);
        if (matches) {
            loadAppImages(matches[1]);
        }
        else {
            loadRelatedMedia(window.location.pathname);
        }
    }

    function loadAppImages(appID) {
        loadJson(`/api/images/app/${appID}`)
            .then((json) => {
                if (json.images.length == 0) {
                    return;
                }
                buildViews(json.images, json.app_id);
                setEventHandlers();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function loadRelatedMedia(path) {
        loadJson(`/api/related_media?url=${path}`)
            .then((json) => {
                if (json.files.length == 0) {
                    return;
                }
                buildViews(json.files);
                setEventHandlers();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function buildViews(files, appID) {
        return ReactDOM.render(
            <MediaViewer appID={appID} files={files}/>,
            document.getElementById(ID_CONTAINER)
        );
    }

    function MediaViewer(props) {
        function isVideoFile(filename) {
            return VIDEO_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
        }

        function isImageFile(filename) {
            return IMAGE_FILE_TYPES.filter(type => filename.endsWith(type)).length > 0;
        }

        function getDescription(file, isVideo, isImage) {
            if (file.description) {
                return file.description;
            }
            else if (isVideo) {
                if (props.appID) {
                    return `Video for app ${props.appID}`;
                }
                else {
                    return 'Related video';
                }
            }
            else if (isImage) {
                if (props.appID) {
                    return `Image for app ${props.appID}`;
                }
                else {
                    return 'Related image';
                }
            }
            return '';
        }

        function renderMedia() {
            return props.files.map((file) => {
                const isVideo = isVideoFile(file.url);
                const isImage = isImageFile(file.url);

                const description = getDescription(file, isVideo, isImage);
                
                if (isImage) {
                    return (<Image key={file.url} file={file} description={description}/>);
                }
                else if (isVideo) {
                    return (<Video key={file.url} file={file} description={description}/>);
                }
            });
        }

        return (
            <div className="card animate-visibility">
                <div className="card-content">
                    <h3>Media</h3>
                    <div id={ID_MEDIA_VIEWER_WRAPPER}>
                        <div id={ID_MEDIA_VIEWER}>
                            {renderMedia()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    
    function renderDescription(d) {
        if (d) {
            return (<div className="related-media-description">{d}</div>);
        }
    }

    function Image(props) {
        return (
            <div className="media-viewer-item">
                <img className="related-image" src={props.file.url} alt={props.description} aria-label={props.description}/>
                {renderDescription(props.file.description)}
            </div>
        );
    }

    function Video(props) {
        return (
            <div className="media-viewer-item">
                <video className="related-video" src={props.file.url} alt={props.description} aria-label={props.description} autoPlay={true} loop controls muted/>
                {renderDescription(props.file.description)}
            </div>
        )
    }

    function getMediaWrapper() {
        return document.getElementById(ID_MEDIA_VIEWER_WRAPPER);
    }

    function getMediaViewer() {
        return document.getElementById(ID_MEDIA_VIEWER);
    }

    function setEventHandlers() {
        getMediaWrapper().addEventListener('click', toggleFullscreen);

        const viewer = getMediaViewer();
        viewer.addEventListener('wheel', (e) => {
            e.preventDefault();
            viewer.scrollBy(e.deltaY, 0);
        });
    }

    function toggleFullscreen() {
        const wrapper = getMediaWrapper();
        if (wrapper) {
            wrapper.classList.toggle('fullscreen');
        }
    }

    loadMedia();

    return {
        'load': loadMedia,
        'toggleFullscreen': toggleFullscreen,
    }
})(window);
