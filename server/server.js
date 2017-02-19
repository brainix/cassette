/*---------------------------------------------------------------------------*\
 |  server.js                                                                |
 |                                                                           |
 |  Copyright © 2016-2017, Rajiv Bakulesh Shah, original author.             |
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



var cluster = require('cluster');

require('babel-core/register');
require('newrelic');
var express = require('express/lib/express');
var compression = require('compression');
var webpack = require('webpack/lib/webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var config = require('../webpack.config.babel');
var router = require('./router.jsx');



var PORT = process.env.PORT || 8080;
var NUM_WORKERS = process.env.WEB_CONCURRENCY || 2;
var app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(compression());
} else {
    var compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {colors: true},
    }));
    app.use(webpackHotMiddleware(compiler));
}
app.set('view engine', 'pug');
app.disable('x-powered-by');
app.use(router.default);



if (cluster.isMaster) {
    cluster.on('exit', function () {
        cluster.fork();
    });

    var i;
    for (i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else if (cluster.isWorker) {
    app.listen(PORT, function () {
        console.log(`Listening at: http://127.0.0.1:${PORT} (${process.pid})`);
    });
}
