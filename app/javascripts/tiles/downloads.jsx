import React from "react";
import {Line} from 'react-chartjs-2';
import axios from "axios";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

var DownloadsTile = React.createClass({
  getInitialState: function() {
    return {
      data: null,
      total: ""
    };
  },

  componentDidMount: function() {
    var self = this;

    var date = new Date();
    date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    axios.get("https://api.npmjs.org/downloads/range/2015-05-01:" + date + "/truffle").then(function(response) {
      var total = 0;
      var downloads = response.data.downloads;
      var data = {
        labels: [],
        datasets: [
          {
            fill: false,
            lineTension: 0.3,
            backgroundColor: 'black',
            borderColor: 'white',
            pointBackgroundColor: 'white',
            pointBorderColor: 'white',
            pointHitRadius: 10,
            pointBorderWidth: 5,
            pointRadius: 1,
            pointHoverRadius: 5,
            data: []
          }
        ]
      };

      var dataset = data.datasets[0].data;

      function getMonth(day) {
        var d = new Date(day);
        return months[d.getMonth()] + " " + d.getFullYear();
      }

      var currentMonth = {
        label: getMonth(downloads[0].day),
        total: 0
      };

      downloads.forEach(function(item) {
        var month = getMonth(item.day);

        if (month != currentMonth.label) {
          data.labels.push(currentMonth.label);
          dataset.push(currentMonth.total);

          currentMonth = {label: month, total: 0};
        }

        currentMonth.total += item.downloads;
        total += item.downloads;
      });

      if (data.labels[data.labels.length - 1] != currentMonth.label) {
        data.labels.push(currentMonth.label);
        dataset.push(currentMonth.total);
      }

      self.setState({
        data: data,
        total: total
      });
    });
  },

  render: function() {
    var chart;

    if (this.state.data == null) {
      chart = <div/>;
    } else {
      chart = <Line data={this.state.data} options={{
        legend: {display: false},
        title: {display: true, text: "Lifetime Downloads"}
      }}/>;
    }

    return (
      <div className="tile">
        <div className="tile is-parent is-8">
          <div className="tile is-child notification is-primary">
            {chart}
          </div>
        </div>
        <div className="tile is-vertical is-parent">
          <div className="tile is-child notification is-warning">
            Total Downloads
            <br/>{this.state.total}
          </div>
          <div className="tile is-child notification is-warning">

          </div>
        </div>
      </div>
    );
  }
});

export default DownloadsTile;
