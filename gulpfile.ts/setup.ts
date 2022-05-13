import { Callback } from "./types";

export const BUILD_TYPE_PRODUCTION = "production";
export const BUILD_TYPE_DEVELOPMENT = "development"; // Disable js/css minification

let buildType: "none" | "development" | "production" = null;

export const getBuildType = () => buildType;
export const isDevBuild = () => buildType === BUILD_TYPE_DEVELOPMENT;
export const isProductionBuild = () => buildType === BUILD_TYPE_PRODUCTION;

export const initDev = (cb: Callback) => {
    buildType = BUILD_TYPE_DEVELOPMENT;
    return cb();
};

export const initProduction = (cb: Callback) => {
    buildType = BUILD_TYPE_PRODUCTION;
    return cb();
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
