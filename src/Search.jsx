/*---------------------------------------------------------------------------*\
 |  Search.jsx                                                               |
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
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';



class Search extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateState = this.updateState.bind(this);
        this.state = {
            query: this.props.query || '',
            results: this.props.results || []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            query: nextProps.query || '',
            results: nextProps.results || []
        });
    }

    onSubmit(eventObject) {
        eventObject.preventDefault();
        this.refs.results.redirect();
    }

    updateState(nextState) {
        this.setState(nextState);
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <Precache />
                <fieldset>
                    <Input
                        query={this.state.query}
                        updateState={this.updateState}
                    />
                </fieldset>
                <Results
                    results={this.state.results}
                    router={this.props.router}
                    ref='results'
                />
            </form>
        );
    }
}



class Precache extends React.PureComponent {
    constructor(props) {
        super(props);
        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.serverRequest = null;
    }

    componentDidMount() {
        this.getQueries();
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
    }

    getQueries() {
        this.serverRequest = $.get(
            this.API + '/queries',
            (result) => this.cacheQueries(result.queries)
        );
    }

    cacheQueries(queries) {
        if (queries.length) {
            const query = queries.shift();
            this.serverRequest = $.get(this.API + '/songs/search', {q: query})
                .always(() => this.cacheQueries(queries));
        }
    }

    render() {
        return null;
    }
}



class Input extends React.PureComponent {
    constructor(props) {
        super(props);
        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.serverRequest = null;
        this.$input = null;
        this.$video = null;
    }

    componentDidMount() {
        document.addEventListener('keypress', this.onKeyPress);
        this.$input = $('input[type=search]');
    }

    componentDidUpdate() {
        if (!this.props.query) {
            this.$input.blur();
        }
    }

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
    }

    onKeyPress(eventObject) {
        const c = String.fromCharCode(eventObject.which);
        if (c && /^[0-9a-z]+$/i.test(c) && !this.$input.is('focus')) {
            this.$input.focus();
        }
    }

    onFocus() {
        this.$video = $('.playing');
        this.$video.removeClass('playing');
    }

    onBlur() {
        if (this.$video !== null) {
            this.$video.addClass('playing');
        }
    }

    onChange(eventObject) {
        const query = eventObject.target.value;
        const easterEgg = this.easterEgg(query);
        this.props.updateState({query: query});
        if (query) {
            if (this.serverRequest) {
                this.serverRequest.abort();
            }
            if (easterEgg === null) {
                this.serverRequest = $.get(
                    this.API + '/songs/search',
                    {q: query},
                    (result) => this.props.updateState({results: result.songs})
                )
                    .always(() => $.post(this.API + '/queries', {q: query}));
            } else {
                this.props.updateState({results: easterEgg});
            }
        } else {
            this.props.updateState({results: []});
        }
    }

    easterEgg(query) {
        switch (query.toLowerCase().trimAll()) {
            case 'raj':
                return [
                    {
                        "_id": 1685,
                        "album": "The Videos",
                        "album_id": "the-videos",
                        "artist": "Red Hot Chili Peppers",
                        "artist_id": "red-hot-chili-peppers",
                        "artwork_url": "http://is1.mzstatic.com/image/thumb/Video/ca/b8/5c/dj.qbavkfso.jpg/133x100bb-85.jpg",
                        "genre": "Alternative",
                        "genre_id": "alternative",
                        "itunes_album_url": "https://itunes.apple.com/us/album/the-videos/id142229949?uo=2",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/red-hot-chili-peppers/id889780?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-alternative/id1620?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/scar-tissue/id142229976?uo=2",
                        "mp4_url": "http://a969.phobos.apple.com/us/r1000/003/Video/fb/83/98/mzm.gnztiswm..640x400.h264lc.u.p.m4v",
                        "song": "Scar Tissue",
                        "song_id": "scar-tissue"
                    },
                    {
                        "_id": 1554,
                        "album_id": null,
                        "artist": "Weezer",
                        "artist_id": "weezer",
                        "artwork_url": "http://is5.mzstatic.com/image/thumb/Video/d7/7f/67/mzi.bfhabttq.jpg/133x100bb-85.jpg",
                        "genre": "Rock",
                        "genre_id": "rock",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/weezer/id115234?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-rock/id1621?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/buddy-holly/id272450585?uo=2",
                        "mp4_url": "http://a477.phobos.apple.com/us/r1000/044/Video/f6/f9/64/mzm.njrbodrr..640x464.h264lc.u.p.m4v",
                        "song": "Buddy Holly",
                        "song_id": "buddy-holly"
                    },
                    {
                        "_id": 840,
                        "album_id": null,
                        "artist": "Fountains Of Wayne",
                        "artist_id": "fountains-of-wayne",
                        "artwork_url": "http://is2.mzstatic.com/image/thumb/Features/ee/3c/f1/dj.kueyrkjp.tif/133x100bb-85.jpg",
                        "genre": "Alternative",
                        "genre_id": "alternative",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/fountains-of-wayne/id154213?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-alternative/id1620?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/stacys-mom/id720080360?uo=2",
                        "mp4_url": "http://a1589.phobos.apple.com/us/r30/Video7/v4/3b/78/40/3b784070-23e5-335c-a535-85adf912b3b4/mzvf_4653304549299309499.640x480.h264lc.U.p.m4v",
                        "song": "Stacy's Mom",
                        "song_id": "stacys-mom"
                    }
                ];
            case 'katie':
                return [
                    {
                        "_id": 25,
                        "album_id": null,
                        "artist": "The Chainsmokers",
                        "artist_id": "the-chainsmokers",
                        "artwork_url": "http://is4.mzstatic.com/image/thumb/Video50/v4/9c/f4/7b/9cf47b05-660f-d28c-3429-6475fbc75532/8864457808260101VIC.jpg/133x100bb-85.jpg",
                        "genre": "Dance",
                        "genre_id": "dance",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/the-chainsmokers/id580391756?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-dance/id1617?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/dont-let-me-down-feat.-daya/id1108091927?uo=2",
                        "mp4_url": "http://a1446.phobos.apple.com/us/r1000/146/Video18/v4/f3/a4/89/f3a489f2-78d9-6c13-0c2c-fd2a61232ecc/mzvf_5701634985949381330.640x354.h264lc.U.p.m4v",
                        "song": "Don't Let Me Down (feat. Daya)",
                        "song_id": "dont-let-me-down-feat-daya"
                    },
                    {
                        "_id": 1158,
                        "album_id": null,
                        "artist": "Jason Derulo",
                        "artist_id": "jason-derulo",
                        "artwork_url": "http://is2.mzstatic.com/image/thumb/Video1/v4/6a/55/66/6a5566c7-ed31-b4b2-6ba4-ad3b02a9aa01/USWBV1400292.sca1.jpg/133x100bb-85.jpg",
                        "genre": "Pop",
                        "genre_id": "pop",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/jason-derulo/id259118085?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-pop/id1614?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/wiggle-feat.-snoop-dogg/id882941148?uo=2",
                        "mp4_url": "http://a1638.phobos.apple.com/us/r1000/142/Video49/v4/30/ce/d4/30ced498-a2db-09b4-0597-cddf47e497b5/mzvf_467958599302439909.640x336.h264lc.U.p.m4v",
                        "song": "Wiggle (feat. Snoop Dogg)",
                        "song_id": "wiggle-feat-snoop-dogg"
                    }
                ];
            case 'avery':
                return [
                    {
                        "_id": 491,
                        "album_id": null,
                        "artist": "Ylvis",
                        "artist_id": "ylvis",
                        "artwork_url": "http://is1.mzstatic.com/image/thumb/Video3/v4/92/0f/2d/920f2d86-2991-66c4-4ba6-19e69ebd6d92/NOAGW1300438.sca1.jpg/133x100bb-85.jpg",
                        "genre": "Pop",
                        "genre_id": "pop",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/ylvis/id262803453?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-pop/id1614?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/the-fox-what-does-the-fox-say/id733166582?uo=2",
                        "mp4_url": "http://a1767.phobos.apple.com/us/r1000/164/Video49/v4/f5/76/f1/f576f11c-880a-0b65-14ac-9e762f90d720/mzvf_2119292484003809701.640x448.h264lc.U.p.m4v",
                        "song": "The Fox (What Does the Fox Say?)",
                        "song_id": "the-fox-what-does-the-fox-say"
                    },
                    {
                        "_id": 518,
                        "album_id": null,
                        "artist": "Anna Kendrick",
                        "artist_id": "anna-kendrick",
                        "artwork_url": "http://is1.mzstatic.com/image/thumb/Video1/v4/3c/fb/a3/3cfba3be-0971-ea9a-63a9-5a6f3468da59/vidtrkimg_00602537384082_1_1.jpg/133x100bb-85.jpg",
                        "genre": "Soundtrack",
                        "genre_id": "soundtrack",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/anna-kendrick/id331677309?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-soundtrack/id1616?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/cups-pitch-perfects-when-im/id671084855?uo=2",
                        "mp4_url": "http://a597.phobos.apple.com/us/r1000/015/Video3/v4/71/bb/32/71bb323d-d9bf-5784-4ac1-61c11c46e0b1/mzvf_622540291025265896.640x362.h264lc.U.p.m4v",
                        "song": "Cups (Pitch Perfect\u2019s \u201cWhen I\u2019m Gone\u201d)",
                        "song_id": "cups-pitch-perfects-when-im-gone"
                    }
                ];
            case 'chloe':
                return [
                    {
                        "_id": 158,
                        "album_id": null,
                        "artist": "Skillet",
                        "artist_id": "skillet",
                        "artwork_url": "http://is2.mzstatic.com/image/thumb/Video/da/ba/3a/mzi.mwhitxyn.jpg/133x100bb-85.jpg",
                        "genre": "Rock",
                        "genre_id": "rock",
                        "itunes_artist_url": "https://itunes.apple.com/us/artist/skillet/id1750802?uo=2",
                        "itunes_genre_url": "https://itunes.apple.com/us/genre/music-videos-rock/id1621?uo=2",
                        "itunes_song_url": "https://itunes.apple.com/us/music-video/monster/id329941796?uo=2",
                        "mp4_url": "http://a1009.phobos.apple.com/us/r1000/179/Video69/v4/20/dc/c3/20dcc3ca-7200-8ceb-ebe9-ccc3401e56b2/mzvf_6096529714821032057.640x480.h264lc.U.p.m4v",
                        "song": "Monster",
                        "song_id": "monster"
                    }
                ];
            default:
                return null;
        }
    }

    render() {
        return (
            <input
                type='search'
                placeholder='Search'
                maxLength='20'
                autoComplete='off'
                spellCheck='false'
                value={this.props.query}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChange={this.onChange}
            />
        );
    }
}



class Results extends React.PureComponent {
    constructor(props) {
        super(props);
        this.UP_KEYS = [38];
        this.DOWN_KEYS = [40];
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.updateSelected = this.updateSelected.bind(this);
        this.state = {selected: null};
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    componentWillReceiveProps() {
        this.setState({selected: null});
    }

    onKeyDown(eventObject) {
        if (this.props.results.length &&
            this.UP_KEYS.indexOf(eventObject.which) !== -1 ||
            this.DOWN_KEYS.indexOf(eventObject.which) !== -1) {
            eventObject.preventDefault();
        }
    }

    onKeyUp(eventObject) {
        if (this.props.results.length) {
            if (this.UP_KEYS.indexOf(eventObject.which) !== -1) {
                this.updateSelected(-1);
            } else if (this.DOWN_KEYS.indexOf(eventObject.which) !== -1) {
                this.updateSelected(1);
            }
        }
    }

    updateSelected(direction) {
        let selected = this.state.selected;
        if (selected === null) {
            selected = -0.5 * direction - 0.5;
        }
        selected += direction;
        selected += this.props.results.length;
        selected %= this.props.results.length;
        this.setState({selected: selected});
    }

    redirect() {
        if (this.refs.result) {
            this.props.router.push(this.refs.result.target);
        }
    }

    render() {
        const items = [];
        for (let index = 0; index < this.props.results.length; index++) {
            const result = this.props.results[index];
            const key = `/${result.artist_id}/${result.song_id}`;
            const selected = index == this.state.selected;
            const ref = index == this.state.selected ? 'result' : null;
            const item = (
                <Result
                    key={key}
                    result={result}
                    selected={selected}
                    ref={ref}
                />
            );
            items.push(item);
        }
        return <ol>{items}</ol>;
    }
}



class Result extends React.PureComponent {
    constructor(props) {
        super(props);
        const {artist_id, song_id} = this.props.result;
        this.target = `/${artist_id}/${song_id}`;
    }

    componentWillReceiveProps(nextProps) {
        const {artist_id, song_id} = this.props.result;
        this.target = `/${artist_id}/${song_id}`;
    }

    render() {
        const style = {textDecoration: this.props.selected ? 'underline' : null};
        const {artist, song} = this.props.result;
        const html = `${artist} &mdash; ${song}`;
        const title = html.htmlToText();
        return (
            <li>
                <Link
                    to={this.target}
                    style={style}
                    dangerouslySetInnerHTML={{__html: html}}
                    title={title}
                />
            </li>
        );
    }
}



export default withRouter(Search);
