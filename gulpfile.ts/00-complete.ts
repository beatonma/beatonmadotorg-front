import { series } from "gulp";

import { build } from "./03-build";
import { clean, cleanTemp } from "./clean";
import { collect } from "./04-collect";
import { prebuild } from "./02-prebuild";
import { checkConfiguration } from "./01-setup";

export const completeBuild = series(
    checkConfiguration,
    clean,
    prebuild,
    build,
    collect,
    cleanTemp
);
