import { completeBuild } from "./complete";

import { initDev, initProduction } from "./setup";
import { publish as push } from "./publish";

import { series } from "gulp";

import { watch } from "./dev";

const devWatch = series(initDev, completeBuild, watch);
const pushToPublicServer = series(initProduction, completeBuild, push);

// export const default = devWatch;
export const publish = pushToPublicServer;
export default devWatch;
