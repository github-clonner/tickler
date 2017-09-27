// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Inspector.jsx                                             //
// @summary      : Content inspector                                         //
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
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import fs from 'fs';
import path from 'path';
import { connect } from 'react-redux';
import querystring from 'querystring';
import url from 'url';
import { js_beautify } from 'js-beautify';
import jsonata from 'jsonata';
import * as Actions from '../../actions/PlayList';
import * as Settings from '../../actions/Settings';
import { Header, Toolbar, Editor, Player } from '../../components';
import { read, write, remove } from '../../lib/FileSystem';
import Style from './Inspector.css';

type Props = {
  file: string,
  options: Object
};

const optionsQuery = jsonata(`
  $.(
    $toNumber := function($x) { $length($x) < 1 ? 0 : $number($x) };
    $.{
      'mode': $string(mode),
      'indentUnit': $number(indentUnit),
      'indentWithTabs': $boolean(indentWithTabs),
      'smartIndent': $boolean(smartIndent),
      'tabSize': $number(tabSize),
      'lineSeparator': $string(lineSeparator),
      'specialChars': specialChars,
      'electricChars': $boolean(electricChars),
      'inputStyle': $string(inputStyle),
      'spellcheck': $boolean(spellcheck),
      'rtlMoveVisually': $boolean(rtlMoveVisually),
      'wholeLineUpdateBefore': $boolean(wholeLineUpdateBefore),
      'theme': $string(theme),
      'keyMap': $string(keyMap),
      'extraKeys': extraKeys,
      'configureMouse': configureMouse,
      'lineWrapping': $boolean(lineWrapping),
      'gutters': gutters,
      'fixedGutter': $boolean(fixedGutter),
      'coverGutterNextToScrollbar': $boolean(coverGutterNextToScrollbar),
      'scrollbarStyle': $string(scrollbarStyle),
      'lineNumbers': $boolean(lineNumbers),
      'firstLineNumber': $number(firstLineNumber),
      'showCursorWhenSelecting': $boolean(showCursorWhenSelecting),
      'resetSelectionOnContextMenu': $boolean(resetSelectionOnContextMenu),
      'lineWiseCopyCut': $boolean(lineWiseCopyCut),
      'pasteLinesPerSelection': $boolean(pasteLinesPerSelection),
      'readOnly': $boolean(readOnly),
      'disableInput': $boolean(disableInput),
      'dragDrop': $boolean(dragDrop),
      'allowDropFileTypes': allowDropFileTypes,
      'cursorBlinkRate': $number(cursorBlinkRate),
      'cursorScrollMargin': $number(cursorScrollMargin),
      'cursorHeight': $number(cursorHeight),
      'singleCursorHeightPerLine': $boolean(singleCursorHeightPerLine),
      'workTime': $number(workTime),
      'workDelay': $number(workDelay),
      'flattenSpans': $boolean(flattenSpans),
      'addModeClass': $boolean(addModeClass),
      'pollInterval': $number(pollInterval),
      'undoDepth': $number(undoDepth),
      'historyEventDelay': $number(historyEventDelay),
      'viewportMargin': $number(viewportMargin),
      'maxHighlightLength': $number(maxHighlightLength),
      'moveInputWithCursor': $boolean(moveInputWithCursor),
      'tabindex': $toNumber(tabindex),
      'autofocus': $boolean(autofocus),
      'direction': $string(direction),
      'matchTags': $boolean(matchTags)
    }
  )
`);

function mapStateToProps (state, ownProps) {
  console.log('ownProps', ownProps);
  const file = decodeURIComponent(ownProps.match.params.file);
  const { query, pathname } = url.parse(file, true);
  // Extract params, apply transform, remove undefined
  const options = Object.entries(optionsQuery.evaluate(query)).reduce((acc, [option, value]) => {
    return value ? Object.assign({}, acc, {
      [option]: value
    }) : acc;
  }, state.Settings.get('inspector'));

  return {
    file: pathname,
    options: options
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class Inspector extends Component<Props, void>  {

  static propTypes = {
    file: PropTypes.string,
    options: PropTypes.object
  };

  load (file: string) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isFile()) {
        try {
          const data = read(file);
          return js_beautify(JSON.stringify(data), { indent_size: 2 });
        } catch (error) {
          console.error(error);
          throw error;
        }
      } else {
        throw new Error('Invalid file format');
      }
    } else {
      throw new Error('File not found');
    }
  }

  render () {
    const { file, options } = this.props;
    const code = this.load(file);
    console.log('file, options', Style, file, options);
    return (
      <div className={ Style.frame }>
        <Header />
        <Editor className={ Style.content } file={ file } options={ options } code={ code } />
        <Player />
      </div>
    );
  }
};
