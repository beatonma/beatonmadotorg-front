/**
 * Expected structure:
 *
 *   <div id="{contentWrapperID}>
 *     <div id="{contentID}">
 *       <!-- Animated content here -->
 *     </div>
 *   </div>
 */
import { loadPage, scrollToId } from "./util";
import { APPS } from "./apps";

const ItemAnimationDelay = 40;
const PageAnimationDuration = 200;

// Hot-swappable page content.
const ContentID = "content";

// Placeholder parent of contentID.
const ContentWrapperID = "content_wrapper";

// Hot-swappable inline CSS.
const LocalStyleID = "local_style";

// globally available loading UI
const LoadingID = "loading";

// Links with this class opt out of hot-swapping content.
const NoAnimationClass = "noanim";

// Disable animations when the URL path matches this pattern.
const NoAnimationPathsRegex = /(webapp)\/.*/;

const OnPageChangeClass = ".onPageChange";
const OnPageUnloadClass = ".onPageUnload";

const AnimatedElementSelector = ".card, .feed-item-card, article";

// Page transitions are enabled when travelling to URLs on these domains.
const DomainsRegex = /(beatonma.org|inverness.io|localhost)/;

async function onContentChanged(dom: Document | Element) {
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

export const showLoading = (show: boolean) => {
    document.getElementById(LoadingID).dataset.active = `${show}`;
};

const getScript = async (element: HTMLScriptElement) => {
    const src = element.src;
    element.parentElement.removeChild(element);

    const script: HTMLScriptElement = document.createElement("script");
    script.async = true;
    script.src = src;

    document.body.appendChild(script);
};

function shouldAnimateTransition(
    anchor: HTMLAnchorElement | URL | Location
): boolean {
    if (!DomainsRegex.test(anchor.href)) {
        // If target is on a different domain then handle it the normal way
        return false;
    }

    if (NoAnimationPathsRegex.test(anchor.pathname)) {
        return false;
    }

    // Links annotated with 'noanim' class should be treated as external (no content transition animations)
    if (
        anchor instanceof HTMLAnchorElement &&
        anchor.className.includes(NoAnimationClass)
    ) {
        return false;
    }

    return true;
}

function shouldScrollTo(anchor: HTMLAnchorElement | URL | Location): boolean {
    return (
        anchor.pathname === window.location.pathname &&
        anchor.search === window.location.search
    );
}

function setup() {
    // Intercept all click events
    document.addEventListener("click", e => {
        let el: HTMLElement | ParentNode = e.target as HTMLElement;

        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        while (el && !(el instanceof HTMLAnchorElement)) {
            el = el.parentNode;
        }

        if (!el) return;
        const anchor = el as HTMLAnchorElement;

        if (!shouldAnimateTransition(anchor)) return;

        if (anchor.hash && shouldScrollTo(anchor)) {
            // Handle links to element #id
            e.preventDefault();
            history.pushState(null, null, anchor.href);
            scrollToId(anchor.hash);
            return;
        }

        // Otherwise fetch content from the target and insert it
        // into the current page
        e.preventDefault();
        changePage(anchor.href);
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
                `#${LocalStyleID}`
            ).innerHTML;
            document.getElementById(LocalStyleID).innerHTML = newLocalStyle;

            const oldContent = document.getElementById(ContentID);
            const newContent = wrapper.querySelector(
                `#${ContentID}`
            ) as HTMLElement;

            animatePageChange(oldContent, newContent, onContentChanged);
        })
        .catch(err => {
            console.error(err);
            window.location.href = url;
            showLoading(false);
        });
}

function animatePageChange(
    oldContent: HTMLElement,
    newContent: HTMLElement,
    callback: (content: HTMLElement) => void
) {
    const contentWrapper = document.getElementById(ContentWrapperID);
    const fadeOut = oldContent.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        PageAnimationDuration
    );

    fadeOut.onfinish = () => {
        contentWrapper.removeChild(oldContent);
        contentWrapper.appendChild(newContent);

        contentWrapper.scrollIntoView(true);

        showLoading(false);
        animateContentEnter(newContent);

        newContent.querySelectorAll(OnPageChangeClass).forEach(el => {
            const script = el as HTMLScriptElement;
            if (script.src) {
                getScript(script);
            } else {
                try {
                    eval(script.innerHTML);
                } catch (err) {}
            }
        });

        oldContent.querySelectorAll(OnPageUnloadClass).forEach(el => {
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

function animateContentEnter(parent: HTMLElement) {
    let delay = 0;

    try {
        parent.querySelectorAll(AnimatedElementSelector).forEach(el => {
            elementIn(el as HTMLElement, delay);

            delay += ItemAnimationDelay;
        });
    } catch (e) {}
}

function elementIn(element: HTMLElement, delay: number) {
    element.style.animationDelay = `${delay}ms`;
    element.dataset.animateIn = "true";
}

setup();
