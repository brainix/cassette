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



class Search extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateQuery = this.updateQuery.bind(this);
        this.updateResults = this.updateResults.bind(this);
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
    }

    updateQuery(query) {
        this.setState({query: query || ''});
    }

    updateResults(results) {
        this.setState({results: results || []});
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <fieldset>
                    <Input
                        query={this.state.query}
                        updateQuery={this.updateQuery}
                        updateResults={this.updateResults}
                    />
                </fieldset>
                <Results results={this.state.results} />
            </form>
        );
    }
}



class Input extends React.Component {
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

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
    }

    onChange(eventObject) {
        var query = eventObject.target.value;
        this.props.updateQuery(query);
        if (query) {
            if (this.serverRequest) {
                this.serverRequest.abort();
            }
            this.serverRequest = $.get(
                this.API + '/songs/search',
                {q: query},
                function(result) {
                    this.props.updateResults(result.songs);
                }.bind(this)
            ).fail(function() {
                this.props.updateResults([]);
            }.bind(this));
        } else {
            this.props.updateResults([]);
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



function Results(props) {
    var items = [];
    for (var result of props.results) {
        const key = `/${result.artist_id}/${result.song_id}`;
        const item = <Result key={key} result={result} />;
        items.push(item);
    }
    return <ol>{items}</ol>;
}



function Result(props) {
    const linkTo = `/${props.result.artist_id}/${props.result.song_id}`;
    const html = `${props.result.artist} &mdash; ${props.result.song}`;
    return (
        <li>
            <Link
                to={linkTo}
                dangerouslySetInnerHTML={{__html: html}}
            />
        </li>
    );
}



export default Search;
