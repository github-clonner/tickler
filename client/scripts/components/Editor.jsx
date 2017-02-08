import React from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';

const Editor = () =>
  <CodeMirror options={{
    mode: 'javascript',
    lineNumbers: true,
    styleActiveLine: true,
    theme: 'material'
  }} />

export default Editor;
