///////////////////////////////////////////////////////////////////////////////
// @file         : ModalFactory.jsx                                          //
// @summary      : Modal factory for stock styles                            //
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

import Style from './Modal.css';
import classNames from 'classnames';
import { Related } from './Related';
import { MediaInfo } from './MediaInfo';
import React, { Component } from 'react';
import ModalStyle from './ModalStyle.json';
import { ModalType } from '../../components/Modal';
import { isPlainObject, isString, has } from '../../lib/utils';

const getButton = (type, label) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, label: label = type, ...(isPlainObject(type) ? type : undefined) }} = ModalStyle.button;
  const { actions } = styled;
  console.log('actions', actions);
  return { ...styled };
};

const FooterFactory = ({ behavior: { type }, ...options}) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, ...type }} = ModalStyle.type;
  return (
    styled.buttons.map(getButton).map((button, index) => (
      <button className={ classNames(Style.modalButton, Style[button.style]) } key={ index } onClick={ button.onClick }>
        <i className={ Style.modalIcon } role="icon">
          { button.icon }
        </i>
        { button.label }
      </button>
    ))
  );
};

const getHeader = (type, title) => {
  const { DEFAULT, [type]: styled = { ...DEFAULT, ...type }} = ModalStyle.type;
  return { ...styled, title };
};

const HeaderFactory = ({ behavior: { type }, window: { title }, ...options}) => {
  const header = getHeader(type, title);
  return (
    <h5 className={ classNames(Style.modalTitle, Style[header.style])}>
      <i className={ Style.modalIcon } role="icon">
        { header.icon }
      </i>
      { header.title }
    </h5>
  );
};

export const ModalFactory = (type, category, options, data) => {
  try {
    const template = {
      options: { type, category, ...options }
    };
    switch (category.join('.')) {
      case 'metadata': return {
        modal: {
          ...template,
          header: <HeaderFactory { ...options } />,
          body: <MediaInfo { ...data } />,
          footer: FooterFactory(options)
        }
      };
      case 'related': return {
        modal: {
          ...template,
          header: <HeaderFactory { ...options } />,
          body: <Related { ...data } />,
          footer: <FooterFactory { ...options } />
        }
      };
      default: return {
        modal: {
          ...template,
          header: '<Header { ...data } />',
          body: (<div { ...data } />),
          footer: FooterFactory(options.behavior.type)
        }
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
