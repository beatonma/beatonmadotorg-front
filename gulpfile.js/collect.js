/**
 * Collect files for dist.
 *
 * Input: TEMP_PATH, SRC_PATH.
 * Output: DIST_PATH.
 */

const {
    ANY_CSS,
    ANY_FILE,
    ANY_HTML,
    ANY_JS,
    DIST_PATH,
    distPath,
    srcPath,
    ANY_TS,
} = require("./paths");
const { BUILD_TYPE_PRODUCTION, buildType } = require("./setup");

const { dest, src, parallel, series } = require("gulp");
const gulpCssNano = require("gulp-cssnano");
const gulpIf = require("gulp-if");
const gulpRename = require("gulp-rename");
const gulpReplace = require("gulp-replace");

const FLATPAGE_TEMPLATES = [
    "base.template.html",
    "empty.template.html",
    "null.template.html",
    "about.template.html",
];

const collectJs = () =>
    src([tempPath(ANY_JS), tempPath(ANY_TS)])
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
 * Copy processed javascript files to final output directory.
 */
const collectCss = () =>
    src(tempPath(ANY_CSS))
        .pipe(
            gulpRename(path => {
                // Move to apps/appname/static/appname/css
                path.dirname = path.dirname.replace(
                    /apps[/\\](.+?)[/\\]css/g,
                    "apps/$1/static/$1/css"
                );
                path.extname = ".min.css";
            })
        )
        .pipe(gulpIf(buildType() == BUILD_TYPE_PRODUCTION, gulpCssNano()))
        .pipe(dest(DIST_PATH));

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
 * Create a flatpage-compatible variant of each template specified in FLATPAGE_TEMPLATES.
 *
 * - Replace generic tags with flatpage-specific ones
 * - Replace 'extends' declarations with the flatpage version
 * - Rename to .flat.html extension
 * - TODO? Remove dynamic tags e.g. {% if %}, {% for %}, etc.
 */
const collectFlatpageTemplates = () => {
    const fps = [];
    for (let x in FLATPAGE_TEMPLATES) {
        const p = tempPath(`**/templates/**/${FLATPAGE_TEMPLATES[x]}`);
        fps.push(p);
    }

    return src(fps)
        .pipe(
            gulpReplace(
                /(apps\/.*\/static\/.*)?\/?((js|css)\/.*\.(js|css))/g,
                "{% static '$2' %}"
            )
        ) // Fix filenames generated by useref in :concat and insert {% static %} tag
        .pipe(gulpReplace(/[ ]{2,}/g, "")) // Remove extra spaces
        .pipe(gulpReplace(/(\r\n){2,}/g, "\r\n")) // Remove extra line breaks
        .pipe(gulpReplace(/([%}]{1}})([\r\n]+)/g, "$1")) // Remove line breaks after django template stuff
        .pipe(
            gulpReplace(
                /{% block (title|header) %}.*%}/g,
                "{{ flatpage.title }}"
            )
        )
        .pipe(gulpReplace(/{% block content %}.*%}/g, "{{ flatpage.content }}"))
        .pipe(
            gulpReplace(/{% extends '(.*?)' %}/g, match => {
                // If this template extends another, it must also be a flatpage
                // template with .flat.html extension.
                let fname = /{% extends '(.*?)' %}/g.exec(match)[1];
                fname = fname.replace(".template.html", ".flat.html");
                return "{% extends 'flatpages/" + fname + "' %}";
            })
        )
        .pipe(gulpReplace(/{% block [a-z_-]+ %}/, "")) // Tidy up any remaining block tags
        .pipe(gulpReplace(/{% endblock %}/, ""))
        .pipe(
            gulpRename(path => {
                path.dirname += "/flatpages/";
                path.basename = path.basename.replace(".template", "");
                path.extname = ".flat.html";
            })
        )
        .pipe(dest(DIST_PATH));
};

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

exports.collect = series(
    parallel(collectJs, collectCss, collectHtml, collectImages, collectStatic),
    collectFlatpageTemplates,
    unwrap
);
