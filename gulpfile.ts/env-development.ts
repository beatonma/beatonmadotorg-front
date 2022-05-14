import { Env } from "./env";

export const DevelopmentEnv: Env = {
    contactEmail: "test@beatonma.org",
    googleRecaptchaToken: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
    rsyncConfig: {
        keyfile: "",
        username: "",
        hostname: "",
        destinationPath: "",
    },
};
