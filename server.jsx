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



import express from 'express';
import compression from 'compression';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {memoryHistory, match, RouterContext} from 'react-router';

import config from './webpack.config.babel';
import routes from './shared/routes';



const apiRequest = url => {
    return new Promise((resolve, reject) => {
        const http = require(url.startsWith('https') ? 'https' : 'http');
        http.get(url, response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                try {
                    const json = chunks.join('');
                    const obj = JSON.parse(json);
                    resolve(obj);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
};



const app = express();
let API_HOST, WEB_HOST;
if (process.env.NODE_ENV === 'production') {
    [API_HOST, WEB_HOST] = ['https://api.spool.tv', 'https://spool.tv'];
} else {
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
            (artistId && songId ? getSong : getSongs)(props, res, next);
        }
    });
});

const getSong = (props, res, next) => {
    let {artistId, songId} = props.params;
    const songReq = apiRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}`);
    const songsReq = apiRequest(`${API_HOST}/v1/songs`);
    const geniusReq = apiRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}/genius`);
    Promise.all([songReq, songsReq, geniusReq]).then(values => {
        try {
            const [songRes, songsRes, geniusRes] = values;
            const song = songRes.songs[0];
            const songs = songsRes.songs;
            const genius = geniusRes.songs[0].description.plain;
            const component = <RouterContext {...props} />;
            const rendered = ReactDOMServer.renderToString(component);
            const videos = [song].concat(songs);
            res.render('index', {
                title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                description: genius,
                openGraph: {
                    title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                    type: 'website',
                    image: videos[0].artwork_url,
                    url: `${WEB_HOST}/${artistId}/${songId}`,
                    description: genius,
                    siteName: 'Spool',
                    video: videos[0].mp4_url,
                },
                twitterCard: {
                    title: `Spool - ${videos[0].artist} - ${videos[0].song}`,
                    description: genius,
                    image: videos[0].artwork_url,
                },
                app: rendered,
                videos: videos,
            });
        } catch (err) {
            next(err);
        }
    }).catch(next);
};

const getSongs = (props, res, next) => {
    apiRequest(`${API_HOST}/v1/songs`).then(videos => {
        try {
            const component = <RouterContext {...props} />;
            const rendered = ReactDOMServer.renderToString(component);
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
        } catch (err) {
            next(err);
        }
    }).catch(next);
};

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    apiRequest(`${API_HOST}/v1/songs`).then(videos => {
        res.status(404).render('error', {
            title: 'Spool - Not Found',
            heading: 'Not Found',
            videos: videos,
        });
    }).catch(next);
});

app.use((err, req, res, next) => {
    console.error(err);
    apiRequest(`${API_HOST}/v1/songs`).then(videos => {
        res.status(500).render('error', {
            title: 'Spool - Server Error',
            heading: 'Server Error',
            videos: videos,
        });
    });
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening at: http://127.0.0.1:${PORT} (${process.pid})`);
});
