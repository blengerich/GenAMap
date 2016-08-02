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

var colorScale;
var xScale;
var yScale;

var Graph = function() {
  d3.select('#manhattanChart').selectAll('svg').remove()

  /************************************
  *** visualization setup functions ***
  ************************************/

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

  /* hover tooltip */
  function hoverOnCell(d, mousePos) {
    var labelText = "<h2>Marker: " + d.marker + "</h2>"
                  + "<p><b>Chromosome: </b>" + d.chromosome + "</p>"
                  + "<p><b>Position: </b>" + d.chromosomePosition + "</p>"
                  + "<p><b>p-value: </b>" + d.pVal + "</p>"
    var tooltip = d3.select("#manhattanChart")
                    .append("div")
                    .attr("class", "tooltip")
                    .html(labelText)
                    .style("position", "absolute")
                    .style("left", mousePos.pageX + "px")
                    .style("top", mousePos.pageY + "px")
  }

  function hoverOutCell() {
    d3.select(".tooltip").remove();
  }

  // parse marker data
  function parseData() {
    // TODO: connect to runAnalysis
    const dataPath = 'tempData'
    const markerLabelFile = 'markerLabelsReal.txt'
    const pValsFile = 'pvals.txt'

    // used for scaling axes
    var maxPValLog = 0
    var maxChromosome = 0

    var markerData = []

    d3.text(dataPath + "/" + markerLabelFile, function(text) {
      var markerData =
      d3.tsv.parseRows(text, function(d) {
        maxChromosome = Math.max(maxChromosome, +d[1])
        return {
          marker: d[0],
          chromosome: +d[1],
          chromosomePosition: +d[2]
        }
      })

      // get cummulative positions
      var cummulativePosition = new Array(maxChromosome + 1).fill(0)
      markerData.forEach(function (d, i) {
        cummulativePosition[d.chromosome] = Math.max(cummulativePosition[d.chromosome], d.chromosomePosition)
      })

      for (var i = 1; i <= maxChromosome; i++) {
        cummulativePosition[i] = cummulativePosition[i] + cummulativePosition[i - 1] + 1
      }

      var maxPosition = 0
      markerData.forEach(function (d, i) {
        d.position = d.chromosomePosition + cummulativePosition[d.chromosome - 1] + 1
        maxPosition = Math.max(maxPosition, d.position)
      })

      // finalize visualization
      d3.text(dataPath + "/" + pValsFile, function(text) {
        d3.csv.parseRows(text, function(d, i) {
          const log10 = (x) => Math.log(x)/Math.log(10)
          maxPValLog = Math.max(maxPValLog, -log10(+d[0]))
          markerData[i].pVal = -log10(+d[0])
        })

        colorScale = d3.scale.linear()
                              .domain([0, maxChromosome])
                              .range(["red", "blue"])
        xScale = d3.scale.linear()
                          .domain([0, maxPosition])
                          .range([0, mapWidth])
        yScale = d3.scale.linear()
                          .domain([0, maxPValLog * 1.2])
                          .range([mapHeight, 0])

        var cards = svg.selectAll('circle')
                       .data(markerData, function(d) { return d.marker })

        cards.enter().append('circle')
                     .attr('cx', function(d) { return xScale(d.position) })
                     .attr('cy', function(d) { return yScale(d.pVal) })
                     .attr('class', 'cell')
                     .attr('r', cellRadius)
                     .attr('value', function(d) { return d.pVal })
                     .on('mouseover', function(d) {
                       var mousePos = d3.event;
                       hoverOnCell(d, mousePos);
                       d3.select(d3.event.target).classed("manhattanHighlight", true);
                     })
                     .on('mouseout', function(d) {
                       hoverOutCell();
                       d3.select(d3.event.target).classed("manhattanHighlight", false);
                     });

        cards.transition().duration(100)
             .attr('fill', function(d) { return colorScale(d.chromosome) })

        cards.exit().remove()
      })
    })
  }

  /****************************
  ***** begin main script *****
  ****************************/

  const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  const totalWidth =  windowWidth * 0.95;
  const totalHeight = windowHeight * 0.65;

  var cellRadius = 5;

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
  parseData()
}

var GMManhattanChart = React.createClass({
  validateNewProps(nextProps) {
    return (this.props.pageParams !== nextProps.pageParams)
  },
  componentWillReceiveProps(nextProps) {
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
