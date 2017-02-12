/*---------------------------------------------------------------------------*\
 |  Search.jsx                                                               |
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



import React from 'react';
import $ from 'jquery';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import {render} from 'react-dom';



String.prototype.trimAll = function () {
    const s = this.trim();
    s.replace(/\s+/g, ' ');
    return s;
};

String.prototype.htmlToText = function () {
    const s = this.replace(/<[^>]*\/?>/g, '')   // HTML open and self-closing tags
        .replace(/<\/[a-z]*>/ig, '')            // HTML close tags
        .replace(/\&mdash;/ig, '-');
    return s;
}

Array.prototype.choice = function () {
        return this[Math.floor(Math.random() * this.length)];
};



class Search extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateState = this.updateState.bind(this);
        this.state = {
            query: this.props.query || '',
            results: this.props.results || [],
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            query: nextProps.query || '',
            results: nextProps.results || [],
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
        if (process.env.NODE_ENV === 'production') {
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
            `${this.API}/queries`,
            result => this.cacheQueries(result.queries),
        );
    }

    cacheQueries(queries) {
        if (queries.length) {
            const query = queries.shift();
            this.serverRequest = $.get(`${this.API}/songs/search`, {q: query})
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
        if (process.env.NODE_ENV === 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.GTFO_KEYS = [27];
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
        } else if (this.GTFO_KEYS.includes(eventObject.which)) {
            window.location = '/gtfo';
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
        this.props.updateState({query: query});
        if (query) {
            if (this.serverRequest) {
                this.serverRequest.abort();
            }
            this.serverRequest = $.get(
                `${this.API}/songs/search`,
                {q: query},
                result => this.props.updateState({results: result.songs}),
            )
                .always(() => $.post(`${this.API}/queries`, {q: query}));
        } else {
            this.props.updateState({results: []});
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
            this.UP_KEYS.includes(eventObject.which) ||
            this.DOWN_KEYS.includes(eventObject.which)) {
            eventObject.preventDefault();
        }
    }

    onKeyUp(eventObject) {
        if (this.props.results.length) {
            if (this.UP_KEYS.includes(eventObject.which)) {
                this.updateSelected(-1);
            } else if (this.DOWN_KEYS.includes(eventObject.which)) {
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
        if (console) {
            console.log(selected);
        }
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
            const selected = index === this.state.selected;
            const ref = index === this.state.selected ? 'result' : null;
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
