var React = require('react');
var ReactDOM = require('react-dom');

var Graph = function() {
	var fileLocation = 'images/test_node_small.csv';

	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	var leftMargin = 0.1 * windowWidth;
	var rightMargin = 0.1 * windowWidth;
	var traitMargin = 0.12 * windowWidth;
	var cellWidth = 10;
	var cellHeight = 10;

	var margin = { top: 0, right: rightMargin, bottom: 50, left: 0 };

    //Fill whole right side
    //width = windowWidth

    //Equal margins on both sides
    //width = windowWidth-100

    var width =  windowWidth/1.5;
    var height = windowHeight/1.5;

	var svg = d3.select("#chart")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "matrixHolder")
        .append("g")
            .attr("id", "overallMatrix")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    d3.csv(fileLocation,
        function(d) {
        	console.log("Data parsed correctly", d);
            return {
                MarkerName: d.Marker,
                TraitName: d.Trait,
                Marker: d.Marker.replace(/\D/g,''),
                Trait: d.Trait.replace(/\D/g,''),
                value: +d.Correlation
            };
        },

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
};


var D3Chart = React.createClass({
	componentDidMount() {
		Graph();
	},

	getInitialState: function() {
		return {
		};
	},

	render: function() {
		return (
			<div id="chart">
			</div>
		);
	}

});

module.exports = D3Chart;
