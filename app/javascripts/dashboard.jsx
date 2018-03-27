import "../stylesheets/dashboard.scss";

import React from "react";
import ReactDOM from "react-dom";

import Header from "./header.jsx";
import Footer from "./footer.jsx";

import DownloadsTile from "./tiles/downloads.jsx";
import StargazersTile from "./tiles/stargazers.jsx";
import TotalDownloadsTile from "./tiles/totaldownloads.jsx";

var Dashboard = React.createClass({
  render: function() {
    return (
      <div className="dashboard">
        <Header />

        <div className="section">
          <div className="container">

            <h1 className="title">Downloads</h1>
            <h2 className="subtitle">
              Over the lifetime of Truffle, from inception to now.
            </h2>
            <div className="tile is-ancestor">
              <div className="tile is-12">
                <DownloadsTile />
              </div>
            </div>

            <h1 className="title">Developer Adoption</h1>
            <h2 className="subtitle">
              Truffle Suite's usage by developers over time.
            </h2>
            <div className="tile is-ancestor">
              <div className="tile is-12">
                <StargazersTile projects={["trufflesuite/truffle", "trufflesuite/ganache", "trufflesuite/drizzle"]}/>
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
