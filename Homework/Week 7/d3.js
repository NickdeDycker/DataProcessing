var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xTransform = d3.scale.linear().range([0, width]);
var xAxis = d3.svg.axis().scale(xTransform).orient("bottom");

var yTransform = d3.time.scale().range([height, 0]);
var yAxis = d3.svg.axis().scale(yTransform).orient("left");

var line = d3.svg.line()
    .x(function(d) { return xTransform(d.date); })
    .y(function(d) { return yTransform(d.temp); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data.txt", function(error, data) {
    var dates = [];
    var temps = [];
    for (var key in data) {
        dates.push(key)
        temps.push(data[key])
    }

    data = {date: dates, temp: temps};

    xTransform.domain(d3.extent(data, function(d) { return d.date; }));
    yTransform.domain(d3.extent(data, function(d) { return d.temp; }));

    svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Price ($)");
    svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);
    console.log("test");
});