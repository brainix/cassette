/*---------------------------------------------------------------------------*\
 |  Head.jsx                                                                 |
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



import React from 'react/lib/React';



export default class Head extends React.PureComponent {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const WEB_HOST = process.env.NODE_ENV === 'production' ? 'https://spool.tv' : 'http://localhost:8080';
        const title = this.props.title || 'Spool - Just music videos.';
        const description = this.props.description || "Spool takes the experience of channel surfing and puts it online. I hope that you enjoy using it as much as I've enjoyed building it.";
        const image = this.props.image || `${WEB_HOST}/avatar.png`;
        const url = this.props.url || `${WEB_HOST}/`;

        return (
            <head>
                <meta charset='utf-8' />
                <title dangerouslySetInnerHTML={{__html: title}} />
                <meta name='description' content={description} />
                <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
                <link rel='stylesheet' href={`/${this.props.hash}.style.css`} />
                <link rel='icon' href='/icon.png' />

                <meta property='og:title' content={title} />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={image} />
                <meta property='og:url' content={url} />
                <meta property='og:description' content={description} />
                <meta property='og:site_name' content='Spool' />
                <OpenGraphVideo video={this.props.video} />
            </head>
        );
    }
}



class OpenGraphVideo extends React.PureComponent {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        if (this.props.video) {
            return <meta property='og:video' content={this.props.video} />;
        } else {
            return null;
        }
    }
}
