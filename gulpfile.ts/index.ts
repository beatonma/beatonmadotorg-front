import { completeBuild } from "./00-complete";
import {
    getBuildType as _getBuildType,
    isProductionBuild as _isProductionBuild,
    initDev,
    initProduction,
} from "./01-setup";
import { publish as push } from "./05-publish";
import { series } from "gulp";
import { watch } from "./05-watch";

const devWatch = series(initDev, watch);
const prodWatch = series(initProduction, watch);
const pushToPublicServer = series(initProduction, completeBuild, push);

/**
 * Reduced local build with no minification, watched locally.
 */
export default devWatch;

// noinspection JSUnusedGlobalSymbols
/**
 * Complete build and push to server.
 */
export const publish = pushToPublicServer;

/**
 * Complete build with minification, watched locally.
 */
export const local = prodWatch;

export const getBuildType = _getBuildType;
export const isProductionBuild = _isProductionBuild;
