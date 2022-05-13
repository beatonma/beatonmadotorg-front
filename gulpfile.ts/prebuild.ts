/**
 * Handle inlining to construct valid source [js, jsx, ts, tsx, html] files.
 *
 * Input: SRC_PATH
 * Output: PREPROCESSING_PATH
 */

import {
    ANY_HTML,
    ANY_JS_OR_TS,
    prepPath,
    PREPROCESSING_PATH,
    srcPath,
} from "./paths";

import { dest, series, src } from "gulp";

// File reduction/combination
import gulpInclude from "gulp-file-include";

import gulpReplace from "gulp-replace";

import gulpUseref from "gulp-useref";
import { getEnvironment } from "./setup";
import { Env } from "./env";

/**
 * Inline any @@included files with gulpInclude.
 */
const prepInclude = () =>
    src([srcPath(ANY_JS_OR_TS), srcPath(ANY_HTML)])
        .pipe(gulpUseref())
        .pipe(gulpInclude({ basepath: "src/apps/main/templates" }))
        .pipe(
            gulpReplace(/__env__:(\w+)/, (match: string, key: string) => {
                const env = getEnvironment();
                if (Object.keys(env).includes(key)) {
                    return env[key as keyof Env] as string;
                } else {
                    throw `Unknown environment key ${key}`;
                }
            })
        )
        .pipe(dest(PREPROCESSING_PATH));

const prepJsx = () =>
    src(prepPath(ANY_JS_OR_TS))
        .pipe(gulpReplace("class=", "className="))
        .pipe(gulpReplace("@@id", ""))
        .pipe(gulpReplace("@@class", ""))
        .pipe(gulpReplace("@@", ""))
        .pipe(dest(PREPROCESSING_PATH));

export const prebuild = series(prepInclude, prepJsx);
