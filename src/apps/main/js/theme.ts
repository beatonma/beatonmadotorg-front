const ID_THEME_BUTTON = "theme_icon";
const CLASS_DARK = "dark";
const CLASS_LIGHT = "light";
const SCHEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_THEME = "darkTheme";

let isDark: boolean = null;

const loadTheme = () => {
    const storedIsDark: boolean = JSON.parse(
        window.localStorage.getItem(STORAGE_THEME)
    );

    if (storedIsDark === null) {
        isDark = window.matchMedia(SCHEME_MEDIA_QUERY).matches;
    } else {
        isDark = storedIsDark;
    }

    document.documentElement.classList.add(isDark ? CLASS_DARK : CLASS_LIGHT);
};

const toggleTheme = async () => setDark(!isDark);

const setDark = async (dark: boolean, save: boolean = true) => {
    isDark = dark;
    document.documentElement.classList.add(dark ? CLASS_DARK : CLASS_LIGHT);
    document.documentElement.classList.remove(dark ? CLASS_LIGHT : CLASS_DARK);

    if (save) {
        window.localStorage.setItem(STORAGE_THEME, `${isDark}`);
    }
};

export const isDarkTheme = (): boolean => isDark;

try {
    loadTheme();

    window
        .matchMedia(SCHEME_MEDIA_QUERY)
        .addEventListener("change", event => setDark(event.matches, false));

    document
        .getElementById(ID_THEME_BUTTON)
        .addEventListener("click", toggleTheme);
} catch (e) {
    console.error(e);
}
