// modules/About.js
import React from 'react'
import Editor from '../components/Editor';
import Spectrum from '../components/Spectrum';

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
        <Spectrum />
      </div>
    )
  }
}
