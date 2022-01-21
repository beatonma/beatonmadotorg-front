/**
 * I think this file was abandoned some time back, replaced by get-webmentions.jsx
 */

// function loadWebmentions(slug) {
//   fetch("https://beatonma.org/webmentions", {
//     method: "post",
//     body: "slug=" + slug,
//   })
//     .then(data => {
//       document.getElementById("webmentions_container").innerHTML = data;
//     })
//     .catch(err => {
//       document.getElementById("webmentions_container").innerHTML = "";
//     })
//     .then(hideRelatedIfEmpty);
// }

// // Hide the container if there is nothing to go in it
// function hideRelatedIfEmpty() {
//   const webmentions = document.getElementById("webmentions_container");
//   const apps = document.getElementById("related_apps");
//   if (webmentions.innerHTML || apps) {
//     document.getElementById("related_content").classList.remove("hidden");
//   }
//   if (webmentions.innerHTML == "") {
//     webmentions.classList.add("hidden");
//   }
//   try {
//     componentHandler.upgradeDom();
//   } catch (e) {}
// }
