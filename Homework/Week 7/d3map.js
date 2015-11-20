/**
 * Created by Nick on 13-11-2015.
 */

    // A function that returns in which bound a certain density value is.
    function getColor(value) {
        var bounds = [0, 10, 25, 50, 75, 100, 150, 300, 1000];
        var colorCodes = ['bound1', 'bound2', 'bound3', 'bound4', 'bound5',
            'bound6', 'bound7', 'bound8', 'bound9'];

        for (var i = 1; i < bounds.length; i++) {

            // Color the bound if it is between the two bounds.
            if (value >= bounds[i - 1] && value < bounds[i]) {
                return colorCodes[i - 1];
            }
        }
        return bounds[-1]; // Anything higher than the last one in bounds.
    }

    var map = new Datamap({element: document.getElementById('worldMap'),
        fills: {
            bound1: '#F4E3D7',
            bound2: '#E9C6AF',
            bound3: '#DEAA87',
            bound4: '#D38D5F',
            bound5: '#C87137',
            bound6: '#A05A2C',
            bound7: '#784421',
            bound8: '#502D16',
            bound9: '#28170B',
            defaultFill: "#ABDDA4"
        },
        // Set the text to display on hover.
        geographyConfig: {
            popupTemplate: function(country, data) { //this function should just return a string
                return '<div class="hoverinfo"><strong>' + '<b>' + country.properties.name + '</b>' + '<br>'
                        + 'Pop. Density: ' + data.density + '</strong></div>';
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                document.getElementById("graph").innerHTML = "";
                createGraph();
            });
        },
        scope: 'world',
        setProjection: function(element) {
            var projection = d3.geo.equirectangular()
                .center([13, 50])
                .rotate([0, 0])
                .scale(800)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

            var path = d3.geo.path()
                .projection(projection);

            return {path: path, projection: projection};
        },
        data: {  // Specify there is data, without this, it returns errors.
        }
    });

    // Open the json with the 3 letter codes and densities.
    data = d3.json("densities.txt", function(error, data) {
        var data_dict = {};

        data.forEach(function(d) {
            var c = getColor(d.density);
            data_dict[d.iso3] = {fillKey: c, density: d.density};
         });
        map.updateChoropleth(data_dict);
    });

function createGraph() {
    var margin = {top: 20, right: 20, bottom: 30, left: 75};
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("data.txt", function (error, data) {

        data.forEach(function (d) {
            d.date = d3.time.format("%Y/%m/%d").parse(d.date);
            d.temp = parseFloat(d.temp);
        });

        var xDom = d3.extent(data, function (d) {
            return d.date;
        });
        var yDom = d3.extent(data, function (d) {
            return d.temp;
        });

        var xScale = d3.time.scale().range([0, width]).domain(xDom);
        var yScale = d3.scale.linear().range([height, 0]).domain(yDom);

        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var line = d3.svg.line()
            .x(function (d) {
                return xScale(d.date);
            })
            .y(function (d) {
                return yScale(d.temp);
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "ylabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -170)
            .attr("y", -50)
            .text("Temperature (\u00B0C) \u2192");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        var focus = svg.append('g').style('display', 'none');

        focus.append('line')
            .attr('id', 'focusLineX')
            .attr('class', 'focusLine');
        focus.append('line')
            .attr('id', 'focusLineY')
            .attr('class', 'focusLine');

        var bisectDate = d3.bisector(function (d) {
            return d.date;
        }).left;
        var timer;

        var toolTip = svg.append('g').style('display', 'none');

        toolTip.append('text')
            .attr('id', 'rectTemp')
            .attr('width', 100)
            .attr('height', 30)
            .text('');

        toolTip.append('text')
            .attr('id', 'rectDate')
            .attr('width', 30)
            .attr('height', 100)
            .text('')
            .style('fill', 'black')
            .attr('transform', 'rotate(90)');

        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', function () {
                focus.style('display', null);
            })
            .on('mouseout', function () {
                focus.style('display', 'none');
                clearTimeout(timer);
            })
            .on('mousemove', function () {
                var mouse = d3.mouse(this);
                var mouseDate = xScale.invert(mouse[0]);
                var i = bisectDate(data, mouseDate);
                var mouseTemp = yScale(data[i].temp);

                focus.select('#focusLineX')
                    .attr('x1', mouse[0]).attr('y1', yScale(yDom[0]))
                    .attr('x2', mouse[0]).attr('y2', yScale(yDom[1]));
                focus.select('#focusLineY')
                    .attr('x1', xScale(xDom[0])).attr('y1', mouseTemp)
                    .attr('x2', xScale(xDom[1])).attr('y2', mouseTemp);

                clearTimeout(timer);
                toolTip.style('display', 'none');

                timer = setTimeout(function () {
                    toolTip.style('display', null);

                    var toolTipX = (width + mouse[0] - 100) / 2;
                    if (mouse[0] > width / 2) {
                        toolTipX = (mouse[0] - 100) / 2
                    }

                    var toolTipY = (height + mouseTemp - 100) / 2;
                    if (mouseTemp > height / 2) {
                        toolTipY = (mouseTemp - 100) / 2
                    }

                    toolTip.select('#rectTemp')
                        .attr('x', toolTipX)
                        .attr('y', mouseTemp)
                        .text(data[i].temp + '\u00B0C')
                        .style('font-size', '20px');

                    toolTip.select('#rectDate')
                        .attr('x', toolTipY)
                        .attr('y', -mouse[0])
                        .text(data[i].date.toDateString())
                        .style('font-size', '20px');

                }, 500);

            })


    });
}