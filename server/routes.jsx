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



import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {memoryHistory, match, RouterContext} from 'react-router';

import routes from '../shared/routes.jsx';



const router = express.Router();
let API_HOST, WEB_HOST;
if (process.env.NODE_ENV === 'production') {
    [API_HOST, WEB_HOST] = ['https://api.spool.tv', 'https://spool.tv'];
} else {
    [API_HOST, WEB_HOST] = ['http://localhost:5000', 'http://localhost:8080'];
}



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
            let {artistId, songId} = props.params;
            (artistId && songId ? getSong : getSongs)(props, res, next);
        }
    });
});

const getSong = (props, res, next) => {
    let {artistId, songId} = props.params;
    const songReq = makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}`);
    const songsReq = makeRequest(`${API_HOST}/v1/songs`);
    const geniusReq = makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}/genius`);
    Promise.all([songReq, songsReq, geniusReq]).then(values => {
        try {
            const [songRes, songsRes, geniusRes] = values.map(JSON.parse);
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
    makeRequest(`${API_HOST}/v1/songs`).then(json => {
        try {
            const videos = JSON.parse(json).songs;
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

router.get(['/robots.txt', '/humans.txt'], (req, res, next) => {
    makeRequest(`${API_HOST}${req.path}`)
        .then(body => res.type('text/plain').send(body))
        .catch(next);
});

router.get('/sitemap.xml', (req, res, next) => {
    makeRequest(`${API_HOST}/sitemap.xml`).then(body => {
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
    }).catch(next);
});

router.use(express.static(__dirname + '/../public'));

router.use((req, res, next) => {
    makeRequest(`${API_HOST}/v1/songs`).then(json => {
        const videos = JSON.parse(json).songs;
        res.status(404).render('error', {
            title: 'Spool - Not Found',
            heading: 'Not Found',
            videos: videos,
        });
    }).catch(next);
});

router.use((err, req, res, next) => {
    console.error(err);
    makeRequest(`${API_HOST}/v1/songs`).then(json => {
        const videos = JSON.parse(json).songs;
        res.status(500).render('error', {
            title: 'Spool - Server Error',
            heading: 'Server Error',
            videos: videos,
        });
    });
});



export default router;
