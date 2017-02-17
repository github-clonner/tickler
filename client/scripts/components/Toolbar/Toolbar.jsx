import React, { Component, PropTypes } from 'react';
import path from 'path';
import './toolbar.css';

/* Redux stuff */
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from 'actions/Player';

function mapStateToProps(state) {
  return {
    toolbar: state.Player
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Toolbar extends Component {
  state = {
    toolbar: {
      equalizer: false,
      levels: false,
      coverflow: false
    },
    checked: true
  };

  static defaultProps = {
    toolbar: new Immutable.Map()
  };

  static propTypes = {
    toolbar: React.PropTypes.instanceOf(Immutable.Record).isRequired
  }

  componentDidMount () {
    this.setState({
      toolbar: this.props.toolbar.toJS()
    });
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.toolbar.size) {
      return;
    }
    this.setState({
      toolbar: nextProps.toolbar.toJS()
    });
  }

  handleOnChange = event => {
    let option = event.target.value;
    let {actions} = this.props;
    let {toolbar} = this.state;

    let values = Object.keys(toolbar).reduce((previous, key) => {
      previous[key] = (key === option) ? !this.state.toolbar[key] : false;
      return previous;
    }, {});

    actions.toolbarOptions(values);
    this.setState({
      toolbar: values
    });
  }

  makeButtons () {
    let toolbar = this.props.toolbar.toJS();
    let buttons = Object.keys(toolbar).map(button => {
      return (
        <li className="radio-button" key={button}>
          <input
            type="radio"
            name="toolbar"
            id={button}
            value={button}
            checked={toolbar[button]}
            onChange={this.handleOnChange}
          />
          <label className="radio-button" htmlFor={button}>
          <img src={path.resolve(`assets/images/${button}.svg`)}></img>
          </label>
        </li>
      );
    });
    return buttons;
  }

  render () {
    return (
      <ul className="toolbar">{this.makeButtons()}</ul>
    );
  }
}
