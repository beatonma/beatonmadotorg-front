import { dest, src } from "gulp";
import gulpInclude from "gulp-file-include";
import gulpIf from "gulp-if";
import gulpRename from "gulp-rename";
import gulpReplace from "gulp-replace";
import gulpUseref from "gulp-useref";
import Vinyl from "vinyl";
import { unwrap } from "./build";
import { includeEnv } from "./env";
import { ANY_HTML, DIST_PATH, srcPath } from "./paths";
import { getGitHash } from "./setup";

const isFlatPage = (file: Vinyl): boolean => {
    const path = file.history[0];
    return /.*templates\/.*\/flatpages\/.*/.test(path);
};

const collectFlatpages = () =>
    gulpIf(
        isFlatPage,
        gulpRename(path => {
            path.dirname = path.dirname.replace(
                /(.*\/templates\/).*/,
                "$1/flatpages/"
            );
        })
    );

const injectGitHash = () =>
    gulpReplace(
        /({% static )(.*?).min.(.*? %})/g,
        `$1$2-${getGitHash()}.min.$3`
    );

const removeNewlinesInDjangoTags = () =>
    gulpReplace(/(?<={%).*?(?=%})/gs, match => match.replace(/\s/g, " "));

const removeWhitespaceAfterDjangoTags = () =>
    gulpReplace(/([%}]})[\r\n]+\s*/gs, "$1");

const removeNewlinesInHtmlTags = () =>
    gulpReplace(/(?<=<.*?)\s+(?=[^<]*>)/gs, " ");

const removeWhitespaceAtLineStart = () => gulpReplace(/^\s+/gm, "");

const removeLinebreaks = () => gulpReplace(/[\r\n]{2,}/g, "\n");

export const buildTemplates = () =>
    src(srcPath(ANY_HTML))
        .pipe(gulpUseref())
        .pipe(gulpInclude({ basepath: "src/apps/main/templates" }))
        .pipe(includeEnv())
        .pipe(injectGitHash())
        .pipe(removeNewlinesInDjangoTags())
        .pipe(removeWhitespaceAfterDjangoTags())
        .pipe(removeNewlinesInHtmlTags())
        .pipe(removeWhitespaceAtLineStart())
        .pipe(removeLinebreaks())
        .pipe(collectFlatpages())
        .pipe(unwrap())
        .pipe(dest(DIST_PATH));
