const gulp = require("gulp");
const { dest, series, src, parallel } = gulp;

const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");

// Compilation
const gulpSass = require("gulp-sass")(require("sass"));
const gulpAutoprefixer = require("gulp-autoprefixer");
const gulpInline64 = require("gulp-inline-base64");
const gulpIf = require("gulp-if");

// File reduction/combination
const gulpInclude = require("gulp-file-include");
const gulpUseref = require("gulp-useref");

// Minification/obfuscation
const gulpCssNano = require("gulp-cssnano");

// Text processing
const gulpFind = require("gulp-find");
const gulpReplace = require("gulp-replace");

// Filesystem
const del = require("del");
const gulpRename = require("gulp-rename");
const gulpRsync = require("gulp-rsync");

/* Paths */
const SRC_PATH = "src/";
const DIST_PATH = "dist/";
const BUILD_PATH = "build/";
const LOCAL_PATH = "../back/";

const buildPath = path => BUILD_PATH + path;
const distPath = path => DIST_PATH + path;

const TEMP_PATH = buildPath("temp/");
const PREPROCESSING_PATH = buildPath("preprocessed/");

const srcPath = path => SRC_PATH + path;
const prepPath = path => PREPROCESSING_PATH + path;
const tempPath = path => TEMP_PATH + path;

const ANY_JS = "**/*.js";
const ANY_JSX = "**/*.jsx";
const ANY_CSS = "**/*.css";
const ANY_HTML = "**/*.html";
const ANY_SCSS = "**/*.scss";
const ANY_FILE = "**";

const FLATPAGE_TEMPLATES = [
    "base.template.html",
    "empty.template.html",
    "null.template.html",
    "about.template.html",
];

const BUILD_TYPE_PRODUCTION = "production";
const BUILD_TYPE_DEVELOPMENT = "development"; // Disable js/css minification
let buildType = "none";

const localDist = () => src(distPath(ANY_FILE)).pipe(dest(LOCAL_PATH));

/**
 * Collect js|css files together into static/(js|css)/ directory
 */
const localCollectStatic = () =>
    src([distPath(ANY_JS), distPath(ANY_CSS)])
        .pipe(
            gulpRename(path => {
                const ext = path.extname.replace(".", "");
                path.dirname = `static/${ext}/`;
            })
        )
        .pipe(dest(DIST_PATH));

/**
 * Apply include tags to inline any specified
 */
const buildInclude = () =>
    src([srcPath(ANY_JS), srcPath(ANY_JSX), srcPath(ANY_HTML)])
        .pipe(gulpUseref())
        .pipe(gulpInclude({ basepath: "@root" }))
        .pipe(dest(PREPROCESSING_PATH));

const prepJsx = () =>
    src(prepPath(ANY_JSX))
        .pipe(gulpReplace("class=", "className="))
        .pipe(gulpReplace("@@id", ""))
        .pipe(gulpReplace("@@class", ""))
        .pipe(gulpReplace("@@", ""))
        .pipe(dest(PREPROCESSING_PATH));

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
 * Source files are read from PREPROCESSING_PATH and output to TEMP_PATH.
 */
const js = () => {
    const buildConfig = webpackConfig;
    buildConfig.mode = buildType;

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

const collectJs = () =>
    src(tempPath(ANY_JS))
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

const minifyCss = () =>
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
        .pipe(gulpIf(buildType == BUILD_TYPE_PRODUCTION, gulpCssNano()))
        .pipe(dest(DIST_PATH));

const collectTemplates = () =>
    src(prepPath(ANY_HTML))
        .pipe(gulpReplace(/[\r\n]+(?=.*?%})(?!.*?{%)/gs, " ")) // Remove any newlines found inside {% django\ntags %}
        .pipe(gulpReplace(/([%}]})[\r\n]+\s*/gs, "$1")) // Remove line breaks and whitespace after django template closing tags %} }}.
        .pipe(dest(TEMP_PATH));

const minifyHtml = () =>
    src(tempPath(ANY_HTML))
        .pipe(
            gulpReplace(
                /(apps\/.*\/static\/.*)?\/?((js|css)\/.*\.(js|css))/g,
                "{% static '$2' %}"
            )
        ) // Fix filenames generated by useref in :concat and insert {% static %} tag
        .pipe(gulpReplace(/(?<=<.*?)[\s]+(?=[^<]*>)/gs, " ")) // Remove any newlines found inside <html tags>
        .pipe(gulpReplace(/ {2,}/g, " ")) // Remove extra spaces
        .pipe(gulpReplace(/[\r\n]{2,}/g, "\n")) // Remove extra line breaks
        .pipe(gulpReplace(/@@[\w]*/, "")) // Remove any 'leftover' tags from buildInclude()
        .pipe(dest(DIST_PATH));

const buildImages = () =>
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

const collectStatic = () =>
    src(srcPath("static/**/*")).pipe(dest(distPath("main/static/main/")));

/**
 * Create a flatpage-compatible variant of each template specified in FLATPAGE_TEMPLATES.
 *
 * - Replace generic tags with flatpage-specific ones
 * - Replace 'extends' declarations with the flatpage version
 * - Rename to .flat.html extension
 * - TODO Remove dynamic tags e.g. {% if %}, {% for %}, etc.
 */
const buildFlatpageTemplates = () => {
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

const clean = async () => del.sync([buildPath(ANY_FILE), distPath(ANY_FILE)]);

const cleanTemp = async () =>
    del.sync([
        // buildPath(ANY_FILE),
        distPath("/apps/"),
    ]);

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

const rsyncConfig = config => ({
    options: {
        chmod: "Du=rwx,Dgo=rx,Fu=rw,Fgo=r",
        e: `ssh -i "${config.keyfile}"`,
    },
    username: config.username,
    hostname: config.hostname,
    destination: "path",
    recursive: true,
    silent: true,
    root: DIST_PATH,
    progress: false,
});

const publish = () => {
    const config = rsyncConfig({
        keyfile:
            "keyfile",
        username: "username",
        "",
    });
    console.log(JSON.stringify(config, null, 2));

    return src(distPath(ANY_FILE))
        .pipe(gulpRsync(config))
        .on("error", err => {
            console.log(JSON.stringify(err, null, 2));
        });
};

/**
 * Additional meta-tools that provide information without contributing
 * to dist output. Outputs to BUILD_PATH
 */
const concat = require("gulp-concat");
const merge = require("merge-stream");
const jsFindReferences = () =>
    merge(
        // HTML IDs
        src([srcPath(ANY_JS)]).pipe(
            gulpFind(
                /(querySelector\(['"]#(.*?)['"]\)|getElementById\(['"](.*?)['"]\))/g
            )
        ),

        // HTML classes
        src([srcPath(ANY_JS)]).pipe(
            gulpFind(/querySelector\(['"]\.(.*?)['"]\)/g)
        )
    )
        .pipe(concat("references.txt"))

        // Show all ID references as #name
        .pipe(gulpReplace(/getElementById\('(.*?)'\)/g, "#$1,"))
        .pipe(gulpReplace(/querySelector\('(#.*?)'\)/g, "$1,"))

        // Show all class references as .name
        .pipe(gulpReplace(/querySelector\('(\..*?)'\)/g, "$1,"))

        // Reformat to one reference per line
        .pipe(gulpReplace(/\s/g, ""))
        .pipe(gulpReplace(/,+/g, "\n"))
        .pipe(dest(BUILD_PATH));

const initDev = cb => {
    buildType = BUILD_TYPE_DEVELOPMENT;
    return cb();
};
const initProduction = cb => {
    buildType = BUILD_TYPE_PRODUCTION;
    return cb();
};
const checkConfiguration = cb => {
    if (![BUILD_TYPE_DEVELOPMENT, BUILD_TYPE_PRODUCTION].includes(buildType)) {
        throw `gulpfile task configuration error
    buildType must be set before calling 'build' task!
    Expected (${BUILD_TYPE_PRODUCTION} | ${BUILD_TYPE_DEVELOPMENT}), found '${buildType}'\n`;
    } else {
        console.log(`Build configuration: ${buildType}`);
    }
    return cb();
};

const build = series(
    checkConfiguration,
    clean,
    buildInclude,
    prepJsx,
    parallel(buildSass, js, collectTemplates),
    parallel(minifyCss, minifyHtml, collectJs),
    parallel(buildFlatpageTemplates, buildImages, collectStatic),
    unwrap,
    cleanTemp
);

const localBuild = series(build, localCollectStatic, localDist);

const watch = () => {
    gulp.watch(srcPath(ANY_SCSS), localBuild);
    gulp.watch(srcPath(ANY_JS), localBuild);
    gulp.watch(srcPath(ANY_JSX), localBuild);
    gulp.watch(srcPath(ANY_HTML), localBuild);
};

exports.default = exports.build = series(initProduction, build);
exports.local = series(initDev, localBuild);
exports.watch = series(initDev, localBuild, watch);
exports.buildLocal = series(initProduction, localBuild);
exports.publish = series(initProduction, build, publish);

exports.ref = jsFindReferences;
