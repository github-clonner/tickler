///////////////////////////////////////////////////////////////////////////////
// @file         : Modal.jsx                                                 //
// @summary      : Modal HOC                                                 //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Nov 2017                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2017 Benjamin Maggi <benjaminmaggi@gmail.com>                   //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

import Style from './Modal.css';
import PropTypes from 'prop-types';
import URL, { URL as URI} from 'url';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { WebView } from '../../components';
import { shell, remote, ipcRenderer } from 'electron';
import * as Settings from '../../actions/Settings';
import Time, { parseDuration } from '../../lib/Time';
import durationFormat from '@maggiben/duration-format';

const General = function ({ media }, ...args) {
  console.log('General', media)
  return (
    <form>
      <div className={ Style.formGroup }>
        <label htmlFor="title">Title</label>
        <input type="text" className={ Style.formControl } id="title" value={ media.title} />
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="artist">artist</label>
        <input type="text" className={ Style.formControl } id="artist" value={ media.artist }/>
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="album">album</label>
        <input type="text" className={ Style.formControl } id="album" value={ media.album }/>
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="genre">genre</label>
        <input type="text" className={ Style.formControl } id="genre" value={ media.genre }/>
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="description">description</label>
        <input type="text" className={ Style.formControl } id="description" value={ media.description } />
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="copyright">copyright</label>
        <input type="text" className={ Style.formControl } id="copyright" value={ media.copyright }/>
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="location">location</label>
        <input type="text" className={ Style.formControl } id="location" />
        <small className={ Style.formText }>We'll never share your email with anyone else.</small>
      </div>
      <button type="submit" className={ Style.btn }>Submit</button>
    </form>
  );
};

const Related = function ({ items }, ...args) {
  console.log('related', items);
  const list = function (list) {

  };
  const media = function ({ title, iurlhq, iurlmq, id, length_seconds, short_view_count_text }) {
    return (
      <div className={ Style.media }>
        <div className={ Style.thumbnail }>
          <a href="#">
            <div className={ Style.overlay }>
              <div className={ Style.stats }><i className={ Style.icon }>grade</i>&nbsp;<span className={ Style.text }>{ short_view_count_text }</span></div>
              <div className={ Style.duration }><i className={ Style.icon }>alarm</i>&nbsp;&nbsp;{ durationFormat((parseInt(length_seconds, 10) * 1000), '#{2H}:#{2M}:#{2S}')  }</div>
              <div className={ Style.play }><i className={ Style.icon }>play_arrow</i></div>
            </div>
            <img src={ iurlmq } />
          </a>
        </div>
        <div className={ Style.caption } >
          <h1 className={ Style.title }>{ title }</h1>
          <h2 className={ Style.subtitle }>
            <span>Artist</span>
            <span>•</span>
            <span>{ short_view_count_text }</span>
          </h2>
          <p className={ Style.description }>description</p>
        </div>
      </div>
    );
  };
  return (
    <ul className={ Style.related } >
      {
        items
        .filter(item => !(item.list))
        .map((item, index) => {
          return (
            <li key={ index } className={ Style.item } >{ media(item) }</li>
          );
        })
      }
    </ul>
  );
}

function mapStateToProps (state, ownProps) {
  console.log('ownProps', ownProps);
  const { match: { params: { type, ...sub }}} = ownProps;
  const { location: { query }} = ownProps;
  return {
    type,
    query,
    sub: Object.values(sub)
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    settings: bindActionCreators(Settings, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class Modal extends Component {

  static propTypes = {
    header: PropTypes.string,
    title: PropTypes.object,
    body: PropTypes.string,
    footer: PropTypes.string
  };

  static close(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:close', webContents.id, webContents);
    return webContents.getParentWindow().send('modal:close');
  }

  state = {
    media: {
      related: [],
    }
  };

  componentDidMount () {
    this.modal = remote.getCurrentWindow();
    window.xxx = this.modal;
    this.listener = {
      modalEvent: (event, data) => {
        console.log('modal:event', data);
      },
    };
    ipcRenderer.on('modal:event', this.listener.modalEvent);
  }

  componentWillMount () {
    this.modal = remote.getCurrentWindow();
    this.listener = {
      setScope: (event, { state: media, options }) => {
        return this.setState({ media, options });
      }
    };
    ipcRenderer.on('modal:set:scope', this.listener.setScope);
  }

  render () {
    const { header, title, body, footer, query } = this.props;
    const { related } = query;
    const { media } = this.state;
    console.log('Modal.Props', this.props)
    return (
      <div className={ Style.modal } role="dialog" >
        <div className={ Style.content } role="document" >
          <div className={ Style.header }>
            <h5 className={ Style.title }>Modal title</h5>
            <button type="button" className={ Style.close } onClick={ Modal.close }>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className={ Style.body }>
            { /*
            <p>Modal body text goes here.</p>
            <div className={ Style.thumbnail }>
              <a href="#">
                <div className={ Style.overlay }>
                  <div className={ Style.stats }><i></i> <span className={ Style.text }>2500</span></div>
                  <div className={ Style.duration }><i></i> 2:20</div>
                  <div className={ Style.play }><i></i></div>
                </div>
                <img src="https://i.ytimg.com/vi/12CeaxLiMgE/mqdefault.jpg" />
              </a>
            </div>
            <General media={ this.props.query } />
            */ }
            <Related items={ media.related } />
          </div>
          <div className={ Style.footer} >
            { /* <p>footer</p> */ }
          </div>
        </div>
      </div>
    );
  }
}
