import { series } from "gulp";
import { completeBuild } from "./build";
import { publish as push } from "./dist-publish";
import { watch } from "./dist-watch";
import {
    getBuildType as _getBuildType,
    initDev,
    initProduction,
    isProductionBuild as _isProductionBuild,
} from "./setup";

/**
 * Reduced local build with no minification, watched locally.
 */
export default series(initDev, watch);

/**
 * Complete build, nothing more.
 */
export const build = series(initProduction, completeBuild);

/**
 * Complete build with minification, watched locally.
 */
export const local = series(initProduction, watch);

// noinspection JSUnusedGlobalSymbols
/**
 * Complete build and push to server.
 */
export const publish = series(initProduction, completeBuild, push);

export const getBuildType = _getBuildType;
export const isProductionBuild = _isProductionBuild;
