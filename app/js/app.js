//var itemAnimationDuration = 200;
//var itemAnimationDelay = 60;
//var enterInterpolator = 'ease';
//var exitInterpolator = 'ease-in';
//var pageAnimationDuration = 200;

function init() {
    initPageTransitions();
//    $(setTimeout(loadNavDrawer(), 100));
}

//function loadNavDrawer() {
//    loadPage("/navigation_drawer.html").then(function (responseText) {
//        console.log("Loading navigation drawer");
//        var container = document.querySelector('.mdl-layout__drawer');
//        container.innerHTML = responseText;
//    });
//}

//function replaceBannerImage(path) {
//    if (path === "") {
//        path = '/images/play_banner.png';
//    }
//    console.log("loading banner: " + path);
//    var banner = document.querySelector('#banner_image');
//
//    var fadeout = banner.animate([
//        {opacity: 1},
//        {opacity: 0}
//    ], itemAnimationDuration);
//
//    fadeout.onfinish = function () {
//        $(banner).css('background', "url('" + path + "') center / cover");
//        banner.animate([
//            {opacity: 0},
//            {opacity: 1}
//        ], itemAnimationDuration);
//    };
//}
//
//function loadPage(url) {
//    return fetch(url, {
//        method: 'GET'
//    }).then(function (response) {
//        return response.text();
//    });
//}