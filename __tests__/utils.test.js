/*---------------------------------------------------------------------------*\
 |  utils.test.js                                                            |
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



import path from 'path';

import {fileContents, shellOutput, makeRequest} from '../server/utils.js';



describe('fileContents()', () => {
    it('tests reading a file', () => {
        return fileContents(path.join('public', 'humans.txt'))
            .then(buffer => expect(buffer.toString()).toContain('Raj'));
    });
});

describe('shellOutput()', () => {
    it('tests shell command output', () => {
        return shellOutput('echo hi')
            .then(stdout => expect(stdout.trimRight()).toBe('hi'));
    });
});

describe('makeRequest()', () => {
    it('tests making an HTTP request', () => {
        return makeRequest('https://api.spool.tv/v1/canary')
            .then(body => expect(JSON.parse(body)).toEqual({message: 'OK'}));
    });
});
