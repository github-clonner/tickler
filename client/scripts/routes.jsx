import React, { ReactDOM, Component } from 'react'
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute, Link, Switch } from 'react-router-dom';
// import { Main, Home, About, NotFound, NewList } from './views';
import { Main, About, NewList } from './containers';
// import { Main, Home, About, NotFound, NewList } from './views';

export default (
  <Switch>
    <Route exact path="/" component={ Main } />
    <Route path="/about" component={ About } />
    <Route path="/new-list" component={ NewList } />
    <Redirect from="/*" exact to="/" />
  </Switch>
);