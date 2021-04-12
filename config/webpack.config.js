const path = require("path")

const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")

module.exports = {
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        hot: true,
        contentBase: './'
    },
    target:"nwjs",
    output: {
        path: path.resolve(__dirname, "../build/"),
        filename: "bundle.js"
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/template-res", to: './' }
            ]
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    }
}