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

function isSameDay(first, second) {
    return (first.getFullYear() == second.getFullYear()
        && first.getMonth() == second.getMonth()
        && first.getDate() == second.getDate());
}

function isSameMonth(first, second) {
    return (first.getFullYear() == second.getFullYear()
        && first.getMonth() == second.getMonth());
}

function isSameYear(first, second) {
    return (first.getFullYear() == second.getFullYear());
}

function formatDate(date, options={
    day: '2-digit',
    month: 'long',
    year: 'numeric'
}) {
    const now = new Date();

    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (date.getMonth() == now.getMonth() && date.getDate() == now.getDate()) {
        return 'Today';
    }

    now.setDate(now.getDate() - 1);
    if (date.getMonth() == now.getMonth() && date.getDate() == now.getDate()) {
        return 'Yesterday';
    }

    if (date.getFullYear() == now.getFullYear()) {
        delete options['year'];
    }

    const dayOptions = { day: options.day };
    const monthOptions = { month: options.month };
    const day = date.toLocaleDateString('default', { day: options.day });
    const month = date.toLocaleDateString('default', { month: options.month });

    return `${day} ${month}${ options.year ? " " + date.toLocaleDateString('default', { year: options.year }) : "" }`;
}