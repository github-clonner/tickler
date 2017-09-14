// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : WebView.jsx                                               //
// @summary      : WebView component                                         //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Sep 2017                                               //
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


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import fs from 'fs';
import path from 'path';
import URL, { URL as URI} from 'url';
// import { promise as DataURI } from 'datauri';
import { changableProps, events, methods, props } from './constants';

function filterKeys (object, filterFunc) {
  return Object.keys(object)
    .filter(filterFunc)
    .reduce((filtered, key) => {
      filtered[key] = object[key];
      return filtered;
    }, {});
}


/*
export default class WebView extends Component<Props, void> {

  bindEvents (element) {

  }

  render () {
    const style = classNames('row', {
      active: true
    });
    const tagProps = filterKeys(this.props, propName => !(propName in eventPropTypes))
    // return (<webview ref="webview" {...tagProps}></webview>);
    return (<webview ref="webview" className={style} style={'width:40px;height:80px;background:red;'} src={"https://www.github.com/"} disableguestresize ></webview>);
  }
}
*/

const data = 'data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KCjxoZWFkPgogIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICA8dGl0bGU+SGVsbG8gV29ybGQ8L3RpdGxlPgogIDxzdHlsZSB0eXBlPSd0ZXh0L2Nzcyc+CiAgICBodG1sLCAuYm9keSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJlZAogICAgfQogIDwvc3R5bGU+CjwvaGVhZD4KCjxib2R5PgogIDxoMT5IZWxsbyBXb3JsZDwvaDE+CiAgPHA+IEphbWllIHdhcyBoZXJlLiA8L3A+CjwvYm9keT4KCjwvaHRtbD4K';

export default class WebView extends Component<Props, void> {

  componentDidMount () {
    const container = ReactDOM.findDOMNode(this.c);
    let propString = '';
    Object.keys(props).forEach((propName) => {
      if (typeof this.props[propName] !== 'undefined') {
        if (typeof this.props[propName] === 'boolean') {
          propString += `${propName}="${this.props[propName] ? 'on' : 'off'}" `;
        } else {
          propString += `${propName}=${JSON.stringify(this.props[propName].toString())} `;
        }
      }
    });
    if (this.props.className) {
      propString += `class="${this.props.className}" `;
    }
    // container.innerHTML = `<webview src="about:blank" style="width:100%;height:180px;border:2px solid black;" />`;
    //container.innerHTML = `<webview src="${data}" style="display:flex;width:100%;height:180px;border:2px solid black;" />`;
    // const webview = document.createElement('webview');
    // webview.setAttribute('src', data);
    // webview.setAttribute('style', 'display:flex;width:100%;height:180px;border:2px solid black;');
    // container.append(webview);

    container.innerHTML = `<webview ${propString} />`;
    this.view = container.querySelector('webview');
    const basePath = path.join(process.cwd(), 'dist', 'index.html');
    // const dataUri = await DataURI(basePath)
    // .then(content => console.log(content))
    // .catch(err => { throw err; });

    // console.log('dataUri', dataUri)

    // this.view.loadURL(data, { baseURLForDataURL: `file://${basePath}${path.sep}`})

    this.view.ready = false;
    this.view.addEventListener('dom-ready', () => {
      // this.view.openDevTools()
      // this.view.loadURL('http://google.com');
    });

    this.view.addEventListener('did-attach', (...attachArgs) => {
      this.ready = true;
      events.forEach((event) => {
        this.view.addEventListener(event, (...eventArgs) => {
          // const propName = camelCase(`on-${event}`);
          const propName = String.prototype.concat.apply('on-', [ event.split('-').reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1)) ]);
          // console.log('Firing event: ', propName, ' has listener: ', !!this.props[propName]);
          if (this.props[propName]) this.props[propName](...eventArgs);
        });
      });
      if (this.props.onDidAttach) this.props.onDidAttach(...attachArgs);
    });

    methods.forEach((method) => {
      this[method] = (...args) => {
        if (!this.ready) {
          throw new Error('WebView is not ready yet, you can\'t call this method');
        }
        return this.view[method](...args);
      };
    });
    this.setDevTools = (open) => {
      if (open && !this.isDevToolsOpened()) {
        this.openDevTools();
      } else if (!open && this.isDevToolsOpened()) {
        this.closeDevTools();
      }
    };
  }

  componentDidUpdate (prevProps) {
    /*
    Object.keys(changableProps).forEach((propName) => {
      if (this.props[propName] !== prevProps[propName]) {
        if (changableProps[propName] === '__USE_ATTR__') {
          this.view.setAttribute(propName, this.props[propName]);
        } else {
          this[changableProps[propName]](this.props[propName]);
        }
      }
    });
    */
  }

  isReady() {
    return this.ready;
  }

  render() {
    return <div ref={(c) => { this.c = c; }} style={this.props.style || {}} />;
  }
}

WebView.propTypes = Object.assign({
  className: PropTypes.string,
  style: PropTypes.object,
}, props);

events.forEach((event) => {
  const name = String.prototype.concat.apply('on-', [ event.split('-').reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1)) ])
  WebView.propTypes[name] = PropTypes.func;
})
