import {
    ANY_CSS,
    ANY_FILE,
    ANY_HTML,
    ANY_JS,
    ANY_JS_OR_TS,
    ANY_SCSS,
    DIST_PATH,
    distPath,
    LOCAL_PATH,
    srcPath,
} from "./paths";
import { completeBuild } from "./00-complete";
import gulp from "gulp";
import gulpRename from "gulp-rename";
import { create as browserSyncCreate } from "browser-sync";

const { src, dest, series } = gulp;

const browserSync = browserSyncCreate();

const initBrowser = async () =>
    browserSync.init({
        proxy: "localhost:8000",
    });

const refreshBrowser = async () => browserSync.reload();

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

const _watch = () => {
    gulp.watch(srcPath(ANY_SCSS), localBuild);
    gulp.watch(srcPath(ANY_JS_OR_TS), localBuild);
    gulp.watch(srcPath(ANY_HTML), localBuild);
};

export const watch = series(initBrowser, localBuild, _watch);
