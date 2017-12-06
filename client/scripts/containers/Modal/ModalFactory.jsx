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

console.log('ModalStyle', ModalStyle);

const getButton = (button) => {
  if (isString(button) && ModalStyle.button.hasOwnProperty(button)) {
    return ModalStyle.button[button];
  } else if (isString(button) && !ModalStyle.button.hasOwnProperty(button)) {
    return { ...ModalStyle.button.DEFAULT, label: button };
  } else if (isPlainObject(button) && has(button, [ 'label', 'style' ])) {
    return button;
  } else {
    console.log('getButton nada', button);
    return ModalStyle.button.DEFAULT;
  }
};

const FooterFactory = (type = 'DEFAULT', category) => {
  const { [type]: modalType } = ModalStyle.type;
  return (
    modalType.buttons.map((button, index) => {
      const { label, style }= getButton(button);
      return (
        <button data-role="#f00" className={ classNames(Style.modalButton, Style[style]) } key={ index } onClick={ () => {} }>{ label }</button>
      );
    })
  );
};

export const ModalFactory = (type, category, options, data) => {
  try {
    const template = {
      options: { type, category, ...options }
    };
    console.log('ModalFactory', options)
    switch (category.join('.')) {
      case 'metadata': return {
        modal: {
          ...template,
          header: (<span>{ options.window.title }</span>),
          body: <MediaInfo { ...data } />,
          footer: FooterFactory(options.behavior.type)
        }
      };
      case 'related': return {
        modal: {
          ...template,
          header: (<span>{ options.window.title }</span>),
          body: <Related { ...data } />,
          footer: FooterFactory(options.behavior.type)
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
