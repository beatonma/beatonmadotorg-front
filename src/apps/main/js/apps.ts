import { NotesApp } from "./notes";
import { WebmentionsApp } from "./get-webmentions";
import { RelatedMediaApp } from "./load-media";
import { GithubEventsApp } from "./github-events";
import { WebmentionTesterApp } from "../../webmentions_tester/js/webmention-test-tool";
import { ContactApp } from "../../contact/js/contact";

export const APPS = [
    NotesApp,
    GithubEventsApp,
    ContactApp,
    RelatedMediaApp,
    WebmentionsApp,
    WebmentionTesterApp,
];
