/*---------------------------------------------------------------------------*\
 |  router.jsx                                                               |
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

import express from 'express/lib/express';
import React from 'react/lib/React';
import ReactDOMServer from 'react-dom/server';
import {memoryHistory, match, RouterContext} from 'react-router';
import LRUCache from 'lru-cache/lib/lru-cache';

import routes from '../shared/routes.jsx';
import Head from './Head.jsx';



const router = express.Router();
const cache = LRUCache({max: 128});

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
        })
        .on('error', reject);
    });
};



const getBundleHash = () => {
    return new Promise((resolve, reject) => {
        let bundleHash = cache.get('hash');
        if (bundleHash === undefined) {
            fileContents('stats.json')
                .then(value => {
                    bundleHash = JSON.parse(value).hash;
                    cache.set('hash', bundleHash);
                    resolve(bundleHash);
                })
                .catch(err => reject(err));
        } else {
            resolve(bundleHash);
        }
    });
};

const getRandomSongs = () => {
    return new Promise((resolve, reject) => {
        let randomSongs = cache.get('random');
        if (randomSongs === undefined) {
            makeRequest(`${API_HOST}/v1/songs`)
                .then(value => {
                    randomSongs = JSON.parse(value).songs;
                    cache.set('random', randomSongs, 30 * 1000);
                    resolve(randomSongs);
                })
                .catch(err => reject(err));
        } else {
            resolve(randomSongs);
        }
    });
};

const getSpecifiedSong = (artistId, songId) => {
    return new Promise((resolve, reject) => {
        let specifiedSong = cache.get(`${artistId}/${songId}`);
        if (specifiedSong === undefined) {
            makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}`)
                .then(value => {
                    specifiedSong = JSON.parse(value).songs[0];
                    cache.set(`${artistId}/${songId}`, specifiedSong);
                    resolve(specifiedSong);
                })
                .catch(err => reject(err));
        } else {
            resolve(specifiedSong);
        }
    });
};

const getSpecifiedSongDescription = (artistId, songId) => {
    return new Promise((resolve, reject) => {
        let description = cache.get(`${artistId}/${songId}/genius`);
        if (description === undefined) {
            makeRequest(`${API_HOST}/v1/artists/${artistId}/songs/${songId}/genius`)
                .then(value => {
                    description = JSON.parse(value).songs[0].description.plain;
                    cache.set(`${artistId}/${songId}/genius`, description);
                    resolve(description);
                })
                .catch(() => {
                    description = ''
                    cache.set(`${artistId}/${songId}/genius`, description);
                    resolve(description);
                });
        } else {
            resolve(description);
        }
    });
};

const renderRandomSongs = (props, res, next) => {
    const promises = [getBundleHash(), getRandomSongs()];
    Promise.all(promises)
        .then(values => {
            try {
                const [bundleHash, videos] = values;
                const [head, app] = [
                    <Head bundleHash={bundleHash} />,
                    <RouterContext {...props} />,
                ].map(ReactDOMServer.renderToString);
                res.setHeader('Cache-Control', `public, max-age=${2 * 60}`);
                res.setHeader('Expires', new Date(Date.now() + 2 * 60 * 1000).toUTCString());
                res.render('index', {head, app, videos, bundleHash});
            } catch (err) {
                next(err);
            }
        })
        .catch(next);
};

const renderSpecifiedSongAndRandomSongs = (props, res, next) => {
    const {artistId, songId} = props.params;
    const promises = [
        getBundleHash(),
        getSpecifiedSong(artistId, songId),
        getSpecifiedSongDescription(artistId, songId),
        getRandomSongs(),
    ];
    Promise.all(promises)
        .then(values => {
            try {
                const bundleHash = values[0];
                const specifiedSong = values[1];
                const description = values[2];
                const randomSongs = values[3];
                const [head, app] = [
                    <Head
                        bundleHash={bundleHash}
                        title={`Spool - ${specifiedSong.artist} - ${specifiedSong.song}`}
                        description={description}
                        image={specifiedSong.artwork_url}
                        url={`${WEB_HOST}/${artistId}/${songId}`}
                        video={specifiedSong.mp4_url}
                    />,
                    <RouterContext {...props} />,
                ].map(ReactDOMServer.renderToString);
                const videos = [specifiedSong].concat(randomSongs);
                res.setHeader('Cache-Control', `public, max-age=${2 * 60}`);
                res.setHeader('Expires', new Date(Date.now() + 2 * 60 * 1000).toUTCString());
                res.render('index', {head, app, videos, bundleHash});
            } catch (err) {
                next();
            }
        })
        .catch(next);
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
                renderSpecifiedSongAndRandomSongs(props, res, next);
            } else {
                renderRandomSongs(props, res, next);
            }
        }
    });
});

router.get(['/robots.txt', '/humans.txt'], (req, res, next) => {
    makeRequest(`${API_HOST}${req.path}`)
        .then(body => {
            res.setHeader('Cache-Control', `public, max-age=${24 * 60 * 60}`);
            res.setHeader('Expires', new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString());
            res.type('text/plain').send(body);
        })
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
            res.setHeader('Cache-Control', `public, max-age=${24 * 60 * 60}`);
            res.setHeader('Expires', new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString());
            res.type('application/xml').send(body);
        })
        .catch(next);
});

router.use(express.static(__dirname + '/../public', {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    setHeaders: res => res.setHeader('Expires', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()),
}));

router.use((req, res, next) => {
    const promises = [getBundleHash(), getRandomSongs()];
    Promise.all(promises)
        .then(values => {
            try {
                const [bundleHash, videos] = values;
                const title = 'Spool - Not Found';
                const description = 'Spool - Not Found';
                const heading = 'Not Found';
                const head = ReactDOMServer.renderToString(
                    <Head
                        bundleHash={bundleHash}
                        title={title}
                        description={description}
                    />
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
    const promises = [getBundleHash(), getRandomSongs()];
    Promise.all(promises)
        .then(values => {
            const [bundleHash, videos] = values;
            const title = 'Spool - Server Error';
            const description = 'Spool - Server Error';
            const heading = 'Server Error';
            const head = ReactDOMServer.renderToString(
                <Head
                    bundleHash={bundleHash}
                    title={title}
                    description={description}
                />
            );
            res.status(500).render('error', {head, videos, heading});
        });
});



export default router;
