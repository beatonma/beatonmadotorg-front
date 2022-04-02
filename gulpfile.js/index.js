const { completeBuild } = require("./complete");
const { watch } = require("./dev");
const { initDev, initProduction } = require("./setup");
const { series } = require("gulp");
const { publish } = require("./publish");

const devWatch = series(initDev, completeBuild, watch);
const pushToPublicServer = series(initProduction, completeBuild, publish);

exports.default = devWatch;
exports.publish = pushToPublicServer;
