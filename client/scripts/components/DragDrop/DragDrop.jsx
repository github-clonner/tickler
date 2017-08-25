///////////////////////////////////////////////////////////////////////////////
// @file         : DragDrop.jsx                                              //
// @summary      : Drag Drop component                                       //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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
import './DragDrop.css';

export default class DragDrop extends Component {
  state = {
    isDragDrop: false
  };

  componentDidMount () {
    this.refs.dragdrop.addEventListener('dragstart', this.onDragStart, false);
    this.refs.dragdrop.addEventListener('dragenter', this.onDragEnter, false);
    this.refs.dragdrop.addEventListener('dragover', this.onDragOver, false);
    this.refs.dragdrop.addEventListener('dragleave', this.onDragLeave, false);
    this.refs.dragdrop.addEventListener('drop', this.onDrop, false);
  }

  componentWillUnmount () {
    this.refs.dragdrop.removeEventListener('dragstart', this.onDragStart, false);
    this.refs.dragdrop.removeEventListener('dragenter', this.onDragEnter, false);
    this.refs.dragdrop.removeEventListener('dragover', this.onDragOver, false);
    this.refs.dragdrop.removeEventListener('dragleave', this.onDragLeave, false);
    this.refs.dragdrop.removeEventListener('drop', this.onDrop, false);
  }

  onDragStart = event => {
    event.stopPropagation();
    event.preventDefault();
    console.log('onDragStart')
    return false;
  };

  onDragEnter = event => {
    //console.log(event.target, this.refs.dragdrop)
    event.stopPropagation();
    event.preventDefault();



    var img = document.createElement("img");
    img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
    event.dataTransfer.setDragImage(img, 0, 0);


    return false;
  };

  onDragOver = event => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'link';

    this.setState({
      isDragDrop: true
    });
    return false;
  };

  onDragLeave = event => {
    if(event.target === this.refs.dragdrop) {
      event.stopPropagation();
      event.preventDefault();
      console.log('dragleave')
      this.setState({
        isDragDrop: false
      });
      return false;
    }
  };

  onDrop = event => {
    event.stopPropagation();
    event.preventDefault();
    // fetch FileList object
    let files = Array.prototype.slice.call(event.target.files || event.dataTransfer.files || [], 0);
    this.setState({
      isDragDrop: false
    });
    console.log(files)
    return false;
  };

  render() {
    let dragDropStyle = classNames('dragdrop', {
      'is-dragdrop': this.state.isDragDrop
    })
    return (
      <div className={dragDropStyle} ref="dragdrop">
        <div className="dragOverlay">
          <div className="drop-zone"></div>
        </div>
        {this.props.children}
      </div>
    );
  }
}
