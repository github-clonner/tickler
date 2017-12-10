// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Footer.jsx                                                //
// @summary      : Modal footer component                                    //
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

import Style from './Footer.css';
import classNames from 'classnames';
import React, { Component } from 'react';
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


const Footer = ({ modal: { footer, actions, options }}) => {
  return (
    <div className={ Style.footer } >
      { React.Children.map(footer, buttonClass) }
    </div>
  );
};

const buttonClass = (child) => {
  console.log('buttonClass', child.props);
  const className = classNames(child.props.className, Style.footerButton );
  const props = {
    className
  };
  return React.cloneElement(child, props);
};

const mapButtonType = (type) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, label: label = type, ...(isPlainObject(type) ? type : undefined) }} = ModalStyle.button;
  return { ...styled };
};

const mapButtonEvents = (actions) => ({ events, ...button }) => {
  return {
    ...button,
    events: Object
    .entries(events)
    .filter(([name, handler]) => (handler in actions))
    .reduce((events, [ name, handler ]) => ({...events, [name]: actions[handler] }), {})
  };
};

const mapButtonElement = ({ icon, label, style, events }, index) =>
  <button className={ classNames(Style.modalButton, Style[style]) } key={ index } { ...events }>
    <i className={ Style.modalIcon } role="icon">{ icon }</i>
    { label }
  </button>;

const FooterFactory = ({ behavior: { type }, ...options}, actions) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, ...type }} = ModalStyle.type;
  return (
    styled.buttons
    .map(mapButtonType)
    .map(mapButtonEvents(actions))
    .map(mapButtonElement)
  );
};

/*
 * Component wrapper
 */
export default compose(
  pure,
  getContext({
    modal: ModalType
  }),
  mapProps(({ modal: { header, body, footer, actions, options } }) => {
    console.log('actions', actions);
    return {
      modal: {
        header,
        body,
        footer: FooterFactory(options, actions),
        actions,
        options
      }
    }
  }),
  onlyUpdateForPropTypes,
  setPropTypes({
    modal: ModalType
  }),
  branch(
    ({ modal }) => {
      return React.Children.count(modal.footer) > 1;
    },
    renderComponent(Footer),
    renderNothing,
  )
)(Footer);

