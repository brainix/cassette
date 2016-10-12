/*---------------------------------------------------------------------------*\
 |  webpack.config.js                                                        |
 |                                                                           |
 |  Copyright © 2016, Rajiv Bakulesh Shah, original author.                  |
 |                                                                           |
 |      This program is free software: you can redistribute it and/or modify |
 |      it under the terms of the GNU General Public License as published by |
 |      the Free Software Foundation, either version 3 of the License, or    |
 |      (at your option) any later version.                                  |
 |                                                                           |
 |      This program is distributed in the hope that it will be useful, but  |
 |      WITHOUT ANY WARRANTY; without even the implied warranty of           |
 |      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU    |
 |      General Public License for more details.                             |
 |                                                                           |
 |      You should have received a copy of the GNU General Public License    |
 |      along with this program.  If not, see:                               |
 |          <http://www.gnu.org/licenses/>                                   |
\*---------------------------------------------------------------------------*/



const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const SRC_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'public');
const NODE_ENV = JSON.stringify(process.env.NODE_ENV || 'development');



module.exports = {
    entry: [
        SRC_DIR + '/style.scss',
        SRC_DIR + '/index.jsx'
    ],
    output: {
        path: BUILD_DIR,
        publicPath: '/',
        filename: 'bundle.js'
    },
    plugins: (function() {
        const plugins = [
            new webpack.DefinePlugin({'process.env.NODE_ENV': NODE_ENV}),
            new ExtractTextPlugin('style.css', {allChunks: true})
        ];
        if (process.env.NODE_ENV == 'production') {
            plugins.push(
                new webpack.optimize.UglifyJsPlugin({
                    compress: {warnings: false}
                })
            );
        } else {
            plugins.push(
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NoErrorsPlugin()
            );
        }
        return plugins;
    }()),
    module: {
        loaders: [
            {
                test: /\.scss$/,
                include: SRC_DIR,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader!postcss-loader!sass-loader'
                )
            },
            {
                test: /\.jsx?$/,
                include: SRC_DIR,
                loader: 'babel'
            }
        ]
    }
};
