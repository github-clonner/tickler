import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { List, Map } from 'immutable';
import * as Actions from 'actions/Playlist';

function mapStateToProps(state) {
  return {
    list: state.PlayListItems
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class NewList extends Component {

  constructor (context) {
    super(context);
    console.log(arguments)
  }

  componentDidMount () {
    let { actions, location } = this.props;
    console.log(this)
    actions.fetchList(location.state.list);
    actions.fetchListItems(location.state.list);
  }

  render() {
    let { location } = this.props;
    return (
      <div>
        <h1>{ location.state.list }</h1>
        <h1>{ location.state.video }</h1>
      </div>
    );
  }
}
