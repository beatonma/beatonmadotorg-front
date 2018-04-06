const itemAnimationDuration = 200;
const itemAnimationDelay = 60;
const enterInterpolator = 'ease';
const exitInterpolator = 'ease-in';
const pageAnimationDuration = 200;

function getScript(element, callback) {
    const src = element.src;
    element.parentElement.removeChild(element);

    let script = document.createElement('script');
    script.async = 1;

    script.onload = script.onreadystatechange = (_, isAbort) => {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort && callback) {
                callback();
            }
        }
    };

    script.src = src;
    document.body.appendChild(script);
}

function initPageTransitions() {
    // Intercept all click events
    document.addEventListener('click', (e) => {
        let el = e.target;
        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        while (el && !el.href) {
            el = el.parentNode;
        }
        if (el) {
            // If target is on a different domain then handle it the normal way
            if (!el.href.includes('beatonma.org') && !el.href.includes('beatonma.com') && !el.href.includes('localhost')) {
                return;
            }
            // Links annotated with 'noanim' class should be treated as external (no content transition animations)
            if (el.className.includes('noanim')) {
                return;
            }
            
            if (el.pathname == window.location.pathname && el.hash != '') {
                e.preventDefault();
                history.pushState(null, null, el.href);
                scrollToId(el.hash);
                return;
            }

            // Otherwise fetch content from the target and insert it
            // into the current page
            e.preventDefault();
            
            history.pushState(null, null, el.href);
            changePage();

            return;
        }
    });
    
    // Intercept 'back' events
    window.addEventListener('popstate', changePage);
}

function changePage(use_url) {
    // Note, the URL has already been changed
    let url = window.location.href;
    if (arguments.length > 0 && typeof(use_url) === 'string' && use_url.includes('url=')) {
        url = use_url.replace(/url=/g, '');
    }
    
    document.getElementById('beatonma_loading').classList.add('loading');

    loadPage(url).then((responseText) => {
        let wrapper = document.createElement('div');
        wrapper.innerHTML = responseText;
        
        document.title = wrapper.querySelector('title').textContent;

        let oldContent = document.getElementById('content');
        let newContent = wrapper.querySelector('#content');

        try {
            animatePageChange(oldContent, newContent);
        }
        catch (exception) {
            // If something went wrong with the animation then just open the page the normal way
            console.log("Page transition animation error - opening normally.")
            window.location.href = url;
        }
    });
}

function animatePageChange(oldContent, newContent) {
    let container = document.getElementById('content_wrapper');
    let fadeOut = oldContent.animate(
            [
                {opacity: 1},
                {opacity: 0}
            ], pageAnimationDuration);

    fadeOut.onfinish = () => {
        oldContent.parentNode.removeChild(oldContent);
        container.appendChild(newContent);
        document.body.scrollIntoView(true);
        let fadeIn = newContent.animate(
                [
                    {opacity: 0},
                    {opacity: 1}
                ], pageAnimationDuration);

        document.getElementById('beatonma_loading').classList.remove('loading');
        animateCardsIn(newContent);
        
        newContent.querySelectorAll('.onPageChange').forEach((el) => {
            if (el.src) {
                getScript(el);
            }
            else {
                try {
                    eval(el.innerHTML);
                }
                catch (err) {};
            }
        });

        oldContent.querySelectorAll('.onPageUnload').forEach((el) => {
            if (el.src) {
                getScript(el);
            }
            else {
                try {
                    eval(el.innerHTML);
                }
                catch (err) {};
            }
        });
    };
}

function animateCardsOut(parent) {
    let delay = 0;
    let container = parent.querySelector('.card-container');

    container.querySelectorAll('.card').forEach((el) => {
        elementOut(el, delay);

        delay += itemAnimationDelay;
    });
}

function animateCardsIn(parent) {
    let delay = 0;
    let container = parent.querySelector('.card-container');
    
    container.querySelectorAll('.card').forEach((el) => {
        elementIn(el, delay);

        delay += itemAnimationDelay;
    });
}

function elementIn(element, delay) {
    element.animate(
            [
                {opacity: 0},
                {opacity: 0}
            ], {
        delay: 0,
        duration: delay
    });

    element.animate(
            [
                {opacity: 0},
                {opacity: 1}
            ], {
        delay: delay,
        duration: itemAnimationDuration,
        easing: enterInterpolator
    });

    element.animate(
            [
                {transform: 'translateY(50px)'},
                {transform: 'translateY(0px)'}
            ], {
        delay: delay,
        duration: itemAnimationDuration,
        easing: enterInterpolator
    });
}

function elementOut(element, delay) {
    element.animate(
            [
                {opacity: 1},
                {opacity: 0}
            ], {
        delay: delay,
        duration: itemAnimationDuration,
        easing: exitInterpolator
    });

    element.animate(
            [
                {transform: 'translateY(0px)'},
                {transform: 'translateY(50px)'}
            ], {
        delay: delay,
        duration: itemAnimationDuration,
        easing: exitInterpolator
    });
}




// function replaceBannerImage(path) {
//     if (path === "") {
//         path = 'images/play_banner.png';
//     }
//     console.log("loading banner: " + path);
//     let banner = document.querySelector('#banner_image');

//     let fadeout = banner.animate([
//         {opacity: 1},
//         {opacity: 0}
//     ], itemAnimationDuration);

//     fadeout.onfinish = function () {
//         $(banner).css('background', "url('" + path + "') center / cover");
//         banner.animate([
//             {opacity: 0},
//             {opacity: 1}
//         ], itemAnimationDuration);
//     };
// }