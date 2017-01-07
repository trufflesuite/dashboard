import React from "react";
import {Polar} from 'react-chartjs-2';
import axios from "axios";
import colors from "../colors.js";

var TotalDownloadsTile = React.createClass({
  getInitialState: function() {
    return {
      data: null
    };
  },

  componentDidMount: function() {
    var self = this;

    var date = new Date();
    date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    var packages = this.props.packages.join(",");

    axios.get("https://api.npmjs.org/downloads/range/2015-05-01:" + date + "/" + packages).then(function(response) {
      var results = response.data;

      Object.keys(results).forEach(function(package_name) {
        var pkg = results[package_name];

        pkg.downloads = pkg.downloads.reduce(function(total, item) {
          return total + item.downloads;
        }, 0)
      });

      self.setState({
        data: results
      });
    }).catch(function(e) {
      console.log(e);
    });
  },

  render: function() {
    var self = this;
    var chart;

    if (this.state.data == null) {
      chart = <div/>;
    } else {
      chart = <Polar data={{
        labels: self.props.packages,
        datasets: [
          {
            backgroundColor: [
              colors.turquoise,
              colors.yellow,
              colors.blue
            ],
            data: self.props.packages.map(function(package_name) {
              return self.state.data[package_name].downloads;
            })
          }
        ]
      }} options={{
        legend: {display: false},
        title: {display: true, text: "Total Downloads"}
      }}/>;
    }

    return (
      <div className="tile is-parent is-6">
        <div className="tile is-child notification">
          {chart}
        </div>
      </div>
    );
  }
});

export default TotalDownloadsTile;
