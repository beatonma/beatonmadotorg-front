const imageViewer = (() => {
    const ID_IMAGE_VIEWER_WRAPPER = 'image_viewer_wrapper';
    let imageUrls = [];

    function loadImages() {
        const matches = /app\/([\w.-]+)$/.exec(window.location.pathname);
        if (matches) {
            loadAppImages(matches[1]);
        }
    }

    function loadAppImages(appID) {
        loadJson(`/api/images/app/${appID}`)
        .then((json) => {
            buildViews(json.app_id, json.images);
            getImageWrapper().addEventListener('click', toggleFullscreen);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    function buildViews(appID, images) {
        return ReactDOM.render(
            <ImageViewer appID={appID} images={images}/>,
            document.getElementById('app_images'));
    }

    function ImageViewer(props) {
        function renderImages() {
            return props.images.map((image) => <Image key={image.url} image={image} appID={props.appID}/>);
        }

        return (
            <div className="card animate-visibility">
                <div className="card-content">
                    <h3>Images</h3>
                    <div id={ID_IMAGE_VIEWER_WRAPPER}>
                        <div id="image_viewer">
                            {renderImages(props.images)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function Image(props) {
        function renderDescription(d) {
            if (d) {
                return (<div className="app-image-description">{d}</div>)
            }
        }

        const url = props.image.url;
        const description = props.image.description || `Image for app '${props.appID}'`;
        return (
            <div className="image-viewer-item">
                <img className="app-image" src={url} alt={description} aria-label={description}/>
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