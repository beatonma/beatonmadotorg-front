const imageViewer = (() => {
    const ID_IMAGE_VIEWER_WRAPPER = 'image_viewer_wrapper';
    let imageUrls = [];

    function loadImages() {
        const matches = /app\/([\w.-]+)$/.exec(window.location.pathname);
        if (matches) {
            loadAppImages(matches[1]);
        }
        else {
            loadRelatedImages(window.location.pathname);
        }
    }

    function loadAppImages(appID) {
        loadJson(`/api/images/app/${appID}`)
            .then((json) => {
                if (json.images.length == 0) {
                    return;
                }
                buildViews(json.images, json.app_id);
                getImageWrapper().addEventListener('click', toggleFullscreen);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function loadRelatedImages(path) {
        loadJson(`/api/images/related?url=${path}`)
            .then((json) => {
                if (json.images.length == 0) {
                    return;
                }
                buildViews(json.images);
                getImageWrapper().addEventListener('click', toggleFullscreen);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function buildViews(images, appID) {
        return ReactDOM.render(
            <ImageViewer appID={appID} images={images}/>,
            document.getElementById('related_images')
        );
    }

    function ImageViewer(props) {
        function renderImages() {
            return props.images.map((image) => {
                const description = props.appID ? `Image for app ${props.appID}` : "Related image";
                return (<Image key={image.url} image={image} description={description}/>);
            });
        }

        return (
            <div className="card animate-visibility">
                <div className="card-content">
                    <h3>Images</h3>
                    <div id={ID_IMAGE_VIEWER_WRAPPER}>
                        <div id="image_viewer">
                            {renderImages()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Generic related image.
     */
    function Image(props) {
        function renderDescription(d) {
            if (d) {
                return (<div className="related-image-description">{d}</div>);
            }
        }

        return (
            <div className="image-viewer-item">
                <img className="related-image" src={props.image.url} alt={props.description} aria-label={props.description}/>
                {renderDescription(props.image.description)}
            </div>
        );
    }

    function getImageWrapper() {
        return document.getElementById(ID_IMAGE_VIEWER_WRAPPER);
    }

    function toggleFullscreen() {
        const viewer = getImageWrapper();
        if (viewer) {
            viewer.classList.toggle('fullscreen');
        }
    }

    loadImages();

    return {
        'load': loadImages,
        'toggleFullscreen': toggleFullscreen,
    }
})(window);