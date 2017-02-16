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



import cluster from 'cluster';

import 'newrelic';
import express from 'express/lib/express';
import compression from 'compression';
import webpack from 'webpack/lib/webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../webpack.config.babel';
import router from './router.jsx';



const PORT = process.env.PORT || 8080;
const NUM_WORKERS = process.env.WEB_CONCURRENCY || 1;
const app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(compression());
} else {
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {colors: true},
    }));
    app.use(webpackHotMiddleware(compiler));
}
app.set('view engine', 'pug');
app.use(router);

const runInstance = () => {
    app.listen(PORT, () => {
        console.log(`Listening at: http://127.0.0.1:${PORT} (${process.pid})`);
    });
};



if (process.env.NODE_ENV === 'production') {
    if (cluster.isMaster) {
        cluster.on('exit', () => cluster.fork());
        for (var i = 0; i < NUM_WORKERS; i++) {
            cluster.fork();
        }
    } else if (cluster.isWorker) {
        runInstance();
    }
} else {
    runInstance();
}
