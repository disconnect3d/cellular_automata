
function fitCanvasToParent(canvasId) {
    var canvas = document.getElementById(canvasId);
    var parent = document.getElementById(canvasId + "Div");
    canvas.width = parent.offsetWidth - 20;
    canvas.height = parent.offsetHeight;

    var plotDiv = $('#' + canvasId + 'Plot');
    plotDiv.height(300);
    plotDiv.width(parent.offsetWidth - 20);
}

$(document).ready(function() {
    fitCanvasToParent("familyCanvas");
    fitCanvasToParent("wvCanvas");
    fitCanvasToParent("dstCanvas");
});