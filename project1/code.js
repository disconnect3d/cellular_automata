var DEFAULT_RULE = "110";
var DEFAULT_DELAY = "75";
var DEFAULT_MAX_HEIGHT = 1000;

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

var copyCanvas;
function createBoard(elementId) {
    var canvasColElement = $("#" + elementId + "Col");
    var canvasElement = $("#" + elementId)[0];
    var canvasCtx = canvasElement.getContext("2d");

    var cols;
    var rows;
    var iteration;

    var prevArray;
    var currArray;

    var clearCurrArray = function () {
        for (var x = 0; x < cols; ++x)
            currArray[x] = 0;
    };

    return {
        init: function () {
            iteration = 0;
            canvasElement.width = canvasColElement.width();
            canvasElement.height = DEFAULT_MAX_HEIGHT;
            cols = Math.floor(canvasElement.width / GRID_WALL_PX) - 1;
            rows = Math.floor(canvasElement.height / GRID_WALL_PX);

            if (cols % 2 == 0)
                cols -= 1;

            prevArray = createArray(cols);
            currArray = createArray(cols);

            this.clearCanvas();
        },

        initRandBits: function () {
            this.init();
            for (var x = 0; x < cols; ++x)
                currArray[x] = Math.random() > 0.5 ? 1 : 0;
        },
        initMidBit: function () {
            this.init();
            clearCurrArray();
            currArray[Math.floor(cols / 2)] = 1;
        },
        calculateCurrent: function () {
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

        nextIteration: function () {
            iteration += 1;

            var tmp = prevArray;
            prevArray = currArray;
            currArray = tmp;
            clearCurrArray();

            if (iteration % rows == 0 && iteration < 1000) {
                this.setHeight(canvasElement.height + DEFAULT_MAX_HEIGHT);
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
            // create backing canvas
            copyCanvas.width = canvasElement.width;
            copyCanvas.height = canvasElement.height;
            console.log(copyCanvas);
            var copyCtx = copyCanvas.getContext('2d');

            copyCtx.drawImage(canvasElement, 0, 0);

            // restore main canvas
            canvasElement.height = newHeight;
            canvasCtx.drawImage(copyCanvas, 0, 0);
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
    for (var i = 0; i <= 7; ++i) {
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

function invokeOnBoards(funcName) {
    midPointBoard[funcName]();
    rndPointBoard[funcName]();
    rndDiffPointBoard[funcName]();
}

function loop() {
    invokeOnBoards('calculateCurrent');
    invokeOnBoards('drawCurrent');
    invokeOnBoards('nextIteration');

    if (!stop)
        setTimeout(loop, delay);
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
    invokeOnBoards('drawCurrent');

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
    copyCanvas = document.createElement('canvas');
});