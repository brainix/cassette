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



const API = process.env.NODE_ENV == 'production' ? 'https://api.spool.tv/v1' : 'http://localhost:5000/v1';



class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videos: [],
            index: 0
        };
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
    }

    componentDidMount() {
        this.serverRequest = $.get(
            API + '/songs',
            function(result) {
                this.setState({videos: result.songs});
            }.bind(this)
        );
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    next() {
        if (this.state.index < this.state.videos.length - 1) {
            this.setState({index: this.state.index + 1});
        } else {
            this.serverRequest = $.get(
                API + '/songs',
                function(result) {
                    this.setState({
                        videos: this.state.videos.concat(result.songs),
                        index: this.state.index + 1
                    });
                }.bind(this)
            );
        }
    }

    prev() {
        if (this.state.index > 0) {
            this.setState({index: this.state.index - 1});
        }
    }

    render() {
        if (this.state.index < this.state.videos.length - 1) {
            return (
                <div>
                    <Video video={this.state.videos[this.state.index]}
                           next={this.next} />
                    <Video video={this.state.videos[this.state.index + 1]} />
                </div>
            );
        } else if (this.state.index < this.state.videos.length) {
            return (
                <div>
                    <Video video={this.state.videos[this.state.index]}
                           next={this.next} />
                </div>
            );
        } else {
            return null;
        }
    }
}



class Video extends React.Component {
    render() {
        if (this.props.next) {
            var style = {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer'
            };
            return (
                <video src={this.props.video.mp4_url}
                       loop
                       preload='auto'
                       autoPlay='autoplay'
                       style={style}
                       onClick={this.props.next}>
                </video>
            );
        } else {
            var style = {display: 'none'};
            return (
                <video src={this.props.video.mp4_url}
                       preload='auto'
                       style={style}>
                </video>
            );
        }
    }
}



render(<App/>, document.getElementById('app'));
