export const get = (url: string) =>
    fetch(url, {
        method: "GET",
        credentials: "same-origin",
    });

export const loadPage = (url: string) =>
    get(url).then(response => response.text());
export const loadJson = (url: string) =>
    get(url).then(response => response.json());

export function setCookie(cname: string, cvalue: string, expiry: number) {
    const d = new Date();
    d.setTime(d.getTime() + expiry);
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/;samesite=strict;`;
}

export function clearCookie(cname: string) {
    const d = new Date();
    d.setTime(0);
    document.cookie = `${cname}=0;path=/;expires=${d.toUTCString()}`;
}

export function getCookie(cname: string) {
    const name = cname + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export const getCsrfToken = () => getCookie("csrftoken");
export const cookieExists = (cname: string): boolean => getCookie(cname) !== "";

export function scrollToId(id: string) {
    document.getElementById(id.replace("#", "")).scrollIntoView();
}

export function removeChildren(el: HTMLElement) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

export const isSameDay = (first: Date, second: Date): boolean =>
    first.getFullYear() == second.getFullYear() &&
    first.getMonth() == second.getMonth() &&
    first.getDate() == second.getDate();

const isSameMonth = (first: Date, second: Date): boolean =>
    first.getFullYear() == second.getFullYear() &&
    first.getMonth() == second.getMonth();

const isSameYear = (first: Date, second: Date): boolean =>
    first.getFullYear() == second.getFullYear();

export function formatDate(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }
) {
    const _date = new Date(date);
    const now = new Date();

    _date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (
        _date.getMonth() == now.getMonth() &&
        _date.getDate() == now.getDate()
    ) {
        return "Today";
    }

    now.setDate(now.getDate() - 1);
    if (
        _date.getMonth() == now.getMonth() &&
        _date.getDate() == now.getDate()
    ) {
        return "Yesterday";
    }

    if (_date.getFullYear() == now.getFullYear()) {
        delete options["year"];
    }

    const day = _date.toLocaleDateString("default", { day: options.day });
    const month = _date.toLocaleDateString("default", { month: options.month });

    return `${day} ${month}${
        options.year
            ? " " + _date.toLocaleDateString("default", { year: options.year })
            : ""
    }`;
}

export function formatTimeDelta(
    totalSeconds: number,
    options = { verbose: false }
) {
    const hours = Math.floor(totalSeconds / 3600);
    let remaining = totalSeconds % 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const verbose = options.verbose;
    const hoursLabel = verbose ? " hours" : "h";
    const minutesLabel = verbose ? " minutes" : "min";
    const secondsLabel = verbose ? " seconds" : "sec";

    if (hours) {
        if (minutes == 0) {
            return `${hours}${hoursLabel}`;
        } else {
            return `${hours}${hoursLabel} ${minutes}${minutesLabel}`;
        }
    } else if (minutes) {
        if (minutes > 15) {
            return `~${minutes}${minutesLabel}`;
        } else {
            return `${minutes}${minutesLabel} ${seconds}${secondsLabel}`;
        }
    } else {
        return `${seconds}${secondsLabel}`;
    }
}
