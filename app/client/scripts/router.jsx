import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';


import App from './index';
import HomePage from './views/Home';
import About from './views/About';
import NotFound from './views/NotFound';

/*const findDOMNode = ReactDOM.findDOMNode;
const gui = require('nw.gui');
const os = require('os');
const EventEmitter = require('events');
const appEmitter = new EventEmitter();
const fs = require('fs');
*/

import EventEmitter from 'events';
//import gui from 'nw.gui';
//import os from 'os';
//import fs from 'fs';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

render((
  <Router history={browserHistory}>
    <Route path="/" component={App} name="Container">
      <IndexRoute component={HomePage} name='Home'/>
      <Route path="/about" component={About}/>
    </Route>
    <Route path="/about" component={About}/>
    <Redirect from="/*" to="/" />
    <Route path="*" component={NotFound} />
  </Router>
), document.getElementById('app'))

console.log('sdfgsdfg453345 worldxXXXX')
