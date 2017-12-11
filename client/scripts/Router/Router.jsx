// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Router.jsx                                                //
// @summary      : Application state router                                  //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 05 Dec 2017                                               //
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

import { URL, URLSearchParams } from 'url';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import { Router, Route, Redirect, Link, Switch } from 'react-router-dom';
import { Main, About, NewList, Inspector, Modal, ShowError } from '../containers';
import { ModalWindow } from '../components/Modal';
import { ModalRouter } from './ModalRouter';
import { AlertRouter } from './AlertRouter';

const locationOverride = (props, DefaultComponent) => {
  try {
    const { location } = props;
    const param = new URLSearchParams(location.search).entries().next();
    if (param.value) {
      const [ name,  value ] = param.value;
      switch (name) {
        case 'modal': return ModalRouter(props);
        case 'alert': return AlertRouter(props);
        default:
          return (<DefaultComponent {...props } />);
      }
    } else {
      return (<DefaultComponent {...props } />);
    }
  } catch (error) {
    console.error(error);
    return (<ShowError {...props } />);
  }
}

export default (
  <Switch>
    <Route exact path="/" render={ (props) => (locationOverride(props, Main)) }/>
    <Route path="/about" component={ About } />
    <Route path="/list" component={ NewList } />
    <Route path="/inspector/:file?" component={ Inspector } />
    <Route path="/modal/:type?/*" component={ ModalWindow } />
    <Route path="/error/:type?/*" component={ ShowError } />
    <Redirect from="/*" exact to="/" />
  </Switch>
);
