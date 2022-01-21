import { loadPage, scrollToId } from "./util.js";
import { WebmentionsApp } from "./get-webmentions.jsx";
import { GithubLatestCommitsApp } from "./github-latest-commits.jsx";
import { RelatedMediaApp } from "./load-media.jsx";
import { WebmentionTesterApp } from "../../webmentions_tester/js/webmention-test-tool.jsx";

const itemAnimationDuration = 200;
const itemAnimationDelay = 60;
const enterInterpolator = "ease";
const exitInterpolator = "ease-in";
const pageAnimationDuration = 200;

// Page transitions are enabled when travelling to URLs on these domains.
const domainsRegex = /(beatonma.org|inverness.io|localhost)/;

function onContentChanged(dom) {
  if (dom.querySelector("#mentions")) {
    WebmentionsApp();
  }

  if (dom.querySelector("#related_media")) {
    RelatedMediaApp();
  }

  if (dom.querySelector("#github_recent")) {
    GithubLatestCommitsApp();
  }

  if (dom.querySelector("#webmentions_testing_tool")) {
    WebmentionTesterApp();
  }
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
      if (el.className.includes("noanim")) {
        return;
      }

      if (el.pathname == window.location.pathname && el.hash != "") {
        // Handle links to element #id
        e.preventDefault();
        history.pushState(null, null, url);
        scrollToId(el.hash);
        return;
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

  document.getElementById("beatonma_loading").classList.add("loading");

  loadPage(url)
    .then(responseText => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = responseText;

      document.title = wrapper.querySelector("title").textContent;

      const newLocalStyle = wrapper.querySelector("#local_style").innerHTML;
      document.getElementById("local_style").innerHTML = newLocalStyle;

      const oldContent = document.getElementById("content");
      const newContent = wrapper.querySelector("#content");
      animatePageChange(oldContent, newContent, onContentChanged);
    })
    .catch(err => {
      console.error(err);
      window.location.href = url;
    });
}

function animatePageChange(oldContent, newContent, callback) {
  const container = document.getElementById("content_wrapper");
  const fadeOut = oldContent.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    pageAnimationDuration
  );

  fadeOut.onfinish = () => {
    oldContent.parentNode.removeChild(oldContent);
    container.appendChild(newContent);
    document.body.scrollIntoView(true);
    const fadeIn = newContent.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      pageAnimationDuration
    );

    document.getElementById("beatonma_loading").classList.remove("loading");
    animateCardsIn(newContent);

    newContent.querySelectorAll(".onPageChange").forEach(el => {
      if (el.src) {
        getScript(el);
      } else {
        try {
          eval(el.innerHTML);
        } catch (err) {}
      }
    });

    oldContent.querySelectorAll(".onPageUnload").forEach(el => {
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
  let container = parent.querySelector(".card-container");

  try {
    container.querySelectorAll(".card").forEach(el => {
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

function elementOut(element, delay) {
  element.animate([{ opacity: 1 }, { opacity: 0 }], {
    delay: delay || 0,
    duration: itemAnimationDuration,
    easing: exitInterpolator,
  });

  element.animate(
    [{ transform: "translateY(0px)" }, { transform: "translateY(50px)" }],
    {
      delay: delay || 0,
      duration: itemAnimationDuration,
      easing: exitInterpolator,
    }
  );
}

init();
