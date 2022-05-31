import gulp_sass from "gulp-sass";
import sass from "sass";
import { dest, src } from "gulp";
import { ANY_SCSS, DIST_PATH, SRC_PATH, srcPath } from "./paths";
import gulpInline64 from "gulp-inline-base64";
import gulpRename from "gulp-rename";
import gulpAutoprefixer from "gulp-autoprefixer";
import gulpSourcemaps from "gulp-sourcemaps";
import gulpIf from "gulp-if";
import { getGitHash, isProductionBuild } from "./setup";
import gulpCssNano from "gulp-cssnano";
import { unwrap } from "./build";

const gulpSass = gulp_sass(sass);

const inlineImages = () =>
    gulpInline64({
        maxSize: 16 * 1024,
        debug: false,
        baseDir: SRC_PATH,
    });

/**
 * Inject the current git hash to the name of any minified files.
 */
const appendGitHash = () =>
    gulpRename(path => {
        path.basename = path.basename.replace(
            /([^.]+)(\.?.*)/,
            `$1-${getGitHash()}$2.min`
        );
    });

export const buildCss = () =>
    src(srcPath(ANY_SCSS))
        .pipe(gulpSass())
        .pipe(inlineImages())
        .pipe(gulpAutoprefixer())
        .pipe(appendGitHash())
        .pipe(gulpSourcemaps.init())
        .pipe(gulpIf(isProductionBuild(), gulpCssNano()))
        .pipe(gulpSourcemaps.write("."))
        .pipe(
            gulpRename(path => {
                // Move to apps/appname/static/appname/css
                path.dirname = path.dirname.replace(
                    /apps[/\\](.+?)[/\\]s?css/g,
                    "apps/$1/static/$1/css"
                );
            })
        )
        .pipe(unwrap())
        .pipe(dest(DIST_PATH));
