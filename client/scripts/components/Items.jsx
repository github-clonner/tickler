import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../actions/Playlist';
import Chance from 'chance';

function Items({ list, actions }) {
  console.log('list:', list.toJS());
  console.log('actions:', actions);
  let chance = new Chance();
  let newItem = () => ({
    "title": chance.sentence({words: 2}),
    "id": chance.hash({length: 15}),
    "duration": chance.second(),
    "file": "media/FurElise.ogg",
    "stars": chance.integer({min: 0, max: 5})
  })
  let getListStyle = function () {
    return {
      'padding': '0px 20px',
    }
  }
  let getItemStyle = function () {
    return {
      'display': 'flex',
      'justifyContent': 'space-between',
      'padding': '10px 0px'
    }
  }
  let getTitleStyle = function () {
    return {
      'flexBasis': '50%'
    }
  }
  return (
    <div>
      <h5>List:</h5>
      <hr />
      <button onClick={() => actions.addItem(newItem())}>AddItem</button>
      <ul style={getListStyle()}>
        {list.map(item => {
          let id = item.get('id');
          let title = item.get('title');
          let duration = item.get('duration');
          let isPlaying = item.get('isPlaying');
          return (
            <li key={id} style={getItemStyle()}>
              <a style={getTitleStyle()} onClick={() => action.playItem(id)}>{title}</a>
              <span>{duration}</span>
              <input
                name="isGoing"
                type="checkbox"
                checked={isPlaying}
                onChange={() => actions.playPauseItem(id, !isPlaying)}
              />
              <button onClick={() => actions.playPauseItem(id, !isPlaying)}>></button>
              <button onClick={() => actions.deleteItem(id)}>✖</button>
              <button onClick={() => actions.editItem(id, {
                duration: 1600
              })}>✎</button>
            </li>
          );
        })}
      </ul>
    </div>
  )
}


function mapStateToProps(state) {
  return {
    list: state.Playlist
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Items);

/*
export default connect(
  state => ({ number: state.count.number }),
  { increase, decrease }
)(Items)
*/