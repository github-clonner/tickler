import React, { ReactDOM, Component } from 'react'
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute, Link, Switch } from 'react-router-dom';
import { Main, About, NewList } from './containers';

export default (
  <Switch>
    <Route exact path="/" component={ Main } />
    <Route path="/about" component={ About } />
    <Route path="/list" component={ NewList } />
    <Redirect from="/*" exact to="/" />
  </Switch>
);