import { getCsrfToken } from "../../main/js/util.js";

function showSuccess() {
    document.getElementById("contact_form").classList.add("hidden");
    document.getElementById("success_message").classList.remove("hidden");
}

function showFailure(response) {
    document.getElementById("failure_message").classList.remove("hidden");
    console.error(`[${response.status}]: ${response.statusText}`);
}

export function onSubmitContact(recaptchaToken) {
    const contact = document.getElementById("contact_form");
    document.getElementById("beatonma_loading").classList.add("loading");

    const form = new FormData(contact);
    const csrftoken = getCsrfToken();
    const headers = new Headers();
    headers.append("X-CSRFToken", csrftoken);

    fetch("/contact/send", {
        headers: headers,
        method: "POST",
        body: form,
        credentials: "same-origin",
    })
        .then(response => {
            document
                .getElementById("beatonma_loading")
                .classList.remove("loading");
            if (response.ok) {
                showSuccess();
            } else {
                showFailure(response);
            }
        })
        .catch(err => {
            console.error(err);
            showFailure();
        });
}

window.onSubmitContact = onSubmitContact;
