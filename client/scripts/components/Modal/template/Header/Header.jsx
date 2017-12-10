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
import HeaderButtons from './HeaderButtons';
import { ModalType } from '../../ModalType';
import ModalStyle from '../../../../containers/Modal/ModalStyle.json';

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
const Header = ({ modal }) =>
  <div className={ Style.header }>
    <HeaderFactory { ...modal.options } />
    <HeaderButtons { ...modal } />
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
