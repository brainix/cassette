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
import {browserHistory} from 'react-router';



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
        this.KATIE_NUM = 60;

        this.nextVideo = this.nextVideo.bind(this);
        this.prevVideo = this.prevVideo.bind(this);
        this.state = {index: null};
        this.videos = [];
    }

    componentDidMount() {
        this.initVideos();
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.artistId != prevProps.artistId || this.props.songId != prevProps.songId) {
            this.initVideos();
        }
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    onKeyUp(e) {
        if (this.NEXT_KEYS.indexOf(e.which) != -1) {
            this.nextVideo();
        } else if (this.PREV_KEYS.indexOf(e.which) != -1) {
            this.prevVideo();
        }
    }

    initVideos() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
        if (this.props.artistId && this.props.songId) {
            this.serverRequest = $.get(
                this.API + `/artists/${this.props.artistId}/songs/${this.props.songId}`,
                function(result) {
                    this.videos = [result.songs[0]];
                    this.moreVideos(true);
                }.bind(this)
            );
        } else {
            this.moreVideos(true);
        }
    }

    moreVideos(init) {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
        this.serverRequest = $.get(
            this.API + '/songs',
            function(result) {
                this.videos = this.videos.concat(result.songs);
                if (init) {
                    this.setState({index: 0});
                }
            }.bind(this)
        );
    }

    nextVideo() {
        if (this.props.reRender) {
            this.props.reRender();
        }
        if (this.state.index !== null) {
            if (this.state.index < this.videos.length - 1) {
                this.setState({index: this.state.index + 1});
            }
            if (this.state.index >= this.videos.length - this.KATIE_NUM / 2) {
                this.moreVideos(false);
            }
        }
    }

    prevVideo() {
        if (this.props.reRender) {
            this.props.reRender();
        }
        if (this.state.index !== null) {
            if (this.state.index > 0) {
                this.setState({index: this.state.index - 1});
            }
        }
    }

    render() {
        var states, videos = [];
        if (this.state.index === null || this.state.index > this.videos.length - 1) {
            states = [];
        } else if (this.state.index == this.videos.length - 1 || this.props.state == 'background') {
            states = [this.props.state];
        }
        else {
            states = ['playing', 'buffering'];
        }
        for (var index = 0; index < states.length; index++) {
            const video = this.videos[this.state.index + index];
            const state = states[index];
            const key = `/${video.artist_id}/${video.song_id}/${state}`
            videos.push(
                <Video
                    key={key}
                    video={video}
                    state={state}
                    nextVideo={this.nextVideo}
                />
            );
        }
        return <div>{videos}</div>;
    }
}



class Video extends React.Component {
    constructor(props) {
        super(props);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    componentDidMount() {
        this.updateUrlAndTitle();
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    componentDidUpdate() {
        this.updateUrlAndTitle();
    }

    onVisibilityChange() {
        var video = document.getElementsByTagName('video')[0];
        video[document.hidden ? 'pause' : 'play']();
    }

    updateUrlAndTitle() {
        if (this.props.state == 'playing') {
            browserHistory.replace(`/${this.props.video.artist_id}/${this.props.video.song_id}`);
            document.title = `Spool - ${this.props.video.artist} - ${this.props.video.song}`;
        }
    }

    render() {
        return (
            <video
                className={this.props.state}
                src={this.props.video.mp4_url}
                preload='auto'
                loop
                autoPlay={this.props.state == 'buffering' ? null : 'autoPlay'}
                muted={this.props.state != 'playing'}
                onClick={this.props.state == 'playing' ? this.props.nextVideo : null}
            >
            </video>
        );
    }
}



export default Player;
