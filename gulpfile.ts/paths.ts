export const ANY_JS = "**/*.js";
export const ANY_JSX = "**/*.jsx";
export const ANY_TS = "**/*.ts";
export const ANY_TSX = "**/*.tsx";
export const ANY_CSS = "**/*.css";
export const ANY_HTML = "**/*.html";
export const ANY_SCSS = "**/*.scss";
export const ANY_JS_OR_TS = "**/*.{j,t}s?(x)"; // .js, .ts, .jsx, .tsx
export const ANY_FILE = "**";
export const ANY_META = "**/*.{map,LICENSE.txt}";

/* Paths */
export const SRC_PATH = "src/";
export const DIST_PATH = "dist/";
export const BUILD_PATH = "build/";
export const LOCAL_PATH = "../back/";

export const srcPath = (path: string) => SRC_PATH + path;
export const buildPath = (path: string) => BUILD_PATH + path;
export const distPath = (path: string) => DIST_PATH + path;

export const TEMP_PATH = buildPath("temp/");
export const PREPROCESSING_PATH = buildPath("preprocessed/");

export const prepPath = (path: string) => PREPROCESSING_PATH + path;
export const tempPath = (path: string) => TEMP_PATH + path;
