let theme = 'day'; // values: 'day', 'night'
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
        console.log('Setting theme from cookie: ' + t);
        setTheme(t, true);
        return;
    }
    
    document.getElementById('theme_icon');
    
    let h = new Date().getHours();
    if (h > 8 && h < 20) {
        theme = 'day';
        setTheme(theme);
    }
    else {
        theme = 'night';
        setTheme(theme);
    }
}

// byUser -> indicates this action was explicitely started by user input, not an automatic event
function setTheme(newtheme, args) {
    console.log('theme:' + newtheme);
    let stylesheet = document.getElementById('theme');
    if (newtheme == 'day') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-day.css');
        document.querySelector('meta[name=theme-color]').setAttribute('content', 'var(--header-background-color)');
        document.getElementById('beatonma_header').style = 'background: var(--header-background-color);';
        // if (arguments.length > 1) {
        //     document.getElementById('theme_icon').innerHTML = '<i class="material-icons">brightness_7</i>';
        // }
        theme = newtheme;
    }
    else if (newtheme == 'night') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-night.css');
        document.querySelector('meta[name=theme-color]').setAttribute('content', 'var(--header-background-color)');
        document.getElementById('beatonma_header').style = 'background: var(--header-background-color);';
        // if (arguments.length > 1) {
        //     document.getElementById('theme_icon').innerHTML = '<i class="material-icons">brightness_2</i>';
        // }
        theme = newtheme;
    }
    else if (newtheme == '') {
        if (theme == '') {
            // This should never happen, but better include it just in case to avoid apocalypse
            theme = 'day';
        }
        setTheme(theme);
    }
    else {
        if (theme == 'day' && newtheme != '') {
            document.querySelector('meta[name=theme-color]').setAttribute('content', newtheme);
            document.getElementById('beatonma_header').style = 'background: ' + newtheme;
            if (arguments.length > 1) {
                document.querySelectorAll('.header-item').forEach((el) => {
                    el.style = 'color: ' + args;
                })
            }
        }
    }
}

function toggleTheme() {
    if (theme == 'day') {
        theme = 'night';
    }
    else {
        theme = 'day';
    }
    
    setCookie('theme', theme, 24 * 60 * 60 * 1000 * 30); // Remember this theme selection for 30 days
    
    setTheme(theme, true);
}

function setAccent(color, textColor) {
    accentColor = color;
    accentTextColor = textColor;
    accentApplied = false;
}

function applyAccent() {
    if (theme != 'day') {
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