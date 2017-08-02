/**
 * Created by anuraagjain on 7/29/17.
 */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')


const config = {
    devtool: 'source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3001/',
        // 'webpack/hot/only-dev-server',
        'babel-polyfill',
        'react-hot-loader/patch',
        './src/index'
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    // resolve: {
    //     extensions: ['.js', '.jsx']
    // },
    target:'web',
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    },


    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // new ExtractTextPlugin({
        //     filename: 'style.css',
        //     allChunks: true
        // }),
        new HtmlWebpackPlugin({
            template: './static/index.html',
            files: {
                css: ['style.css'],
                js: [ '/build/bundle.js'],
            }
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot-loader/webpack', 'babel-loader'],
                //exclude:path.resolve(__dirname, "node_modules"),
                include: [
                    path.resolve(__dirname, './src'),
                ],
                // query : {
                //     presets : ['es2015','react']
                // }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader?importLoaders=1'],
                include: [
                    path.resolve(__dirname, './src'),
                ],
                //exclude:path.resolve(__dirname, "node_modules"),
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
                include: [
                    path.resolve(__dirname, './src'),
                ],
                //exclude:path.resolve(__dirname, "node_modules"),
            }

        ]
    },
     devServer: {
         contentBase: "./static",
         noInfo: false,
         hot: true,
         inline: true,
         port: 3001,
         host: "0.0.0.0",
             proxy: {
                 '/sessions': {
                     target: 'http://localhost:3000/',
                     secure: false
                 },
                 '/api': {
                     target: 'http://localhost:3000/',
                     secure: false
                 },
                 '/data': {
                     target: 'http://localhost:3000/',
                     secure: false
                 },
                 '/activity': {
                     target: 'http://localhost:3000/',
                     secure: false
                 },
                 '/analysis-results': {
                     target: 'http://localhost:3000/',
                     secure: false
                 }
             }
     },

}

module.exports = config;