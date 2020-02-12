import React from "react";
import moment from "moment";
import {Line} from 'react-chartjs-2';
import axios from "axios";
import {parellel, mapSeries} from "async";
import parselink from "parse-link-header";
import Tokens from "../tokens.js";

var StargazersTile = React.createClass({
  getInitialState: function() {
    return {
      data: null,
      total: "",
      access_token: Tokens.random()
    };
  },

  requestStarsForProject: function(project, callback) {
    var self = this;

    var set = {
      data: {}
    };

    var labels = set.labels;
    var data = set.data;

    var count = 0;

    function processResponse(response) {
      response.data.forEach(function(stargazer) {
        var date = new Date(stargazer.starred_at);
        var bucket = new Date(date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate());
        bucket = bucket.toISOString();

        if (set.data[bucket] == null) {
          set.data[bucket] = 0;
        }

        set.data[bucket] += 1;
      });
    }

    axios.request({
      url: "https://api.github.com/repos/" + project + "/stargazers",
      headers: {
        Accept: "application/vnd.github.v3.star+json",
        Authorization: "token " + this.state.access_token
      }
    }).then(function(response) {
      processResponse(response);

      var links = parselink(response.headers.link);

      var next = parseInt(links.next.page);
      var last = parseInt(links.last.page);

      var requests = [];
      var current = next;

      while (current <= last) {
        requests.push(axios.request({
          url: "https://api.github.com/repos/" + project + "/stargazers?page=" + current,
          headers: {
            Accept: "application/vnd.github.v3.star+json",
            Authorization: "token " + self.state.access_token
          }
        }));

        current += 1;
      }

      return Promise.all(requests);
    }).then(function(responses) {
      responses.forEach(processResponse);
      callback(null, set);
    }).catch(function(e) {
      console.log(e);
      callback(e);
    });
  },

  componentDidMount: function() {
    var self = this;

    mapSeries(this.props.projects, function(project, finished) {
      self.requestStarsForProject(project, finished);
    }, function(err, sets) {
      if (err) return console.log(err);

      // Push all the labels together, sort, and remove duplicates.
      var prev = -1;

      var labels = [];
      labels = labels.concat.apply(labels, sets.map(function(set) {
        // Get only the labels from these arrays.
        return Object.keys(set.data);
      })).sort().filter(function(label) {
        var keep = label != prev;
        prev = label;
        return keep;
      });

      // Now go through each set and create a history of that data for the full time period.
      var fulldata = sets.map(function(set) {
        var count = 0;
        var final = [];

        // Go through each label, maintaining a count at that point in time.
        labels.forEach(function(label) {
          if (set.data[label] == null && count == 0) {
            final.push(null);
            return;
          }

          if (set.data[label] != null) {
            count += set.data[label];
          }

          final.push(count);
        });

        return {
          data: final,
          total: count
        };
      });

      self.setState({
        data: fulldata,
        labels: labels
      })
    });
  },

  numberWithCommas: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  render: function() {
    var self = this;
    var chart;

    // Colors from here: http://bulma.io/documentation/overview/variables/
    var colors = [
      "#3fe0c5",
      "#e4a663",
      "#f069d6",
      "#b86bff"
    ];

    if (this.state.data == null) {
      chart = <div/>;
    } else {
      var datasets = this.state.data.map(function(data, index) {
        var project = self.props.projects[index];
        var name = project.substring(project.indexOf("/") + 1);

        return {
          label: name + " (" + data.total + ")",
          fill: false,
          lineTension: 0.3,
          backgroundColor: colors[index],
          borderColor: colors[index],
          pointBackgroundColor: colors[index],
          pointBorderColor: colors[index],
          pointHitRadius: 2,
          pointBorderWidth: 1,
          pointRadius: 1,
          pointHoverRadius: 5,
          data: data.data
        }
      });

      chart = <Line data={{
        labels: this.state.labels,
        datasets: datasets
      }} options={{
        animation: false,
        legend: {
          labels: {
            fontColor: "white",
            boxWidth: 20
          }
        },
        title: {
          display: true,
          text: "Github Stars",
          fontColor: "white"
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "white"
            },
            type: 'time',
            time: {
              max: new Date(this.state.labels[this.state.labels.length - 1])
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: "white"
            }
          }]
        },
        tooltips: {
          enabled: false
        }
      }}/>;
    }

    return (
      <div className="tile is-parent">
        <div className="tile is-child notification milk-chocolate">
          {chart}
        </div>
      </div>
    );
  }
});

export default StargazersTile;
