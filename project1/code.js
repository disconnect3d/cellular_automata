var DEFAULT_RULE = "110";
var DEFAULT_DELAY = "75";

var maxX = 38;
var maxY = 80;
var delay = 100; // [ms]
var GRID_WALL_PX = 9;

var ruleInBinary = null;

// boards
var midBoard = null;
var randomBoard = null;
var diffboard = null;

// canvas
var randomCanvasCtx = null;
var midCanvasCtx = null;
var diffCanvasCtx = null;

var stop = false;

function createArray2D(dimX, dimY) {
    var arr = new Array(dimY);

    for (var y = 0; y < dimY; ++y) {
        arr[y] = new Array(dimX);

        for (var x = 0; x < dimX; ++x)
            arr[y][x] = 0;
    }

    return arr;
}

function getCanvasContexts() {
    var midCanvas = $("#midCanvas")[0];
    var randomCanvas = $("#randomCanvas")[0];
    var diffCanvas = $("#diffCanvas")[0];

    midCanvasCtx = midCanvas.getContext("2d");
    randomCanvasCtx = randomCanvas.getContext("2d");
    diffCanvasCtx = diffCanvas.getContext("2d");

    midCanvas.width = randomCanvas.width = diffCanvas.width = Math.floor($(window).width() / 3);

    midCanvasCtx.clearRect(0, 0, midCanvas.width, midCanvas.height);
    randomCanvasCtx.clearRect(0, 0, randomCanvas.width, randomCanvas.height);
    diffCanvasCtx.clearRect(0, 0, diffCanvas.width, diffCanvas.height);

    maxX = Math.floor(midCanvas.width / GRID_WALL_PX);
}

function createBoards() {
    midBoard = createArray2D(maxX, maxY);
    randomBoard = createArray2D(maxX, maxY);
    diffboard = createArray2D(maxX, maxY);
}

function getInputs() {
    // '#' in jquery means getById attribute
    ruleInBinary = parseInt($("#rule").val(), 10).toString(2);
    delay = parseInt($("#speed").val(), 10);
}

function drawRect(canvasCtx, x, y) {
    canvasCtx.strokeRect(x * GRID_WALL_PX, y * GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function fillRect(canvasCtx, x, y) {
    canvasCtx.fillRect(x * GRID_WALL_PX, y * GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function drawBoardForandomCanvasCtx(canvasCtx, board) {
    for (var y = 0; y < maxY; ++y)
        for (var x = 0; x < maxX; ++x) {
            drawRect(canvasCtx, x, y);

            if (board[y][x] == 1)
                fillRect(canvasCtx, x, y);
        }
}


bit2top = {
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


var currentIteration = 0;
function calculateIteration() {
    currentIteration += 1;
    var prevY = currentIteration - 1;

    var trimX = function (x) {
        return x >= 0 ? x % maxX : (maxX - 1);
    };

    var calcBoard = function (board) {
        if (stop)
            return;

        for (var x = 0; x < maxX; ++x) {
            var left = board[prevY][trimX(x - 1)];
            var mid = board[prevY][x];
            var right = board[prevY][trimX(x + 1)];

            var str = left.toString() + mid.toString() + right.toString();

            if (ruleMappings.indexOf(str) != -1)
                board[currentIteration][x] = 1;
        }
    };

    calcBoard(midBoard);
    calcBoard(randomBoard);

    // calculating third "differential" of random board
    if (currentIteration >= 1)
        for (var x = 0; x < maxX; ++x)
            diffboard[prevY][x] = Math.abs(randomBoard[currentIteration][x] - randomBoard[prevY][x]);

    drawBoardForandomCanvasCtx(midCanvasCtx, midBoard);
    drawBoardForandomCanvasCtx(randomCanvasCtx, randomBoard);
    drawBoardForandomCanvasCtx(diffCanvasCtx, diffboard);

    if (!stop && currentIteration < maxY - 1)
        setTimeout(calculateIteration, delay);
}

function initBoards() {
    midBoard[0][Math.floor(maxX / 2)] = 1;
    for (var x = 0; x < maxX; ++x)
        if (Math.random() > 0.5)
            randomBoard[0][x] = 1;
}


////////////// Buttons logic //////////////
function startSimulation() {
    stop = false;
    currentIteration = 0;
    getInputs();
    fillRuleMappings();
    getCanvasContexts();
    createBoards();
    initBoards();

    console.log("--------- Starting simulation ---------");
    console.log("ruleInBinary = " + ruleInBinary);
    console.log("ruleMappings = " + ruleMappings);
    console.log("maxY = " + maxY + ", maxY = " + maxX);
    console.log("---------------------------------------");

    drawBoardForandomCanvasCtx(midCanvasCtx, midBoard);
    drawBoardForandomCanvasCtx(randomCanvasCtx, randomBoard);

    setTimeout(calculateIteration, delay);
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
});