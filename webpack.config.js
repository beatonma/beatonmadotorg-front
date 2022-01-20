const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    // main: "./src/apps/main/js/app.js",
    app: {
      import: [
        "./build/preprocessed/apps/main/js/app.js",
        "./build/preprocessed/apps/webmentions_tester/app.js",
      ],
      dependOn: "shared",
      chunkLoading: false,
      filename: "apps/main/js/[name].min.js",
    },
    contact: {
      import: "./build/preprocessed/apps/contact/js/contact.js",
      chunkLoading: false,
      filename: "apps/contact/js/[name].min.js",
    },
    shared: ["react", "react-dom"],
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
