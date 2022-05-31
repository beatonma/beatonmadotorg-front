import { parallel, series } from "gulp";
import gulpRename from "gulp-rename";
import { buildCss } from "./build-css";
import { buildJs } from "./build-js";
import { buildStatic } from "./build-static";
import { buildTemplates } from "./build-templates";
import { checkConfiguration } from "./setup";

/**
 * Remove the `apps/` parent directory.
 */
export const unwrap = () =>
    gulpRename(path => {
        path.dirname = path.dirname.replace(/^apps\//, "");
    });

export const rebuild = parallel(buildJs, buildCss, buildStatic, buildTemplates);

export const completeBuild = series(checkConfiguration, rebuild);
