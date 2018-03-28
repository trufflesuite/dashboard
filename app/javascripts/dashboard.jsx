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

            <h3>TRUFFLE</h3>
            <div className="tile is-ancestor">
              <div className="tile is-12">
                <DownloadsTile colorClass="is-truffle" packageName="truffle" startDate="2015-05-01" />
              </div>
            </div>

            <h3>GANACHE (ganache-cli)</h3>
            <div className="tile is-ancestor">
              <div className="tile is-12">
                <DownloadsTile colorClass="is-ganache" packageName="ganache-cli" startDate="2017-10-01" />
              </div>
            </div>

            <h3>DRIZZLE</h3>
            <div className="tile is-ancestor">
              <div className="tile is-12">
                <DownloadsTile colorClass="is-drizzle" packageName="drizzle" startDate="2017-12-01" />
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
