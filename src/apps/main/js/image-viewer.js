/**
 * @deprecated Replaced by React implementation: react/load-images.js
 */
const imageViewer = (() => {
    let imageUrls = [];

    function loadImages() {
        const matches = /app\/([\w.-]+)$/.exec(window.location.pathname);
        if (matches) {
            loadAppImages(matches[1]);
        }
    }

    function loadAppImages(appID) {
        loadJson(`/api/images/app/${appID}`).then((json) => {
            const images = json.images;
            if (images.length == 0) return;

            const template = document.getElementById(elements.templates.image).content;
            const root = document.getElementById(elements.id.app_images);
            const viewerWrapper = root.querySelector(`#${elements.id.image_viewer_wrapper}`);
            const viewer = viewerWrapper.querySelector(`#${elements.id.image_viewer}`);

            images.forEach((image) => {
                const item = document.importNode(template, true);

                const imageNode = item.querySelector('.app-image');
                imageNode.src = image.url;

                const descriptionNode = item.querySelector('.app-image-description');
                if (image.description) {
                    descriptionNode.textContent = image.description;
                    imageNode.setAttribute('aria-label', image.description);
                    imageNode.setAttribute('alt', image.description);
                    imageNode.setAttribute('title', image.description);
                } else {
                    descriptionNode.classList.add('hidden');
                    imageNode.setAttribute('aria-label', `Image for app '${appID}'`);
                    imageNode.setAttribute('alt', `Image for app '${appID}'`);
                    imageNode.setAttribute('title', `Image for app '${appID}'`);
                }

                viewer.appendChild(item);
            });

            const card = root.querySelector('.card');
            card.classList.add('animate-visibility');
            card.classList.remove('hidden');

            viewerWrapper.addEventListener('click', toggleFullscreen);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    function toggleFullscreen() {
        const viewer = document.getElementById(elements.id.image_viewer_wrapper);
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