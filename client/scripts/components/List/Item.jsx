// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Item.js                                                   //
// @summary      : List item component                                       //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 30 Sep 2017                                               //
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
import classNames from 'classnames';
import * as RowField from './RowField';
import Style from './List.css';

const drawProgress = function (item) {
  if(!item.isLoading && !item.isPlaying) {
    return {};
  } else if (item.isLoading) {
    const { progress } = item;
    return {
      'background': `linear-gradient(to right, #eee 0%, #eee ${progress * 100}%,#f6f6f6 ${progress * 100}%,#f6f6f6 100%)`
    };
  }
};

export default ({ item, index, handlers }) => {
  const style = classNames(Style.row, {
    [Style.active]: item.isPlaying,
    [Style.selected]: item.selected,
    [Style.loading]: item.isLoading
  });
  const { onClick, onDoubleClick, onContextMenu, dragEnd, dragStart } = handlers;
  return (
    <li
      draggable="true"
      item-id={ index }
      className={ style }
      style={ drawProgress(item) }
      onClick={ event => onClick(event, item) }
      onDoubleClick={ event => onDoubleClick(event, item) }
      onContextMenu={ event => onContextMenu(event, item) }
      onDragEnd={ event => dragEnd(event) }
      onDragStart={ event => dragStart(event) }
    >
      <RowField.Index index={ index } />
      <RowField.Status song={ item } />
      <RowField.Title title={ item.title } />
      <RowField.Rating stars={ item.stars } />
      <RowField.Duration duration={ item.duration } format="#{2H}:#{2M}:#{2S}" />
      <RowField.DropDown onClick={ event => onContextMenu(event, item) }/>
    </li>
  );
};
