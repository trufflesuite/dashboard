import React from "react";

var Header = React.createClass({
  render: function() {
    return (
      <nav className="nav">
        <div className="nav-left">
          <a className="nav-item">
            <img src="/images/logo-horiz.png" alt="Bulma logo" />
          </a>
        </div>

        <div className="nav-center">
          <a className="nav-item">
            <span className="icon">
              <i className="fa fa-github"></i>
            </span>
          </a>
          <a className="nav-item">
            <span className="icon">
              <i className="fa fa-twitter"></i>
            </span>
          </a>
        </div>

        <span className="nav-toggle">
          <span></span>
          <span></span>
          <span></span>
        </span>

        <div className="nav-right nav-menu">
          <a className="nav-item" href="http://truffleframework.com">
            Home
          </a>
          <a className="nav-item" href="http://truffleframework.com/docs">
            Documentation
          </a>
          <a className="nav-item" href="http://truffleframework.com/tutorials">
            Tutorials
          </a>

          <span className="nav-item">
            <a className="button is-primary" href="http://truffleframework.com">
              <span>Get Started</span>
            </a>
          </span>
        </div>
      </nav>
    );
  }
});

export default Header;
