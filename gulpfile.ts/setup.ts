import { Callback } from "./types";
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

const init = (cb: Callback) => {
    shellExec("git rev-parse --short HEAD", (error, stdout, stderr) => {
        gitHash = stdout.trim();
        environment.gitHash = gitHash;
        cb();
    });
};

export const initDev = (cb: Callback) => {
    buildType = BUILD_TYPE_DEVELOPMENT;
    environment = DevelopmentEnv;
    return init(cb);
};

export const initProduction = (cb: Callback) => {
    buildType = BUILD_TYPE_PRODUCTION;
    environment = ProductionEnv;
    return init(cb);
};

export const checkConfiguration = (cb: Callback) => {
    if (![BUILD_TYPE_DEVELOPMENT, BUILD_TYPE_PRODUCTION].includes(buildType)) {
        throw `gulpfile task configuration error
            buildType must be set before calling 'build' task!
            Expected (${BUILD_TYPE_PRODUCTION} | ${BUILD_TYPE_DEVELOPMENT}),
            found '${buildType}'\n`;
    } else {
        console.log(`Build configuration: ${buildType}`);
    }
    return cb();
};
