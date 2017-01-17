import React from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';

export default class Editor extends React.Component {

  render () {
    return (
      <CodeMirror options={{
        mode: 'javascript',
        lineNumbers: true,
        styleActiveLine: true,
        theme: 'material'
      }} />
    )
  }

}
