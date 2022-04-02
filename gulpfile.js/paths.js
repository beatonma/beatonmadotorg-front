exports.ANY_JS = "**/*.js";
exports.ANY_JSX = "**/*.jsx";
exports.ANY_TS = "**/*.ts";
exports.ANY_TSX = "**/*.tsx";
exports.ANY_CSS = "**/*.css";
exports.ANY_HTML = "**/*.html";
exports.ANY_SCSS = "**/*.scss";
exports.ANY_FILE = "**";

/* Paths */
SRC_PATH = "src/";
DIST_PATH = "dist/";
BUILD_PATH = "build/";
LOCAL_PATH = "../back/";

srcPath = path => SRC_PATH + path;
buildPath = path => BUILD_PATH + path;
distPath = path => DIST_PATH + path;

TEMP_PATH = buildPath("temp/");
PREPROCESSING_PATH = buildPath("preprocessed/");

prepPath = path => PREPROCESSING_PATH + path;
tempPath = path => TEMP_PATH + path;

exports.SRC_PATH = SRC_PATH;
exports.DIST_PATH = DIST_PATH;
exports.BUILD_PATH = BUILD_PATH;
exports.LOCAL_PATH = LOCAL_PATH;
exports.srcPath = srcPath;
exports.buildPath = buildPath;
exports.distPath = distPath;
exports.TEMP_PATH = TEMP_PATH;
exports.PREPROCESSING_PATH = PREPROCESSING_PATH;
exports.prepPath = prepPath;
exports.tempPath = tempPath;
