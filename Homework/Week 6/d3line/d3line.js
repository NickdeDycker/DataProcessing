
var margin = {top: 20, right: 20, bottom: 30, left: 75};
var width = 1000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data.txt", function(error, data) {

    data.forEach(function(d) {
        d.date = d3.time.format("%Y/%m/%d").parse(d.date);
        d.temp = parseFloat(d.temp);
    });

    var xDom = d3.extent(data, function(d) { return d.date; });
    var yDom = d3.extent(data, function(d) { return d.temp; });

    var xScale = d3.time.scale().range([0, width]).domain(xDom);
    var yScale = d3.scale.linear().range([height, 0]).domain(yDom);

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.temp); });

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

    var bisectDate = d3.bisector(function(d) { return d.date; }).left;
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
        .on('mouseover', function() { focus.style('display', null); })
        .on('mouseout', function() {
                focus.style('display', 'none');
                clearTimeout(timer);
            })
        .on('mousemove', function() {
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