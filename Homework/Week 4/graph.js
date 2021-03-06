// Main function for drawing the complete graph.
function Graph() {
    this.canvas = document.getElementById('graph');
    this.context = canvas.getContext('2d');
    var maxTemp = Math.max.apply(Math, temps);
    var minTemp = Math.min.apply(Math, temps);
    this.maxY = maxTemp + (5 - (maxTemp % 5));
    this.minY = minTemp - (minTemp % 5);
    this.maxX = 365;
    this.minX = 0;
    this.offsetX = 100;
    this.offsetY = 100;
    this.lengthY = this.canvas.height - 2 * this.offsetY;  // Length of the axis, not the canvas.
    this.lengthX = this.canvas.width - 2 * this.offsetX;
    this.axisX = [this.offsetX, this.canvas.width - this.offsetX];
    this.axisY = [this.offsetY, this.canvas.height - this.offsetY];

    context.strokeStyle = '#000000';

    this.drawAxisY();
    this.drawAxisX();

    context.font = '26pt Calibri';
    context.textAlign = "center";
    context.fillText("Temperature in The Bilt in 2014", this.canvas.width / 2, this.offsetY / 2);
}

// Drawing the x-axis and its ticks.
function drawAxisX() {
    var context = this.context;
    context.beginPath();

    // Draw the axis itself.
    context.moveTo(this.axisX[0], this.canvas.height - this.offsetY);
    context.lineTo(this.axisX[1], this.canvas.height - this.offsetY);
    context.strokeStyle = '#000000';
    context.lineWidth = 1;
    context.stroke();

    var pos = this.axisX[0];
    var interval = this.lengthX / (this.maxX - this.minX);

    // Place text monthArray[n] at x-coordinate posArray[n]
    var posArray = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var monthArray = [' 01-Jan', '01-Feb', '01-Mrt', '01-Apr', '01-Mei', '01-Jun', '01-Jul', '01-Aug', '01-Sep',
            '01-Okt', '01-Nov', '01-Dec', ''];
    var n = 0;

    // Draw a marker and add text maandArray[n] at x-coordinate array[n].
    while (pos <= this.axisX[1]) {
        context.moveTo(pos, this.canvas.height - this.offsetY);
        context.lineTo(pos, this.canvas.height - this.offsetY + 10);
        context.stroke();

        // Add rotate text by translating, rotating and restoring the canvas.
        context.save();
        context.translate(pos - 5, this.canvas.height - this.offsetY + 20);
        context.rotate(-Math.PI/4);
        context.textAlign = "right";
        context.fillText(monthArray[n], 0, 0);
        context.restore();

        pos += posArray[n + 1] * interval;
        n += 1;
    }
}

// Draw the y-axis and its ticks.
function drawAxisY() {
    var context = this.context;
    context.beginPath();

    // The Y-axis itself.
    context.moveTo(this.offsetX, this.axisY[0]);
    context.lineTo(this.offsetX, this.axisY[1]);
    context.lineWidth = 2;
    context.stroke();

    var pos = this.axisY[0];
    var interval = this.lengthY / (this.maxY - this.minY);

    // Drawing each marker/tick
    while (pos <= this.axisY[1]) {
        // Draw the marker of 10 pixels length
        context.beginPath();
        context.moveTo(this.offsetX, pos);
        context.lineTo(this.offsetX - 10, pos);
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.stroke();

        // Add the text (markertext/ticktext)
        context.font = '14pt Calibri';
        context.textAlign = "right";
        var relativePos = 1 - ((pos - this.offsetY) / this.lengthY);
        var value = relativePos * (this.maxY - this.minY) + this.minY;
        context.fillText(Math.round(value), this.offsetX - 18, pos + 5);

        // Add horizontal grid.
        context.beginPath();
        context.moveTo(this.offsetX, pos);
        context.lineTo(this.canvas.width - this.offsetX, pos);
        context.strokeStyle = '#aaa';
        context.lineWidth = 1;
        context.stroke();

        pos += interval * 5;
        pos = parseInt(pos);
    }

    // Add y-label
    context.save();
    context.translate(this.offsetX - 60, this.offsetY);
    context.rotate(-Math.PI/2);
    context.font = '18pt Calibri';
    context.textAlign = "right";
    context.fillText("Temperature (\u00B0C) \u2192", 0, 0);
    context.restore();

}

// Draw a function given its y-coordinates.
function drawLine(temps) {
    var context = this.context;
    var coord = coordinatesToPixel(0, temps[0]);
    context.moveTo(coord[0], coord[1]);

    for (var n = 0; n < temps.length; n++) {
        coord = coordinatesToPixel(n, temps[n]);
        context.lineTo(coord[0], coord[1]);
        context.stroke();
    }
}

// Translate graph coordinates to pixel position.
function coordinatesToPixel(x, y) {
    // Y - coordinate
    var unitY = this.lengthY / (this.maxY - this.minY);
    var pixelsToAxisX = (y - this.minY) * unitY;
    var positionY = this.canvas.height - this.offsetY - pixelsToAxisX;

    // X - coordinate
    var unitX = this.lengthX / (this.maxX - this.minX);
    var pixelsToAxisY = (x - this.minX) * unitX;
    var positionX = this.offsetX + pixelsToAxisY;
    return [positionX, positionY]
}

// Translate pixel position to graph coordinates.
function pixelToCoordinates(x, y) {

    var yPixel = y - this.offsetY;
    var xPixel = x - this.offsetX;
    var unitY = (this.maxY - this.minY) / this.lengthY;
    var unitX = (this.maxX - this.minX) / this.lengthX;
    var yCoord = (this.lengthY - yPixel) * unitY + this.minY;
    var xCoord = xPixel * unitX - this.minX;
    return [Math.round(xCoord), Math.round(yCoord)];

}

// Onload function for XMLHTTPRequest.
function loadData () {
    var daysToTemp = JSON.parse(this.responseText);

    for (var date in daysToTemp) {
        days.push(date);
        temps.push(daysToTemp[date] / 10)
    }

    // After this we draw the line, so we don't draw before we load the data.
    Graph();
    drawLine(temps);
}


// Draw the crosshair.
function drawCrosshair(mousePos) {
    context1.beginPath();

    var coord = pixelToCoordinates(mousePos.x, mousePos.y);
    var posX = Math.round(coord[0]);
    var posY = temps[posX];
    var coord2 = coordinatesToPixel(posX, posY);

    // Draw the crosshair
    context1.moveTo(this.axisX[0], coord2[1]);
    context1.lineTo(this.axisX[1], coord2[1]);
    context1.moveTo(mousePos.x, this.axisY[0]);
    context1.lineTo(mousePos.x, this.axisY[1]);

    context1.strokeStyle = '#000000';
    context1.lineWidth = 1;
    context1.stroke();
}

// Draw the 2 tooltip boxes for date and temperature.
function drawTooltip(mousePos) {
    context1.beginPath();

    var coord = pixelToCoordinates(mousePos.x, mousePos.y);
    var posX = Math.round(coord[0]);
    var posY = temps[posX];
    var coord2 = coordinatesToPixel(posX, posY);

    // Determine the position of the temperature tooltip
    var toolTipX = (mousePos.x + this.offsetX) / 2;
    if (mousePos.x < this.canvas1.width / 2) {
        toolTipX = (mousePos.x + this.lengthX + this.offsetX) / 2;
    }

    // Determine the position of the date tooltip
    var toolTipY = (coord2[1] + this.offsetY) / 2;
    if (coord2[1] < this.canvas1.height / 2) {
        toolTipY = (coord2[1] + this.lengthY + this.offsetY) / 2;
    }

    context1.font = '18pt Calibri';

    // Black box for temperature
    context1.fillStyle = "black";
    context1.fillRect(toolTipX, coord2[1], 100 - 30, 24);

    // Text for temperature
    context1.fillStyle = "white";
    context1.fillText(temps[posX] + "\u00B0C", toolTipX + 5, coord2[1] + 20);

    // Black box for date
    context1.fillStyle = "black";
    context1.fillRect(mousePos.x, toolTipY - 50, 30, 125);

    // Text for date
    context1.fillStyle = "white";
    context1.save();
    context1.translate(mousePos.x, toolTipY - 30);
    context1.rotate(-3*Math.PI/2);
    context1.textAlign = "right";
    context1.fillText(days[posX], + 100, - 5);
    context1.restore();
}

// Retrieve the mouse position on screen
function getMousePos(canvas1, evt) {
    var rect = canvas1.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

// Draw the crosshair and tooltip depending on a TimeOut.
function drawCrosshairTooltip (mousePos) {

    // Only draw if within the graph.
    if (mousePos.y >= this.axisY[0] && mousePos.y <= this.axisY[1] &&
            mousePos.x >= this.axisX[0] && mousePos.x <= this.axisX[1]) {

        // CLear the crosshair canvas and redraw.
        context1.clearRect(0, 0, canvas1.width, canvas1.height);
        drawCrosshair(mousePos);

        clearTimeout(timer);
        timer = setTimeout(function () {
            drawTooltip(mousePos);
        }, 500);
    }
}

var days = [];
var temps = [];
var url = "data.txt";
var request = new XMLHttpRequest();
request.addEventListener('load', loadData);
request.open("GET", url, true);
request.send();

var canvas1 = document.getElementById('crosshair');
var context1 = canvas1.getContext('2d');
var timer;

// Event listener for mouse movements.
canvas1.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas1, evt);
    drawCrosshairTooltip(mousePos);
}, false);