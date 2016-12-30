// modules/About.js
import React from 'react'
import Editor from './Editor';

export default class About extends React.Component {
  render() {
    return (
      <div>
        <Editor options={{
          mode: 'javascript',
          lineNumbers: true,
          styleActiveLine: true,
          theme: 'material'
        }}/>
      </div>
    )
  }
}
