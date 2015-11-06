/* use this to test out your function */
window.onload = function() {

    // Load data
    var url = "http://127.0.0.1:8080/data.txt";
    var request = new XMLHttpRequest();
    request.addEventListener('load', loadData);
    request.open("GET", url, true);
    request.send();

};

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {

    var classes = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName(id);

    // For loop to catch all the small islands and stuff as well.
    for (var i = 0; i < classes.length; i++) {
        classes[i].style.fill = color;
    }
}

// Parse JSON and color the map
function loadData () {

    // Densities maps { Country ISO CODE : Density }
    var densities = JSON.parse(this.responseText);

    for (var countryCode in densities) {
        var density = densities[countryCode];

        // colorCodes[n] corresponds to range bounds[n] to bounds[n + 1]
        var bounds = [0, 10, 25, 50, 75, 100, 150, 300, 1000];
        var colorCodes = ['F4E3D7', 'E9C6AF', 'DEAA87', 'D38D5F', 'C87137', 'A05A2C', '784421', '502D16', '28170B'];
        var color = colorCodes[-1];  // Everything higher than the last number in bounds.

        for (var i = 1; i < bounds.length; i++) {

            // Color the bound if it is between the two bounds.
            if (density >= bounds[i - 1] && density < bounds[i]) {
                color = colorCodes[i - 1];
                break
            }
        }

        changeColor(countryCode.toLowerCase(), color);
    }
}