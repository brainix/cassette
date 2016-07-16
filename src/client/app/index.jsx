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



import $ from 'jquery';
import React from 'react';
import {render} from 'react-dom';



var App = React.createClass({
    getInitialState: function() {
        return {
            videos: [],
            index: 0
        };
    },

    componentDidMount: function() {
        this.serverRequest = $.get(
            'https://api.spool.tv/v1/songs',
            function(result) {
                this.setState({videos: result.songs});
            }.bind(this)
        );
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        if (this.state.videos.length > this.state.index) {
            return <Video video={this.state.videos[this.state.index]} />;
        }
        else {
            return null;
        }
    }
});



var Video = React.createClass({
    render: function() {
        return (
            <video src={this.props.video.mp4_url}
                   loop
                   preload='auto'
                   autoPlay='autoplay'>
            </video>
        );
    }
});



render(<App/>, document.getElementById('app'));
