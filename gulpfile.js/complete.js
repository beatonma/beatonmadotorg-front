const { series } = require("gulp");
const { build } = require("./build");
const { clean, cleanTemp } = require("./clean");
const { collect } = require("./collect");
const { prebuild } = require("./prebuild");
const { checkConfiguration } = require("./setup");

exports.completeBuild = series(
    checkConfiguration,
    clean,
    prebuild,
    build,
    collect,
    cleanTemp
);
