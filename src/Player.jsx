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

        this.KATIE_NUM = 60;
        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        [this.NEXT_KEYS, this.PREV_KEYS] = [[39], [37]];

        [this.next, this.prev] = [this.next.bind(this), this.prev.bind(this)];
        this.state = {videos: [], index: null};
    }

    componentDidMount() {
        this.serverRequest = $.get(
            this.API + '/songs',
            function(result) {
                this.setState({videos: result.songs, index: 0});
            }.bind(this)
        );
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.index != this.state.index;
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    onKeyUp(e) {
        if (this.NEXT_KEYS.indexOf(e.which) != -1) {
            this.next();
        } else if (this.PREV_KEYS.indexOf(e.which) != -1) {
            this.prev();
        }
    }

    next() {
        if (this.state.index !== null ) {
            if (this.state.index < this.state.videos.length - 1) {
                this.setState({index: this.state.index + 1});
            }
            if (this.state.index >= this.state.videos.length - this.KATIE_NUM / 2) {
                this.serverRequest = $.get(
                    this.API + '/songs',
                    function(result) {
                        this.setState({
                            videos: this.state.videos.concat(result.songs),
                        });
                    }.bind(this)
                );
            }
        }
    }

    prev() {
        if (this.state.index !== null ) {
            if (this.state.index > 0) {
                this.setState({index: this.state.index - 1});
            }
        }
    }

    render() {
        var states, videos = [];
        if (this.state.index === null || this.state.index > this.state.videos.length - 1) {
            states = [];
        } else if (this.state.index == this.state.videos.length - 1 || this.props.state == 'background') {
            states = [this.props.state];
        }
        else {
            states = ['playing', 'buffering'];
        }
        for (var index = 0; index < states.length; index++) {
            videos.push(
                <Video
                    key={index}
                    video={this.state.videos[this.state.index + index]}
                    state={states[index]}
                    next={this.next}
                />
            );
        }
        return <div>{videos}</div>;
    }
}



class Video extends React.Component {
    componentDidMount() {
        document.addEventListener(
            'visibilitychange',
            this.onVisibilityChange.bind(this)
        );
        if (this.props.state == 'background') {
            var video = document.getElementsByTagName('video')[0];
            video.volume = 0;
        }
    }

    onVisibilityChange() {
        // If this event handler is even called, then we must have a Video
        // component on the page, so we must have a video element on the page.
        var video = document.getElementsByTagName('video')[0];
        video[document.hidden ? 'pause' : 'play']();
    }

    render() {
        var autoPlay, onClick, style;
        switch (this.props.state) {
            case 'playing':
                document.title = `Spool - ${this.props.video.artist} - ${this.props.video.song}`;
                [autoPlay, onClick, style] = ['autoplay', this.props.next, null];
                break;
            case 'background':
                [autoPlay, onClick, style] = ['autoplay', null, null];
                break;
            case 'buffering':
                [autoPlay, onClick, style] = [null, null, {display: 'none'}];
                break;
            default:
                [autoPlay, onClick, style] = [null, null, {display: 'none'}];
        }
        return (
            <video
                src={this.props.video.mp4_url}
                loop
                preload='auto'
                autoPlay={autoPlay}
                style={style}
                onClick={onClick}
            >
            </video>
        );
    }
}



export default Player;
