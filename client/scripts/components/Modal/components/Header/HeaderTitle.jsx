// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Header.jsx                                                //
// @summary      : Modal header component                                    //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Nov 2017                                               //
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

import Style from './Header.css';
import classNames from 'classnames';
import React, { Component } from 'react';
import { isEmpty } from '../../../../lib/utils';
import { shell, remote, ipcRenderer } from 'electron';
import {
  pure,
  branch,
  compose,
  mapProps,
  getContext,
  setPropTypes,
  renderNothing,
  renderComponent,
  onlyUpdateForPropTypes
} from 'recompose';
import { ModalType } from '../../ModalType';
import ModalStyle from '../../../../containers/Modal/ModalStyle.json';


const Close = ({ actions: { close }}) =>
  <button type="button" className={ classNames( Style.modalButton, Style.headerButton, Style.closeButton) } onClick={ close }>
    <span aria-hidden="true">&times;</span>
  </button>;

const Alert = ({ actions: { close }}) =>
  <button type="button" className={ classNames( Style.modalButton, Style.headerButton, Style.closeButton) } onClick={ close }>
    <span aria-hidden="true">&reg;</span>
  </button>;


class Noop extends Component {
  render () {
    <div>{ this.props.children }</div>
  }
}

/*
 * conditional state render
 * inspiration: https://blog.bigbinary.com/2017/09/12/using-recompose-to-build-higher-order-components.html
 */
const isMedia = ({ options: { type }}) => (/media/i.test(type));
const isAlert = ({ options: { type }}) => (/alert/i.test(type));

const conditionalRender = (states) =>
  compose(...states.map(state =>
    branch(state.when, renderComponent(state.then))
  ));

const Buttons = compose(
  pure,
  conditionalRender([
    { name: 'media', when: isMedia, then: Alert },
    { name: 'alert', when: isAlert, then: Close }
  ])
)(Close);

// const Buttons = enhance(Noop);

const getHeader = (type, title) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, ...type }} = ModalStyle.type;
  return { ...styled, title };
};

const HeaderFactory = ({ behavior: { type }, window: { title }, ...options}) => {
  const header = getHeader(type, title);
  return (
    <h5 className={ classNames(Style.title, Style[header.style])}>
      <i className={ Style.icon } role="icon">{ header.icon }</i>
      { header.title }
    </h5>
  );
};

// const Header = ({ modal: { header, actions: { close }, options }}) =>
const Header = ({ modal, modal: { header, actions, options }}) =>
  <div className={ Style.header }>
    <HeaderFactory { ...options } />
    { /*
    <button type="button" className={ classNames( Style.modalButton, Style.headerButton, Style.closeButton) } onClick={ close }>
      <span aria-hidden="true">&times;</span>
    </button>
    <Close { ...actions } />
    */ }
    <Buttons { ...modal } />
  </div>;

/*
 * Component wrapper
 */
export default compose(
  pure,
  getContext({
    modal: ModalType
  }),
  onlyUpdateForPropTypes,
  setPropTypes({
    modal: ModalType
  }),
  branch(
    ({ modal: { header }}) => !isEmpty(header),
    renderComponent(Header),
    renderNothing,
  )
)(Header);
