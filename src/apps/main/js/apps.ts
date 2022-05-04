import { NotesApp } from "./notes";
import { WebmentionsApp } from "./get-webmentions";
import { RelatedMediaApp } from "./load-media";
import { GithubEventsApp } from "./github-events";
import { WebmentionTesterApp } from "../../webmentions_tester/js/webmention-test-tool";

export const APPS = [
    GithubEventsApp,
    NotesApp,
    RelatedMediaApp,
    WebmentionsApp,
    WebmentionTesterApp,
];
