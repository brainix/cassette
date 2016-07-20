/*---------------------------------------------------------------------------*\
 |  Player.jsx                                                               |
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



class Player extends React.Component {
    constructor(props) {
        super(props);

        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.NEXT_KEYS = [39];
        this.PREV_KEYS = [37];

        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.state = {
            videos: [],
            index: 0
        };
    }

    componentDidMount() {
        this.serverRequest = $.get(
            this.API + '/songs',
            function(result) {
                this.setState({videos: result.songs});
            }.bind(this)
        );
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    handleKeyUp(e) {
        if (this.NEXT_KEYS.indexOf(e.which) != -1) {
            this.next();
        } else if (this.PREV_KEYS.indexOf(e.which) != -1) {
            this.prev();
        }
    }

    next() {
        if (this.state.index < this.state.videos.length - 1) {
            this.setState({index: this.state.index + 1});
        } else {
            this.serverRequest = $.get(
                this.API + '/songs',
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
                    <Video
                        video={this.state.videos[this.state.index]}
                        next={this.next}
                    />
                    <Video video={this.state.videos[this.state.index + 1]} />
                </div>
            );
        } else if (this.state.index < this.state.videos.length) {
            return (
                <div>
                    <Video
                        video={this.state.videos[this.state.index]}
                        next={this.next}
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}



class Video extends React.Component {
    componentDidMount() {
        document.addEventListener(
            'visibilitychange',
            this.handleVisibilityChange.bind(this)
        );
    }

    handleVisibilityChange() {
        // If this event handler is even called, then we must have a Video
        // component on the page, so we must have a video element on the page.
        var video = document.getElementsByTagName('video')[0];
        video[document.hidden ? 'pause' : 'play']();
    }

    render() {
        if (this.props.next) {
            document.title = `Spool - ${this.props.video.artist} - ${this.props.video.song}`
            return (
                <video
                    src={this.props.video.mp4_url}
                    loop
                    preload='auto'
                    autoPlay='autoplay'
                    onClick={this.props.next}
                >
                </video>
            );
        } else {
            const style = {display: 'none'};
            return (
                <video
                    src={this.props.video.mp4_url}
                    preload='auto'
                    style={style}
                >
                </video>
            );
        }
    }
}



export default Player;
