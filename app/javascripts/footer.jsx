import React from "react";

var Footer = React.createClass({
  render: function() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="content has-text-centered">
            <p>
              Made with &#x02764; across the USA.
            </p>
            {/*<p>
              <a className="icon" href="https://github.com/jgthms/bulma">
                <i className="fa fa-github"></i>
              </a>
            </p>*/}
          </div>
        </div>
      </footer>
    );
  }
});

export default Footer;
