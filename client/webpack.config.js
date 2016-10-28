var webpack = require("webpack");
var path = require("path");


module.exports = {
    entry: {
        index: "./app.js",
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "glo.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ["es2016", "es2015"],
                    plugins: ["transform-react-jsx"],
                }
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"],
            },
        ]
    },
    resolve: {
        extensions: ['', '.js'],
    },
    devtool: 'source-map',
};
