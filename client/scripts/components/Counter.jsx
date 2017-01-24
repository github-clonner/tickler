import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { increase, decrease } from '../actions/count';
import * as Count from '../actions/count';
import * as Actions from '../actions';

function Home({ number, actions }) {
  return (
    <div>
      Some state changes:
      {number}
      <button onClick={() => actions.increase(1)}>Increase</button>
      <button onClick={() => actions.decrease(1)}>Decrease</button>
    </div>
  )
}


function mapStateToProps(state) {
  return {
    number: state.count.number
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Count, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

/*
export default connect(
  state => ({ number: state.count.number }),
  { increase, decrease }
)(Home)
*/