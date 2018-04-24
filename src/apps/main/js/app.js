const app = (() => {
// function initScrollTransitions() {
//     document.getElementsByTagName('main')[0].addEventListener('scroll', () => {
//         const main_header = document.getElementById('beatonma_header');
//         const article_header = document.getElementById('article_header');

//         if (!main_header || !article_header) {
//             return;
//         }

//         let main_bottom = main_header.offsetHeight;
//         let article_bottom = article_header.getBoundingClientRect().top + article_header.offsetHeight;

//         if (article_bottom <= main_bottom) {
//             theme.apply();
//         }
//         else {
//             theme.unapply();
//         }
//     });
// }

// function init() {
    // initPageTransitions();
//     initSearch();
// }

function initSearch() {
    // Replace the default form submission so we can animate the page change
    const searchform = document.getElementById('searchform');
    searchform.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const searchform = document.getElementById('searchform');
        const searchUrl = '/search?' + new URLSearchParams(
            new FormData(searchform)).toString();
        history.pushState(null, null, searchUrl);
        transitions.changePage('url=' + searchUrl);
    });

    const searchIcon = document.getElementById('search_icon');
    searchIcon.addEventListener('focus', () => {
        // Move focus to search box when icon is selected
        const searchInput = document.getElementById('search');
        searchInput.focus();
    });
    
    // We want the search box to expand to a new line when on a small device
    // so we need to listen to focus changes and toggle the 'search-container'
    // class on the parent form
    // const searchbox = document.getElementById('search');
    // searchbox.addEventListener('focus', function(ev) {
    //     document.getElementById('searchform').classList.add('search-container');
    // });
    // searchbox.addEventListener('focusout', function(ev) {
    //     document.getElementById('searchform').classList.remove('search-container');
    // });
}

initSearch();
})();