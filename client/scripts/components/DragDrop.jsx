import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
require('../../styles/dragdrop.css');

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
