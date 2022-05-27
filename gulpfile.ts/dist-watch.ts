import { create as browserSyncCreate } from "browser-sync";
import gulp from "gulp";
import { completeBuild } from "./build";
import { ANY_FILE, distPath, LOCAL_PATH, srcPath } from "./paths";

const { src, dest, series } = gulp;

const browserSync = browserSyncCreate();

const initBrowser = async () =>
    browserSync.init({
        proxy: "localhost:8000",
    });

const refreshBrowser = async () => browserSync.reload();

/**
 * Copy constructed files to our local Django project directory.
 */
const localDist = () => src(distPath(ANY_FILE)).pipe(dest(LOCAL_PATH));

const localBuild = series(completeBuild, localDist, refreshBrowser);

const _watch = () => gulp.watch(srcPath(ANY_FILE), localBuild);

export const watch = series(localBuild, initBrowser, _watch);
