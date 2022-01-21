import { cookieExists, getCookie, setCookie } from "./util.js";

const DAY = "day";
const NIGHT = "night";

let themeName = DAY; // values: 'day', 'night'

// Automatically change basic color themes depending on time of day
// If forceAuto then cookie values will be ignored
export function setDayNightAutoTheme(forceAuto) {
  if (forceAuto) {
    clearCookie("theme");
  } else if (cookieExists("theme")) {
    let t = getCookie("theme");
    setTheme(t, true);
    return;
  }

  document.getElementById("theme_icon");

  let h = new Date().getHours();
  if (h > 8 && h < 20) {
    themeName = DAY;
    setTheme(themeName);
  } else {
    themeName = NIGHT;
    setTheme(themeName);
  }
}

function setTheme(newtheme, args) {
  console.log("Theme:" + newtheme);
  let stylesheet = document.getElementById("theme");
  if (newtheme == DAY) {
    stylesheet.setAttribute("href", "/static/css/colors-day.min.css");
    themeName = newtheme;
  } else if (newtheme == NIGHT) {
    stylesheet.setAttribute("href", "/static/css/colors-night.min.css");
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
      if (arguments.length > 1) {
        document.querySelectorAll(".header-item").forEach(el => {
          el.style = "color: " + args;
        });
      }
    }
  }
}

export function toggleTheme() {
  if (themeName == DAY) {
    themeName = NIGHT;
  } else {
    themeName = DAY;
  }

  setCookie("theme", themeName, 24 * 60 * 60 * 1000 * 30); // Remember this theme selection for 30 days

  setTheme(themeName, true);
}

export function initTheme() {
  setDayNightAutoTheme();
  try {
    document
      .getElementById("theme_icon")
      .addEventListener("click", toggleTheme);
  } catch (e) {
    console.error(e);
  }
}

initTheme();
