import {} from "bulma";
import {} from "../stylesheets/dashboard.scss";

import React from "react";
import ReactDOM from "react-dom";

import Header from "./header.jsx";
import Footer from "./footer.jsx";

import DownloadsTile from "./tiles/downloads.jsx";

var Dashboard = React.createClass({
  render: function() {
    return (
      <div>
        <Header />

        <div className="section">
          <div className="container">

            <div className="tile is-ancestor">
              <div className="tile is-12">
                <DownloadsTile />
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    );
  }
});

window.onload = function() {
  ReactDOM.render(<Dashboard/>, document.getElementById('main'));
};
