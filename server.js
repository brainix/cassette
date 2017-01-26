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



import express from 'express';
import http from 'http';
import https from 'https';
import path from 'path';

import ReactDOMServer from 'react-dom/server';

import App from './src/index.jsx';

const app = express();
const port = process.env.PORT || 8080;



if (process.env.NODE_ENV !== 'production') {
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const webpack = require('webpack');
    const config = require('./webpack.config.js');
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {colors: true}
    }));
    app.use(webpackHotMiddleware(compiler));
}



app.set('view engine', 'pug');

app.get(['/robots.txt', '/humans.txt'], (request, response) => {
    const module = process.env.NODE_ENV == 'production' ? https : http;
    const scheme = process.env.NODE_ENV == 'production' ? 'https' : 'http';
    const hostname = process.env.NODE_ENV == 'production' ? 'api.spool.tv' : 'localhost';
    const port = process.env.NODE_ENV == 'production' ? 443 : 5000;
    const url = `${scheme}://${hostname}:${port}${request.path}`;
    module.get(url, (apiResponse) => {
        let body = '';
        apiResponse.on('data', (data) => {
            body += data;
        });
        apiResponse.on('end', () => {
            response.type('text/plain');
            response.send(body);
        });
    });
});

app.get('/sitemap.xml', (request, response) => {
    const module = process.env.NODE_ENV == 'production' ? https : http;
    const scheme = process.env.NODE_ENV == 'production' ? 'https' : 'http';
    const hostname = process.env.NODE_ENV == 'production' ? 'api.spool.tv' : 'localhost';
    const port = process.env.NODE_ENV == 'production' ? 443 : 5000;
    const url = `${scheme}://${hostname}:${port}/sitemap.xml`;
    module.get(url, (apiResponse) => {
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
            response.type('application/xml');
            response.send(body);
        });
    });
});

app.get('/', (request, response) => {
    const module = process.env.NODE_ENV == 'production' ? https : http;
    const scheme = process.env.NODE_ENV == 'production' ? 'https' : 'http';
    const hostname = process.env.NODE_ENV == 'production' ? 'api.spool.tv' : 'localhost';
    const port = process.env.NODE_ENV == 'production' ? 443 : 5000;
    const url = `${scheme}://${hostname}:${port}/v1/songs`;
    module.get(url, (apiResponse) => {
        let json = '';
        apiResponse.on('data', (data) => {
            json += data;
        });
        apiResponse.on('end', () => {
            const videos = JSON.parse(json).songs;
            const component = App({videos: videos});
            const rendered = ReactDOMServer.renderToString(component);
            response.render('index', {
                title: 'Spool - Just music videos.',
                app: rendered,
                videos: videos,
            });
        });
    });
});

app.get('/:artistId/:songId', (request, response) => {
    const module = process.env.NODE_ENV == 'production' ? https : http;
    const scheme = process.env.NODE_ENV == 'production' ? 'https' : 'http';
    const hostname = process.env.NODE_ENV == 'production' ? 'api.spool.tv' : 'localhost';
    const port = process.env.NODE_ENV == 'production' ? 443 : 5000;
    let url = `${scheme}://${hostname}:${port}/v1/artists/${request.params.artistId}/songs/${request.params.songId}`;
    module.get(url, (apiResponse) => {
        let json = '';
        apiResponse.on('data', (data) => {
            json += data;
        });
        apiResponse.on('end', () => {
            let videos = [JSON.parse(json).songs[0]];
            const url = `${scheme}://${hostname}:${port}/v1/songs`;
            module.get(url, (apiResponse) => {
                json = '';
                apiResponse.on('data', (data) => {
                    json += data;
                });
                apiResponse.on('end', () => {
                    videos = videos.concat(JSON.parse(json).songs);
                    const component = App({videos: videos});
                    const rendered = ReactDOMServer.renderToString(component);
                    response.render('index', {
                        title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                        app: rendered,
                        videos: videos,
                    });
                });
            });
        });
    });
});

app.use(express.static(__dirname + '/public'));

app.get('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});



app.listen(port);
console.log(`Listening at: http://127.0.0.1:${port} (${process.pid})`);
