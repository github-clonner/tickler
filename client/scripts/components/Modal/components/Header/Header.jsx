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
import ModalType from '../../types';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import HeaderButtons from './HeaderButtons';
import HeaderTitle from './HeaderTitle';
import { isEmpty, isString, isPlainObject } from 'lib/utils';
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
import { getStyle } from '../../constants';

const Header = ({ modal: { actions, options }}) =>
  <div className={ Style.header }>
    <HeaderTitle className={ Style.title } { ...{ actions, options }} />
    <HeaderButtons className={ Style.button } { ...{ actions, options }} />
  </div>;

const CustomHeader = (props) => {
  return (<div className={ Style.header } { ...props }></div>);
}

const SimpleHeader = (props) => {
  console.log('SimpleHeader', props);
  return (<div className={ Style.header }>
    <h1 className={ Style.title }>
      <i className={ Style.icon } role="icon">{ props.icon }</i>
      { props.title }
    </h1>
  </div>);
}
/*
 * Component wrapper
 */
// const simpleComponent = compose(
//   pure,
//   getContext({
//     modal: ModalType
//   }),
//   onlyUpdateForPropTypes,
//   setPropTypes({
//     modal: ModalType
//   }),
//   branch(
//     ({ modal: { header }}) => !isEmpty(header),
//     renderComponent(Header),
//     renderNothing,
//   )
// )(renderNothing);

const simpleHeader = compose(
  pure,
  mapProps(({ title, icon }) => {
    return { title, icon };
  }),
  setPropTypes({
    title: PropTypes.string,
    icon: PropTypes.string
  }),
  onlyUpdateForPropTypes,
  renderComponent(SimpleHeader)
)(renderNothing);

const simpleComponent = compose(
  pure,
)(renderNothing);

const customComponent = compose(
  pure,
  mapProps(({ props }) => {
    if (React.isValidElement(props)) {
      return React.Children.count(props) ? React.Children.only(props) : props;
    } else {
      return props;
    }
  }),
  renderComponent(CustomHeader)
)(renderNothing);

const isValidHeader = (props) => (React.isValidElement(props));
const isValidString = (props) => (isString(props) && !isEmpty(props));
const isValidObject = (props) => (isPlainObject(props) && !isEmpty(props));

const conditionalRender = (states) =>
  compose(...states.map(state =>
    branch(state.when, renderComponent(state.then))
  ));

export default compose(
  pure,
  getContext({
    modal: ModalType
  }),
  onlyUpdateForPropTypes,
  setPropTypes({
    modal: ModalType
  }),
  conditionalRender([
    { when: isValidHeader, then: customComponent },
    { when: isValidString, then: simpleComponent },
    { when: isValidObject, then: simpleHeader }
  ])
)(renderNothing);
