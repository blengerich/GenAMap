import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

var zoomFunction;
var mapWidth;
var mapHeight;
var miniZoomed;
var overlayWidth;
var overlayHeight;

function hoverOnCell(d, trait, marker, correlation, mousePos) {
  var labelText = "<h2>Trait: T" + trait + "</h2> <h2>Marker: M" + marker + "</h2> <p> Correlation: " + correlation + "</p>";
  var tooltip = d3.select("#chart")
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Graph = function() {
  // Grab the file from upload
	var fileLocation = 'example_data/test_node_small.csv';

  // TODO: get from label files
  var numTraits = 250;
  var numMarkers = 10;

  var traitLabels = [];
  for (var i = 1; i <= numTraits; i++)
    traitLabels.push("T" + i);

  var markerLabels = [];
  for (var i = 1; i <= numMarkers; i++)
    markerLabels.push("M" + i);

	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;
	var traitMargin = 0.12 * windowWidth;
	var cellWidth = 10;
	var cellHeight = 10;

  // Need to change percentages again to take into account sidebar
  var maxWidth =  windowWidth/1.25;
  var maxHeight = windowHeight/1.5;
  var matrixHeight = cellHeight * numMarkers;
  var matrixWidth = cellWidth * numTraits;

  var margin = { top: 0, right: rightMargin, bottom: 5, left: 5 };

  mapWidth = Math.min(maxWidth, matrixWidth);
  mapHeight = Math.min(maxHeight, matrixHeight);

  var axisPadding = 50;
  var baseLabelStyle = { fontSize: 10, innerMargin: 8 };

  var totalWidth = axisPadding + margin.left + mapWidth;
  var totalHeight = mapHeight + margin.bottom + axisPadding;

  d3.select('#chart')
    .style({ "width": (mapWidth + margin.left) + "px" });

  var zoom = d3.behavior.zoom()
              .size([mapWidth, mapHeight])
              .scaleExtent([1, 8])
              .on("zoom", zoomFunction)

  zoomFunction = function() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    var zoomAmount = d3.event.scale;
    var translateAmount = d3.event.translate;

    var newTextY = baseLabelStyle.innerMargin * zoomAmount;
    var newFontSize = baseLabelStyle.fontSize * zoomAmount;

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

    var overlay = d3.select("#map-background");

    // Get new calculations for transform and translate
    var newZoom = 1/zoomAmount;

    /* Division amount (15/numTraits) and (15/numMarkers) is to make the rectangle translate the
    proper amount, use 15 for both even though 20 columns because the example data is square (250*250) */
    var newArray = [-translateAmount[0]*(15/numTraits), -translateAmount[1]*(15/numMarkers)]

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

  /* add axis labels and gridlines */
  function initAxes() {
    var axes = d3.select("#rootSvg")
                 .append("g")
                 .attr("class", "axes")
                 .attr("transform", "translate(" + axisPadding + ",0)");

    // gridlines
    axes.append("line")
        .attr("x2", mapWidth + margin.left)
        .attr("y1", mapHeight + margin.bottom)
        .attr("y2", mapHeight + margin.bottom);
    axes.append("line")
        .attr("y2", mapHeight + margin.bottom);

    // horizontal labels
    for (var i = 0; i < numMarkers; i++) {
      var row = axes.append("g")
                    .attr("class", "row")
                    .attr("transform", "translate(0," + (cellHeight * i) + ")");

      row.append("text")
         .attr("text-anchor", "end")
         .attr("x", -5)
         .attr("y", 8)
         .text(markerLabels[i]);
    }

    axes.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", mapHeight/2)
        .attr("transform", "translate(-35,0)rotate(-90,0," + mapHeight/2 + ")")
        .text("Markers");

    // vertical labels
    for (var i = 0; i < numTraits; i++) {
      var col = d3.select(".axes")
                  .append("g")
                  .attr("class", "col")
                  .attr("transform", "translate(" + (margin.left + cellWidth * i)
                        + "," + (mapHeight + margin.bottom) + ")rotate(-90)");

      col.append("text")
         .attr("text-anchor", "end")
         .attr("x", -5)
         .attr("y", 8)
         .text(traitLabels[i]);
    }

    axes.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", mapHeight)
        .attr("x", mapWidth/2)
        .attr("transform", "translate(0,50)")
        .text("Traits");

    // opaque bottom-left selector
    axes.append("rect")
        .attr("x", -(axisPadding + margin.left))
        .attr("y", mapHeight + margin.bottom)
        .attr("width", axisPadding + margin.left)
        .attr("height", axisPadding + margin.bottom)
        .attr("fill", "#fff");

    d3.selectAll(".row text")
      .style("font-size", baseLabelStyle.fontSize + "px");
    d3.selectAll(".col text")
      .style("font-size", baseLabelStyle.fontSize + "px");
  }

  function initGridLines() {
    var matrix = d3.select("#overallMatrix");

    for (var i = 0; i < numMarkers; i++) {
      matrix.append("line")
            .attr("x1", 0)
            .attr("y1", cellHeight * i)
            .attr("x2", cellWidth * numTraits)
            .attr("y2", cellHeight * i)
            .attr("stroke", "#fff");
    }

    for (var i = 0; i < numTraits; i++) {
      matrix.append("line")
            .attr("x1", cellWidth * i)
            .attr("y1", 0)
            .attr("x2", cellWidth * i)
            .attr("y2", cellHeight * numMarkers)
            .attr("stroke", "#fff");
    }
  }

  d3.selectAll("a[data-zoom]")
    .on("click", clicked);

  d3.select("#reset")
    .on("click", reset);

  var svg = d3.select("#chart")
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

  initAxes();

  d3.csv(fileLocation,
    function(d) {
      return {
        MarkerName: d.Marker,
        TraitName: d.Trait,
        Marker: d.Marker.replace(/\D/g,''),
        Trait: d.Trait.replace(/\D/g,''),
        value: +d.Correlation
      };
    },

    function(error, data) {
		    var colors = ["#c1f4ec","#91f2ed","#97e6fc","#95d1f9","#64b4dd","#65c5db","#66a9d8"];
        var colorScale = d3.scale.quantile()
                                .domain([0, 1])
                                .range(colors);

        var cards = svg.selectAll(".dots")
                      .data(data, function(d) { return d.Marker+':'+d.Trait;});

        cards.append("title");

        // append cells
        cards.enter().append("rect")
                        .attr("x", function(d) { return (d.Trait - 1) * cellWidth; })
                        .attr("y", function(d) { return (d.Marker - 1) * cellHeight; })
                        .attr("class", "cell")
                        .attr("width", cellWidth)
                        .attr("height", cellHeight)
                        .attr("trait", function(d) {return d.Trait })
                        .attr("marker", function(d) { return d.Marker })
                        .attr("value", function(d) { return d.value })
                        .on('mouseover', function(d) {
                          var mousePos = d3.event;
                          var trait = d.Trait;
                          var marker = d.Marker;
                          var correlation = d.value;
                          hoverOnCell(d, trait, marker, correlation, mousePos);
                          d3.select(d3.event.target).classed("highlight", true);
                        })
                        .on('mouseout', function(d) {
                          hoverOutCell();
                          d3.select(d3.event.target).classed("highlight", false);
                        });

        cards.transition().duration(100)
            .style("fill", function(d) { return colorScale(d.value); });

        cards.exit().remove();
        initGridLines();
	  });

    miniZoomed = function() {
      var translateAmount = d3.event.translate;
      overlay.attr("transform", "translate(" + translateAmount + ")scale(" + 1/d3.event.scale + ")");
      var matrix = d3.select("#overallMatrix");
      var newArray = [-translateAmount[0]*(numTraits/15), -translateAmount[1]*(numMarkers/15)];
      matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");
    }

    var overlayMapWidth = 100;
    var overlayMapHeight = 100;
    var overlayCellWidth = 5;
    var overlayCellHeight = 5;

    /* Some minimap code */
    var svgGraphic = d3.select("body")
                        .append("svg")
                            .attr("class", "minimap")
                            .attr("width", overlayMapWidth)
                            .attr("height", overlayMapHeight)

    var minimapColors = ["#65e5cf", "#5bc8df", "#239faf", "#128479", "#5eacdd", "#1e69c4", "#2b90e2"];

    for (var col = 0; col < 20; col++) {
        for (var row = 0; row < 20; row++) {

            var random = getRandomInt(0,7);
            var color = minimapColors[random];

            svgGraphic.append("rect")
                          .attr("x", col*overlayCellWidth)
                          .attr("y", row*overlayCellHeight)
                          .attr("rx", 4)
                          .attr("ry", 4)
                          .attr("class", "cell")
                          .attr("width", overlayCellWidth)
                          .attr("height", overlayCellHeight)
                          .attr("value", 1)
                          .style("fill", color)
                          .style("fill-opacity", "0.8");
        }
    }

    var numCellsHorizontalLanding = mapWidth/10;
    var numCellsVerticalLanding = mapHeight/10;

    var overlayWidthPercentage = numCellsHorizontalLanding/numTraits;
    var overlayHeightPercentage = numCellsVerticalLanding/numMarkers;

    overlayWidth = overlayWidthPercentage*overlayMapWidth;
    overlayHeight = overlayHeightPercentage*overlayMapHeight;

    var miniZoom = d3.behavior.zoom()
                .size([overlayWidth, overlayHeight])
                .scaleExtent([1, 8])
                .on("zoom", miniZoomed)

    svgGraphic.append("g")
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

var D3Chart = React.createClass({
  getInitialState: function() {
		return {
			points: [],
      subsetCells: [],
      numClicked: 0,
      element: null,
      mouse: {x: 0, y: 0, startX: 0, startY: 0}
		}
	},
  componentDidMount: function() {
    console.log("mounted")
    this.state.points = Graph();
  },
  subsetIndicator: function(trait1, marker1, trait2, marker2) {
    // Would be easier to have material-ui flatbutton instead of regular buttons
    // modfied with CSS, but I don't know how to render those in a string
    var labelText = "<h4> Selected Subset: </h4> " + 
                    "<p>" + trait1 + " - " + trait2 + "</p>" +
                    "<p>" + marker1 + " - " + marker2 + "</p>" +
                    "<button class='subsetButton' id='cancel'> Cancel </button>" +
                    "<button class='subsetButton' id='add'> Add </button>";
    var selector = d3.select("#chart")
                      .append("div")
                        .attr("class", "selector")
                        .html(labelText)
                        .style("position", "absolute")
                        .style("left", "80px")
                        .style("top", "300px");
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
        document.getElementById('chart').appendChild(that.state.element);
      }
    }
  },
  componentDidUpdate: function() {
    var threshold = this.props.threshold;
    d3.select("#overallMatrix")
      .selectAll('.cell')
      .each(function(d) {
        if (d.value < threshold) {
          d3.select(this).style({ visibility: "hidden" });
        } else {
          d3.select(this).style({ visibility: "visible" });
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
          // Allocates a new array so uses more memory, but online said it was safer lol
          var subsetCells = that.state.subsetCells.slice();
          // Just adding the name here for display purposes, add the whole cell ('this') if wanted
          subsetCells.push("Trait " + this.getAttribute("trait"));
          subsetCells.push("Marker " + this.getAttribute("marker"));
          that.setState({subsetCells: subsetCells});
          that.setState({numClicked: that.state.numClicked + 1});
          if (that.state.numClicked == 2) {
            that.subsetIndicator(that.state.subsetCells[0], that.state.subsetCells[1], 
                                  that.state.subsetCells[2], that.state.subsetCells[3]);
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
        <div id="chart" style={{ "marginTop": "25px" }}>
          <ul className="buttonContainer">
            <li className="zoomButton">
              <a id="zoom-in" data-zoom="+1">
                <FloatingActionButton>
                  <FontIcon className="material-icons">add</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="zoom-out" data-zoom="-1">
                <FloatingActionButton>
                  <FontIcon className="material-icons">remove</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="reset" data-zoom="-8">
                <FloatingActionButton>
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

export default D3Chart
