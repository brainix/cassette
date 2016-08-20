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



class Input extends React.PureComponent {
    constructor(props) {
        super(props);
        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }
        this.onChange = this.onChange.bind(this);
        this.serverRequest = null;
    }

    componentDidUpdate() {
        if (!this.props.query) {
            const input = document.querySelectorAll('input[type=search]')[0];
            input.blur();
        }
    }

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
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
                this.API + '/songs/search',
                {q: query},
                (result) => this.props.updateState({results: result.songs})
            ).fail(() => this.props.updateState({results: []})).always(() => {
                $.post(this.API + '/queries', {q: query});
            });
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
        return (
            <li>
                <Link
                    to={this.target}
                    style={style}
                    dangerouslySetInnerHTML={{__html: html}}
                />
            </li>
        );
    }
}



export default withRouter(Search);
