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
        return bounds[-1]; // Anythin higher than the last one in bounds.
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
