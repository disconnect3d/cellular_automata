
function fitElementToParent(elementId) {
    var element = document.getElementById(elementId);
    var parent = document.getElementById(elementId + "Div");
    element.width = parent.offsetWidth - 20;
    element.height = parent.offsetHeight;
}

$(document).ready(function() {
    fitElementToParent("familyCanvas");
    fitElementToParent("wvCanvas");
    fitElementToParent("dstCanvas");

    fitElementToParent("modelsHeightStdPlot");
});