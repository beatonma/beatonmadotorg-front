import { loadPage, scrollToId } from "./util";
import { APPS } from "./apps";

const itemAnimationDuration = 120;
const itemAnimationDelay = 40;
const enterInterpolator = "ease";
const pageAnimationDuration = 200;

/**
 * Expected structure:
 *
 *   <main>
 *     <div id="{contentID}">
 *       <!-- Animated content here -->
 *     </div>
 *   </main>
 */
const contentID = "content"; // Hot-swappable page content.
const localStyleID = "local_style"; // Hot-swappable inline CSS.
const loadingID = "loading"; // globally available loading UI.
const noAnimationClass = "noanim"; // Links with this class opt out of hot-swapping content.

const onPageChangeClass = ".onPageChange";
const onPageUnloadClass = ".onPageUnload";

const animatedElements = ".card, .feed-item-card";

// Page transitions are enabled when travelling to URLs on these domains.
const domainsRegex = /(beatonma.org|inverness.io|localhost)/;

function onContentChanged(dom) {
    APPS.forEach(app => {
        try {
            app(dom);
        } catch (e) {
            console.error(`App ${app.name} failed: ${e}`);
        }
    });

    if (window.location.hash) {
        scrollToId(window.location.hash);
    }
}

export function showLoading(show) {
    document.getElementById(loadingID).dataset.active = show;
}

function getScript(element, callback) {
    const src = element.src;
    element.parentElement.removeChild(element);

    let script = document.createElement("script");
    script.async = 1;

    script.onload = script.onreadystatechange = (_, isAbort) => {
        if (
            isAbort ||
            !script.readyState ||
            /loaded|complete/.test(script.readyState)
        ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort && callback) {
                callback();
            }
        }
    };

    script.src = src;
    document.body.appendChild(script);
}

function init() {
    // Intercept all click events
    document.addEventListener("click", e => {
        let el = e.target;
        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        while (el && !el.href) {
            el = el.parentNode;
        }
        if (el) {
            const url = el.href;
            if (!domainsRegex.test(url)) {
                // If target is on a different domain then handle it the normal way
                return;
            }

            // Links annotated with 'noanim' class should be treated as external (no content transition animations)
            if (el.className.includes(noAnimationClass)) {
                return;
            }

            if (
                el.pathname === window.location.pathname &&
                el.search === window.location.search &&
                el.hash !== window.location.hash
            ) {
                // Handle links to element #id
                console.log(`navigate to ${el.hash}`);
                e.preventDefault();
                history.pushState(null, null, url);
                scrollToId(el.hash);
            } else {
                // Otherwise fetch content from the target and insert it
                // into the current page
                e.preventDefault();
                changePage(url);
            }
        }
    });

    window.addEventListener("popstate", () =>
        // Intercept 'back' events
        changePage(window.location.href, false)
    );

    window.addEventListener("load", () => {
        onContentChanged(document);
        window.removeEventListener("load", this);
    });
}

export function changePage(url, pushToHistory = true) {
    if (pushToHistory) {
        history.pushState(null, null, url);
    }

    showLoading(true);

    loadPage(url)
        .then(responseText => {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = responseText;

            document.title = wrapper.querySelector("title").textContent;

            const newLocalStyle = wrapper.querySelector(
                `#${localStyleID}`
            ).innerHTML;
            document.getElementById(localStyleID).innerHTML = newLocalStyle;

            const oldContent = document.getElementById(contentID);
            const newContent = wrapper.querySelector(`#${contentID}`);

            animatePageChange(oldContent, newContent, onContentChanged);
        })
        .catch(err => {
            console.error(err);
            window.location.href = url;
        });
}

function animatePageChange(oldContent, newContent, callback) {
    const main = document.getElementsByTagName("main").item(0);
    const fadeOut = oldContent.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        pageAnimationDuration
    );

    fadeOut.onfinish = () => {
        main.removeChild(oldContent);
        main.appendChild(newContent);

        main.scrollIntoView(true);

        showLoading(false);
        animateCardsIn(newContent);

        newContent.querySelectorAll(onPageChangeClass).forEach(el => {
            if (el.src) {
                getScript(el);
            } else {
                try {
                    eval(el.innerHTML);
                } catch (err) {}
            }
        });

        oldContent.querySelectorAll(onPageUnloadClass).forEach(el => {
            if (el.src) {
                getScript(el);
            } else {
                try {
                    eval(el.innerHTML);
                } catch (err) {}
            }
        });

        callback(newContent);
    };
}

function animateCardsIn(parent) {
    let delay = 0;

    try {
        parent.querySelectorAll(animatedElements).forEach(el => {
            elementIn(el, delay);

            delay += itemAnimationDelay;
        });
    } catch (e) {}
}

function elementIn(element, delay) {
    element.animate([{ opacity: 0 }, { opacity: 0 }], {
        delay: 0,
        duration: delay || 0,
    });

    element.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay: delay || 0,
        duration: itemAnimationDuration,
        easing: enterInterpolator,
    });

    element.animate(
        [{ transform: "translateY(50px)" }, { transform: "translateY(0px)" }],
        {
            delay: delay || 0,
            duration: itemAnimationDuration,
            easing: enterInterpolator,
        }
    );
}

init();
