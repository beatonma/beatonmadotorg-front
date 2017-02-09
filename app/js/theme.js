var theme = 'day';

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
function setTheme(newtheme, byUser) {
    console.log('theme:' + newtheme);
    var stylesheet = document.getElementById('theme');
    if (newtheme == 'day') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-day.css');
        $('meta[name=theme-color]').attr('content', '#311B92');
        $('#main_header').css('background', '#311B92');
        if (arguments.length > 1) {
            $('#theme_icon').html('<i class="material-icons">brightness_7</i>');
        }
        theme = newtheme;
    }
    else if (newtheme == 'night') {
        stylesheet.setAttribute('href', '/static/projects/css/colors-night.css');
        $('meta[name=theme-color]').attr('content', '#333333');
        $('#main_header').css('background', '#333333');
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

setDayNightAutoTheme();