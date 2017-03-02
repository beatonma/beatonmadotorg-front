const itemAnimationDuration = 200;
const itemAnimationDelay = 60;
const enterInterpolator = 'ease';
const exitInterpolator = 'ease-in';
const pageAnimationDuration = 200;

function initPageTransitions() {
    // Intercept all click events
    document.addEventListener('click', function (e) {
        let el = e.target;
        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        while (el && !el.href) {
            el = el.parentNode;
        }
        if (el) {
            // If target is on a different domain then handle it the normal way
            if (!el.href.includes('beatonma.org') && !el.href.includes('beatonma.com')) {
                return;
            }
            // Links annotated with 'noanim' class should be treated as external (no content transition animations)
            if (el.className.includes('noanim')) {
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

    loadPage(url).then(function (responseText) {
        let wrapper = document.createElement('div');
        wrapper.innerHTML = responseText;
        
        document.title = $(wrapper).find("title").text();

        let oldContent = document.querySelector('#content');
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
    let container = document.querySelector('#content_wrapper');
    let fadeOut = oldContent.animate(
            [
                {opacity: 1},
                {opacity: 0}
            ], pageAnimationDuration);

    fadeOut.onfinish = function () {
        oldContent.parentNode.removeChild(oldContent);
        container.appendChild(newContent);
        window.scrollTo(0, 0);
        let fadeIn = newContent.animate(
                [
                    {opacity: 0},
                    {opacity: 1}
                ], pageAnimationDuration);

        animateCardsIn(newContent);
        
        let onPageChange = newContent.querySelectorAll(".onPageChange");
        for (var i = 0; i < onPageChange.length; i++) {
            let p = onPageChange[i];
            if (p.src == "") {
                eval(onPageChange[i].innerHTML);
            }
            else {
                $.getScript(p.src);
            }
        }
    };
}

function animateCardsOut(parent) {
    let delay = 0;
    let container = $(parent).find('.card_container');

    $(container).children('.card').each(function () {
        elementOut(this, delay);

        delay += itemAnimationDelay;
    });
}

function animateCardsIn(parent) {
    let delay = 0;
    let container = $(parent).find('.card_container');
    
    $(container).children('.card').each(function () {
        elementIn(this, delay);

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




function replaceBannerImage(path) {
    if (path === "") {
        path = 'images/play_banner.png';
    }
    console.log("loading banner: " + path);
    let banner = document.querySelector('#banner_image');

    let fadeout = banner.animate([
        {opacity: 1},
        {opacity: 0}
    ], itemAnimationDuration);

    fadeout.onfinish = function () {
        $(banner).css('background', "url('" + path + "') center / cover");
        banner.animate([
            {opacity: 0},
            {opacity: 1}
        ], itemAnimationDuration);
    };
}