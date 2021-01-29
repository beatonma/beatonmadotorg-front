const app = (() => {
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
    }

    initSearch();
})();
