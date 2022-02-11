const path = require("path");

module.exports = {
    mode: "production",
    entry: {
        app: {
            import: [
                "./build/preprocessed/apps/main/js/app.js",
                "./build/preprocessed/apps/webmentions_tester/app.js",
            ],
            chunkLoading: false,
            filename: "apps/main/js/[name].min.js",
        },
        contact: {
            import: "./build/preprocessed/apps/contact/js/contact.js",
            chunkLoading: false,
            filename: "apps/contact/js/[name].min.js",
        },
        dashboard: {
            import: "./build/preprocessed/apps/dashboard/js/dashboard.js",
            chunkLoading: false,
            filename: "apps/dashboard/js/[name].min.js",
        },
    },
    output: {
        path: path.resolve(__dirname, "build/temp/"),
        filename: "[name].min.js",
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
        ],
    },
    resolve: {
        extensions: [".js", ".jsx"],
    },
};
