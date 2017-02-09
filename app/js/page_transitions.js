var itemAnimationDuration = 200;
var itemAnimationDelay = 60;
var enterInterpolator = 'ease';
var exitInterpolator = 'ease-in';
var pageAnimationDuration = 200;

// Pages which should be loaded in full with no transition
// Because styles on these pages aren't being applied properly
// when loaded from a different page wrapper
var noAnimationPages = [
    "beatonma.org/contact/"
]

function initPageTransitions() {
    // Intercept all click events
    document.addEventListener('click', function (e) {
        var el = e.target;
        // Go up in the nodelist until we find a node with .href (HTMLAnchorElement)
        while (el && !el.href) {
            el = el.parentNode;
        }
        if (el) {
            // If target is on a different domain then handle it the normal way
            if (!el.href.includes("beatonma.org") && !el.href.includes("beatonma.com")) {
                return;
            }
            
            // Check if this page should be treated as 'external'
            for (var i=0;i<noAnimationPages.length;i++) {
                var p = noAnimationPages[i];
                if (el.href.includes(p)) {
                    return;
                }
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
    var url = window.location.href;
    if (arguments.length > 0 && typeof(use_url) === 'string' && use_url.includes('url=')) {
        url = use_url.replace(/url=/g, '');
    }

//    replaceBannerImage("");

    loadPage(url).then(function (responseText) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = responseText;
        
        document.title = $(wrapper).find("title").text();

        var oldContent = document.querySelector('#content');
        var newContent = wrapper.querySelector('#content');

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
    var container = document.querySelector('#content_wrapper');
    var fadeOut = oldContent.animate(
            [
                {opacity: 1},
                {opacity: 0}
            ], pageAnimationDuration);

    fadeOut.onfinish = function () {
        oldContent.parentNode.removeChild(oldContent);
        container.appendChild(newContent);
        var fadeIn = newContent.animate(
                [
                    {opacity: 0},
                    {opacity: 1}
                ], pageAnimationDuration);

        animateCardsIn(newContent);
        
        var onPageChange = newContent.querySelector("#onPageChange").innerHTML;
        eval(onPageChange);
    };
}

function animateCardsOut(parent) {
    var delay = 0;
    var container = $(parent).find('.card_container');

    $(container).children('.card').each(function () {
        elementOut(this, delay);

        delay += itemAnimationDelay;
    });
}

function animateCardsIn(parent) {
    var delay = 0;
    var container = $(parent).find('.card_container');
    
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
    var banner = document.querySelector('#banner_image');

    var fadeout = banner.animate([
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