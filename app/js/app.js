function initScrollTransitions() {
    console.log("initScrollTransitions()");
    $('main').scroll(function() {
        const main_header = $('#beatonma_header');
        const article_header = $('#article_header');
        
        if (!main_header.length || !article_header.length) {
            return;
        }

        let main_bottom = main_header.outerHeight();
        let article_bottom = article_header.offset().top + article_header.outerHeight();

        if (article_bottom <= main_bottom) {
            applyAccent()
        }
        else {
            removeAccent();
        }
    });
}

function init() {
    initPageTransitions();
    $(document).ready(function() {
        initScrollTransitions();
        initSearch();
    });
}

function initSearch() {
    // Replace the default form submission so we can animate the page change
    const searchform = document.querySelector('#searchform');
    searchform.addEventListener("submit", function(ev) {
        const searchform = $(this);
        let searchUrl = '/search?' + searchform.serialize();
        history.pushState(null, null, searchUrl);
        changePage('url=' + searchUrl);
        ev.preventDefault();
    });
    
    // We want the search box to expand to a new line when on a small device
    // so we need to listen to focus changes and toggle the 'search_container'
    // class on the parent form
    const searchbox = document.querySelector('#search');
    searchbox.addEventListener('focus', function(ev) {
        $('#searchform').addClass('search_container');
    });
    searchbox.addEventListener('focusout', function(ev) {
        $('#searchform').removeClass('search_container');
    });
}