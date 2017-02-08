import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';


import App from './index';

import { Home, About, NotFound } from './views';
/* redux stuff */
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import * as reducers from './reducers';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);
const history = syncHistoryWithStore(browserHistory, store);

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} name="Container">
        <IndexRoute component={Home} name='Home'/>
        <Route path="/about" component={About} />
      </Route>
      <Route path="/about" component={About} />
      <Redirect from="/*" to="/" />
      <Route path="*" component={NotFound} />
    </Router>
  </Provider>
), document.getElementById('app'))
