import { series } from "gulp";

import { build } from "./build";
import { clean, cleanTemp } from "./clean";
import { collect } from "./collect";
import { prebuild } from "./prebuild";
import { checkConfiguration } from "./setup";

export const completeBuild = series(
    checkConfiguration,
    clean,
    prebuild,
    build,
    collect,
    cleanTemp
);
