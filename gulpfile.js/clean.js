const { ANY_FILE, buildPath, distPath } = require("./paths");
const del = require("del");

const clean = async () => del.sync([buildPath(ANY_FILE), distPath(ANY_FILE)]);

const cleanTemp = async () =>
    del.sync([
        // buildPath(ANY_FILE),
        distPath("/apps/"),
    ]);

exports.clean = clean;
exports.cleanTemp = cleanTemp;
