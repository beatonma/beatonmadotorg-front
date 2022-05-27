import del from "del";
import { parallel, TaskFunctionCallback } from "gulp";
import { Env } from "./env";
import { DevelopmentEnv } from "./env-development";
import { ProductionEnv } from "./env-production";

export const BUILD_TYPE_PRODUCTION = "production";
export const BUILD_TYPE_DEVELOPMENT = "development"; // Disable js/css minification

let buildType: "none" | "development" | "production" = null;
let environment: Env = null;
let gitHash: string = null;

export const getBuildType = () => buildType;
export const isDevBuild = () => buildType === BUILD_TYPE_DEVELOPMENT;
export const isProductionBuild = () => buildType === BUILD_TYPE_PRODUCTION;

export const getEnvironment = () => environment;
export const getGitHash = () => gitHash;
import { exec as shellExec } from "child_process";
import { ANY_FILE, distPath } from "./paths";

const _init = () =>
    new Promise<void>((resolve, reject) => {
        shellExec("git rev-parse --short HEAD", (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            gitHash = stdout.trim();
            environment.gitHash = gitHash;
            console.log(`gitHash: ${gitHash}`);
            resolve();
            return;
        });
    });

const clean = async () =>
    del.sync([distPath(ANY_FILE)]);

const init = parallel(clean, _init);


export const initDev = (done: TaskFunctionCallback) => {
    buildType = BUILD_TYPE_DEVELOPMENT;
    environment = DevelopmentEnv;
    return init(done);
};

export const initProduction = (done: TaskFunctionCallback) => {
    buildType = BUILD_TYPE_PRODUCTION;
    environment = ProductionEnv;
    return init(done);
};

export const checkConfiguration = async () => {
    if (!gitHash) throw "gitHash is not initialised!";

    if (![BUILD_TYPE_DEVELOPMENT, BUILD_TYPE_PRODUCTION].includes(buildType)) {
        throw `gulpfile task configuration error
            buildType must be set before calling 'build' task!
            Expected (${BUILD_TYPE_PRODUCTION} | ${BUILD_TYPE_DEVELOPMENT}),
            found '${buildType}'\n`;
    } else {
        console.log(`Build configuration: ${buildType}`);
    }
};
