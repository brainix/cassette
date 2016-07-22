/*---------------------------------------------------------------------------*\
 |  index.jsx                                                                |
 |                                                                           |
 |  Copyright © 2016, Rajiv Bakulesh Shah, original author.                  |
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



import React from 'react';
import {render} from 'react-dom';
import {Router, Route, browserHistory} from 'react-router';

import Player from './Player.jsx';



class App extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' component={Home} />
                <Route path='/:artistId/:songId' component={Home} />
                <Route path='/wtf' component={About} />
                <Route path='*' component={NotFound} />
            </Router>
        );
    }
}

const Home = (props) => (
    <Player
        state='playing'
        artistId={props.params.artistId}
        songId={props.params.songId}
    />
);

const About = () => <Player state='background' />;

const NotFound = () => <Player state='background' />;



render(<App/>, document.getElementById('app'));
