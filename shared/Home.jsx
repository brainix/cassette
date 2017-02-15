/*---------------------------------------------------------------------------*\
 |  Home.jsx                                                                 |
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



import React from 'react/lib/React';

import Player from './Player.jsx';
import Search from './Search.jsx';



export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.resetSearch = this.resetSearch.bind(this);
        this.state = {
            query: this.props.query || '',
            results: this.props.results || [],
        };
    }

    resetSearch() {
        this.setState({query: '', results: []});
    }

    render() {
        return (
            <div>
                <Player
                    state='playing'
                    artistId={this.props.params.artistId}
                    songId={this.props.params.songId}
                    resetSearch={this.resetSearch}
                    videos={this.props.videos || this.props.route.videos}
                />
                <Search query={this.state.query} results={this.state.results} />
            </div>
        );
    }
}
