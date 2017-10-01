// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Sortable.js                                               //
// @summary      : Sortable component                                        //
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
import { TrackDuration } from '../TimeCode/TimeCode';
import classNames from 'classnames';
import Stars from '../Stars/Stars';
import * as RowField from './RowField';
import Style from './List.css';
import Item from './Item';
import { branch, renderNothing, compose } from 'recompose';

export default class Sortable extends Component {

  dragged: HTMLElement;

  state = {
    items: [],
    isDragDrop: false
  }

  static defaultProps = {
    items: []
  };

  constructor(props) {
    super(props);
    this.state = {
      items: props.items
    };
    this.placeholder = document.createElement('li');
    this.placeholder.className = 'placeholder';
    this.placeholder.style.backgroundColor = '#00f';
    this.placeholder.style.minHeight = '12px';
  }

  dragStart = event => {
    this.dragged = event.currentTarget;
    console.log('dragStart', this.dragged);
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    event.dataTransfer.setData('text/html', event.currentTarget);
  }

  dragEnd = event => {
    const { placeholder } = this;
    this.dragged.style.display = 'block';
    this.dragged.parentNode.removeChild(placeholder);
    // Update data
    var items = this.state.items;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    if(this.nodePlacement == 'after') to++;
    items.splice(to, 0, items.splice(from, 1)[0]);
    this.setState({ items });
  }

  dragOver = event => {
    event.preventDefault();
    const { placeholder } = this;
    this.dragged.style.display = 'none';
    if(event.target.className == 'placeholder') return;
    this.over = event.target;
    // Inside the dragOver method
    var relY = event.clientY - this.over.offsetTop;
    var height = this.over.offsetHeight / 2;
    var parent = event.target.parentNode;

    if(relY > height) {
      this.nodePlacement = 'after';
      parent.insertBefore(placeholder, event.target.nextElementSibling);
    }
    else if(relY < height) {
      this.nodePlacement = 'before';
      parent.insertBefore(placeholder, event.target);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { items } = nextProps;
    if(!items && !items.length) {
      return;
    }
    return this.setState({ items });
  }

  renderItem = (item, index) => {
    const { onClick, onDoubleClick, onContextMenu } = this.props;
    const { dragEnd, dragStart } = this;
    return (
      <Item { ...{ item, index, handlers: { onClick, onDoubleClick, onContextMenu, dragEnd, dragStart } } } key={ index } />
    );
  }

  render () {
    const dragList = classNames(Style.list, {
      [Style.isDragDrop]: this.state.isDragDrop
    });

    return (
      <div className={ dragList }>
        <ul className={ Style.container } onDragOver={ this.dragOver }>{ this.state.items.map(this.renderItem) }</ul>
      </div>
    );
  }
}
