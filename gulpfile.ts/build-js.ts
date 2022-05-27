import { DIST_PATH, srcPath } from "./paths";
import { dest, parallel, src } from "gulp";
import { includeEnv } from "./env";
import { exec as shellExec } from "child_process";
import webpackStream from "webpack-stream";
import { getConfig } from "../webpack.config";
import named from "vinyl-named";
import Vinyl from "vinyl";
import { appendGitHash, unwrap } from "./build";

const renameForWebpack = () => named(function(file: Vinyl) {
    const original = file.history[0];
    const matches = original.match(/.*\/([^/]+)\/js\/(.*)\.tsx?/);
    const appname = matches[1];
    const filename = matches[2];

    return `${appname}/static/${appname}/js/${filename}.min`;
});

const _buildJs = () =>
    src([
        srcPath("**/app.ts"),
        srcPath("**/dashboard.tsx"),
    ])
        .pipe(includeEnv())
        .pipe(renameForWebpack())
        .pipe(webpackStream(getConfig()))
        .pipe(appendGitHash())
        .pipe(unwrap())
        .pipe(dest(DIST_PATH));

const checkTypescript = () =>
    new Promise<void>((resolve, reject) => {
        shellExec(
            "npx tsc --project ./tsconfig.json --noEmit",
            (error, stdout, stderr) => {
                if (error) {
                    console.error("ERROR", error);
                    if (stderr) console.error(stderr);
                    if (stdout) console.error(stdout);
                    reject(error);
                    throw error;
                }

                resolve();
            },
        );
    });

export const buildJs = parallel(_buildJs, checkTypescript);
