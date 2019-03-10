function get(url) {
    return fetch(url, {
        method: 'GET',
        credentials: 'same-origin'
    });
}

function loadPage(url) {
    return get(url).then((response) => {
        return response.text();
    });
}

function loadJson(url) {
    return get(url).then((response) => {
        return response.json();
    });
}

function setCookie(cname, cvalue, expiry) {
    const d = new Date();
    d.setTime(d.getTime() + (expiry));
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
}

function clearCookie(cname) {
    const d = new Date();
    d.setTime(0);
    document.cookie = `${cname}=0;path=/;expires=${d.toUTCString()}`;
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
    return '';
}

function cookieExists(cname) {
    return getCookie(cname) !== '';
}

function scrollToId(id) {
    const el = document.getElementById(id.replace('#', ''));
    el.scrollIntoView();
}

function removeChildren(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}
