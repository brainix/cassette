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



import http from 'http';
import https from 'https';
import path from 'path';

import ReactDOMServer from 'react-dom/server';
import express from 'express';
import parallel from 'async/parallel';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import App from './src/index.jsx';
import config from './webpack.config.babel.js';

const app = express();



if (process.env.NODE_ENV !== 'production') {
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {colors: true}
    }));
    app.use(webpackHotMiddleware(compiler));
}

app.set('view engine', 'pug');

app.locals.port = process.env.PORT || 8080;
if (process.env.NODE_ENV === 'production') {
    app.locals.http = https;
    const scheme = 'https';
    const hostname = 'api.spool.tv';
    const port = 443;
    app.locals.apiHost = `${scheme}://${hostname}:${port}`;
} else {
    app.locals.http = http;
    const scheme = 'http';
    const hostname = 'localhost';
    const port = 5000;
    app.locals.apiHost = `${scheme}://${hostname}:${port}`;
}



app.get(['/robots.txt', '/humans.txt'], (req, res) => {
    const url = `${app.locals.apiHost}${req.path}`;
    app.locals.http.get(url, (apiResponse) => {
        let body = '';
        apiResponse.on('data', (data) => {
            body += data;
        });
        apiResponse.on('end', () => {
            res.type('text/plain');
            res.send(body);
        });
    });
});

app.get('/sitemap.xml', (req, res) => {
    const url = `${app.locals.apiHost}/sitemap.xml`;
    app.locals.http.get(url, (apiResponse) => {
        let body = '';
        apiResponse.on('data', (data) => {
            body += data;
        });
        apiResponse.on('end', () => {
            const find = process.env.NODE_ENV == 'production' ? /https:\/\/api.spool.tv\//g : /http:\/\/localhost:5000\//g;
            const replace = process.env.NODE_ENV == 'production' ? 'https://spool.tv/' : 'http://localhost:8080/';
            body = body.replace(find, replace);
            body = body.replace(/\/v1\//g, '/');
            body = body.replace(/\/artists\//g, '/');
            body = body.replace(/\/songs\//g, '/');
            res.type('application/xml');
            res.send(body);
        });
    });
});

app.get('/', (req, res) => {
    const url = `${app.locals.apiHost}/v1/songs`;
    app.locals.http.get(url, (apiResponse) => {
        let json = '';
        apiResponse.on('data', (data) => {
            json += data;
        });
        apiResponse.on('end', () => {
            const videos = JSON.parse(json).songs;
            const component = App({videos: videos});
            const rendered = ReactDOMServer.renderToString(component);
            res.render('index', {
                title: 'Spool - Just music videos.',
                app: rendered,
                videos: videos,
            });
        });
    });
});

app.get('/:artistId/:songId', (req, res) => {
    parallel({
        song: (callback) => {
            const url = `${app.locals.apiHost}/v1/artists/${req.params.artistId}/songs/${req.params.songId}`;
            app.locals.http.get(url, (apiResponse) => {
                let json = '';
                apiResponse.on('data', (data) => {
                    json += data;
                });
                apiResponse.on('end', () => {
                    const video = JSON.parse(json).songs[0];
                    callback(null, video);
                });
            });
        },
        songs: (callback) => {
            const url = `${app.locals.apiHost}/v1/songs`;
            app.locals.http.get(url, (apiResponse) => {
                let json = '';
                apiResponse.on('data', (data) => {
                    json += data;
                });
                apiResponse.on('end', () => {
                    const videos = JSON.parse(json).songs;
                    callback(null, videos);
                });
            });
        },
        genius: (callback) => {
            const url = `${app.locals.apiHost}/v1/artists/${req.params.artistId}/songs/${req.params.songId}/genius`;
            app.locals.http.get(url, (apiResponse) => {
                let json = '';
                apiResponse.on('data', (data) => {
                    json += data;
                });
                apiResponse.on('end', () => {
                    const description = JSON.parse(json).songs[0].description.plain;
                    callback(null, description);
                });
            });
        },
    },
    (err, results) => {
        const videos = [results.song].concat(results.songs);
        const component = App({videos: videos});
        const rendered = ReactDOMServer.renderToString(component);
        res.render('index', {
            title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
            app: rendered,
            videos: videos,
        });
    });
});

app.use(express.static(__dirname + '/public'));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});



app.listen(app.locals.port);
console.log(`Listening at: http://127.0.0.1:${app.locals.port} (${process.pid})`);
