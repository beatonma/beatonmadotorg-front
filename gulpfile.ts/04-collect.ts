/**
 * Collect files for dist.
 *
 * Input: TEMP_PATH, SRC_PATH.
 * Output: DIST_PATH.
 */

import { getGitHash, isProductionBuild } from "./01-setup";

import {
    ANY_CSS,
    ANY_FILE,
    ANY_HTML,
    ANY_JS,
    DIST_PATH,
    distPath,
    ANY_META,
    srcPath,
    tempPath,
} from "./paths";

import { dest, parallel, series, src } from "gulp";
import gulpCssNano from "gulp-cssnano";
import gulpIf from "gulp-if";
import gulpRename from "gulp-rename";
import gulpReplace from "gulp-replace";
import gulpSourcemaps from "gulp-sourcemaps";

/**
 * Copy processed javascript files to final output directory.
 */
const collectJs = () =>
    src(tempPath("**/js/*"))
        .pipe(
            gulpRename(path => {
                // Move to apps/appname/static/appname/js
                path.dirname = path.dirname.replace(
                    /apps[/\\](.+?)[/\\]js/g,
                    "apps/$1/static/$1/js"
                );
            })
        )
        .pipe(dest(DIST_PATH));

/**
 * Copy processed CSS files to final output directory.
 */
const collectCss = () =>
    src(tempPath("**/css/*"))
        .pipe(
            gulpRename(path => {
                // Move to apps/appname/static/appname/css
                path.dirname = path.dirname.replace(
                    /apps[/\\](.+?)[/\\]css/g,
                    "apps/$1/static/$1/css"
                );
                if (path.extname === ".css") {
                    path.extname = ".min.css";
                }
            })
        )
        .pipe(gulpSourcemaps.init())
        .pipe(gulpIf(isProductionBuild(), gulpCssNano()))
        .pipe(gulpSourcemaps.write("."))
        .pipe(dest(DIST_PATH));

/**
 * Copy HTML templates to final output directory.
 */
const collectHtml = () =>
    src(tempPath(ANY_HTML))
        .pipe(gulpReplace(/(?<=<.*?)[\s]+(?=[^<]*>)/gs, " ")) // Remove any newlines found inside <html tags>
        .pipe(gulpReplace(/ {2,}/g, " ")) // Remove extra spaces
        .pipe(gulpReplace(/[\r\n]{2,}/g, "\n")) // Remove extra line breaks
        .pipe(gulpReplace(/@@[\w]*/, "")) // Remove any 'leftover' tags from buildInclude()
        .pipe(dest(DIST_PATH));

/**
 * Copy image files to final output directory.
 */
const collectImages = () =>
    src(srcPath("**/images/**/*"))
        .pipe(
            gulpRename(path => {
                // Move to apps/appname/static/appname/images
                path.dirname = path.dirname.replace(
                    /apps[/\\](.+?)[/\\]images/g,
                    "apps/$1/static/$1/images"
                );
            })
        )
        .pipe(dest(DIST_PATH));

/**
 * Copy static files to final output directory.
 */
const collectStatic = () =>
    src(srcPath("static/**/*")).pipe(dest(distPath("main/static/main/")));

/**
 * Copy flatpage templates to final output directory.
 */
const collectFlatpageTemplates = () =>
    src(tempPath("**/templates/**/flatpages/*.html"))
        .pipe(
            gulpRename(path => {
                path.dirname = path.dirname.replace(
                    /(.*\/templates\/).*/,
                    "$1/flatpages/"
                );
                path.extname = ".html";
            })
        )
        .pipe(dest(DIST_PATH));

/**
 * Create a copy of JS//CSS files with the current git has in the name
 * for cachebusting.
 */
const collectHashedFilenames = () =>
    src([distPath(ANY_JS), distPath(ANY_CSS), distPath(ANY_META)])
        .pipe(
            gulpRename(path => {
                path.basename = path.basename.replace(
                    /^(.*?)(\.min)/,
                    `$1-${getGitHash()}$2`
                );
            })
        )
        .pipe(dest(DIST_PATH));

/**
 * Move everything up a directory, removing 'apps' parent directory
 */
const unwrap = () =>
    src(distPath(ANY_FILE))
        .pipe(
            gulpRename(path => {
                path.dirname = path.dirname.replace(/^apps[/\\]/, "");
            })
        )
        .pipe(dest(DIST_PATH));

export const collect = series(
    parallel(collectJs, collectCss, collectHtml, collectImages, collectStatic),
    parallel(collectFlatpageTemplates, collectHashedFilenames),
    unwrap
);
