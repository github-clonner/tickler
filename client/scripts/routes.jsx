import React, { ReactDOM, Component, PropTypes } from 'react'
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute, Link, Switch } from 'react-router-dom';
// import { Main, Home, About, NotFound, NewList } from './views';

// export default (
//   <Route path="/" component={Main} name="Main">
//     <IndexRoute component={Home} name='Home'/>
//     <Route path="/about" component={About} />
//     <Route path="/new-list" component={NewList} />
//     <Redirect from="/*" to="/" />
//     <Route path="*" component={NotFound} />
//   </Route>
// );

class App extends React.Component {

    render() {

        return (
            <div>
                <h1>App component</h1>
                <br/>
                <Link to="/about">About</Link>
                <Link to="foo/name">foo</Link>
                {this.props.children}
            </div>
        )
    }
}

class About extends React.Component {

    render() {
        return (
            <div>
                <h1>Kitchen sink component</h1>
            </div>
        )
    }
}

class NotFound extends React.Component {

    render() {
        return (
            <div>
                <h1>404</h1>
            </div>
        )
    }
}

export default (
  <Switch>
    <Route exact path="/" component={App} />
    <Route path="/about" component={About}/>
    <Redirect from="/*" exact to="/" />
  </Switch>
);