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
        <Search query='' />
    </div>
);

class About extends React.Component {
    componentDidMount() {
        document.title = 'Spool - About Me';
    }

    render() {
        return (
            <div>
                <Player state='background' />
                <section>
                    <h1>About Me</h1>

                    <h2>What is Spool?</h2>
                    <p>
                        <Link to='/'>Spool</Link> takes the experience of
                        channel surfing and puts it online.  I hope that you
                        enjoy using it as much as I&rsquo;ve enjoyed building
                        it.
                    </p>

                    <h2>Just &hellip; Why?</h2>
                    <p>
                        I want to build something frivolous, but in a
                        particular way.  Inexplicable like <small>MTV</small>,
                        Twitter, Snapchat, or Yo.
                    </p>

                    <h2>How can I contact you?</h2>
                    <p>
                        Find me on Twitter
                        (<a href='https://twitter.com/brainix'>@brainix</a>),
                        email me
                        (<a href='mailto:brainix@gmail.com'>brainix@gmail.com</a>),
                        or have coffee with me any time in San Francisco.
                    </p>
                </section>
            </div>
        );
    }
}

class NotFound extends React.Component {
    componentDidMount() {
        document.title = 'Spool - Not Found';
    }

    render() {
        return <Player state='background' />;
    }
}



render(<App/>, document.getElementById('app'));
