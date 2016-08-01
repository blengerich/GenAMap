import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

import config from '../../config'

var axisOnZoom;
var zoomFunction;
var mapWidth;
var mapHeight;
var miniZoomed;

var Graph = function() {
  d3.select('#manhattanChart').selectAll('svg').remove()

  /* initialize axes and axis labels */
  function initAxes() {
    var axes = d3.select("#manhattanRoot")
                 .append("g")
                 .attr("class", "axes")
                 .attr("transform", "translate(" + axisPadding + ",0)");

    // borders
    axes.append("line")
        .attr("x2", mapWidth + margin.left)
        .attr("y1", mapHeight + margin.bottom)
        .attr("y2", mapHeight + margin.bottom);
    axes.append("line")
        .attr("y2", mapHeight + margin.bottom);

    // TODO: horizontal labels

    var xText = axes.append("text")
                    .attr("class", "title")
                    .attr("text-anchor", "middle")
                    .attr("y", mapHeight/2)
                    .attr("transform", "translate(" + (-axisPadding + baseLabelStyle.titleSize)
                      + ",0)rotate(-90,0," + mapHeight/2 + ")")
    xText.append("tspan")
         .text("-log")
    xText.append("tspan")
         .attr("baseline-shift", "sub")
         .text("10")
    xText.append("tspan")
         .text("(P)")

    // TODO: vertical labels

    axes.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", mapHeight)
        .attr("x", mapWidth/2)
        .attr("transform", "translate(0," + axisPadding + ")")
        .text("Chromosome");

    // opaque bottom-left selector
    axes.append("rect")
        .attr("x", -(axisPadding + margin.left))
        .attr("y", mapHeight + margin.bottom)
        .attr("width", axisPadding + margin.left)
        .attr("height", axisPadding + margin.bottom)
        .attr("fill", "#fff");

    d3.selectAll(".title")
      .style("font-size", baseLabelStyle.titleSize + "px");
    d3.selectAll(".row text")
      .style("font-size", baseLabelStyle.fontSize + "px");
    d3.selectAll(".col text")
      .style("font-size", baseLabelStyle.fontSize + "px");
  }

  /****************************
  ***** begin main script *****
  ****************************/

  const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  const totalWidth =  windowWidth * 0.95;
  const totalHeight = windowHeight * 0.65;

  var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;

  const axisPadding = 60;
  const margin = { top: 0, right: rightMargin, bottom: 5, left: 5 }

  mapWidth = totalWidth - axisPadding - margin.left
  mapHeight = totalHeight - axisPadding - margin.bottom

  const baseLabelStyle = { fontSize: 10, maxFontSize: 18, titleSize: 20, innerMargin: 8 };

  var svg = d3.select("#manhattanChart")
              .append("svg")
              .attr("id", "manhattanRoot")
              .attr("width", totalWidth)
              .attr("height", totalHeight)
                .append("svg")
                .attr("width", mapWidth)
                .attr("height", mapHeight)
                .attr("id", "manhattanHolder")
                .attr("x", axisPadding + margin.left)
                .attr("y", margin.top)
                .append("g")
                  .attr("id", "manhattanMap")

  initAxes()
}

var GMManhattanChart = React.createClass({
  validateNewProps(nextProps) {
    return !!nextProps
  },
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    if (this.validateNewProps(nextProps)) {
      this.setState({
        points: Graph()
      })
    }
  },
  getInitialState() {
    return {
      points: []
    }
  },
	render() {
		return (
      <div>
        <div id="manhattanChart" style={{ "marginTop": "25px" }}>
        </div>
        <div id="manhattanBottomPanel">
          <ul className="buttonContainer">
            <li className="zoomButton">
              <a id="zoom-in" data-zoom="+1">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">add</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="zoom-out" data-zoom="-1">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">remove</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="reset" data-zoom="-8">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">settings_backup_restore</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
          </ul>
        </div>
      </div>
		);
	}
});

export default GMManhattanChart
