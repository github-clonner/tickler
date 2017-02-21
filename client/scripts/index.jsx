import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';

/* redux stuff */
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import * as reducers from './reducers';

/* router */
import routes from './routes.jsx';
/* clipboard manager */
import ClipBoardData from 'lib/ClipBoardData';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);
const history = syncHistoryWithStore(browserHistory, store);

const clipBoardData = new ClipBoardData();
clipBoardData.events.on('data', data => {
  history.push({
    pathname: '/new-list',
    query: { 
      modal: true 
    },
    state: {
      list: data.list,
      video: data.v
    }
  });
})

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

render((
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
), document.getElementById('app'));