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
import {Link} from 'react-router';



class Search extends React.Component {
    constructor(props) {
        super(props);

        if (process.env.NODE_ENV == 'production') {
            this.API = 'https://api.spool.tv/v1';
        } else {
            this.API = 'http://localhost:5000/v1';
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {results: []};
        this.serverRequest = null;
    }

    componentWillReceiveProps() {
        document.getElementsByTagName('input')[0].value = '';
        this.setState({results: []});
    }

    componentWillUnmount() {
        if (this.serverRequest) {
            this.serverRequest.abort();
        }
    }

    onChange(eventObject) {
        if (eventObject.target.value) {
            this.serverRequest = $.get(
                this.API + '/songs/search',
                {q: eventObject.target.value},
                function(result) {
                    this.setState({results: result.songs});
                }.bind(this)
            );
        } else {
            this.setState({results: []});
        }
    }

    onSubmit(eventObject) {
        eventObject.preventDefault();
    }

    render() {
        return (
            <div id='search'>
                <form onSubmit={this.onSubmit}>
                    <fieldset>
                        <input
                            type='search'
                            placeholder='Search'
                            maxLength='20'
                            autoComplete='off'
                            spellCheck='false'
                            onChange={this.onChange}
                        />
                    </fieldset>
                </form>
                <Results results={this.state.results} />
            </div>
        );
    }
}



function Results(props) {
    var items = [];
    for (var index = 0; index < props.results.length; index++) {
        const result = props.results[index];
        const linkTo = `/${result.artist_id}/${result.song_id}`;
        const html = `${result.artist} &mdash; ${result.song}`;
        items.push(
            <li key={linkTo}>
                <Link
                    to={linkTo}
                    dangerouslySetInnerHTML={{__html: html}}
                />
            </li>
        );
    }
    return <ol>{items}</ol>;
}



export default Search;
