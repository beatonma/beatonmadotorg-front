const BUILD_TYPE_PRODUCTION = "production";
const BUILD_TYPE_DEVELOPMENT = "development"; // Disable js/css minification

let buildType = null;

exports.initDev = cb => {
    buildType = BUILD_TYPE_DEVELOPMENT;
    return cb();
};

exports.initProduction = cb => {
    buildType = BUILD_TYPE_PRODUCTION;
    return cb();
};

exports.checkConfiguration = cb => {
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

exports.buildType = () => buildType;
exports.BUILD_TYPE_DEVELOPMENT = BUILD_TYPE_DEVELOPMENT;
exports.BUILD_TYPE_PRODUCTION = BUILD_TYPE_PRODUCTION;
