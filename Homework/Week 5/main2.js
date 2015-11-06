/* use this to test out your function */
window.onload = function() {
    changeColor("it", "FF0000");
    changeColor("fr", "FF0000");
    changeColor("se", "FF0000");
    changeColor("pl", "FF0000");
};

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {

    // Retrieve and change the color of all paths in the class.
    var classes = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName(id);
    for (var i = 0; i < classes.length; i++) {
        classes[i].style.fill = color;
    }
}