import path from "path";
import { Configuration } from "webpack";
import { getBuildType, isProductionBuild } from "./gulpfile.ts";

export const getConfig: () => Configuration = () => ({
    mode: getBuildType(),
    entry: {
        app: {
            import: [
                "./build/preprocessed/apps/main/js/app",
                "./build/preprocessed/apps/webmentions_tester/app",
            ],
            chunkLoading: false,
            filename: "apps/main/js/[name].min.js",
        },
        contact: {
            import: "./build/preprocessed/apps/contact/js/contact",
            chunkLoading: false,
            filename: "apps/contact/js/[name].min.js",
        },
        dashboard: {
            import: "./build/preprocessed/apps/dashboard/js/dashboard",
            chunkLoading: false,
            filename: "apps/dashboard/js/[name].min.js",
        },
    },
    output: {
        path: path.resolve(__dirname, "build/temp/"),
        filename: `[name].min.js`,
    },
    optimization: {
        minimize: isProductionBuild(),
    },
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
                type: "asset",
            },
            {
                test: /\.[jt]sx?$/,
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
    devtool: isProductionBuild() ? "source-map" : "inline-source-map",
});
