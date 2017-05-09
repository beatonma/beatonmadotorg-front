function loadPage(url) {
    return fetch(url, {
        method: 'GET'
    }).then(function (response) {
        return response.text();
    });
}

function setCookie(cname, cvalue, expiry) {
    const d = new Date();
    d.setTime(d.getTime() + (expiry));
    const expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    for (let i=0; i < ca.length; i++) {
        let c = ca[i];
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

function scrollToId(id) {
    const el = document.getElementById(id.replace('#', ''));
    el.scrollIntoView();
}