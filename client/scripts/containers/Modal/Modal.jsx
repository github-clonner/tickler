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
import classNames from 'classnames';
import URL, { URL as URI} from 'url';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { WebView } from '../../components';
import { shell, remote, ipcRenderer } from 'electron';
import * as Settings from '../../actions/Settings';
import Time, { parseDuration } from '../../lib/Time';
import durationFormat from '@maggiben/duration-format';

/* Modals */
import { MediaInfo } from './MediaInfo';
import { SortableComponent } from './Related';

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

const QI = {status:"ok",id:"JqiGYpvxt7A",title:"Daft Punk - High Life",name:"Daft Punk - High Life",filename:"Daft Punk - High Life",description:"Daft Punk - High Life",related:[{endscreen_autoplay_session_data:"itct=CBQQ4ZIBIhMI_caR0-vE1wIVT8GQCh1yWwAOKPgdMgxyZWxhdGVkLWF1dG9IsO_G36nModQm&playnext=1&autonav=1",id:"zNRbP7U0Iq8",length_seconds:"241",session_data:"itct=CBMQvU4YACITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"4.4M views",iurlhq:"https://i.ytimg.com/vi/zNRbP7U0Iq8/hqdefault.jpg",title:"Daft Punk - Face To Face",iurlmq:"https://i.ytimg.com/vi/zNRbP7U0Iq8/mqdefault.jpg",author:"Costa Ntino"},{playlist_iurlmq:"https://i.ytimg.com/vi/JqiGYpvxt7A/mqdefault.jpg",video_id:"zNRbP7U0Iq8",thumbnail_ids:"zNRbP7U0Iq8",list:"RDJqiGYpvxt7A",session_data:"itct=CBIQvk4YASITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",playlist_length:"0",playlist_iurlhq:"https://i.ytimg.com/vi/JqiGYpvxt7A/hqdefault.jpg",playlist_title:"Mix - Daft Punk - High Life"},{id:"n6RTF4OPzf8",length_seconds:"321",session_data:"itct=CBEQvU4YAiITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"10M views",iurlhq:"https://i.ytimg.com/vi/n6RTF4OPzf8/hqdefault.jpg",title:"Daft Punk - One More Time [HQ]",iurlmq:"https://i.ytimg.com/vi/n6RTF4OPzf8/mqdefault.jpg",author:"Naf' Manson"},{id:"oUutxbjzL18",length_seconds:"229",session_data:"itct=CBAQvU4YAyITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"6.8K views",iurlhq:"https://i.ytimg.com/vi/oUutxbjzL18/hqdefault.jpg",title:"Daft Punk - High Life (FL Studio Remake)",iurlmq:"https://i.ytimg.com/vi/oUutxbjzL18/mqdefault.jpg",author:"Oscar Betancourt"},{id:"tEJpLDEOivA",length_seconds:"229",session_data:"itct=CA8QvU4YBCITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"2.6M views",iurlhq:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",title:"Daft Punk - Voyager",iurlmq:"https://i.ytimg.com/vi/tEJpLDEOivA/mqdefault.jpg",author:"Costa Ntino"},{playlist_iurlmq:"https://i.ytimg.com/vi/n6RTF4OPzf8/mqdefault.jpg",video_id:"n6RTF4OPzf8",thumbnail_ids:"n6RTF4OPzf8",list:"PLjIuADMrDKIb_TAE3RsW8kffG9N9LxjrU",session_data:"itct=CA4Qvk4YBSITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",playlist_length:"14",playlist_iurlhq:"https://i.ytimg.com/vi/n6RTF4OPzf8/hqdefault.jpg",playlist_title:"Daft Punk - Discovery full album"},{id:"quHVq28Y_gg",length_seconds:"213",session_data:"itct=CA0QvU4YBiITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"1.3M views",iurlhq:"https://i.ytimg.com/vi/quHVq28Y_gg/hqdefault.jpg",title:"Daft Punk - Crescendolls",iurlmq:"https://i.ytimg.com/vi/quHVq28Y_gg/mqdefault.jpg",author:"Costa Ntino"},{id:"sIv17mT9pBc",length_seconds:"232",session_data:"itct=CAwQvU4YByITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"2.5M views",iurlhq:"https://i.ytimg.com/vi/sIv17mT9pBc/hqdefault.jpg",title:"Daft Punk - Something About Us",iurlmq:"https://i.ytimg.com/vi/sIv17mT9pBc/mqdefault.jpg",author:"Costa Ntino"},{id:"X4fa44_sq2E",length_seconds:"239",session_data:"itct=CAsQvU4YCCITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"1.4M views",iurlhq:"https://i.ytimg.com/vi/X4fa44_sq2E/hqdefault.jpg",title:"Daft Punk - Superheroes",iurlmq:"https://i.ytimg.com/vi/X4fa44_sq2E/mqdefault.jpg",author:"Costa Ntino"},{id:"Oq77lLDEFGY",length_seconds:"601",session_data:"itct=CAoQvU4YCSITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"982K views",iurlhq:"https://i.ytimg.com/vi/Oq77lLDEFGY/hqdefault.jpg",title:"Daft Punk - Too Long",iurlmq:"https://i.ytimg.com/vi/Oq77lLDEFGY/mqdefault.jpg",author:"Costa Ntino"},{id:"QOngRDVtEQI",length_seconds:"299",session_data:"itct=CAkQvU4YCiITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"10M views",iurlhq:"https://i.ytimg.com/vi/QOngRDVtEQI/hqdefault.jpg",title:"Daft Punk - Digital Love",iurlmq:"https://i.ytimg.com/vi/QOngRDVtEQI/mqdefault.jpg",author:"Costa Ntino"},{id:"dh3jFRvYvDE",length_seconds:"346",session_data:"itct=CAgQvU4YCyITCP3GkdPrxNcCFU_BkAodclsADij4HTIJZW5kc2NyZWVuSLDvxt-pzKHUJg%3D%3D",short_view_count_text:"1.4M views",iurlhq:"https://i.ytimg.com/vi/dh3jFRvYvDE/hqdefault.jpg",title:"Daft Punk - Veridis Quo",iurlmq:"https://i.ytimg.com/vi/dh3jFRvYvDE/mqdefault.jpg",author:"Costa Ntino"}],keywords:["Discovery","Daft Punk (Musical Group)","High","Life"],rating:4.8902584493,views:1314119,author:{id:"UCIVB9h04X5FXmx7r9zatZJQ",name:"Costa Ntino",avatar:"https://yt3.ggpht.com/-lZQMUToQIF8/AAAAAAAAAAI/AAAAAAAAAAA/qnfriszfzlY/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",user:"aimo10",channel_url:"https://www.youtube.com/channel/UCIVB9h04X5FXmx7r9zatZJQ",user_url:"https://www.youtube.com/user/aimo10"}};
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
  }

  componentWillMount () {
    this.modal = remote.getCurrentWindow();
    this.listener = {
      setScope: (event, { state: media, options }) => {
        return this.setState({ media, options });
      },
      modalEvent: (event, data) => {
        console.log('modal:event', data);
      }
    };
    console.log('modal:componentWillMount');
    ipcRenderer.on('modal:event', this.listener.modalEvent);
    ipcRenderer.on('modal:set:scope', this.listener.setScope);
  }

  componentWillUnmount() {
    console.log('modal:componentWillUnmount');
    /* Remove listeners */
    ipcRenderer.removeListener('modal:event', this.listener.modalEvent);
    ipcRenderer.removeListener('modal:set:scope', this.listener.setScope);
  }

  render () {
    const { header, title, body, footer, query } = this.props;
    const { related } = query || QI;
    const { media } = this.state;
    console.log('Modal.Props', this.props)
    return (
      <div className={ Style.modal } role="dialog" >
        <div className={ Style.content } role="document" >
          <div className={ Style.header }>
            <h5 className={ Style.title }>Modal title</h5>
            <button type="button" className={ classNames( Style.modalButton, Style.close) } onClick={ Modal.close }>
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

            <MediaInfo media={ this.props.query } />
            */ }

            { /* <Related items={ media.related } /> */ }
            <SortableComponent items={ media.related } />
          </div>
          <div className={ Style.footer} >
            { /* <p>footer</p> */ }
          </div>
        </div>
      </div>
    );
  }
}
