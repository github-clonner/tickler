// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Editor.js                                                 //
// @summary      : Text editor component                                     //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 07 Sep 2017                                               //
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
import PropTypes from 'prop-types';
import CodeMirror, { getCodeMirror } from 'react-codemirror';
import { js_beautify } from 'js-beautify';
import { SettingsStore } from '../../lib';

import 'codemirror/mode/javascript/javascript';
// keymap
import 'codemirror/keymap/sublime';
// comments (single / multiline)
import 'codemirror/addon/comment/comment';
// Highlight matching brackets
import 'codemirror/addon/edit/matchbrackets';
// Auto close brackets and strings
import 'codemirror/addon/edit/closebrackets';
// Auto match tags (great for TSX!)
import 'codemirror/addon/edit/matchtags';
// Auto close brackets and strings
import 'codemirror/addon/edit/closebrackets';
// Auto highlight same words selected
import 'codemirror/addon/search/match-highlighter';

/* stryles */
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/monokai.css';
import './Editor.css';

const settings = new SettingsStore();

type Options = {
  autofocus: bool,
  // Match tags addon
  matchTags: Object,
  // Match bracket addon
  matchBrackets: bool,
  // match-highlighter
  highlightSelectionMatches: Object,
  // keymap
  keyMap: string,
  // mode
  mode: string,
  lineNumbers: bool,
  styleActiveLine: bool,
  readOnly: bool,
  indentUnit: number,
  theme: string
};

type Props = {
  code: string,
  onFocusChange: Function,
  options: Options
};

type DefaultProps = {
  code: string,
  onFocusChange: Function,
  options: Options
};


export default class Editor extends React.Component<Props, void> {

  options: Options;
  codeMirror: Object;
  editor: ?Element;

  static defaultProps = {
    code: js_beautify(settings.toString(), { indent_size: 2 }),
    onFocusChange(focused: bool) { },
    options: {
      autofocus: true,
      // Match tags addon
      matchTags: { bothTags: true },
      // Match bracket addon
      matchBrackets: true,
      // match-highlighter
      highlightSelectionMatches: { showToken: /\w/},
      // keymap
      keyMap: 'sublime',
      // mode
      mode: 'javascript',
      lineNumbers: true,
      styleActiveLine: true,
      readOnly: false,
      indentUnit: 2,
      theme: 'monokai'
    }
  };

  static propTypes = {
    options: PropTypes.shape({
      autoFocus: PropTypes.bool,
      mode: PropTypes.string.isRequired,
      lineNumbers: PropTypes.bool,
      styleActiveLine: PropTypes.bool,
      readOnly: PropTypes.bool,
      theme: PropTypes.string
    })
  };

  updateCode (newCode: string) : any {
    // return this.setState({
    //   code: newCode || 'newCode'
    // });
  }

  focusChanged (focused: bool) : any {
    // return this.setState({
    //   isFocused: focused || false
    // });
  }

  componentDidMount () : any {
    this.codeMirror = this.refs.editor.getCodeMirror();
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
  }

  componentWillUnmount () : any {
    // todo: is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
      /**
       * Very hacky way to unlink docs from CM
       * If we don't do this then the doc stays in memory and so does cm :-/
       */
      (this.codeMirror.getDoc()).cm = null;
    }
  }

  componentWillReceiveProps (nextProps: Object) {
    if (this.codeMirror && nextProps.code !== undefined && this.code != nextProps.code.toString()) {
      this.codeMirror.setValue(nextProps.code);
    }
  }

  render () {
    const { options, code } = this.props;
    // const { code } = this.state;
    return (
      /*<CodeMirror className="editor" ref={ editor => { this.editor = editor; }} value={ code } options={ options } onChange={ this.updateCode }/>*/
      <CodeMirror className="editor" ref="editor" value={ code } options={ options } onChange={ this.updateCode }/>
    );
  }
}

