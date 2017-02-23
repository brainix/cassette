/*---------------------------------------------------------------------------*\
 |  version.test.js                                                          |
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



import {shellOutput, fileContents} from '../server/utils.js';



describe('Node.js version', () => {
    it('confirms that installed Node.js version matches package.json', () => {
        const promises = [
            shellOutput('node --version'),
            fileContents('package.json'),
        ];
        Promise.all(promises)
            .then(([installedVersion, data]) => {
                const specifiedVersion = `v${JSON.parse(data).engines.node}`;
                expect(installedVersion).toEqual(specifiedVersion);
            });
    });
});

describe('npm version', () => {
    it('confirms that installed npm version matches package.json', () => {
        const promises = [
            shellOutput('npm --version'),
            fileContents('package.json'),
        ];
        Promise.all(promises)
            .then(([installedVersion, data]) => {
                const specifiedVersion = JSON.parse(data).engines.npm;
                expect(installedVersion).toEqual(specifiedVersion);
            });
    });
});
