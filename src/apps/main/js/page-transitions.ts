import { loadPage, scrollToId } from "./util";
import { APPS } from "./apps";
import { createElement } from "react";

const itemAnimationDuration = 120;
const itemAnimationDelay = 40;
const enterInterpolator = "ease";
const pageAnimationDuration = 200;

/**
 * Expected structure:
 *
 *   <div id="{contentWrapperID}>
 *     <div id="{contentID}">
 *       <!-- Animated content here -->
 *     </div>
 *   </div>
 */
const contentID = "content"; // Hot-swappable page content.
const contentWrapperID = "content_wrapper"; // Placeholder parent of contentID.
const localStyleID = "local_style"; // Hot-swappable inline CSS.
const loadingID = "loading"; // globally available loading UI.
const noAnimationClass = "noanim"; // Links with this class opt out of hot-swapping content.

const onPageChangeClass = ".onPageChange";
const onPageUnloadClass = ".onPageUnload";

const animatedElements = ".card, .feed-item-card, article";

// Page transitions are enabled when travelling to URLs on these domains.
const domainsRegex = /(beatonma.org|inverness.io|localhost)/;

function onContentChanged(dom: Document | Element) {
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

export function showLoading(show: boolean) {
    document.getElementById(loadingID).dataset.active = `${show}`;
}

const getScript = (element: HTMLScriptElement) =>
    new Promise((resolve, reject) => {
        const src = element.src;
        element.parentElement.removeChild(element);

        const script: HTMLScriptElement = document.createElement("script");
        script.async = true;
        script.src = src;

        // @ts-ignore
        script.onload = script.onreadystatechange = function () {
            const loadState = this.readyState;

            if (loadState && loadState !== "loaded" && loadState !== "complete")
                return;

            // @ts-ignore
            script.onload = script.onreadystatechange = null;

            resolve(null);
        };

        document.body.appendChild(script);
    });

// function getScript(element: HTMLScriptElement, callback: () => void) {
//     const src = element.src;
//     element.parentElement.removeChild(element);
//
//     let script: HTMLScriptElement = document.createElement("script");
//     script.async = true;
//
//     script.onload = (_: GlobalEventHandlers, isAbort: Event): any => {
//         if (
//             isAbort ||
//             !script.readyState ||
//             /loaded|complete/.test(script.readyState)
//         ) {
//         }
//     };
//
//     // script.onload = script.onreadystatechange = (_, isAbort) => {
//     //     if (
//     //         isAbort ||
//     //         !script.readyState ||
//     //         /loaded|complete/.test(script.readyState)
//     //     ) {
//     //         script.onload = script.onreadystatechange = null;
//     //         script = undefined;
//     //
//     //         if (!isAbort && callback) {
//     //             callback();
//     //         }
//     //     }
//     // };
//
//     script.src = src;
//     document.body.appendChild(script);
// }

function init() {
    // Intercept all click events
    document.addEventListener("click", e => {
        let el: HTMLElement | ParentNode = e.target as HTMLElement;
        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        // while (el && !el.href) {
        //     el = el.parentNode;
        // }

        while (el && !(el instanceof HTMLAnchorElement)) {
            el = el.parentNode;
        }

        if (el) {
            const anchor = el as HTMLAnchorElement;
            const url = anchor.href;
            if (!domainsRegex.test(url)) {
                // If target is on a different domain then handle it the normal way
                return;
            }

            // Links annotated with 'noanim' class should be treated as external (no content transition animations)
            if (anchor.className.includes(noAnimationClass)) {
                return;
            }

            if (
                anchor.pathname === window.location.pathname &&
                anchor.search === window.location.search &&
                anchor.hash !== window.location.hash
            ) {
                // Handle links to element #id
                console.log(`navigate to ${anchor.hash}`);
                e.preventDefault();
                history.pushState(null, null, url);
                scrollToId(anchor.hash);
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

export function changePage(url: string, pushToHistory: boolean = true) {
    if (pushToHistory) {
        history.pushState(null, null, url);
    }

    showLoading(true);

    loadPage(url)
        .then(responseText => {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = responseText;

            document.title = wrapper.querySelector("title").textContent;
            (
                document.querySelector(
                    "meta[name=description]"
                ) as HTMLMetaElement
            ).content = (
                wrapper.querySelector(
                    "meta[name=description]"
                ) as HTMLMetaElement
            ).content;

            const newLocalStyle = wrapper.querySelector(
                `#${localStyleID}`
            ).innerHTML;
            document.getElementById(localStyleID).innerHTML = newLocalStyle;

            const oldContent = document.getElementById(contentID);
            const newContent = wrapper.querySelector(
                `#${contentID}`
            ) as HTMLElement;

            animatePageChange(oldContent, newContent, onContentChanged);
        })
        .catch(err => {
            console.error(err);
            window.location.href = url;
        });
}

function animatePageChange(
    oldContent: HTMLElement,
    newContent: HTMLElement,
    callback: (content: HTMLElement) => void
) {
    const contentWrapper = document.getElementById(contentWrapperID);
    const fadeOut = oldContent.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        pageAnimationDuration
    );

    fadeOut.onfinish = () => {
        contentWrapper.removeChild(oldContent);
        contentWrapper.appendChild(newContent);

        contentWrapper.scrollIntoView(true);

        showLoading(false);
        animateContentEnter(newContent);

        newContent.querySelectorAll(onPageChangeClass).forEach(el => {
            const script = el as HTMLScriptElement;
            if (script.src) {
                getScript(script);
            } else {
                try {
                    eval(script.innerHTML);
                } catch (err) {}
            }
        });

        oldContent.querySelectorAll(onPageUnloadClass).forEach(el => {
            const script = el as HTMLScriptElement;
            if (script.src) {
                getScript(script);
            } else {
                try {
                    eval(script.innerHTML);
                } catch (err) {}
            }
        });

        callback(newContent);
    };
}

function animateContentEnter(parent: Element) {
    let delay = 0;

    try {
        parent.querySelectorAll(animatedElements).forEach(el => {
            elementIn(el, delay);

            delay += itemAnimationDelay;
        });
    } catch (e) {}
}

function elementIn(element: Element, delay: number) {
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
