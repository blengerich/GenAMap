/**
 * Created by anuraagjain on 7/29/17.
 */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')


const config = {
    devtool: 'source-map',
    entry: [
        'babel-polyfill',
        './src/index'
    ],
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    target:'web',
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    },


    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                drop_console: true,
                drop_debugger: true
            }
        }),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot-loader/webpack', 'babel-loader'],
                include: [
                    path.resolve(__dirname, './src'),
                ],
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader?importLoaders=1'],
                include: [
                    path.resolve(__dirname, './src'),
                ],
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
                include: [
                    path.resolve(__dirname, './src'),
                ],
            }

        ]
    },

}

module.exports = config;
