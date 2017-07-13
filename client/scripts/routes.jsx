import React, { ReactDOM, Component, PropTypes } from 'react'
import { render } from 'react-dom';
import { Router, Route, Redirect, hashHistory, browserHistory, IndexRoute } from 'react-router';
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

class App extends Component {

    render() {

        return (
            <div>
                <h1>App component</h1>
                <Link to="/">Hjem</Link>
                <br/>
                <Link to="about">About</Link>
                {this.props.children}
            </div>
        )
    }
}

class About extends Component {

    render() {
        return (
            <div>
                <h1>Kitchen sink component</h1>
            </div>
        )
    }
}


export default (
  <Route path="/" component={App}>
    <Route path="about" component={About}/>
  </Route>
);