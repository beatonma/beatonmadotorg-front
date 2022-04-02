import { NotesApp } from "./notes.tsx";
import { WebmentionsApp } from "./get-webmentions.jsx";
import { RelatedMediaApp } from "./load-media.jsx";
import { GithubLatestCommitsApp } from "./github-latest-commits.jsx";
import { WebmentionTesterApp } from "../../webmentions_tester/js/webmention-test-tool.jsx";

export const APPS = [
    GithubLatestCommitsApp,
    NotesApp,
    RelatedMediaApp,
    WebmentionsApp,
    WebmentionTesterApp,
];
