import React from 'react';

export default React.createClass({

  render() {
    return (
      <nav className="navbar navbar-default">
          <div className="container-fluid">
              <div className="navbar-header">
                <a href="#" className="navbar-brand">Brand</a>
              </div>
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-5">
                  <p className="navbar-text navbar-right">Signed in as <a href="#" className="navbar-link">Mark Otto</a></p>
              </div>
          </div>
      </nav>
    );
  }
});
