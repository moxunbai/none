// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

const Webpack = require('webpack')
module.exports = {
    mode: 'development', // 开发模式
    entry: path.resolve(__dirname, '../src/index.js'), // 入口文件
    output: {
        filename: '[name].[hash:8].js', // 打包后的文件名称
        path: path.resolve(__dirname, '../dist') // 打包后的目录
    },
    devServer: {
        port: 3300,
        hot: true,
        contentBase: '../dist'
    },
    // module: {
    //     rules: [{
    //         // 打包字体文件
    //         test: /\.(gltf|ttf|svg|woff|woff2)$/,
    //         use: {
    //             loader: 'file-loader',
    //             options: {
    //                 outputPath: 'font/',
    //             }
    //         },
    //     }]
    // },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html')
        }),
        new CleanWebpackPlugin(),
        new Webpack.HotModuleReplacementPlugin(),
        // new CopyWebpackPlugin({
        //     patterns: [{
        //         from: path.resolve(__dirname, '../static'),
        //         to: 'static',
        //         // ignore: ['.*']
        //     }]
        // }),
    ]
}