function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function InitChart(numTraits, numMarkers) {

    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    var leftMargin = 0.1 * windowWidth;
    var rightMargin = 0.1 * windowWidth;
    var traitMargin = 0.12 * windowWidth;

    var margin = { top: 0, right: rightMargin, bottom: 50, left: 0 },

        //Fill whole right side
        //width = windowWidth

        //Equal margins on both sides
        //width = windowWidth-100

        width =  windowWidth/1.5,
        height = windowHeight/1.5,
        cellWidth = 10,
        cellHeight = 10,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
        datasets = ["static/export.csv", "static/export_trim.csv", "static/test.csv"];

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

    var svg = d3.select("#chart")
                .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("id", "matrixHolder")
                    .call(zoom)
                .append("g")
                    .attr("id", "overallMatrix")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                

    d3.selectAll("a[data-zoom]")
      .on("click", clicked);

    d3.select("#reset")
      .on("click", reset);

    var disable = false;

    d3.select("#plus")
      .on("click", zoomFlag);

    function zoomFlag() {
        disable = !disable;
        isDrawing = !isDrawing;
        if (disable) {
            document.getElementById("matrixHolder").style.cursor = "cell";
            zoom.on("zoom", null);
            svg.call(zoom);
        }
        else {
            document.getElementById("matrixHolder").style.cursor = "default";
            zoom.on("zoom", zoomed);
            svg.call(zoom);
        }
      }

    function reset() {
        svg.call(zoom.event);
        var center0 = center1 = [width/2, height/2]
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

    var fullSVGHorizontal = (windowWidth - 100)/10;
    var fullSVGVertical = Math.round((windowHeight - 210)/10);

    var heatmapChart = function(csvFile) {
        d3.csv(csvFile,
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

            var colorScale = d3.scale.quantile()
                                    .domain([0, 1])
                                    .range(colors);

            //Code to slice the data when drawing the matrix 
            var slicedData = [];


            for (var sliceCount = 0; sliceCount < data.length; sliceCount++) {

                var markerNum = data[sliceCount].Marker;
                var traitNum = data[sliceCount].Trait;

                if (traitNum < fullSVGHorizontal && markerNum < fullSVGVertical) {
                    slicedData.push(data[sliceCount]);
                }
            }

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

            //cards.select("title").text(function(d) { return d.value; });
              
            cards.exit().remove();

            /* Legend code

            legendElementWidth = Math.floor(width/20),
              
            var legendBuckets = [];
            var step = 0;
            for (var i = 0; i < 9; i++) {
              step += 0.11;
              legendBuckets.push(step);
            }

            var legend = svg.selectAll(".legend")
                .data([0].concat(legendBuckets));

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height)
                .attr("width", legendElementWidth)
                .attr("height", legendElementWidth/2)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .attr("class", "mono")
                .text(function(d) { return "≥ " + Math.ceil(d * 100) / 100; })
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + legendElementWidth);

            legend.exit().remove();
            */

        });  
    };

    var overlayMapWidth = 300;
    var overlayMapHeight = 150;


    /* Some minimap code */
    var svgGraphic = d3.select("#chart")
                        .append("svg")
                            .attr("class", "minimap")
                            .attr("width", overlayMapWidth)
                            .attr("height", overlayMapHeight)
                            .style("margin-left", 50)


    for (var col = 0; col < 20; col++) {
        for (var row = 0; row < 15; row++) {

            var random = getRandomInt(0, 2)
            var color = "#7fcdbb"

            if (random == 0) {
                color = "#225ea8"
            }

            svgGraphic.append("rect")
                          .attr("x", col*10)
                          .attr("y", row*10)
                          .attr("rx", 4)
                          .attr("ry", 4)
                          .attr("class", "cell")
                          .attr("width", 10)
                          .attr("height", 10)
                          .attr("value", 1)
                          .style("fill", color)
        }
    }


    function miniZoomed() {

        var translateAmount = d3.event.translate;

        overlay.attr("transform", "translate(" + translateAmount + ")scale(" + 1/d3.event.scale + ")");

        var matrix = d3.select("#overallMatrix")

        var newArray = [-translateAmount[0]*(numTraits/15), -translateAmount[1]*(numMarkers/15)]

        matrix.attr("transform", "translate(" + newArray + ")scale(" + d3.event.scale + ")");


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

    heatmapChart(datasets[0]);

}


/* Tooltip functions that will be edited later */

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

var isDrawing = false;

function hoverOutCell() {
    d3.select(".tooltip").remove();
}

/* Code taken http://stackoverflow.com/a/11674757/4283247 */

(function createMarquee(global, evt) {

    var svgNS = 'http://www.w3.org/2000/svg',
        svg   = document.createElementNS(svgNS,'svg'),
        pt    = svg.createSVGPoint();

    var pointsArray = [];

    global.trackMarquee = function(forElement,onRelease,onDrag) {
        forElement.addEventListener('mousedown',function(evt) {
            if (isDrawing) {
                var point0 = getLocalCoordinatesFromMouseEvent(forElement,evt);
                var marquee = document.createElementNS(svgNS,'rect');
                marquee.setAttribute('class','marquee');
                updateMarquee(marquee,point0,point0);
                marquee.style.strokeDashoffset = 0;
                forElement.appendChild(marquee);

                var offset = 0, marcher = setInterval(function(){
                  marquee.style.strokeDashoffset = offset--;
                }, 30);

                document.documentElement.addEventListener('mousemove',trackMouseMove,false);
                document.documentElement.addEventListener('mouseup',stopTrackingMove,false);

                pointsArray.push(evt.x);
                pointsArray.push(evt.y);

                function trackMouseMove(evt) {
                    var point1 = getLocalCoordinatesFromMouseEvent(forElement,evt);
                    updateMarquee(marquee,point0,point1);
                    //if (onDrag) callWithBBox(onDrag,marquee);
                }

                function stopTrackingMove(evt) {
                    document.documentElement.removeEventListener('mousemove',trackMouseMove,false);
                    document.documentElement.removeEventListener('mouseup',stopTrackingMove,false);
                    pointsArray.push(evt.x);
                    pointsArray.push(evt.y);
                    selectPoints(pointsArray);
                    //clearInterval(marcher);
                    //forElement.removeChild(marquee);
                    //if (onRelease) callWithBBox(onRelease,marquee);
                }
            }
        }, false);
    };


    /* 
    
    function callWithBBox(func,rect) {
        var x = rect.getAttribute('x')*1,
          y = rect.getAttribute('y')*1,
          w = rect.getAttribute('width')*1,
          h = rect.getAttribute('height')*1;
        console.log(func(x, y, x+w, y+h));
        func(x,y,x+w,y+h);
    }

    */

    function updateMarquee(rect,p0,p1) {
        var xs = [p0.x,p1.x].sort(sortByNumber),
          ys = [p0.y,p1.y].sort(sortByNumber);
        rect.setAttribute('x',xs[0]);
        rect.setAttribute('y',ys[0]);
        rect.setAttribute('width', xs[1]-xs[0]);
        rect.setAttribute('height',ys[1]-ys[0]);
    }

    function getLocalCoordinatesFromMouseEvent(el,evt) {
        pt.x = evt.clientX; pt.y = evt.clientY;
        return pt.matrixTransform(el.getScreenCTM().inverse());
    }

    function sortByNumber(a,b) { 
        return a-b 
    }
}) (window);


/* Massive bug, doesn't work on any zoom level except 1 due to how points/values are calculated. 
Think about maybe passing in the zoom  and translation levels as parameters and then calculating 
with the proper offsets */

function selectPoints(pointsArray) {

    var matrix = d3.select("#overallMatrix");

    var marginLeft = 50;
    var marginTop = 50;
    var widthNavbar = 64;
    var cellSize = 10;
    var x1 = pointsArray[0],
        y1 = pointsArray[1],
        x2 = pointsArray[2],
        y2 = pointsArray[3];

    var startingX = x1-marginLeft;
    var endingX = x2-marginLeft;
    var startingY = y1-marginTop-widthNavbar;
    var endingY = y2-marginTop-widthNavbar;


    /* 10 is size of cell */

    var trait1 = Math.round(startingX/10);
    var trait2 = Math.round(endingX/10);
    var marker1 = Math.round(startingY/10);
    var marker2 = Math.round(endingY/10);

    console.log(trait1+1, trait2, marker1+1, marker2);

    var labelText = "<h4> Selected Subset: </h4> " + 
                    "<p> Trait " + trait1 + " - Trait " + trait2 + "</p>" +
                    "<p> Marker " + marker1 + " - Marker " + marker2 + "</p>" +
                    "<a class='waves-effect waves-red btn-flat' id='cancel' onclick='cancelSubset()'> Cancel </a>" +
                    "<a class='waves-effect waves-teal btn-flat' id='add'> Add </a>";

    var tooltip = d3.select("#chart")
                      .append("div")
                        .attr("class", "selector")
                        .html(labelText)
                        .style("position", "absolute")
                        .style("right", "125px")
                        .style("top", "114px")

}

function cancelSubset() {
    d3.select(".selector").remove();
    d3.select(".marquee").remove();
}







/* No longer using this init axis code */
function InitAxis() {

    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    $("#xLabel").html("Traits")
                .css("font-size", "36px")
                .css("font-weight", "700")
                .css("clear", "both")
                .css("position", "static")
                .css("text-align", "center")

    $("#markers").html("Markers")
                .css("font-size", "36px")
                .css("font-weight", "700")
                .css("transform", "rotate(-90deg)")
                .css("left", "0")
                .css("top", windowHeight/3)
                .css("position", "absolute")

}


