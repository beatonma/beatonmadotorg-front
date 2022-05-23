const ID_THEME_BUTTON = "theme_icon";
const CLASS_DARK = "dark";
const CLASS_LIGHT = "light";
const SCHEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

let isDark = window.matchMedia(SCHEME_MEDIA_QUERY).matches;

const toggleTheme = () => {
    isDark = !isDark;
    document.documentElement.classList.toggle(CLASS_DARK);
    document.documentElement.classList.toggle(CLASS_LIGHT);
};

const setDark = (dark: boolean) => {
    isDark = dark;
    document.documentElement.classList.add(dark ? CLASS_DARK : CLASS_LIGHT);
    document.documentElement.classList.remove(dark ? CLASS_LIGHT : CLASS_DARK);
};

export const isDarkTheme = (): boolean => isDark;

try {
    document.documentElement.classList.add(isDark ? CLASS_DARK : CLASS_LIGHT);

    window
        .matchMedia(SCHEME_MEDIA_QUERY)
        .addEventListener("change", event => setDark(event.matches));

    document
        .getElementById(ID_THEME_BUTTON)
        .addEventListener("click", toggleTheme);
} catch (e) {
    console.error(e);
}
