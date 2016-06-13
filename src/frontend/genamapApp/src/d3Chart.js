var React = require('react');
var ReactDOM = require('react-dom');

function hoverOnCell(d, trait, marker, correlation) {

    var labelText = "<h4>Trait: T" + trait + "</h4> <h4>Marker: M" + marker + "</h4> <p> Correlation: " + correlation + "</p>";

    var tooltip = d3.select("#chart")
                      .append("div")
                        .attr("class", "tooltip")
                        .html(labelText)
                        .style("position", "absolute")
                        .style("right", "125px")
                        .style("top", "114px")

}

function hoverOutCell() {
    d3.select(".tooltip").remove();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var Graph = function() {
    // Grab the file from upload
	var fileLocation = 'images/test_node_small.csv';

    // Read this from file
    var numTraits = 250;
    var numMarkers = 10;

	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;
	var traitMargin = 0.12 * windowWidth;
	var cellWidth = 10;
	var cellHeight = 10;

    // Need to change percentages again to take into account sidebar
    var width =  windowWidth/1.25;
    var height = windowHeight/2;

	var margin = { top: 0, right: rightMargin, bottom: 50, left: 0 };

    var zoom = d3.behavior.zoom()
                .size([width, height])
                .scaleExtent([1, 8])
                .on("zoom", zoomed)

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        var zoomAmount = d3.event.scale;
        var translateAmount = d3.event.translate;

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
        var center0 = [width/2, height/2];
        var center1 = [width/2, height/2];
        zoom.scale(1);
        zoom.translate([center0[0] - center1[0], center0[1] - center1[1]]);
        svg.transition().duration(750).call(zoom.event);
    }

    function clicked() {
        svg.call(zoom.event);
        // Record the coordinates (in data space) of the center (in screen space).
        var center0 = [width/2, height/2], translate0 = zoom.translate(), coordinates0 = coordinates(center0);
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


    d3.selectAll("a[data-zoom]")
      .on("click", clicked);

    d3.select("#reset")
      .on("click", reset);

	var svg = d3.select("#chart")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "matrixHolder")
            .call(zoom)
        .append("g")
            .attr("id", "overallMatrix")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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

<<<<<<< HEAD
		function(error, data) {
			var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

        	var colorScale = d3.scale.quantile()
		        .domain([0, 1])
                .range(colors);

    		var cards = svg.selectAll(".dots")
             	.data(data, function(d) { return d.Marker+':'+d.Trait;});

        	cards.append("title");

        	cards.enter().append("rect")
                .attr("x", function(d) { return (d.Trait - 1) * cellWidth; })
                .attr("y", function(d) { return (d.Marker - 1) * cellHeight; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "cell")
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("value", function(d) { return d.value })
                .on('mouseover', function(d) {
                    var trait = d.Trait;
                    var marker = d.Marker;
                    var correlation = d.value;
                    hoverOnCell(d, trait, marker, correlation)
                    d3.select(d3.event.target).classed("highlight", true);
                })
                .on('mouseout', function(d) {
                    hoverOutCell();
                    d3.select(d3.event.target).classed("highlight", false);
                });

        	cards.transition().duration(100)
            	.style("fill", function(d) { return colorScale(d.value); });

        	cards.exit().remove();
		}
	);
=======
	function(error, data) {

		var colors = ["#c1f4ec","#91f2ed","#97e6fc","#95d1f9","#64b4dd","#65c5db","#66a9d8"];

        var colorScale = d3.scale.quantile()
                                .domain([0, 1])
                                .range(colors);

        var cards = svg.selectAll(".dots")
                      .data(data, function(d) { return d.Marker+':'+d.Trait;});

        cards.append("title");

        cards.enter().append("rect")
                        .attr("x", function(d) { return (d.Trait - 1) * cellWidth; })
                        .attr("y", function(d) { return (d.Marker - 1) * cellHeight; })
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .attr("class", "cell")
                        .attr("width", cellWidth)
                        .attr("height", cellHeight)
                        .attr("value", function(d) { return d.value })
                        .on('mouseover', function(d) {
                            var trait = d.Trait;
                            var marker = d.Marker;
                            var correlation = d.value;
                            hoverOnCell(d, trait, marker, correlation)
                            d3.select(d3.event.target).classed("highlight", true);
                        })
                        .on('mouseout', function(d) {
                            hoverOutCell();
                            d3.select(d3.event.target).classed("highlight", false);
                        });

        cards.transition().duration(100)
            .style("fill", function(d) { return colorScale(d.value); });
          
        cards.exit().remove();
	});

    function miniZoomed() {
        var translateAmount = d3.event.translate;
        overlay.attr("transform", "translate(" + translateAmount + ")scale(" + 1/d3.event.scale + ")");
        var matrix = d3.select("#overallMatrix")
        var newArray = [-translateAmount[0]*(numTraits/15), -translateAmount[1]*(numMarkers/15)]
        matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");
    }

    var overlayMapWidth = 150;
    var overlayMapHeight = 150;

    /* Some minimap code */
    var svgGraphic = d3.select("#chart")
                        .append("svg")
                            .attr("class", "minimap")
                            .attr("width", overlayMapWidth)
                            .attr("height", overlayMapHeight)

    var minimapColors = ["#65e5cf", "#5bc8df", "#239faf", "#128479", "#5eacdd", "#1e69c4", "#2b90e2"];

    for (var col = 0; col < 30; col++) {
        for (var row = 0; row < 30; row++) {

            var random = getRandomInt(0,7);
            var color = minimapColors[random];

            svgGraphic.append("rect")
                          .attr("x", col*5)
                          .attr("y", row*5)
                          .attr("rx", 4)
                          .attr("ry", 4)
                          .attr("class", "cell")
                          .attr("width", 5)
                          .attr("height", 5)
                          .attr("value", 1)
                          .style("fill", color)
                          .style("fill-opacity", "0.8");
        }
    }

    var numCellsHorizontalLanding = width/10;
    var numCellsVerticalLanding = height/10;
    
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
>>>>>>> functionality import complete
};


var D3Chart = React.createClass({
	componentDidMount() {
		Graph();
	},

	getInitialState: function() {
		return {
<<<<<<< HEAD
		};
=======
			points: []
		}
>>>>>>> functionality import complete
	},

    componentDidMount: function() {
        this.state.points = Graph();
    },

	render: function() {
		return (
			<div id="chart">
			</div>
		);
	}

});

module.exports = D3Chart;
