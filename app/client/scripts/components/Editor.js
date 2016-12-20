import React from 'react';
import { findDOMNode } from 'react-dom';
//import CodeMirror from 'codemirror';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/monokai.css';

export default class Editor extends React.Component {

  render () {
    return (
      <CodeMirror options={{
        mode: 'javascript',
      }} />
    )
  }
  /*
  static propTypes = {
    className: React.PropTypes.any,
    codeMirrorInstance: React.PropTypes.func,
    defaultValue: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onFocusChange: React.PropTypes.func,
    onScroll: React.PropTypes.func,
    options: React.PropTypes.object,
    path: React.PropTypes.string,
    value: React.PropTypes.string,
    preserveScrollPosition: React.PropTypes.bool,
  }

  componentDidMount () {
    const textareaNode = findDOMNode(this.refs.textarea);
    const codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options);
    //appEmitter.on('getCodeMirror', this.getCodeMirror.bind(this));
  }

  getCodeMirror (callback) {
    return callback(this.codeMirror);
  }

  getCodeMirrorInstance () {
    return this.props.codeMirrorInstance || CodeMirror;
  }

  render () {
    return (
      <div>
        <textarea ref="textarea" name={this.props.path} defaultValue={this.props.value} autoComplete="off" />
      </div>
    );
  }
  */

}
