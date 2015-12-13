/**
 * Created by Nick on 13-11-2015.
 */


/*
 * Function to get a color back based on a linear scale.
 */
function getColor(value, minimum, maximum) {

    // Invalid data uses a fillKey
    if (value < -9000) {
        return 'nodata'
    }

    // Split in evenly divided intervals.
    var bounds = [];
    var dx = (maximum - minimum) / 8.;
    for (var i = 0; i <= 8; i++) {
        bounds.push(minimum + i * dx)
    }

    var o = d3.scale.ordinal().domain(bounds).range(colorbrewer.YlOrRd[9]);

    for (i = 1; i < bounds.length; i++) {

        // Color the bound if it is between the two bounds.
        if (value >= bounds[i - 1] && value <= bounds[i]) {
            return o(bounds[i - 1])
        }
    }
    return o(bounds[-1]); // Anything higher than the last one in bounds.
}

/*
 * Create the basis of a graph
 */
function createGraph() {
    svg = d3.select("#graph").append("svg")
        .attr("class", "svg_bar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = [];

    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var yScale = d3.scale.linear().range([height, 0]);

    xScale.domain(data.map(function(d) { return d.month; }));
    yScale.domain([0, d3.max(data, function(d) { return d.value; })]);

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

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
        .attr("x", -230)
        .attr("y", -50)
        .text("Temperature (\u00B0C) \u2192");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.month); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return yScale(d.value); })
        .attr("height", function(d) { return height - yScale(d.value); });
}

/*
 * Change the graph based on the data input.
 */
function updateGraph(order) {
    dataURL = window.country;
    dataSET = window.dataset;
    document.getElementById("graph").style.visibility = "visible";

    // Order is a number that indicates the month. If it's 0, plot all months.
    if (order !== parseInt(order, 10)) {
        var data_obj = d3.time.format("%b").parse(order);
        order = d3.time.format("%m")(data_obj);
    }

    var fname = "DATA/" + dataSET + "/" + dataURL + "_month.txt";
    if (order != 0) {
        fname = "DATA/" + dataSET + "/" + dataURL + "_" + order + ".txt"
    }

    d3.json(fname, function (error, data) {
        if (error) {
            d3.select("#graph").style("visibility", "hidden")
            return
        }

        // Months if order equals 0 or else use days
        if (order == 0) {
            data.forEach(function (d) {
                d.month = d.month > 9 ? String(d.month) : "0" + String(d.month);
                var data_obj = d3.time.format("%m").parse(d.month);
                d.month = d3.time.format("%b")(data_obj);
            });
        }
        else {
            data.forEach(function (d) {
                var data_obj = d3.time.format("%Y/%m/%d").parse(d.date);
                d.month = d3.time.format("%d %b")(data_obj);
            });
        }

        var yScale = d3.scale.linear().range([height, 0]);
        var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);

        var maximum = d3.max(data, function(d) { return d.value; });
        var minimum = d3.min(data, function(d) { return d.value; });

        // Minimize the y-range.
        var min_range = minimum - ((maximum - minimum) / 10.);

        xScale.domain(data.map(function(d) { return d.month; }));
        yScale.domain([min_range, d3.max(data, function(d) { return d.value; })]);

        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        d3.select(".x").transition().call(xAxis);
        d3.select(".y").transition().call(yAxis);
        d3.select(".ylabel").text(window.setToText[window.dataset]);
        console.log(data);
        // Add rectangles
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return xScale(d.month);
            })
            .attr("width", xScale.rangeBand())
            .attr("y", function (d) {
                return yScale(d.value);
            })
            .attr("height", function (d) {
                return height - yScale(d.value);
            });

        console.log(svg.selectAll("rect"));
        left_value = widthContentLeft + margin.left + 13;
        top_value = heightMap + heightMenu * 2 + heightTitle + margin.top + 10;

        // Add tooltip and the ability to go from months to days and backwards.
        if (order != 0) {
            svg.selectAll("rect")
                .on("click", function (d) {
                    return updateGraph(0);
                })
                .on("mouseover", function(d) {
                    d3.select("#tooltip")
                        .text(d3.round(d.value, 2))
                        .style("display", "inline")
                        .style("top", (yScale(d.value) + top_value) + "px")
                        .style("left", (xScale(d.month) + left_value) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select("#tooltip").style("display", "none");
                });

            // Click anywhere on the graph to go back to months
            d3.select("#graph")
                .on("click", function(d) {
                    return updateGraph(0);
                });
        }
        else {
            svg.selectAll("rect")
                .on("click", function (d) {
                    return updateGraph(d.month);
                })
                .on("mouseover", function(d) {
                    d3.select("#tooltip")
                        .text(d3.round(d.value, 2))
                        .style("display", "inline")
                        .style("top", (yScale(d.value) + top_value) + "px")
                        .style("left", (xScale(d.month) + left_value) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select("#tooltip").style("display", "none");
                });

            // Click a bar to get that month in days.
            d3.select("#graph")
                .on("click", function(d) {
                    return false;
                });
        }

        // Update data
        svg.selectAll("rect")
            .data(data)
            .transition()
            .duration(500)
            .attr("y", function(d) { return yScale(d.value); })
            .attr("height", function(d) { return height - yScale(d.value); })
            .attr("x", function(d) { return xScale(d.month); })
            .attr("width", xScale.rangeBand());

        // Remove rectangles
        svg.selectAll("rect")
            .data(data)
            .exit()
            .transition()
            .attr("y", function(d) { return yScale(d.value); })
            .attr("height", function(d) { return height - yScale(d.value); })
            .attr("x", function(d) { return xScale(d.month); })
            .attr("width", xScale.rangeBand())
            .remove()

    });
}

/*
 * update the map depending on what is clicked on.
 */
function updateMap(div_state) {
    var id = this.id;

    // Whether or not clicked on a dataset.
    div_state = typeof div_state !== 'undefined' ? div_state : 0;

    d3.select("#text3").style("display", "inline-block");

    // A data State button is clicked, retain the last dataset.
    if (div_state == 1) {
        id = window.dataset;
    }

    // Color the button of the selected dataset back to white.
    d3.select("#" + window.dataset).transition().style("background", "#464646");
    window.dataset = id;
    d3.select("#" + id).transition().style("background", "#ADD8E6");

    // Set to visible for the first time.
    d3.select("#worldMap").transition().style("visibility", "visible");

    cleanMap();

    if (window.state == "station") {
        showStations(id);
    }
    else {
        map.bubbles([]);
        setTimeout(colorMap(id), 500);
    }
}

/*
 * Color and update the map
 */
function colorMap() {
    data = d3.json("DATA/" + window.dataset + "/global.txt", function(error, data) {
        var data_dict = {};
        window.data_values = {};

        var minimum = 10000;
        var maximum = -10000;

        // Create global dictionary for country > value and find maximum and minimum values.
        data.forEach(function(d) {
            window.data_values[d.country] = d.value;
            if (d.value > maximum && d.value != -9999) {
                maximum = d.value
            }
            if (d.value < minimum && d.value != -9999) {
                minimum = d.value
            }
        });

        // Get the color corresponding to a value and set onclick function.
        data.forEach(function(d) {
            var c = getColor(d.value, minimum, maximum);

            if (c == "nodata") {
                data_dict[d.country] = {fillKey: c, borderWidth: 5};
            }
            else {
                data_dict[d.country] = c;
            }

            // Show graph on click.
            if (c != "nodata") {
                map.svg.select("." + d.country).on("click", function () {
                    ds = {};

                    if (window.country !== null) {
                        ds[window.country] = getColor(d.value, minimum, maximum);
                    }

                    window.country = d.country;
                    ds[window.country] = "#000099";

                    setTimeout(function() { map.updateChoropleth(ds) }, 1000);
                    updateGraph(0);
                });
            }
         });

        map.updateChoropleth(data_dict);

        // If changed from stations to data.
        if (window.country !== null) {
            updateGraph(0);
        }

    });
}

/*
 * show circles of different size representing stations of a specific country.
 */
function showStations() {
    d3.select("#graph").transition().style("visibility", "hidden");
    map.bubbles([]);

    d3.json("DATA/" + window.dataset + "/stations.txt", function(error, data) {
        var bubbles_array = [];

        // Update all bubbles.
        data.forEach(function (d) {
            var radius = d.count > 9 ? d.count / 3 : 3;
            radius = radius > 8 ? 8 : radius;

            bubbles_array.push({name: d.name, latitude: d.lat, longitude: d.long, radius: radius,
                fillKey: "bubble", borderColor: "#000000", iso3: d.iso3, count: d.count})
        });

        // Timeout for javascript async behavior.
        setTimeout(function(d) {
            map.bubbles(bubbles_array)
        }, 500);

        setTimeout(function(d) {
            map.svg.selectAll('.datamaps-bubble').on('click', zoomAndExpand)
        }, 500);
    })
}

/*
 * Zoom in on a country and show its individual stations.
 */
function zoomAndExpand() {

    // Get the country from a circle object.
    var country = JSON.parse(d3.select(this).attr("data-info")).iso3;
    window.zoom = true;

    d3.json("DATA/" + window.dataset + "/stations.txt", function(error, data) {
        var bubbles_array = [];
        var avg_lat;
        var avg_lon;
        var scale_factor;

        // Find the country, add its stations and calculated the maximum lat or lon difference.
        data.forEach(function (d) {

            if (d.iso3 == country) {

                d.stations.forEach(function(e) {
                    bubbles_array.push({name: e.name, latitude: e.lat, longitude: e.lon, radius: 1,
                    fillKey: "bubble", borderColor: "#000000"})
                });

                var max_lon = d3.max(d.stations, function (f) { return f.lon; });
                var min_lon = d3.min(d.stations, function (f) { return f.lon; });
                var max_lat = d3.max(d.stations, function (f) { return f.lat; });
                var min_lat = d3.min(d.stations, function (f) { return f.lat; });
                avg_lat = (max_lat + min_lat) / 2;
                avg_lon = (max_lon + min_lon) / 2;

                var lat_diff = max_lat - min_lat;
                var lon_diff = max_lon - min_lon;
                scale_factor = lat_diff > lon_diff ? lat_diff : lon_diff
            }
        });

        // Scale the map depending on maximum difference lat/lon.
        scale_factor = scale_factor < 50 ? scale_factor : 50;
        scale_factor = scale_factor == 0 ?  5 : scale_factor;
        map.projection = d3.geo.equirectangular()
            .center([avg_lon, avg_lat])
            .scale(16000 / scale_factor);

        map.path = d3.geo.path()
            .projection(map.projection);

        d3.selectAll('path').transition().attr('d', map.path);

        setTimeout(map.bubbles(bubbles_array), 500);
        map.svg.on("click", cleanMap);

    })
}

/*
 * Reset every country to its original values and removes onclicks.
 */
function cleanMap() {
    var data_dict = {};

    var cleaner = ['ALB', 'DZA', 'ARM', 'AUT', 'AZE', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EGY', 'EST',
            'FIN', 'FRA', 'GEO', 'DEU', 'GIB', 'GRC', 'GRL', 'HUN', 'ISL', 'IRN', 'IRQ', 'IRL', 'ISR', 'ITA', 'KAZ', 'KGZ',
            'LVA', 'LBN', 'LBY', 'LIE', 'LTU', 'LUX', 'MKD', 'MLT', 'MDA', 'MAR', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'RUS',
            'SAU', 'SRB', 'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'SYR', 'TJK', 'TUN', 'TUR', 'TKM', 'UKR', 'GBR', 'UZB'];

    map.svg.on("click", function() { return false; });

    // Reset color and on click function.
    for (var i = 0; i < cleaner.length; i++) {
        data_dict[cleaner[i]] = {fillKey: 'nodata', value: -9999};
        map.svg.select("." + cleaner[i]).on("click", function () {
            return false;
        })
    }

    // Don't show stations if clicked on data.
    map.bubbles([]);
    map.updateChoropleth(data_dict);
    if (window.zoom === true) {
        window.zoom = false;
        map.projection = d3.geo.equirectangular()
            .center([10, 50])
            .scale(350);

        map.path = d3.geo.path()
            .projection(map.projection);

        // Don't show stations if clicked on data.
        if (window.state == "station") {
            showStations(window.dataset);
        }
        setTimeout( function() { d3.selectAll('path').transition().attr('d', map.path); }, 250);
    }
}

/*
 * Function to change color used for mouseover.
 */
function colorChangeHover() {
    d3.select("#" + this.id).transition().style("background", "#262626")
}

/*
 * Function to change color used for mouseout.
 */
function colorChangeBack() {
    if (window.dataset == this.id) {
        d3.select("#" + this.id).transition().style("background", "#ADD8E6")
    }
    else {
        d3.select("#" + this.id).transition().style("background", "#464646")
    }
}


window.state = null;
window.dataset = null;
window.country = null;
window.zoom = false;
window.data_values = {};
window.setToText = {"TX": "Max Temp. (\u00B0C) \u2192",
                    "TN": "Min Temp. (\u00B0C) \u2192",
                    "TG": "Mean Temp. (\u00B0C) \u2192",
                    "RR": "Precipitation (mm) \u2192",
                    "PP": "Sea level pressure (hPa) \u2192",
                    "CC": "Cloud cover (oktas) \u2192",
                    "HU": "Humidity (%) \u2192",
                    "SD": "Snow depth (10 cm) \u2192",
                    "SS": "Sunshine duration (hours) \u2192",
                    "FG": "Mean wind speed (m/s) \u2192",
                    "FX": "Max wind gust (m/s) \u2192",
                    "DD": "Wind direction (\u00B0) \u2192"};

widthTotal = window.innerWidth;
heightTotal = window.innerHeight;

widthTitle = 98 * (widthTotal / 100.);
heightTitle = 9 * (heightTotal / 100.);

widthContent = 98 * (widthTotal / 100.);
heightContent = 89 * (heightTotal / 100.);

widthContentLeft = 25 * (widthContent / 100.);
widthContentRight = 75 * (widthContent / 100.);

heightMap = 45 * (heightContent / 100.);
heightGraph = 35 * (heightContent / 100.);
heightMenu = 10 * (heightContent / 100.);

widthButton = 40 * (widthContentRight / 100.);
heightButton = 80 * (heightMenu / 100.);

d3.select("#title")
    .style("width", widthTitle + "px")
    .style("height", heightTitle + "px");

d3.select("#textWrapper")
    .style("width", widthContentLeft + "px")
    .style("height", heightContent + "px");

d3.select("#wrapper2")
    .style("width", widthContentRight + "px")
    .style("height", heightContent + "px");

d3.select("#worldMap")
    .style("width", widthContentRight + "px")
    .style("height", heightMap + "px");

d3.select("#graph")
    .style("width", widthContentRight + "px")
    .style("height", heightGraph + "px");

d3.select("#menu2")
    .style("width", widthContentRight + "px")
    .style("height", heightMenu + "px");

d3.select("#menu1")
    .style("width", widthContentRight + "px")
    .style("height", heightMenu + "px");

d3.select("#data")
    .style("width", widthButton + "px")
    .style("height", heightButton + "px");

d3.select("#stations")
    .style("width", widthButton + "px")
    .style("height", heightButton + "px");

fonts = (widthContentRight / 1920) * 30;
d3.select(".textdiv1").style("font-size", fonts + "px");
d3.select(".textdiv").style("font-size", fonts + "px");
d3.select("#right").style("font-size", fonts + "px");
d3.select("#text3").style("font-size", fonts + "px");

var datasets = ["CC", "DD", "FG", "FX", "HU", "PP", "RR", "SD", "SS", "TG", "TN", "TX"];
var div_width = (widthContentRight / (parseFloat(datasets.length) + 4));
var div_height = div_width;


d3.select("#text1").style("display", "inline-block");
var menu_div = document.getElementById("menu2");
var wrapper3 = document.getElementById("wrapper4");

leftField = document.getElementById("left");
rightField = document.getElementById("right");
graphdiv = document.getElementById("graph");

var margin = {top: 20, right: 20, bottom: 30, left: 75};
var width = graphdiv.offsetWidth - margin.left - margin.right;
var height = graphdiv.offsetHeight - margin.top - margin.bottom;


var map = new Datamap({
    element: document.getElementById('worldMap'),
    fills: {
        nodata: '#ABDDA4',
        bubble: "#28170B",
        defaultFill: "#ABDDA4"
    },
    // Set the text to display on hover.
    geographyConfig: {
        borderColor: '#000000',
        popupTemplate: function(country, data) { //this function should just return a string
            if (window.state == "station") {
                return '<div class="hoverinfo"><strong>' + '<b>' + country.properties.name + '</b></strong></div>';
            }
            // No data available
            if (window.data_values[country.id] == null) {

                return '<div class="hoverinfo"><strong>' + '<b>' + country.properties.name + '</b>' + '<br>'
                    + 'No data available' + '</strong></div>';
            }
            // Incorrect data
            if (window.data_values[country.id] == -9999) {
                return '<div class="hoverinfo"><strong>' + '<b>' + country.properties.name + '</b>' + '<br>'
                    + 'No data available' + '</strong></div>';
            }
            return '<div class="hoverinfo"><strong>' + '<b>' + country.properties.name + '</b>' + '<br>'
                    + 'Avg. Value: ' + window.data_values[country.id] + '</strong></div>';
        }
    },
    bubblesConfig: {
        popupOnHover: true,
        popupTemplate: function (geography, data) {
            if (window.zoom === false) {
                return '<div class="hoverinfo"><strong>' + '<b>' + geography.iso3 + '</b>' + '<br>'
                    + "Number of stations: " + geography.count + '</strong></div>';
            }
            else {
                return '<div class="hoverinfo"><strong>' + '<b>' + geography.name + '</b></strong></div>';
            }
        }
    },
    scope: 'world',
    setProjection: function(element) {
        var projection = d3.geo.equirectangular()
            .center([10, 50])
            .scale(350);
            //.translate([width / 2., height / 2.]);

        var path = d3.geo.path()
            .projection(projection);

        return {path: path, projection: projection};
    },
    data: {  // Specify there is data, without this, it returns errors.
    }
});

// Add text
for (var key in window.setToText) {
    str = window.setToText[key];
    leftField.innerHTML = leftField.innerHTML + key + " : <br>";
    rightField.innerHTML = rightField.innerHTML + str.slice(0, -1) + "<br>"
}

var svg;
createGraph();

// Add buttons
for (var i = 0; i < datasets.length; i++) {
    var div = document.createElement("div");
    div.id = datasets[i];
    div.className = "round-button";
    div.style.width = div_width + "px";
    div.style.height = div_height + "px";
    div.style.marginLeft = "10px";
    div.style.display= "inline-block";
    div.addEventListener("click", updateMap);
    div.addEventListener("mouseover", colorChangeHover);
    div.addEventListener("mouseout", colorChangeBack);
    div.innerHTML = datasets[i];
    wrapper3.appendChild(div);
}

var stations_div = d3.select("#stations");
var data_div = d3.select("#data");

stations_div.on("click", function () {
    window.state = "station";
    window.country = null;

    if (window.dataset === null) {
        d3.select("#text2").transition().style("display", "inline-block");
    }

    if (window.dataset !== null){
        updateMap(1)
    }
    stations_div.transition().style("background", "#ADD8E6");
    data_div.transition().style("background", "#464646");
    d3.select("#menu2").transition().style("visibility", "visible");
});

data_div.on("click", function () {
    window.state = "data";

    if (window.dataset === null) {
        d3.select("#text2").transition().style("display", "inline-block");
    }
    if (window.dataset !== null){
        updateMap(1)
    }
    data_div.transition().style("background", "#ADD8E6");
    stations_div.transition().style("background", "#464646");
    d3.select("#menu2").transition().style("visibility", "visible");
});

stations_div.on("mouseover", function () {
    stations_div.transition().style("background", "#262626");
});

data_div.on("mouseover", function () {
    data_div.transition().style("background", "#262626");
});

stations_div.on("mouseout", function () {
    if (window.state == "station") {
        stations_div.transition().style("background", "#ADD8E6");
    }
    else {
        stations_div.transition().style("background", "#464646");
    }
});

data_div.on("mouseout", function () {
    if (window.state == "data") {
        data_div.transition().style("background", "#ADD8E6");
    }
    else {
        data_div.transition().style("background", "#464646");
    }
});


