import React from 'react';
import styles from '../../styles/progress.css';

export default class Progress extends React.Component {
  static propTypes = {
    progress: React.PropTypes.number
  };

  static defaultProps = {
    progress: 0
  };

  render () {
    let progressStyle = {
      color: 'blue',
      width: this.props.progress + '%'
    };
    return (
      <div className="progress">
        <div className="bar" style={progressStyle}></div>
        <div className="tip">50%</div>
      </div>
    )
  }
}
