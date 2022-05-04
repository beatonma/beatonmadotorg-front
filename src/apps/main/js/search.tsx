import { changePage } from "./page-transitions";
import React, { useEffect, useState } from "react";
import { loadJson } from "./util";
import ReactDOM from "react-dom";

const formID = "search_form";
const iconID = "search_icon";
const searchInputID = "search";
const suggestionsID = "search_suggestions";

function initSearch() {
    // Replace the default form submission so we can animate the page change
    const form = document.getElementById(formID);
    form.addEventListener("submit", ev => {
        ev.preventDefault();

        const data = new FormData(ev.target as HTMLFormElement);
        const params = new URLSearchParams(data as any);
        const searchUrl = `/search/?${params}`;
        changePage(searchUrl);
    });

    document.getElementById(iconID).addEventListener("focus", () => {
        // Move focus to search box when icon is selected
        const search = document.getElementById(
            searchInputID
        ) as HTMLInputElement;
        search.value = "";
        search.focus();
    });

    SearchSuggestionsApp();
}

function SearchSuggestionsApp() {
    const container = document.getElementById(suggestionsID);

    ReactDOM.render(<SearchSuggestions />, container);
}

function SearchSuggestions() {
    const [suggestions, setSuggestions] = useState(null);

    useEffect(() => {
        loadJson("/search/suggestions/")
            .then(data => data.suggestions)
            .then(setSuggestions);
    }, []);

    if (suggestions) {
        return (
            <>
                {suggestions.map((suggestion: SuggestionProps) => (
                    <Suggestion key={suggestion.url} {...suggestion} />
                ))}
            </>
        );
    } else {
        return null;
    }
}

interface SuggestionProps {
    url: string;
    name: string;
}
function Suggestion(props: SuggestionProps) {
    const { url, name } = props;
    return (
        <a href={url} className="search-suggestion">
            {name}
        </a>
    );
}

initSearch();
