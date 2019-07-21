const theme = (() => {
let themeName = 'day'; // values: 'day', 'night'
let accentColor = '';
let accentTextColor = ''
let accentApplied = false;

// Automatically change basic color themes depending on time of day
// If forceAuto then cookie values will be ignored
function setDayNightAutoTheme(forceAuto) {
    if (forceAuto) {
        clearCookie('theme');
    }
    else if (cookieExists('theme')) {
        let t = getCookie('theme');
        // console.log('Setting theme from cookie: ' + t);
        setTheme(t, true);
        return;
    }
    
    document.getElementById('theme_icon');
    
    let h = new Date().getHours();
    if (h > 8 && h < 20) {
        themeName = 'day';
        setTheme(themeName);
    }
    else {
        themeName = 'night';
        setTheme(themeName);
    }
}

function setTheme(newtheme, args) {
    // console.log('theme:' + newtheme);
    let stylesheet = document.getElementById('theme');
    if (newtheme == 'day') {
        stylesheet.setAttribute('href', '/static/css/colors-day.min.css');
        // document.querySelector('meta[name=theme-color]').setAttribute('content', 'var(--header-background-color)');
        themeName = newtheme;
    }
    else if (newtheme == 'night') {
        stylesheet.setAttribute('href', '/static/css/colors-night.min.css');
        // document.querySelector('meta[name=theme-color]').setAttribute('content', 'var(--header-background-color)');
        themeName = newtheme;
    }
    else if (newtheme == '') {
        if (themeName == '') {
            // This should never happen, but better include it just in case to avoid apocalypse
            themeName = 'day';
        }
        setTheme(themeName);
    }
    else {
        if (themeName == 'day' && newtheme != '') {
            document.querySelector('meta[name=theme-color]').setAttribute('content', newtheme);
            if (arguments.length > 1) {
                document.querySelectorAll('.header-item').forEach((el) => {
                    el.style = 'color: ' + args;
                })
            }
        }
    }
}

function toggleTheme() {
    if (themeName == 'day') {
        themeName = 'night';
    }
    else {
        themeName = 'day';
    }
    
    setCookie('theme', themeName, 24 * 60 * 60 * 1000 * 30); // Remember this theme selection for 30 days
    
    setTheme(themeName, true);
}

function setAccent(color, textColor) {
    accentColor = color;
    accentTextColor = textColor;
    accentApplied = false;
}

function applyAccent() {
    if (themeName != 'day') {
        return;
    }
    if (accentColor == '' || accentTextColor == '') {
        return;
    }
    if (accentApplied) {
        return;
    }
    
    setTheme(accentColor, accentTextColor);
    accentApplied = true;
}

function removeAccent() {
    if (!accentApplied) {
        return;
    }
    setDayNightAutoTheme();
    accentApplied = false;
}

setDayNightAutoTheme();
try {
    document.getElementById('theme_icon').addEventListener('click', toggleTheme);
}
catch(e) {
    console.error(e);
}

return {
    setAuto: setDayNightAutoTheme,
    toggle: toggleTheme,
}
})();
