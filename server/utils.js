/*---------------------------------------------------------------------------*\
 |  utils.js                                                                 |
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
import child_process from 'child_process';



const fileContents = (fileName, encoding) => new Promise((resolve, reject) => {
    fs.readFile(fileName, encoding, (err, data) => {
        (err ? reject : resolve)(err ? err : data);
    });
});

const shellOutput = command => new Promise((resolve, reject) => {
    child_process.exec(command, (err, stdout, stderr) => {
        (err ? reject : resolve)(err ? err : stdout.trim());
    });
});

const makeRequest = url => new Promise((resolve, reject) => {
    const http = require(url.split(':', 1)[0]);
    http.get(url, response => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(chunks.join('')));
    })
    .on('error', reject);
});



export {fileContents, shellOutput, makeRequest};
