var theme = 'day';
var accentColor = '';
var accentTextColor = ''
var accentApplied = false;

// Automatically change basic color themes depending on time of day
function setDayNightAutoTheme() {
    if (cookieExists('theme')) {
        var t = getCookie('theme');
        console.log('Setting theme from cookie: ' + t);
        setTheme(t, true);
        return;
    }
    
    $('#theme_icon').html('');
    
    var h = new Date().getHours();
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
    var stylesheet = document.getElementById('theme');
    if (newtheme == 'day') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-day.css');
        $('meta[name=theme-color]').attr('content', 'var(--header-background-color)');
        $('#main_header').css('background', 'var(--header-background-color)');
        if (arguments.length > 1) {
            $('#theme_icon').html('<i class="material-icons">brightness_7</i>');
        }
        $('.header_item').css('color', 'var(--header-text-color)');
        theme = newtheme;
    }
    else if (newtheme == 'night') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-night.css');
        $('meta[name=theme-color]').attr('content', 'var(--header-background-color)');
        $('#main_header').css('background', 'var(--header-background-color)');
        if (arguments.length > 1) {
            $('#theme_icon').html('<i class="material-icons">brightness_2</i>');
        }
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
            $('meta[name=theme-color]').attr('content', newtheme);
            $('#main_header').css('background', newtheme);
            if (arguments.length > 1) {
                $('.header_item').css('color', args);
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
    
    setCookie('theme', theme, 3 * 60 * 60 * 1000); // Remember this theme selection for 3 hours
    
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