import React from "react";
import {Line, Chart} from 'react-chartjs-2';
import axios from "axios";
import reduce from "async/reduce";
import moment from "moment";

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

  getMonth: function(day) {
    if (day instanceof Date == false) {
      day = new Date(day);
    }
    return months[day.getMonth()] + " " + day.getFullYear();
  },

  componentDidMount: function() {
    var self = this;

    var date = new Date();
    date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    var currentMonth = moment("2015-05-01");

    // Create array of requests to make
    var requests = [];

    while (currentMonth.toDate() < new Date()) {
      var start = moment(currentMonth.format("YYYY-MM-DD"));

      currentMonth.add(6, "months");

      var end = moment(currentMonth.format("YYYY-MM-DD"));

      // Add one day so there's no overlap
      requests.push([start.add(1, "day"), end]);
    }

    requests = requests.map(function(months) {
      var start = months[0];
      var end = months[1];
      return "https://api.npmjs.org/downloads/range/" + start.format("YYYY-MM-DD") + ":" + end.format("YYYY-MM-DD") + "/truffle";
    });

    reduce(requests, [], function(memo, item, callback) {
      axios.get(item).then(function(response) {
        var downloads = response.data.downloads;
        callback(null, memo.concat(downloads));
      }).catch(callback)
    }, function(err, downloads) {

      var total = 0;
      var showCurrent = window.location.hash.toLowerCase().indexOf("current") >= 0;

      var data = {
        labels: [],
        datasets: [
          {
            fill: false,
            lineTension: 0.3,
            borderWidth: 0.1,
            pointBackgroundColor: 'white',
            pointBorderColor: 'white',
            pointHitRadius: 10,
            pointBorderWidth: 5,
            pointRadius: 1,
            pointHoverBackgroundColor: "white",
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: "white",
            data: []
          },
          {
            fill: false,
            lineTension: 0.3,
            borderWidth: 0.1,
            pointBackgroundColor: 'black',
            pointBorderColor: 'black',
            pointHitRadius: 10,
            pointBorderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 5,
            pointHoverBorderColor: "white",
            pointStyle: "crossRot",
            data: [],
            hidden: !showCurrent
          }
        ]
      };

      // Set and id for later.
      data.__id = "Downloads";

      var maindataset = data.datasets[0].data;
      var actualdataset = data.datasets[1].data;

      var currentMonth = {
        label: self.getMonth(downloads[0].day),
        total: 0
      };

      downloads.forEach(function(item) {
        var month = self.getMonth(item.day);

        if (month != currentMonth.label) {
          // Update the labels.
          data.labels.push(currentMonth.label);

          // Update the datasets
          maindataset.push(currentMonth.total);
          actualdataset.push(null);

          currentMonth = {label: month, total: 0};
        }

        currentMonth.total += item.downloads;
        total += item.downloads;
      });

      // Don't add the last month for now (that's why this is commented out).

      // if (data.labels[data.labels.length - 1] != currentMonth.label) {
      //   data.labels.push(currentMonth.label);
      //   maindataset.push(currentMonth.total);
      //   actualdataset.push(null);
      // }

      var lastThreeMonths = (maindataset[maindataset.length - 1] + maindataset[maindataset.length - 2] + maindataset[maindataset.length - 3]);
      var prevThreeMonths = (maindataset[maindataset.length - 4] + maindataset[maindataset.length - 5] + maindataset[maindataset.length - 6]);

      var growth = (lastThreeMonths / prevThreeMonths) - 1;
      var direction = growth < 0 ? "down" : "up";
      growth = Math.floor(Math.abs(growth * 100));

      // Make sure the projected dataset has the last two points.
      // Then op off the last data point on the main dataset so the
      // projected dataset shows through.
      // var currentMonthDownloads = maindataset[maindataset.length - 1];
      // var lastMonthDownloads = maindataset[maindataset.length - 2];
      // var projectedCurrentMonthDownloads = parseInt(lastMonthDownloads * .9);
      //
      // var showProjected = projectedCurrentMonthDownloads > currentMonthDownloads;
      //
      // if (showProjected) {
      //   maindataset.pop();
      //   maindataset.push(projectedCurrentMonthDownloads)
      //
      //   actualdataset.pop();
      //   actualdataset.push(currentMonthDownloads);
      // }

      self.setState({
        data: data,
        total: total,
        growth: growth,
        growth_direction: direction,
        show_projected: false
      });
    });

    Chart.pluginService.register({
      afterDatasetsDraw: function (chart) {
        if (chart.config.data.__id == "Downloads") {
          self.drawCustomCurveLine(chart);
        };
      }
    });
  },

  drawCustomCurveLine: function(chart) {
    var self = this;

    var meta = chart.data.datasets[0]._meta;
    var points = meta[Object.keys(meta)[0]].data;

    var ctx = chart.chart.ctx;

    // Put points in a way the line algorith likes it.
    var _points = [];
    points.forEach(function(point) {
      _points.push(point._model.x);
      _points.push(point._model.y);
    });

    points = _points;

    ctx.save();
    ctx.globalCompositeOperation='destination-over';

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;

    var curveData = getCurve(points, 0.45, 30)

    // Draw main line. We're going to draw all lines between points
    // except for the last one.
    ctx.moveTo(points[0], points[1]);

    var lastAnchorPoint = curveData.anchors[curveData.anchors.length - 2];

    if (self.state.show_projected == false) {
      lastAnchorPoint = curveData.anchors[curveData.anchors.length - 1];
    }

    for (var i=2; i <= lastAnchorPoint; i+=2) {
      var x = curveData.points[i];
      var y = curveData.points[i+1];
      ctx.lineTo(x, y)
    }

    ctx.stroke()

    if (self.state.show_projected) {
      // Now draw the last portion of the line, but dashed.
      ctx.beginPath();
      ctx.setLineDash([10, 5]);

      for (var i = lastAnchorPoint + 1; i < curveData.points.length - 1; i += 2) {
        var x = curveData.points[i];
        var y = curveData.points[i+1];
        ctx.lineTo(x, y)
      }

      ctx.stroke()
    }

    ctx.restore()

    function getCurve(pts, tension, numOfSegments) {
      // use input value if provided, or use a default value
      tension = (typeof tension != 'undefined') ? tension : 0.5;
      numOfSegments = numOfSegments ? numOfSegments : 16;

      var _pts = [], res = [],    // clone array
        x, y,           // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i,       // steps based on num. of segments
        anchors;        // indexes of lines related to each point.

      anchors = [];
      anchors[0] = 0;

      // clone array so we don't change the original
      _pts = pts.slice(0);

      // The algorithm require a previous and next point to the actual point array.
      _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
      _pts.unshift(pts[0]);
      _pts.push(pts[pts.length - 2]); //copy last point and append
      _pts.push(pts[pts.length - 1]);

      // ok, lets start..

      // 1. loop goes through point array
      // 2. loop goes through each segment between the 2 pts + 1e point before and after
      for (var i = 2; i < (_pts.length - 4); i += 2) {
        for (var t = 0; t <= numOfSegments; t++) {
          // calc tension vectors
          t1x = (_pts[i+2] - _pts[i-2]) * tension;
          t2x = (_pts[i+4] - _pts[i]) * tension;

          t1y = (_pts[i+3] - _pts[i-1]) * tension;
          t2y = (_pts[i+5] - _pts[i+1]) * tension;

          // calc step
          st = t / numOfSegments;

          // calc cardinals
          c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
          c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
          c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
          c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

          // calc x and y cords with common control vectors
          x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
          y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

          //store points in array
          res.push(x);
          res.push(y);
        }

        anchors.push(res.length - 1);
      }

      return {
        points: res,
        anchors: anchors
      };
    }
  },

  numberWithCommas: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  render: function() {
    var self = this;
    var chart;

    if (this.state.data == null) {
      chart = <div/>;
    } else {
      chart = <Line ref='downloads' data={self.state.data} options={{
        legend: {display: false},
        title: {display: true, text: "Monthly Downloads (until last month)"},
        animation: false,
        tooltips: {
          displayColors: false,
          callbacks: {
            beforeTitle: function(tooltip) {
              // If it's the first dataset.
              if (tooltip[0].datasetIndex == 0) {
                var current = self.getMonth(new Date());

                if (tooltip[0].xLabel == current) {
                  return "Projected downloads in";
                } else {
                  return "Downloads in";
                }
              } else {
                // it's the actual data set for the current month. Display it as normal.
                return "Downloads in";
              }
            }
          }
        }
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
          <div className="tile is-child notification truffle-border descriptive-tile">
            <div>
              Lifetime Downloads
            </div>
            <div className="content is-large is-marginless">
              <h1 className="is-marginless">{this.numberWithCommas(this.state.total)}</h1>
            </div>
            <div></div>
          </div>
          <div className="tile is-child notification truffle-border descriptive-tile">
            <div>
              Last Three Months
            </div>
            <div className="content is-large is-marginless">
              <h1 className="white is-marginless">{this.state.growth_direction} {this.state.growth}%</h1>
            </div>
            <div>
              * excludes current month
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default DownloadsTile;
