import { changePage } from "./page-transitions.js";

const formID = "search_form";
const iconID = "search_icon";
const searchInputID = "search";

function initSearch() {
    // Replace the default form submission so we can animate the page change
    const form = document.getElementById(formID);
    form.addEventListener("submit", ev => {
        ev.preventDefault();

        const data = new FormData(ev.target);
        const params = new URLSearchParams(data);
        const searchUrl = `/search/?${params}`;
        changePage(searchUrl);
    });

    document.getElementById(iconID).addEventListener("focus", () => {
        // Move focus to search box when icon is selected
        const search = document.getElementById(searchInputID);
        search.value = "";
        search.focus();
    });
}

initSearch();
