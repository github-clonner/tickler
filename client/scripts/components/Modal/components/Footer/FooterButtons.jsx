// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : FooterButtons.jsx                                         //
// @summary      : Footer button component                                   //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 11 Dec 2017                                               //
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
import { isEmpty } from 'lib/utils';
import { getStyle } from '../../constants';


const buttonEvents = (actions) => ({ events, ...button }) => {
  return {
    ...button,
    events: Object
    .entries(events)
    .filter(([name, handler]) => (handler in actions))
    .reduce((events, [ name, handler ]) => ({ ...events, [name]: actions[handler] }), {})
  };
};

const Button = ({ icon, label, style, events }) =>
  <button className={ Style.footerButton } role={ style } { ...events }>
    <i className={ Style.icon } role="icon">{ icon }</i>
    { label }
  </button>;

const Buttons = ({ actions, buttons }) => buttons.map(buttonEvents(actions)).map((props, index) => <Button key={ index } {...props} />);

export default compose(
  pure,
  mapProps(({ actions, options }) => {
    const { behavior: { type }} = options;
    const { buttons } = getStyle(type);
    console.log('BUTTONS', buttons, isEmpty(buttons))
    return { actions, options, buttons };
  }),
  branch(
    ({ buttons }) => !isEmpty(buttons),
    renderComponent(Buttons),
    renderNothing,
  )
)(renderNothing);
