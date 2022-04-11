import { cookieExists, getCookie, setCookie } from "./util";

const DAY = "day";
const NIGHT = "night";
const ID_STYLESHEET = "theme";
const ID_THEME_BUTTON = "theme_icon";
const COOKIE = "theme";

const DAY_HREF = "/static/css/colors-day.min.css";
const NIGHT_HREF = "/static/css/colors-night.min.css";

let themeName = DAY; // values: 'day', 'night'

// Automatically change basic color themes depending on time of day
// If forceAuto then cookie values will be ignored
export function setDayNightAutoTheme(forceAuto) {
    if (forceAuto) {
        clearCookie(COOKIE);
    } else if (cookieExists(COOKIE)) {
        const t = getCookie(COOKIE);
        setTheme(t, true);
        return;
    }

    const h = new Date().getHours();
    if (h > 8 && h < 20) {
        themeName = DAY;
        setTheme(themeName);
    } else {
        themeName = NIGHT;
        setTheme(themeName);
    }
}

function setTheme(newtheme, args) {
    const stylesheet = document.getElementById(ID_STYLESHEET);
    console.log(`Theme: ${newtheme}; Stylesheet: ${stylesheet}`);

    if (newtheme == DAY) {
        stylesheet.setAttribute("href", DAY_HREF);
        themeName = newtheme;
    } else if (newtheme == NIGHT) {
        stylesheet.setAttribute("href", NIGHT_HREF);
        themeName = newtheme;
    } else if (newtheme == "") {
        if (themeName == "") {
            // This should never happen, but better include it just in case to avoid apocalypse
            themeName = DAY;
        }
        setTheme(themeName);
    } else {
        if (themeName == DAY && newtheme != "") {
            document
                .querySelector("meta[name=theme-color]")
                .setAttribute("content", newtheme);
        }
    }
}

export function toggleTheme() {
    if (themeName == DAY) {
        themeName = NIGHT;
    } else {
        themeName = DAY;
    }

    setCookie(COOKIE, themeName, 24 * 60 * 60 * 1000 * 30); // Remember this theme selection for 30 days
    setTheme(themeName, true);
}

export function initTheme() {
    setDayNightAutoTheme();
    try {
        document
            .getElementById(ID_THEME_BUTTON)
            .addEventListener("click", toggleTheme);
    } catch (e) {
        console.error(e);
    }
}

initTheme();
