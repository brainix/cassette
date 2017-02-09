/*---------------------------------------------------------------------------*\
 |  server.jsx                                                               |
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

import express from 'express';
import compression from 'compression';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {memoryHistory, match, RouterContext} from 'react-router';
import parallel from 'async/parallel';

import config from './webpack.config.babel';
import routes from './shared/routes';



const app = express();
let agent, API_HOST, WEB_HOST;
if (process.env.NODE_ENV === 'production') {
    agent = https;
    [API_HOST, WEB_HOST] = ['https://api.spool.tv', 'https://spool.tv'];
} else {
    agent = http;
    [API_HOST, WEB_HOST] = ['http://localhost:5000', 'http://localhost:8080'];
}



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



app.use((req, res, next) => {
    const history = memoryHistory, location = req.url;
    match({routes, history, location}, (err, redirect, props) => {
        if (err) {
            next(err);
        } else if (!props) {
            next();
        } else if (redirect) {
            res.redirect(302, redirect.pathname + redirect.search);
        } else {
            let {artistId, songId} = props.params;
            if (artistId && songId) {
                parallel({
                    song: (callback) => {
                        const url = `${API_HOST}/v1/artists/${artistId}/songs/${songId}`;
                        agent.get(url, (apiResponse) => {
                            let json = '';
                            apiResponse.on('data', (chunk) => {
                                json += chunk;
                            });
                            apiResponse.on('end', () => {
                                const video = JSON.parse(json).songs[0];
                                callback(null, video);
                            });
                        });
                    },
                    songs: (callback) => {
                        const url = `${API_HOST}/v1/songs`;
                        agent.get(url, (apiResponse) => {
                            let json = '';
                            apiResponse.on('data', (chunk) => {
                                json += chunk;
                            });
                            apiResponse.on('end', () => {
                                const videos = JSON.parse(json).songs;
                                callback(null, videos);
                            });
                        });
                    },
                    genius: (callback) => {
                        const url = `${API_HOST}/v1/artists/${artistId}/songs/${songId}/genius`;
                        agent.get(url, (apiResponse) => {
                            let json = '';
                            apiResponse.on('data', (chunk) => {
                                json += chunk;
                            });
                            apiResponse.on('end', () => {
                                try {
                                    const description = JSON.parse(json).songs[0].description.plain;
                                    callback(null, description);
                                } catch (err) {
                                    callback(null, '');
                                }
                            });
                        });
                    },
                },
                (err, results) => {
                    try {
                        const component = <RouterContext {...props} />;
                        const rendered = ReactDOMServer.renderToString(component);
                        const videos = [results.song].concat(results.songs);
                        res.render('index', {
                            title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                            description: results.genius,
                            openGraph: {
                                title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                                type: 'website',
                                image: videos[0].artwork_url,
                                url: `${WEB_HOST}/${artistId}/${songId}`,
                                description: results.genius,
                                siteName: 'Spool',
                                video: videos[0].mp4_url,
                            },
                            twitterCard: {
                                title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                                description: results.genius,
                                image: videos[0].artwork_url,
                            },
                            app: rendered,
                            videos: videos,
                        });
                    } catch (err) {
                        next(err);
                    }
                });
            } else {
                agent.get(`${API_HOST}/v1/songs`, (apiResponse) => {
                    let json = '';
                    apiResponse.on('data', (chunk) => {
                        json += chunk;
                    });
                    apiResponse.on('end', () => {
                        const component = <RouterContext {...props} />;
                        const rendered = ReactDOMServer.renderToString(component);
                        const videos = JSON.parse(json).songs;
                        res.render('index', {
                            title: 'Spool - Just music videos.',
                            description: "Spool takes the experience of channel surfing and puts it online. I hope that you enjoy using it as much as I've enjoyed building it.",
                            openGraph: {
                                title: 'Spool - Just music videos.',
                                type: 'website',
                                image: `${WEB_HOST}/avatar.png`,
                                url: `${WEB_HOST}/`,
                                description: "Spool takes the experience of channel surfing and puts it online. I hope that you enjoy using it as much as I've enjoyed building it.",
                                siteName: 'Spool',
                                video: null,
                            },
                            twitterCard: {
                                title: 'Spool - Just music videos.',
                                description: "Spool takes the experience of channel surfing and puts it online. I hope that you enjoy using it as much as I've enjoyed building it.",
                                image: `${WEB_HOST}/avatar.png`,
                            },
                            app: rendered,
                            videos: videos,
                        });
                    });
                });
            }
        }
    });
});

app.use(express.static(__dirname + '/public'));

app.use((req, res) => {
    agent.get(`${API_HOST}/v1/songs`, (apiResponse) => {
        let json = '';
        apiResponse.on('data', (chunk) => {
            json += chunk;
        });
        apiResponse.on('end', () => {
            const videos = JSON.parse(json).songs;
            res.status(404).render('error', {
                title: 'Spool - Not Found',
                heading: 'Not Found',
                videos: videos,
            });
        });
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    agent.get(`${API_HOST}/v1/songs`, (apiResponse) => {
        let json = '';
        apiResponse.on('data', (chunk) => {
            json += chunk;
        });
        apiResponse.on('end', () => {
            const videos = JSON.parse(json).songs;
            res.status(500).render('error', {
                title: 'Spool - Server Error',
                heading: 'Server Error',
                videos: videos,
            });
        });
    });
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening at: http://127.0.0.1:${PORT} (${process.pid})`);
});
