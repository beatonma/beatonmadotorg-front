/**
 * Input: SRC_PATH or PREPROCESSING_PATH
 * Output: TEMP_PATH.
 */

import {
    ANY_HTML,
    ANY_SCSS,
    SRC_PATH,
    prepPath,
    srcPath,
    TEMP_PATH,
} from "./paths";

import { dest, parallel, src } from "gulp";

// css browser compatibility
import gulpAutoprefixer from "gulp-autoprefixer";

// Requires mime@^1.6.0
import gulpInline64 from "gulp-inline-base64";

import gulpRename from "gulp-rename";
import gulpReplace from "gulp-replace";
import gulp_sass from "gulp-sass";
import sass from "sass";
import webpackStream from "webpack-stream";
import { getConfig } from "../webpack.config";
import { exec as shellExec } from "child_process";

const gulpSass = gulp_sass(sass);

const buildSass = () =>
    src(srcPath(ANY_SCSS))
        .pipe(gulpSass())
        .pipe(
            gulpInline64({
                maxSize: 16 * 1024,
                debug: true,
                baseDir: SRC_PATH,
            })
        )
        .pipe(
            gulpRename(path => {
                path.dirname = path.dirname.replace("scss", "css");
            })
        )
        .pipe(gulpAutoprefixer())
        .pipe(dest(TEMP_PATH));

// const checkTypescript = () => src(srcPath(ANY_JS_OR_TS));
const checkTypescript = () => {
    return new Promise<void>((resolve, reject) => {
        shellExec(
            "npx tsc --project ./tsconfig.json --noEmit",
            (error, stdout, stderr) => {
                if (error) {
                    console.error("ERROR", error);
                    if (stderr) console.error(stderr);
                    if (stdout) console.error(stdout);
                    reject(error);
                    throw error;
                }

                resolve();
            }
        );
    });
};

/**
 * Process webapp javascript via webpack.
 */
const buildJs = () => webpackStream(getConfig()).pipe(dest(TEMP_PATH));

const buildTemplates = () =>
    src(prepPath(ANY_HTML))
        .pipe(
            gulpReplace(/(?<={%).*?(?=%})/gs, match =>
                match.replace(/\s/g, " ")
            ) // Remove any newlines found inside {% django\ntags %}
        )
        .pipe(gulpReplace(/([%}]})[\r\n]+\s*/gs, "$1")) // Remove line breaks and whitespace after django template closing tags %} }}.
        .pipe(dest(TEMP_PATH));

export const build = parallel(
    checkTypescript,
    buildJs,
    buildSass,
    buildTemplates
);
