import React from 'react';

export default class Video extends React.Component {

  render () {
    return (
      <video id="video2" width="100%" controls autopla>
        <source src="http://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        <source src="http://www.w3schools.com/html/mov_bbb.ogg" type="video/ogg" />
      </video>
    )
  }
}
