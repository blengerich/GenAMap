import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

import fetch from './fetch'
import config from '../../config'

const colorScale = d3.scale.linear()
                      .domain([-1, 0, 1])
                      .range(["#990000", "#EEEEEE", "#000099"]);

// TODO: add map rows/cols, account for in initAxes and parseData
var axisOnZoom;
var zoomFunction;
var mapWidth;
var mapHeight;
var miniZoomed;
var overlayWidth;
var overlayHeight;
var populationFactor;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Graph = function(data, markerLabels, traitLabels) {
  d3.select('#matrixChart').selectAll('svg').remove()

  /************************************
  *** visualization setup functions ***
  ************************************/

  function trimmedLabel(s, threshold) {
    return (s.length > threshold) ? (s.substring(0, threshold) + "..") : s
  }

  /* initialize legend */
  function legend() {
    const legendWidth = 95
    const margin = 5
    var legendBody = d3.select("#matrixBottomPanel")
                        .append("svg")
                        .attr("width", legendWidth + 2 * margin)
                        .attr("class", "legend")
                          .append("g")
                          .attr("transform", "translate(" + margin + ",0)")
                          .attr("id", "legendBody")

    legendBody.append("text")
              .text("Effect Size")
              .attr("x", legendWidth/2)
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .style("font-weight", "bold")

    const numRowCells = 500
    const cellWidth = legendWidth/numRowCells
    const cellHeight = 10

    const legendColorScale = d3.scale.linear()
                               .domain([0, numRowCells/2, numRowCells])
                               .range(["#990000", "#EEEEEE", "#000099"])

    for (var i = 0; i < numRowCells; i++) {
      legendBody.append("rect")
                .attr("x", i * cellWidth)
                .attr("y", 15)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .style("fill", legendColorScale(i))
    }

    const mapCorr = d3.scale.linear().domain([-1, 1]).range([0, legendWidth])
    const markers = [-1, 0, 1].map((i) => {
      legendBody.append("text")
                .text(i)
                .attr("x", mapCorr(i))
                .attr("y", 25)
                .attr("dy", "0.8em")
                .style("text-anchor", "middle")
    })
  }

  /* initialize axes and axis labels */
  function initAxes() {
    var axes = d3.select("#rootSvg")
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

    // horizontal labels
    for (var i = 0; i < mapRows; i++) {
      var row = axes.append("g")
                    .attr("class", "row")
                    .attr("transform", "translate(0," + (cellHeight * i) + ")");

      row.append("text")
         .attr("text-anchor", "end")
         .attr("x", -5)
         .attr("y", 8)
         .text(trimmedLabel(traitLabels[Math.floor(i/populationFactor)], 5));
    }

    axes.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", mapHeight/2)
        .attr("transform", "translate(" + (-axisPadding + baseLabelStyle.titleSize)
            + ",0)rotate(-90,0," + mapHeight/2 + ")")
        .text("Traits");

    // vertical labels
    for (var i = 0; i < mapCols; i++) {
      var col = d3.select(".axes")
                  .append("g")
                  .attr("class", "col")
                  .attr("transform", "translate(" + (margin.left + cellWidth * i)
                        + "," + (mapHeight + margin.bottom) + ")rotate(-90)");

      col.append("text")
         .attr("text-anchor", "end")
         .attr("x", -5)
         .attr("y", 8)
         .text(trimmedLabel(markerLabels[i].split(',')[0], 5));
    }

    axes.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", mapHeight)
        .attr("x", mapWidth/2)
        .attr("transform", "translate(0," + axisPadding + ")")
        .text("Markers");

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

  /* create spaces between cells */
  function initGridLines() {
    var matrix = d3.select("#overallMatrix");

    for (var i = 0; i < mapRows; i++) {
      matrix.append("line")
            .attr("x1", 0)
            .attr("y1", cellHeight * i)
            .attr("x2", cellWidth * mapCols)
            .attr("y2", cellHeight * i)
            .attr("stroke", "#fff");
    }

    for (var i = 0; i < mapCols; i++) {
      matrix.append("line")
            .attr("x1", cellWidth * i)
            .attr("y1", 0)
            .attr("x2", cellWidth * i)
            .attr("y2", cellHeight * mapRows)
            .attr("stroke", "#fff");
    }
  }

  function hoverOnCell(d, trait, marker, correlation, mousePos) {
    var labelText = "<h2>Trait: " + traitLabels[trait] + "</h2> <h2>Marker: " +
                    markerLabels[marker].split(',')[0] + "</h2> <p> Effect Size: " + correlation + "</p>";
    var tooltip = d3.select("#matrixChart")
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

  /* parse correlation data into visualization */
  function getPopulationFactor() {
    var rows = data.v.split(";")
    return rows[0].split(",").length/numTraits
  }

  function parseData() {
    var parsedData = []

    data.v.split(";").forEach(function(row, rowIndex) {
      if (row.length > 0) {
        var pts = row.split(",")
        pts.forEach(function(d, colIndex) {
          parsedData.push({
            value: +d,
            Marker: rowIndex,
            Trait: Math.floor(colIndex/populationFactor),
            x: rowIndex,
            y: colIndex
          })
        })
      }
    })

    var cards = svg.selectAll(".dots")
                  .data(parsedData, function(d) { return d.x+':'+d.y;});

    cards.append("title");

    // append cells
    cards.enter().append("rect")
                    .attr("x", function(d) { return d.x * cellHeight; })
                    .attr("y", function(d) { return d.y * cellWidth; })
                    .attr("class", "cell")
                    .attr("width", cellWidth)
                    .attr("height", cellHeight)
                    .attr("trait", function(d) { return d.Trait })
                    .attr("marker", function(d) { return d.Marker })
                    .attr("value", function(d) { return d.value })
                    .on('mouseover', function(d) {
                      var mousePos = d3.event;
                      var trait = d.Trait;
                      var marker = d.Marker;
                      var correlation = d.value;
                      hoverOnCell(d, trait, marker, correlation, mousePos);
                      d3.select(d3.event.target).classed("matrixHighlight", true);
                    })
                    .on('mouseout', function(d) {
                      hoverOutCell();
                      d3.select(d3.event.target).classed("matrixHighlight", false);
                    });
    cards.transition().duration(100)
          .style("fill", function(d) { return colorScale(d.value); });

    cards.exit().remove();
    initGridLines();
  }

  /*************************
  **** zoom functions *****
  *************************/

  axisOnZoom = function(translateAmount, zoomAmount) {
    var newTextY = baseLabelStyle.innerMargin * zoomAmount;
    var newFontSize = Math.min(baseLabelStyle.fontSize * zoomAmount, baseLabelStyle.maxFontSize);

    // column text transform
    d3.selectAll(".col")
      .each(function(d, i) {
        var col = d3.select(this);
        var translated = d3.transform(col.attr("transform")).translate;

        var newX = margin.left + cellWidth * i * zoomAmount + translateAmount[0];
        col.attr("transform", "translate(" + newX + "," + translated[1] + ")rotate(-90)");

        col.select("text")
           .attr("y", newTextY)
           .style("font-size", newFontSize);
      });

    // row text transform
    d3.selectAll(".row")
      .each(function(d, i) {
        var row = d3.select(this);
        var translated = d3.transform(row.attr("transform")).translate;

        var newY = margin.top + cellHeight * i * zoomAmount + translateAmount[1];
        row.attr("transform", "translate(" + translated[0] + "," + newY + ")");

        row.select("text")
          .attr("y", newTextY)
          .style("font-size", newFontSize);
      });
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

    var newArray = [-translateAmount[0]*(overlayMapWidth/matrixWidth)*newZoom,
                    -translateAmount[1]*(overlayHeight/matrixHeight)*newZoom]

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
    var matrix = d3.select("#overallMatrix");
    var zoomAmount = d3.event.scale;
    console.log("minizoomed", translateAmount, zoomAmount)
    var newArray = [-translateAmount[0]*(matrixWidth/overlayMapWidth) * zoomAmount,
                    -translateAmount[1]*(matrixHeight/overlayMapHeight) * zoomAmount];

    //var newArray = [-translateAmount[0]*(numTraits/15), -translateAmount[1]*(numMarkers/15)];
    matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");
    axisOnZoom(newArray, zoomAmount);
  }

  /****************************
  ***** begin main script *****
  ****************************/

  var numTraits = traitLabels.length
  var numMarkers = markerLabels.length

	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;
	var cellWidth = 10;
	var cellHeight = 10;

  var populationFactor = getPopulationFactor(); // may be directly read in future
  var mapRows = numTraits * populationFactor;
  var mapCols = numMarkers;

  // Need to change percentages again to take into account sidebar
  var maxTotalWidth =  windowWidth * 0.95;
  var maxTotalHeight = windowHeight * 0.65;
  var matrixHeight = cellHeight * mapRows;
  var matrixWidth = cellWidth * mapCols;

  var axisPadding = 80;
  var margin = { top: 0, right: rightMargin, bottom: 5, left: 5 };

  var totalWidth = Math.min(maxTotalWidth, matrixWidth + axisPadding + margin.left)
  var totalHeight = Math.min(maxTotalHeight, matrixHeight + axisPadding + margin.bottom)

  mapWidth = totalWidth - axisPadding - margin.left
  mapHeight = totalHeight - axisPadding - margin.bottom

  var baseLabelStyle = { fontSize: 10, maxFontSize: 18, titleSize: 20, innerMargin: 8 };

  d3.select('#matrixChart')
    .style({
      "width": (mapWidth + margin.left) + "px"
    })

  var zoom = d3.behavior.zoom()
              .size([mapWidth, mapHeight])
              .scaleExtent([1, 8])
              .on("zoom", zoomFunction)

  d3.selectAll("a[data-zoom]")
    .on("click", clicked);

  d3.select("#reset")
    .on("click", reset);

  var svg = d3.select("#matrixChart")
              .append("svg")
              .attr("id", "rootSvg")
              .attr("width", totalWidth)
              .attr("height", totalHeight)
                .append("svg")
                .attr("width", mapWidth)
                .attr("height", mapHeight)
                .attr("id", "matrixHolder")
                .attr("x", axisPadding + margin.left)
                .attr("y", margin.top)
                .call(zoom)
                .append("g")
                  .attr("id", "overallMatrix");

  legend();
  parseData();
  initAxes();

  var maxOverlayDimension = 100;
  var overlayMapWidth, overlayMapHeight;
  if (numMarkers > numTraits) {
    overlayMapWidth = maxOverlayDimension;
    overlayMapHeight = maxOverlayDimension * (numTraits/numMarkers);
  } else {
    overlayMapHeight = maxOverlayDimension;
    overlayMapWidth = maxOverlayDimension * (numMarkers/numTraits);
  }

  /* Some minimap code */
  var minimap = d3.select("#matrixBottomPanel")
                  .append("svg")
                  .attr("class", "minimap")
                  .attr("width", overlayMapWidth)
                  .attr("height", overlayMapHeight)

  minimap.append("rect")
    .attr("width", overlayMapWidth)
    .attr("height", overlayMapHeight)
    .style("fill", "#5eacdd")

  var numCellsHorizontalLanding = mapWidth/10;
  var numCellsVerticalLanding = mapHeight/10;

  var overlayWidthPercentage = numCellsHorizontalLanding/numMarkers;
  var overlayHeightPercentage = numCellsVerticalLanding/numTraits;

  overlayWidth = overlayWidthPercentage*overlayMapWidth;
  overlayHeight = overlayHeightPercentage*overlayMapHeight;

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

  var overlay = d3.select("#map-background");
}

var GMMatrixChart = React.createClass({
  validateNewProps: function(nextProps) {
    return (this.props.pageParams !== nextProps.pageParams)
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.validateNewProps(nextProps)) {
      this.setState({
        points: Graph(nextProps.data, nextProps.markerLabels, nextProps.traitLabels)
      })
    }
  },
  getInitialState: function() {
		return {
			points: [],
      subsetCells: [],
      numClicked: 0,
      element: null,
      mouse: {x: 0, y: 0, startX: 0, startY: 0}
		}
	},
  resetSubsetCells: function() {
    this.setState({
      subsetCells: [],
      subsetTooltip: null
    })
    d3.select(".marquee").remove()
  },
  subsetIndicator: function(trait1, marker1, trait2, marker2, mouseEvent) {
    const position = d3.select('.marquee').node().getBoundingClientRect()
    const addSubset = function() {
      this.resetSubsetCells()
    }
    const selectorStyle = {
      "position": "absolute",
      "left": position.left + position.width/2,
      "top": position.top + position.height/2
    }
    const tooltip = (
      <div className='selector' style={selectorStyle}>
        <h4> Selected Subset: </h4>
        <p>{trait1 + " - " + trait2}</p>
        <p>{marker1 + " - " + marker2}</p>
        <FlatButton
          label='Cancel'
          secondary={true}
          onClick={this.resetSubsetCells}
        />
        <FlatButton
          label='Add'
          primary={true}
          onClick={addSubset}
        />
      </div>
    )
    this.setState({ subsetTooltip: tooltip })
  },
  drawMarquee: function(div) {
    var that = this;

    function setMousePosition(event) {
      var ev = event || window.event; // Firefox || IE
      if (ev.pageX) { // Firefox
          var mousePosition = that.state.mouse;
          mousePosition.x = ev.pageX + window.pageXOffset - 10;
          mousePosition.y = ev.pageY + window.pageYOffset - 10;
          that.setState({mouse: mousePosition});
      } else if (ev.clientX) { // IE
          var mousePosition = that.state.mouse;
          mousePosition.x = ev.clientX + document.body.scrollLeft - 10;
          mousePosition.y = ev.clientY + document.body.scrollTop - 10;
          that.setState({mouse: mousePosition});
      }
    };

    div.onmousemove = function (event) {
      setMousePosition(event);
      if (that.state.element !== null) {
          that.state.element.style.width = Math.abs(that.state.mouse.x - that.state.mouse.startX) + 'px';
          that.state.element.style.height = Math.abs(that.state.mouse.y - that.state.mouse.startY) + 'px';
          that.state.element.style.left = (that.state.mouse.x - that.state.mouse.startX < 0) ? that.state.mouse.x + 'px' : that.state.mouse.startX + 'px';
          that.state.element.style.top = (that.state.mouse.y - that.state.mouse.startY < 0) ? that.state.mouse.y + 'px' : that.state.mouse.startY + 'px';
      }
    }

    div.onclick = function(event) {
      if (that.state.element !== null) {
          that.setState({element : null});
      }
      else {
        that.state.mouse.startX = that.state.mouse.x;
        that.state.mouse.startY = that.state.mouse.y;
        that.setState({element : document.createElement('div')});
        that.state.element.className = 'marquee'
        that.state.element.style.left = that.state.mouse.x + 'px';
        that.state.element.style.top = that.state.mouse.y + 'px';
        document.getElementById('matrixChart').appendChild(that.state.element);
      }
    }
  },
  componentDidUpdate: function() {
    if (this.state.points) return

    var threshold = this.props.threshold;
    d3.select("#overallMatrix")
      .selectAll('.cell')
      .each(function(d) {
        if (Math.abs(d.value) < threshold) {
          d3.select(this).style("fill", "#dcdcdc");
        } else {
          d3.select(this).style("fill", colorScale(d.value));
        }
      });
    var zoomEnabled = this.props.zoom;
    var disableZoom = d3.behavior.zoom()
                        .on("zoom", null);
    var reZoomMap = d3.behavior.zoom()
                      .size([mapWidth, mapHeight])
                      .scaleExtent([1, 8])
                      .on("zoom", zoomFunction);
    var reZoomMini = d3.behavior.zoom()
                      .size([overlayWidth, overlayHeight])
                      .scaleExtent([1, 8])
                      .on("zoom", miniZoomed)
    var that = this;
    if (!zoomEnabled) {
      that.drawMarquee(document.getElementById("overallMatrix"));
      document.getElementById("overallMatrix").style.cursor = "cell";
      d3.select("#matrixHolder")
        .call(disableZoom);
      d3.select("#overallMatrix")
        .selectAll('.cell')
        .on("click", function() {
          var mouseEvent = window.event;
          // Allocates a new array so uses more memory, but online said it was safer lol
          var subsetCells = that.state.subsetCells.slice();
          // Just adding the name here for display purposes, add the whole cell ('this') if wanted
          subsetCells.push("Trait " + this.getAttribute("trait"));
          subsetCells.push("Marker " + this.getAttribute("marker"));
          that.setState({subsetCells: subsetCells});
          that.setState({numClicked: that.state.numClicked + 1});
          if (that.state.numClicked == 2) {
            that.subsetIndicator(that.state.subsetCells[0], that.state.subsetCells[1],
                                  that.state.subsetCells[2], that.state.subsetCells[3],
                                  mouseEvent);
            that.setState({numClicked: 0});
            var reset = that.state.subsetCells.slice(0, 0);
            that.setState({subsetCells: reset});
          }
        });
      document.getElementById("map-background").style.cursor = "default";
      d3.select(".frame")
        .call(disableZoom);
    }
    else {
      document.getElementById("overallMatrix").style.cursor = "default";
      d3.select("#matrixHolder")
        .call(reZoomMap);
      document.getElementById("map-background").style.cursor = "move";
      d3.select(".frame")
        .call(reZoomMini);
    }
  },
	render: function() {
		return (
      <div>
        <div id="matrixChart" style={{ "marginTop": "25px" }}>
          {this.state.subsetTooltip}
        </div>
        <div id="matrixBottomPanel">
          <ul className="buttonContainer">
            <li className="zoomButton">
              <a id="zoom-in" data-zoom="+1">
                <FloatingActionButton mini={true} className="zoomBackground">
                  <FontIcon className="material-icons">add</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="zoom-out" data-zoom="-1">
                <FloatingActionButton  mini={true} className="zoomBackground">
                  <FontIcon className="material-icons">remove</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="reset" data-zoom="-8">
                <FloatingActionButton mini={true} className="zoomBackground">
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

export default GMMatrixChart
