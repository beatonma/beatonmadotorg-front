import path from "path";
import { Configuration } from "webpack";
import { getBuildType, getGitHash } from "./gulpfile.ts/setup";

const withGitHash = (filepath: string) =>
    filepath.replace("[name]", `[name]-${getGitHash()}`);

export const getConfig: () => Configuration = () => ({
    mode: getBuildType(),
    entry: {
        app: {
            import: [
                "./build/preprocessed/apps/main/js/app",
                "./build/preprocessed/apps/webmentions_tester/app",
            ],
            chunkLoading: false,
            filename: withGitHash("apps/main/js/[name].min.js"),
        },
        contact: {
            import: "./build/preprocessed/apps/contact/js/contact",
            chunkLoading: false,
            filename: withGitHash("apps/contact/js/[name].min.js"),
        },
        dashboard: {
            import: "./build/preprocessed/apps/dashboard/js/dashboard",
            chunkLoading: false,
            filename: withGitHash("apps/dashboard/js/[name].min.js"),
        },
    },
    output: {
        path: path.resolve(__dirname, "build/temp/"),
        filename: withGitHash(`[name].min.js`),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
                type: "asset",
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                },
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    devtool: "inline-source-map",
});
