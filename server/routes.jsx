/*---------------------------------------------------------------------------*\
 |  routes.jsx                                                               |
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



import fs from 'fs';

import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {memoryHistory, match, RouterContext} from 'react-router';

import routes from '../shared/routes.jsx';
import Head from './Head.jsx';



const router = express.Router();
let API_HOST, WEB_HOST;
if (process.env.NODE_ENV === 'production') {
    [API_HOST, WEB_HOST] = ['https://api.spool.tv', 'https://spool.tv'];
} else {
    [API_HOST, WEB_HOST] = ['http://localhost:5000', 'http://localhost:8080'];
}



const fileContents = (fileName, encoding) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, encoding, (err, data) => {
            (err ? reject : resolve)(err ? err : data);
        });
    });
};

const makeRequest = url => {
    return new Promise((resolve, reject) => {
        const http = require(url.startsWith('https') ? 'https' : 'http');
        http.get(url, response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(chunks.join('')));
        }).on('error', reject);
    });
};



router.use((req, res, next) => {
    const history = memoryHistory, location = req.url;
    match({routes, history, location}, (err, redirect, props) => {
        if (err) {
            next(err);
        } else if (!props) {
            next();
        } else if (redirect) {
            res.redirect(302, redirect.pathname + redirect.search);
        } else {
            if (props.params.artistId && props.params.songId) {
                getSpecifiedSongAndRandomSongs(props, res, next);
            } else {
                getRandomSongs(props, res, next);
            }
        }
    });
});

const getSpecifiedSongAndRandomSongs = (props, res, next) => {
    let {artistId, songId} = props.params;
    const promises = [
        fileContents('stats.json'),
        makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}`),
        makeRequest(`${API_HOST}/v1/songs`),
        makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}/genius`),
    ];
    Promise.all(promises)
        .then(values => {
            try {
                values = values.map(JSON.parse);
                const hash = values[0].hash;
                const song = values[1].songs[0];
                const songs = values[2].songs;
                const description = values[3].songs[0].description.plain;
                const [head, app] = [
                    <Head
                        hash={hash}
                        title={`Spool - ${song.artist} - ${song.song}`}
                        description={description}
                        image={song.artwork_url}
                        url={`${WEB_HOST}/${artistId}/${songId}`}
                        video={song.mp4_url}
                    />,
                    <RouterContext {...props} />,
                ].map(ReactDOMServer.renderToString);
                const videos = [song].concat(songs);
                res.render('index', {head, app, videos, hash});
            } catch (err) {
                next(err);
            }
        })
        .catch(next);
};

const getRandomSongs = (props, res, next) => {
    const promises = [
        fileContents('stats.json'),
        makeRequest(`${API_HOST}/v1/songs`),
    ];
    Promise.all(promises)
        .then(values => {
            try {
                values = values.map(JSON.parse);
                const hash = values[0].hash;
                const videos = values[1].songs;
                const [head, app] = [
                    <Head hash={hash} />,
                    <RouterContext {...props} />,
                ].map(ReactDOMServer.renderToString);
                res.render('index', {head, app, videos, hash});
            } catch (err) {
                next(err);
            }
        })
        .catch(next);
};

router.get(['/robots.txt', '/humans.txt'], (req, res, next) => {
    makeRequest(`${API_HOST}${req.path}`)
        .then(body => res.type('text/plain').send(body))
        .catch(next);
});

router.get('/sitemap.xml', (req, res, next) => {
    makeRequest(`${API_HOST}/sitemap.xml`)
        .then(body => {
            let find, replace;
            if (process.env.NODE_ENV === 'production') {
                find = /https:\/\/api.spool.tv\//g;
                replace = 'https://spool.tv/';
            } else {
                find = /http:\/\/localhost:5000\//g;
                replace = 'http://localhost:8080/';
            }
            body = body.replace(find, replace)
                .replace(/\/v1\//g, '/')
                .replace(/\/artists\//g, '/')
                .replace(/\/songs\//g, '/');
            res.type('application/xml').send(body);
        })
        .catch(next);
});

router.use(express.static(__dirname + '/../public'));

router.use((req, res, next) => {
    const promises = [
        fileContents('stats.json'),
        makeRequest(`${API_HOST}/v1/songs`),
    ];
    Promise.all(promises)
        .then(values => {
            try {
                values = values.map(JSON.parse);
                const hash = values[0].hash;
                const videos = values[1].songs;
                const title = 'Spool - Not Found';
                const description = 'Spool - Not Found';
                const heading = 'Not Found';
                const head = ReactDOMServer.renderToString(
                    <Head hash={hash} title={title} description={description} />
                );
                res.status(404).render('error', {head, videos, heading});
            } catch (err) {
                next(err);
            }
        })
        .catch(next);
});

router.use((err, req, res, next) => {
    console.error(err);
    const promises = [
        fileContents('stats.json'),
        makeRequest(`${API_HOST}/v1/songs`),
    ];
    Promise.all(promises)
        .then(values => {
            values = values.map(JSON.parse);
            const hash = values[0].hash;
            const videos = values[1].songs;
            const title = 'Spool - Server Error';
            const description = 'Spool - Server Error';
            const heading = 'Server Error';
            const head = ReactDOMServer.renderToString(
                <Head hash={hash} title={title} description={description} />
            );
            res.status(500).render('error', {head, videos, heading});
        });
});



export default router;
