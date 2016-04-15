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


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function InitChart() {

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
                .scaleExtent([0.5, 8])
                .on("zoom", zoomed)

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        var zoomAmount = d3.event.scale;
        var translateAmount = d3.event.translate;

        var overlay = d3.select("#map-background");

        // Get new calculations for transform and translate
        var newZoom = 1/zoomAmount;
        var newArray = [-translateAmount[0], -translateAmount[1]]

        overlay.attr("transform", "translate(" + newArray + ")scale(" + newZoom + ")");

    }

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoom)
                .append("g")
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
            zoom.on("zoom", null);
            svg.call(zoom);
        }
        else {
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

            var cards = svg.selectAll(".hour")
                          .data(slicedData, function(d) { return d.Marker+':'+d.Trait;});

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

            cards.select("title").text(function(d) { return d.value; });
              
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

    /* Some minimap code */
    var svgGraphic = d3.select("#chart")
                      .append("svg")
                      .attr("class", "minimap")
                      .attr("width", 300)
                      .attr("height", 150)
                      .style("margin-left", 50)
                      //.attr("transform", "translate(" + offset + "," + 50 + ")")

              
    svgGraphic.append("g")
              .attr("class", "cellGroupings")


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
                      .style("fill", color)
        }
    }

    var miniZoom = d3.behavior.zoom()
                .size([width, height])
                .scaleExtent([0.5, 8])
                .on("zoom", miniZoomed)


    function miniZoomed() {

    }



    svgGraphic.append("g")
              .attr("class", "frame")
              .append("rect")
              .attr("id", "map-background")
              .style("width", 100)
              .style("height", 100)
              .attr("transform", "translate(" + 0 + "," + 0 + ")")
              .call(miniZoom)


    heatmapChart(datasets[0]);

}


/* Tooltip functions that will be edited later */

function hoverOnCell(d, trait, marker, correlation) {

    var labelText = "<h3>Trait: T" + trait + "</h3> <h3>Marker: M" + marker + "</h3> <p> Correlation: " + correlation + "</p>";

    var infolabel = d3.select("#chart")
                      .append("div")
                      .attr("class", "infolabel")
                      .html(labelText)
                      .style("top", 200 + "px")
                      .style("left", 150 + "px")
                      .style("position", "fixed")
                      .style("width", 210)
                      .style("height", "auto")
                      .style("background-color", "gray")
                      .style("border", "solid thin #999")
                      .style("border-radius", 5)
                      .style("padding", 5)
                      .style("opacity", 0.99)
                      .style("z-index", 100);
}

var isDrawing = false;

function hoverOutCell() {
    d3.select(".infolabel").remove();
}

//Code taken http://stackoverflow.com/a/11674757/4283247
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

                //var offset = 0, marcher = setInterval(function(){
                //  marquee.style.strokeDashoffset = offset--;
                //},30);

                document.documentElement.addEventListener('mousemove',trackMouseMove,false);
                document.documentElement.addEventListener('mouseup',stopTrackingMove,false);

                pointsArray.push(evt.x);
                pointsArray.push(evt.y);

                function trackMouseMove(evt) {
                    var point1 = getLocalCoordinatesFromMouseEvent(forElement,evt);
                    updateMarquee(marquee,point0,point1);
                    if (onDrag) callWithBBox(onDrag,marquee);
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

    function callWithBBox(func,rect) {
        var x = rect.getAttribute('x')*1,
          y = rect.getAttribute('y')*1,
          w = rect.getAttribute('width')*1,
          h = rect.getAttribute('height')*1;
        func(x,y,x+w,y+h);
    }

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

function selectPoints(pointsArray) {

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

    var point1 = startingX/10;
    var point2 = endingX/10;
    var point3 = startingY/10;
    var point4 = endingY/10;

    console.log(Math.round(point1)+1, Math.round(point2), Math.round(point3), Math.round(point4));

}







