const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
        filename: './[name].[contenthash].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.md$/,
                use: 'raw-loader'
            }
        ]
    },
    optimization: {
        // Extract boilerplate code into runtime chunk
        runtimeChunk: 'single',
        // Put all third-party dependencies into the vendors chunk
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './public/index.html',
            chunks: ['runtime', 'vendors', 'app']
        }),
        new CopyPlugin({
            patterns: [
                {from: './public/favicon.ico'},
                {from: './public/images/conversions.png'},
                {from: './public/images/conversions_by_version.png'},
                {from: './public/images/crashes.png'},
                {from: './public/images/duration.png'},
                {from: './public/images/errors.png'},
                {from: './public/images/events.png'},
                {from: './public/images/evt_sessions.png'},
                {from: './public/images/new_users.png'},
                {from: './public/images/new_users_0.png'},
                {from: './public/images/retention.png'},
                {from: './public/images/segments.png'},
                {from: './public/images/sessions_with_crashes.png'},
                {from: './public/images/sessions.png'},
                {from: './public/images/top_events.png'},
                {from: './public/images/top_events_by_version.png'},
                {from: './public/images/unique_users.png'},
                {from: './public/thumbs/th_conversions.png'},
                {from: './public/thumbs/th_duration.png'},
                {from: './public/thumbs/th_events.png'},
                {from: './public/thumbs/th_new_users.png'},
                {from: './public/thumbs/th_retention.png'},
                {from: './public/thumbs/th_segments.png'},
                {from: './public/thumbs/th_sessions.png'},
                {from: './public/thumbs/th_top_events.png'},
                {from: './public/thumbs/th_unique_users.png'}
            ]
        })
    ],
    devtool: 'source-map',
    devServer: {
        historyApiFallback: true
    }
};
