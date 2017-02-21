import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { List, Map } from 'immutable';
import * as Actions from 'actions/Playlist';

function mapStateToProps(state) {
  return {
    list: state.PlayListItems,
    info: state.PlayList
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
  }

  componentDidMount () {
    let { actions, location } = this.props;
    actions.fetchList(location.state.list);
    actions.fetchListItems(location.state.list);
  }

  render() {
    let { location, list, info } = this.props;
    return (
      <div>
        <h1>{ location.state.list }</h1>
        <h1>{ location.state.video }</h1>
        <hr />
        <ul>
          { 
            Object.keys(info.toJS()).map(item => {
              return <li key={item}><pre>{item}: {info.get(item)}</pre></li>
            }) 
          }
        </ul>
        <hr />
        <ul>
          {
            list.map((item, index) => {
              let song = item.toJS();
              return <li key={index}>{song.title}</li>
            })
          }
        </ul>
      </div>
    );
  }
}
