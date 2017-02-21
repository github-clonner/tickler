import React from 'react';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute } from 'react-router';
import { Main, Home, About, NotFound, NewList } from './views';

export default (
  <Route path="/" component={Main} name="Main">
    <IndexRoute component={Home} name='Home'/>
    <Route path="/about" component={About} />
    <Route path="/new-list" component={NewList} />
    <Redirect from="/*" to="/" />
    <Route path="*" component={NotFound} />
  </Route>
);