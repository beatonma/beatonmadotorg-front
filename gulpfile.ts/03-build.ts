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
import webpack from "webpack";
import { getConfig } from "../webpack.config";

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

/**
 * Process webapp javascript via webpack.
 */
const buildJs = async () => {
    const config = getConfig();

    webpack(config, (err, stats) => {
        if (err) {
            throw err;
        }
        if (stats.hasErrors()) {
            throw new Error(stats.compilation.errors.join("\n"));
        }
        return;
    });
};

const buildTemplates = () =>
    src(prepPath(ANY_HTML))
        .pipe(
            gulpReplace(/(?<={%).*?(?=%})/gs, match =>
                match.replace(/\s/g, " ")
            ) // Remove any newlines found inside {% django\ntags %}
        )
        .pipe(gulpReplace(/([%}]})[\r\n]+\s*/gs, "$1")) // Remove line breaks and whitespace after django template closing tags %} }}.
        .pipe(dest(TEMP_PATH));

export const build = parallel(buildSass, buildJs, buildTemplates);
