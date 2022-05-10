import { showLoading } from "../../main/js/page-transitions";
import { getCsrfToken } from "../../main/js/util";
import { isDarkTheme } from "../../main/js/theme";
import React from "react";
import ReactDOM from "react-dom";

const CONTAINER_ID = "contact";
const ERROR_MESSAGE_ID = "error_response";
const FORM_ID = "contact_form";
const BUTTON_ID = "contact_submit";

const NAME_ID = "contact_name";
const MESSAGE_BODY_ID = "contact_message";

function setSubmitButtonEnabled(enabled: boolean) {
    (document.getElementById(BUTTON_ID) as HTMLButtonElement).disabled =
        !enabled;
}

function onCaptchaPassed() {
    setSubmitButtonEnabled(true);
}

function onCaptchaExpired() {
    setSubmitButtonEnabled(false);
}

function onSubmitContact(event: SubmitEvent): boolean {
    console.log(`onSubmitContact ${event}`);
    event.preventDefault();
    const contact = document.getElementById(FORM_ID) as HTMLFormElement;
    showLoading(true);

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
            console.log(`Response: ${response}`);
            showLoading(false);

            if (response.ok) {
                renderSuccess();
            } else {
                renderError(response.statusText, response.status);
            }
        })
        .catch(err => {
            console.error(err);
            renderError(err);
        });

    return false;
}

function renderSuccess() {
    ReactDOM.render(
        <ContactSuccessful />,
        document.getElementById(CONTAINER_ID)
    );
}

function renderError(message: string, status?: number) {
    ReactDOM.render(
        <ContactError errorMessage={message} status={status} />,
        document.getElementById(ERROR_MESSAGE_ID)
    );
}

function ContactSuccessful() {
    return (
        <div className="success">
            <h4>Thank you!</h4>
            <p>
                Your message has been submitted successfully - I will get back
                to you as soon as possible.
            </p>
        </div>
    );
}

interface ContactErrorProps {
    errorMessage?: string;
    status?: number;
}
function ContactError(props: ContactErrorProps) {
    const { errorMessage, status } = props;

    const subject = encodeURIComponent("beatonma.org webmail");
    const message = encodeURIComponent(
        (document.getElementById(MESSAGE_BODY_ID) as HTMLTextAreaElement).value
    );

    return (
        <div className="failure">
            {status ? <h6>[{status}] Submission failed.</h6> : <></>}
            <p>It looks like something went wrong. Sorry about that!</p>
            <div className="buttons-row-end">
                <a
                    href={`mailto:michael@beatonma.org?subject=${subject}&body=${message}`}
                >
                    Email me instead
                </a>
            </div>
        </div>
    );
}

function setup() {
    document
        .querySelectorAll(".g-recaptcha")
        .forEach(
            (el: HTMLElement) =>
                (el.dataset.theme = isDarkTheme() ? "dark" : "light")
        );

    document.getElementById(NAME_ID).focus();
}

declare global {
    interface Window {
        onSubmitContact: (event: Event) => void;
        onContactCaptchaPassed: (token: string) => void;
        onContactCaptchaExpired: () => void;
    }
}
window.onSubmitContact = onSubmitContact;
window.onContactCaptchaPassed = onCaptchaPassed;
window.onContactCaptchaExpired = onCaptchaExpired;

setup();
