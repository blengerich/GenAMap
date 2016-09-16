import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

import fetch from './fetch'
import config from '../../config'

var axisOnZoom;
var zoomFunction;
var mapWidth;
var mapHeight;
var miniZoomed;
var overlayWidth;
var overlayHeight;

var colorScale;
var xScale;
var yScale;

var Graph = function(data, markerLabels, traitLabelsNum) {
  d3.select('#manhattanChart').selectAll('svg').remove()
  /************************************
  *** visualization setup functions ***
  ************************************/
    //  console.log(markerLabels)
    //  console.log(data)
    //  console.log(traitLabelsNum)
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
    /*
     * TODO: connect to runAnalysis
     * temp data is not tracked
     */
      var parsedData = []

      // used for scaling axes
      var maxPValLog = 0
      var maxChromosome = 0

      var markerData = []

      markerLabels.forEach(function(row, rowIndex){
        if (row.length > 0){
          var pts = row.split(',')
          markerData.push({
            index: rowIndex,
            marker: pts[0],
            chromosome: +pts[1],
            chromosomePosition: +pts[2]
          })
        }
        }
      )


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
        // d.position = d.chromosomePosition + cummulativePosition[d.chromosome - 1] + 1
        maxPosition = Math.max(maxPosition, d.index)
      })

      // finalize visualization
      data.v.split(";").forEach(function(row, rowIndex){
        if (row.length > 0) {
          var pts = row.split(",")
          const log10 = (x) => Math.log(x)/Math.log(10)
          // maxPValLog = Math.max(maxPValLog, -log10(+pts[0]))
          maxPValLog = Math.max(maxPValLog, +pts[traitLabelsNum])
          // console.log(pts[0])
          // markerData[rowIndex].pVal = -log10(+pts[0])
          markerData[rowIndex].pVal = Math.abs(+pts[traitLabelsNum])
        }
      })

      // console.log(markerData)

        colorScale = d3.scale.linear()
                              .domain([0, maxChromosome])
                              .range(["red", "blue"])
        xScale = d3.scale.linear()
                          .domain([0, maxPosition])
                          .range([cellRadius, mapWidth - cellRadius])
        yScale = d3.scale.linear()
                          .domain([0, maxPValLog * 1.1])
                          .range([mapHeight - cellRadius, 0])

        var cards = svg.selectAll('circle')
                       .data(markerData, function(d) { return d.marker })

        cards.enter().append('circle')
                     .attr('cx', function(d) { return xScale(d.index) })
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
  }

  /*************************
  **** zoom functions *****
  *************************/

  axisOnZoom = function(translateAmount, zoomAmount) {
  }

  zoomFunction = function() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    var zoomAmount = d3.event.scale;
    var translateAmount = d3.event.translate;
    console.log("zoom", translateAmount, zoomAmount)

    axisOnZoom(translateAmount, zoomAmount);

    var overlay = d3.select("#map-background");

    // Get new calculations for transform and translate
    var newZoom = 1/zoomAmount;

    var newArray = [-translateAmount[0]*(overlayMapWidth/mapWidth)*newZoom,
                    -translateAmount[1]*(overlayHeight/mapHeight)*newZoom]

    if (newArray[0] === 0 && newArray[1] === 0) {
      var minimap = document.getElementById("map-background");
      var xforms = minimap.getAttribute("transform");
      var parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);
      var transformX = parts[1];
      var transformY = parts[2];
      newArray[0] = transformX;
      newArray[1] = transformY;
    }

    overlay.attr("transform", "translate(" + newArray + ")scale(" + newZoom + ")");
  }

  function reset() {
    svg.call(zoom.event);
    var center0 = [mapWidth/2, mapHeight/2];
    var center1 = [mapWidth/2, mapHeight/2];
    zoom.scale(1);
    zoom.translate([center0[0] - center1[0], center0[1] - center1[1]]);
    svg.transition().duration(750).call(zoom.event);
  }

  function clicked() {
    svg.call(zoom.event);
    // Record the coordinates (in data space) of the center (in screen space).
    var center0 = [mapWidth/2, mapHeight/2], translate0 = zoom.translate(), coordinates0 = coordinates(center0);
    zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute("data-zoom")));

    // Translate back to the center.
    var center1 = point(coordinates0);
    zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

    svg.transition().duration(750).call(zoom.event);
  }

  function coordinates(point) {
    var scale = zoom.scale(), translate = zoom.translate();
    return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
  }

  function point(coordinates) {
    var scale = zoom.scale(), translate = zoom.translate();
    return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
  }

  miniZoomed = function() {
    var translateAmount = d3.event.translate;
    overlay.attr("transform", "translate(" + translateAmount + ")scale(" + 1/d3.event.scale + ")");
    var matrix = d3.select("#manhattanMap");
    var zoomAmount = d3.event.scale;
    var newArray = [-translateAmount[0]*(mapWidth/overlayMapWidth) * zoomAmount,
                    -translateAmount[1]*(mapHeight/overlayMapHeight) * zoomAmount];
    console.log("minizoomed", translateAmount, zoomAmount)

    //var newArray = [-translateAmount[0]*(numTraits/15), -translateAmount[1]*(numMarkers/15)];
    matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");
  }

  /****************************
  ***** begin main script *****
  ****************************/

  const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  const totalWidth =  windowWidth * 0.95;
  const totalHeight = windowHeight * 0.65;

  var cellRadius = 3;

  var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;

  const axisPadding = 60;
  const margin = { top: 0, right: rightMargin, bottom: 5, left: 5 }
  const padding = 5

  mapWidth = totalWidth - axisPadding - margin.left
  mapHeight = totalHeight - axisPadding - margin.bottom

  const baseLabelStyle = { fontSize: 10, maxFontSize: 18, titleSize: 20, innerMargin: 8 };

  var zoom = d3.behavior.zoom()
              .size([mapWidth, mapHeight])
              .scaleExtent([1, 8])
              .on("zoom", zoomFunction)

  d3.selectAll("a[data-zoom]")
    .on("click", clicked)

  d3.select("#reset")
    .on("click", reset)

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
                .call(zoom)
                .append("g")
                  .attr("id", "manhattanMap")

  initAxes()
  parseData()

  var maxOverlayDimension = 100
  var overlayMapWidth, overlayMapHeight

  if (mapWidth > mapHeight) {
    overlayMapWidth = maxOverlayDimension
    overlayMapHeight = (mapHeight/mapWidth) * overlayMapWidth
  } else {
    overlayMapHeight = maxOverlayDimension
    overlayMapWidth = (mapWidth/mapHeight) * overlayMapHeight
  }

  /* Some minimap code */
  var minimap = d3.select("#manhattanBottomPanel")
                  .append("svg")
                  .attr("class", "minimap")
                  .attr("width", overlayMapWidth)
                  .attr("height", overlayMapHeight)

  minimap.append("rect")
         .attr("width", overlayMapWidth)
         .attr("height", overlayMapHeight)
         .style("fill", "#5eacdd")

  overlayWidth = overlayMapWidth
  overlayHeight = overlayMapHeight

  var miniZoom = d3.behavior.zoom()
                    .size([overlayWidth, overlayHeight])
                    .scaleExtent([1, 8])
                    .on("zoom", miniZoomed)

  minimap.append("g")
         .attr("class", "frame")
         .call(miniZoom)
         .append("rect")
            .attr("id", "map-background")
            .attr("value", 1)
            .style("width", overlayWidth)
            .style("height", overlayHeight)
            .attr("transform", "translate(" + 0 + "," + 0 + ")")

  var overlay = d3.select("#map-background")
}

var GMManhattanChart = React.createClass({
  validateNewProps(nextProps) {
    return (this.props.pageParams !== nextProps.pageParams)
  },
  componentWillReceiveProps(nextProps) {
    if (this.validateNewProps(nextProps)) {
      this.setState({
        points: Graph(nextProps.data, nextProps.markerLabels, nextProps.traitLabelsNum)
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
