/**
 * Input: SRC_PATH or PREPROCESSING_PATH
 * Output: TEMP_PATH.
 */

const { ANY_SCSS, srcPath, TEMP_PATH, ANY_HTML } = require("./paths");
const { buildType } = require("./setup");

const { src, dest, parallel } = require("gulp");

const gulpAutoprefixer = require("gulp-autoprefixer"); // css browser compatibility
const gulpInline64 = require("gulp-inline-base64"); // Requires mime@^1.6.0
const gulpRename = require("gulp-rename");
const gulpReplace = require("gulp-replace");
const gulpSass = require("gulp-sass")(require("sass"));

const webpack = require("webpack");
const webpackConfig = require("../webpack.config.js");

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
const buildJs = () => {
    const buildConfig = webpackConfig;
    buildConfig.mode = buildType();

    return new Promise((resolve, reject) => {
        webpack(buildConfig, (err, stats) => {
            if (err) {
                return reject(err);
            }
            if (stats.hasErrors()) {
                return reject(new Error(stats.compilation.errors.join("\n")));
            }
            resolve();
        });
    });
};

const buildTemplates = () =>
    src(prepPath(ANY_HTML))
        .pipe(gulpReplace(/[\r\n]+(?=.*?%})(?!.*?{%)/gs, " ")) // Remove any newlines found inside {% django\ntags %}
        .pipe(gulpReplace(/([%}]})[\r\n]+\s*/gs, "$1")) // Remove line breaks and whitespace after django template closing tags %} }}.
        .pipe(dest(TEMP_PATH));

exports.build = parallel(buildSass, buildJs, buildTemplates);
