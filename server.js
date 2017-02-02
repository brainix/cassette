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



import compression from 'compression';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from './webpack.config.babel.js';
import router from './routes.js';

const app = express();



if (process.env.NODE_ENV === 'production') {
    app.use(compression);
} else {
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {colors: true},
    }));
    app.use(webpackHotMiddleware(compiler));
}

app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    res.status(statusCode).render(`${statusCode}`);
});

app.set('view engine', 'pug');
app.use(router);



const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening at: http://127.0.0.1:${port} (${process.pid})`);
});
