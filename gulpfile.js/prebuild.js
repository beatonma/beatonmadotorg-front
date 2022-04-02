/**
 * Handle inlining to construct valid source [js, jsx, ts, tsx, html] files.
 *
 * Input: SRC_PATH
 * Output: PREPROCESSING_PATH
 */

const {
    ANY_HTML,
    ANY_JS,
    ANY_JSX,
    PREPROCESSING_PATH,
    srcPath,
} = require("./paths");

const { dest, series, src } = require("gulp");

// File reduction/combination
const gulpInclude = require("gulp-file-include");
const gulpReplace = require("gulp-replace");
const gulpUseref = require("gulp-useref");

/**
 * Inline any @@included files with gulpInclude.
 */
// RENAMED from buildInclude
const prepInclude = () =>
    src([srcPath(ANY_JS), srcPath(ANY_JSX), srcPath(ANY_HTML)])
        .pipe(gulpUseref())
        .pipe(gulpInclude({ basepath: "src/apps/main/templates" }))
        .pipe(dest(PREPROCESSING_PATH));

const prepJsx = () =>
    src([prepPath(ANY_JS), prepPath(ANY_JSX)])
        .pipe(gulpReplace("class=", "className="))
        .pipe(gulpReplace("@@id", ""))
        .pipe(gulpReplace("@@class", ""))
        .pipe(gulpReplace("@@", ""))
        .pipe(dest(PREPROCESSING_PATH));

exports.prebuild = series(prepInclude, prepJsx);
