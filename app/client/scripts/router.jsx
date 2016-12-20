import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';

/*const findDOMNode = ReactDOM.findDOMNode;
const gui = require('nw.gui');
const os = require('os');
const EventEmitter = require('events');
const appEmitter = new EventEmitter();
const fs = require('fs');
*/

import EventEmitter from 'events';
import gui from 'nw.gui';
import os from 'os';
import fs from 'fs';

class Product {
  constructor(connect) {
    this.connect = connect;
  }

  request() {
    return Promise.resolve(new Date())
  }
}

console.log('hello worldx', gui)