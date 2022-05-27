import { Configuration } from "webpack";
import { getBuildType, isProductionBuild } from "./gulpfile.ts";

export const getConfig: () => Configuration = () => ({
    mode: getBuildType(),
    optimization: {
        minimize: isProductionBuild(),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    devtool: isProductionBuild() ? "source-map" : "inline-source-map",
});
