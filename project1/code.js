var DEFAULT_RULE = "110";
var DEFAULT_DELAY = "75";

var delay = 100; // [ms]
var GRID_WALL_PX = 9;

var ruleInBinary = null;

var stop = false;

function createArray(size) {
    var arr = new Array(size);

    for (var x = 0; x < size; ++x)
        arr[x] = 0;

    return arr;
}

function drawRect(canvasCtx, x, y) {
    canvasCtx.strokeRect(1 + x * GRID_WALL_PX, 1 + y * GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function fillRect(canvasCtx, x, y) {
    canvasCtx.fillRect(1 + x * GRID_WALL_PX, 1 + y * GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function createBoard(elementId) {
    var canvasColElement = $("#" + elementId + "col");
    var canvasElement = $("#" + elementId)[0];
    var canvasCtx = canvasElement.getContext("2d");

    var cols = Math.floor(canvasColElement.width() / GRID_WALL_PX);

    var iteration;

    var prevArray = createArray(cols);
    var currArray = createArray(cols);

    var init = function() {
        iteration = 0;
        canvasCtx.width = canvasColElement.width;
    };

    var clearCurrArray = function() {
        for (var x = 0; x < cols; ++x)
            currArray[x] = 0;
    }

    return {
        initRandBits: function () {
            init();
            for (var x = 0; x < cols; ++x)
                    currArray[x] = Math.random() > 0.5? 1 : 0;
        },
        initMidBit: function () {
            init();
            clearCurrArray();
            currArray[Math.floor(cols / 2)] = 1;
        },
        calculateIteration: function () {
            var trimX = function (x) {
                return x >= 0 ? x % cols : (cols - 1);
            };

            for (var x = 0; x < cols; ++x) {
                var left = prevArray[trimX(x - 1)];
                var mid = prevArray[x];
                var right = prevArray[trimX(x + 1)];

                var str = left.toString() + mid.toString() + right.toString();

                if (ruleMappings.indexOf(str) != -1)
                    currArray[x] = 1;
            }
        },

        // view like methods
        clearCanvas: function () {
            canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
        },
        drawCurrent: function () {
            for (var x = 0; x < cols; ++x) {
                drawRect(canvasCtx, x, iteration);

                if (currArray[x] == 1)
                    fillRect(canvasCtx, x, iteration);
            }
        },
        setHeight: function (newHeight) {
            context.height = newHeight;
        }
    };
}

function getInputs() {
    // '#' in jquery means getById attribute
    ruleInBinary = parseInt($("#rule").val(), 10).toString(2);
    delay = parseInt($("#speed").val(), 10);
    $("#ruleRepresentation").text(ruleInBinary);
}

var bit2top = {
    0: "000",
    1: "001",
    2: "010",
    3: "011",
    4: "100",
    5: "101",
    6: "110",
    7: "111"
};

var ruleMappings = null;

function fillRuleMappings() {
    ruleMappings = [];
    for (var i = 0; i < ruleInBinary.length; ++i)
        if (ruleInBinary[ruleInBinary.length - i - 1] == "1")
            ruleMappings.push(bit2top[i]);
}

function clearAndDrawRuleMappings() {
    var canvas_id = "ruleMapping";
    for (var i = 0; i < 7; ++i) {
        var canvas = $("#" + canvas_id + i)[0];

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var s = 0; s < 3; ++s) {
            drawRect(ctx, s, 0);
            if (bit2top[i][s] == "1")
                fillRect(ctx, s, 0);
        }

        drawRect(ctx, 0, 1);
        if (ruleMappings.indexOf(bit2top[i]) != -1)
            fillRect(ctx, 1, 1);
        else
            drawRect(ctx, 1, 1);
        drawRect(ctx, 2, 1);
    }
}

var midPointBoard;
var rndPointBoard;
var rndDiffPointBoard;

function loop() {
    midPointBoard.calculateIteration();
    rndPointBoard.calculateIteration();
    rndDiffPointBoard.calculateIteration();
}

////////////// Buttons logic //////////////
function startSimulation() {
    stop = false;

    getInputs();
    fillRuleMappings();

    midPointBoard.initMidBit();
    rndPointBoard.initRandBits();
    rndDiffPointBoard.initRandBits();

    console.log("--------- Starting simulation ---------");
    console.log("ruleInBinary = " + ruleInBinary);
    console.log("ruleMappings = " + ruleMappings);
    console.log("---------------------------------------");

    clearAndDrawRuleMappings();

    setTimeout(loop, delay);
}

function stopSimulation() {
    stop = true;
}

function changeSpeed() {
    delay = parseInt($("#speed").val(), 10);
}
////////////////////////////////////////////

$(document).ready(function () {
    // Filling inputs with defaults and making them `numeric only`
    var rule = $("#rule");
    var speed = $("#speed");

    var integersOnly = function () {
        if (this.value != this.value.replace(/[^0-9]/g, '')) {
            this.value = this.value.replace(/[^0-9]/g, '');
        }
    };

    speed.keyup(integersOnly);
    rule.keyup(integersOnly);
    speed.val(DEFAULT_DELAY);
    rule.val(DEFAULT_RULE);

    // initialize boards
    midPointBoard = createBoard("midCanvas");
    rndPointBoard = createBoard("rndCanvas");
    rndDiffPointBoard = createBoard("rndDiffCanvas");
});