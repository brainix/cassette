/*---------------------------------------------------------------------------*\
 |  Player.jsx                                                               |
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



import $ from 'jquery';
import React from 'react';
import {render} from 'react-dom';
import browserHistory from 'react-router/lib/browserHistory';



class Player extends React.Component {
    constructor(props) {
        super(props);
        this.NEXT_KEYS = [39];
        this.PREV_KEYS = [37];
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    onKeyUp(eventObject) {
        if (this.refs.buffer && document.activeElement === document.body) {
            if (this.NEXT_KEYS.includes(eventObject.which)) {
                this.refs.buffer.nextVideo();
            } else if (this.PREV_KEYS.includes(eventObject.which)) {
                this.refs.buffer.prevVideo();
            }
        }
    }

    onVisibilityChange() {
        const video = document.getElementsByTagName('video')[0];
        if (video) {
            video[document.hidden ? 'pause' : 'play']();
        }
    }

    render() {
        return <Buffer {...this.props} ref='buffer' />;
    }
}



class Buffer extends React.Component {
    constructor(props) {
        super(props);
        if (process.env.NODE_ENV === 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.BATCH_SIZE = 60;
        this.nextVideo = this.nextVideo.bind(this);
        this.prevVideo = this.prevVideo.bind(this);
        this.videos = this.props.videos || [];
        this.state = {index: this.videos ? 0 : null};
    }

    componentDidMount() {
        this.initVideos();
    }

    componentDidUpdate(prevProps) {
        if (this.props.artistId !== prevProps.artistId ||
            this.props.songId !== prevProps.songId) {
            this.videos = [];
            this.initVideos();
        }
    }

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
    }

    initVideos() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
        if (this.videos.length === 0) {
            if (this.props.artistId && this.props.songId) {
                const {artistId, songId} = this.props;
                this.serverRequest = $.get(
                    this.API + `/artists/${artistId}/songs/${songId}`,
                    (result) => {
                        this.videos = [result.songs[0]];
                        this.moreVideos(true);
                    }
                );
            } else {
                this.moreVideos(true);
            }
        }
    }

    moreVideos(init) {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
        this.serverRequest = $.get(
            this.API + '/songs',
            (result) => {
                this.videos = this.videos.concat(result.songs);
                if (init) {
                    this.setState({index: 0});
                }
            }
        );
    }

    nextVideo() {
        if (this.state.index !== null) {
            if (this.state.index < this.videos.length - 1) {
                this.setState({index: this.state.index + 1});
            }
            if (this.state.index >= this.videos.length - this.BATCH_SIZE / 2) {
                this.moreVideos(false);
            }
        }
    }

    prevVideo() {
        if (this.state.index !== null && this.state.index > 0) {
            this.setState({index: this.state.index - 1});
        }
    }

    render() {
        const videos = [];
        let states;
        if (this.state.index === null ||
            this.state.index > this.videos.length - 1) {
            states = [];
        } else if (this.state.index === this.videos.length - 1 ||
                   this.props.state === 'background') {
            states = [this.props.state];
        }
        else {
            states = ['playing', 'buffering'];
        }
        for (let index = 0; index < states.length; index++) {
            const video = this.videos[this.state.index + index];
            const state = states[index];
            const key = `/${video.artist_id}/${video.song_id}/${state}`;
            videos.push(
                <Video
                    key={key}
                    video={video}
                    state={state}
                    nextVideo={this.nextVideo}
                    resetSearch={this.props.resetSearch}
                />
            );
        }
        return <div>{videos}</div>;
    }
}



class Video extends React.Component {
    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    componentDidMount() {
        this.updateUrlAndTitle();
    }

    componentDidUpdate() {
        this.updateUrlAndTitle();
    }

    onMouseDown() {
        if (this.props.state === 'playing') {
            if (document.activeElement === document.body) {
                this.props.nextVideo();
            } else {
                this.props.resetSearch();
            }
        }
    }

    updateUrlAndTitle() {
        if (this.props.state === 'playing') {
            const {artist_id, song_id, artist, song} = this.props.video;
            browserHistory.replace(`/${artist_id}/${song_id}`);
            document.title = `Spool - ${artist} - ${song}`;
        }
    }

    render() {
        return (
            <video
                className={this.props.state}
                src={this.props.video.mp4_url}
                preload='auto'
                loop
                autoPlay={this.props.state === 'buffering' ? null : 'autoplay'}
                muted={this.props.state !== 'playing'}
                onMouseDown={this.onMouseDown}
            />
        );
    }
}



export default Player;
