import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

const colors = ["#c1f4ec","#91f2ed","#97e6fc","#95d1f9","#64b4dd","#65c5db","#66a9d8"];
const colorScale = d3.scale.quantile()
                        .domain([0, 1])
                        .range(colors);

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
	var fileLocation = 'example_data/export.csv';

  // TODO: get from label files
  var numTraits = 250;
  var numMarkers = 250;

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

  var mapWidth = Math.min(maxWidth, matrixWidth);
  var mapHeight = Math.min(maxHeight, matrixHeight);

  var axisPadding = 50;
  var baseLabelStyle = { fontSize: 10, innerMargin: 8 };

  var totalWidth = axisPadding + margin.left + mapWidth;
  var totalHeight = mapHeight + margin.bottom + axisPadding;

  d3.select('#chart')
    .style({ "width": (mapWidth + margin.left) + "px" });

  var zoom = d3.behavior.zoom()
              .size([mapWidth, mapHeight])
              .scaleExtent([1, 8])
              .on("zoom", zoomed)

  function axisOnZoom(translateAmount, zoomAmount) {
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
  }

  function zoomed() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    var zoomAmount = d3.event.scale;
    var translateAmount = d3.event.translate;
    axisOnZoom(translateAmount, zoomAmount);

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

    function miniZoomed() {
      var translateAmount = d3.event.translate;
      overlay.attr("transform", "translate(" + translateAmount + ")scale(" + 1/d3.event.scale + ")");
      var matrix = d3.select("#overallMatrix");
      var zoomAmount = d3.event.scale;
      var newArray = [translateAmount[0]*(mapWidth/overlayMapWidth),
                      translateAmount[1]*(mapHeight/overlayMapHeight)];
      matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");
      axisOnZoom(newArray, zoomAmount);
    }

    var maxOverlayDimension = 100;
    var overlayMapWidth, overlayMapHeight;
    if (numMarkers > numTraits) {
      overlayMapHeight = maxOverlayDimension;
      overlayMapWidth = maxOverlayDimension * (numTraits/numMarkers);
    } else {
      overlayMapWidth = maxOverlayDimension;
      overlayMapHeight = maxOverlayDimension * (numMarkers/numTraits);
    }

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

    var overlayWidth = overlayWidthPercentage*overlayMapWidth;
    var overlayHeight = overlayHeightPercentage*overlayMapHeight;

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
			points: []
		}
	},
  componentDidMount: function() {
    this.state.points = Graph();
  },
  componentDidUpdate() {
    var threshold = this.props.threshold;
    d3.select("#overallMatrix")
      .selectAll('.cell')
      .each(function(d) {
        if (d.value < threshold) {
          d3.select(this).style("fill", "#dcdcdc");
        } else {
          d3.select(this).style("fill", colorScale(d.value));
        }
      });
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
