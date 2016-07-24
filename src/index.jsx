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



import {createHistory} from 'history';
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link, useRouterHistory} from 'react-router';

import Player from './Player.jsx';
import Search from './Search.jsx';



const browserHistory = useRouterHistory(createHistory)({basename: '/'});



class App extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' component={Chrome}>
                    <IndexRoute component={Home} />
                    <Route path='/:artistId/:songId' component={Home} />
                    <Route path='/wtf' component={About} />
                    <Route path='*' component={NotFound} />
                </Route>
            </Router>
        );
    }
}

const Chrome = (props) => (
    <div>
        {props.children}
        <Link id='logo' to={props.location.pathname == 'wtf' ? '/' : '/wtf'}>
            <img src='/logo.png' />
        </Link>
    </div>
);

const Home = (props) => (
    <div>
        <Player
            state='playing'
            artistId={props.params.artistId}
            songId={props.params.songId}
        />
        <Search
            artistId={props.params.artistId}
            songId={props.params.songId}
        />
    </div>
);

const About = () => <Player state='background' />;

const NotFound = () => <Player state='background' />;



render(<App/>, document.getElementById('app'));
