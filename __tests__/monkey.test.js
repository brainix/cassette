/*---------------------------------------------------------------------------*\
 |  monkey.test.js                                                           |
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



import '../shared/monkey';



describe('String.prototype.trimAll()', () => {
    it('removes/consolidates left, interior, and right whitespace', () => {
        expect(''.trimAll()).toBe('');
        expect(' '.trimAll()).toBe('');
        expect('Rajiv Bakulesh Shah'.trimAll()).toBe('Rajiv Bakulesh Shah');
        expect('  Rajiv  Bakulesh  Shah  '.trimAll()).toBe('Rajiv Bakulesh Shah');
    });
});

describe('String.prototype.htmlToText()', () => {
    it('strips out HTML tags', () => {
        expect(''.htmlToText()).toBe('');
        expect(' '.htmlToText()).toBe(' ');
        expect('Rajiv Bakulesh Shah'.htmlToText()).toBe('Rajiv Bakulesh Shah');
        expect('Rajiv Bakulesh Shah'.htmlToText()).toBe('Rajiv Bakulesh Shah');
        expect('<br>Rajiv Bakulesh Shah'.htmlToText()).toBe('Rajiv Bakulesh Shah');
        expect('<br />Rajiv Bakulesh Shah'.htmlToText()).toBe('Rajiv Bakulesh Shah');
        expect('<b>Rajiv</b> Bakulesh Shah'.htmlToText()).toBe('Rajiv Bakulesh Shah');
        expect('Ariana Grande &mdash; Side to Side'.htmlToText()).toBe('Ariana Grande - Side to Side');
    });
});

describe('Array.prototype.choice()', () => {
    it('returns a random item from the array', () => {
        const seq = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
        expect(seq.choice()).toBeGreaterThanOrEqual(0);
        expect(seq.choice()).toBeLessThanOrEqual(4);
        expect(seq.length).toBe(16);
    });
});

describe('Array.prototype.shuffle()', () => {
    it('shuffles the array in place', () => {
        const seq = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
        expect(seq.shuffle().length).toBe(16);
    });
});
