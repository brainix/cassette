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

import {fileContents, shellOutput} from '../server/utils.js';



describe('fileContents()', () => {
    it('tests reading a file', () => {
        const filename = path.join('public', 'humans.txt');
        return fileContents(filename)
            .then(buffer => {
                const contents = buffer.toString();
                expect(contents).toContain('Raj');
                expect(contents).toContain('brainix@gmail.com');
                expect(contents).toContain('@brainix');
            });
    });
});

describe('shellOutput()', () => {
    it('tests shell command output', () => {
        return shellOutput('echo Hello, World!')
            .then(stdout => {
                expect(stdout.trimRight()).toEqual('Hello, World!');
            });
    });
});
