const { completeBuild } = require("./complete");
const gulpRename = require("gulp-rename");

const gulp = require("gulp");
const { src, dest, series } = gulp;
const {
    ANY_CSS,
    ANY_SCSS,
    ANY_JS,
    ANY_HTML,
    ANY_FILE,
    LOCAL_PATH,
    distPath,
    srcPath,
    ANY_JS_OR_TS,
} = require("./paths");

const browserSync = require("browser-sync").create();

const initBrowser = cb => {
    browserSync.init({
        proxy: "localhost:8000",
    });
    return cb();
};
const refreshBrowser = cb => {
    browserSync.reload();
    cb();
};

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

const localDist = () => src(distPath(ANY_FILE)).pipe(dest(LOCAL_PATH));

const localBuild = series(
    completeBuild,
    localCollectStatic,
    localDist,
    refreshBrowser
);

const watch = () => {
    gulp.watch(srcPath(ANY_SCSS), localBuild);
    gulp.watch(srcPath(ANY_JS_OR_TS), localBuild);
    gulp.watch(srcPath(ANY_HTML), localBuild);
};

exports.watch = series(initBrowser, localBuild, watch);
