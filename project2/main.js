
function fitCanvasToParent(canvasId) {
    var canvas = document.getElementById(canvasId);
    var parent = document.getElementById(canvasId + "Div");
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
}

$(document).ready(function() {
    fitCanvasToParent("familyCanvas");
    fitCanvasToParent("wvCanvas");
    fitCanvasToParent("dstCanvas");
});