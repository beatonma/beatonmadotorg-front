function loadPage(url) {
    return fetch(url, {
        method: 'GET'
    }).then(function (response) {
        return response.text();
    });
}

function setCookie(cname, cvalue, expiry) {
    var d = new Date();
    d.setTime(d.getTime() + (expiry));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function cookieExists(cname) {
    return getCookie(cname) !== "";
}