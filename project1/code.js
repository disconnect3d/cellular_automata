var DEFAULT_RULE = 101;

var DEFAULT_ITERATIONS = 30;
var maxX = 54;
var maxY = 0;
var delay = 500; // [ms]

var ruleInBinary = null;
var lboard = null;
var rboard = null;


// view part
var GRID_WALL_PX = 10;
var rcanvas = null;
var lcanvas = null;
var canvasHeight = null;
var canvasWidth = null;

function createArray2D(dimX, dimY) {
    var arr = new Array(dimY);

    for(var y=0; y<dimY; ++y) {
        arr[y] = new Array(dimX);

        for(var x=0; x<dimX; ++x)
            arr[y][x] = 0;
    }

    return arr;
}

function getCanvasContexts() {
    var lb = $("#lboard")[0];
    var rb = $("#rboard")[0];
    lcanvas = lb.getContext("2d");
    rcanvas = rb.getContext("2d");

    lcanvas.clearRect(0, 0, lb.width, lb.height);
    rcanvas.clearRect(0, 0, lb.width, lb.height);
}

function createBoards() {
    lboard = createArray2D(maxX, maxY);
    rboard = createArray2D(maxX, maxY);
}

function getInputs() {
    // '#' in jquery means getById attribute
    ruleInBinary = parseInt($("#rule").val(), 10).toString(2);
    maxY = parseInt($("#iters").val(), DEFAULT_ITERATIONS);
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

ruleMappings = [];

function fillRuleMappings() {
    for(var i=0; i<ruleInBinary.length; ++i)
        if (ruleInBinary[ruleInBinary.length-i-1] == "1")
            ruleMappings.push(bit2top[i]);
}


function drawRect(canvas, x, y) {
    canvas.strokeRect(x*GRID_WALL_PX, y*GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function fillRect(canvas, x, y) {
    canvas.fillRect(x*GRID_WALL_PX, y*GRID_WALL_PX, GRID_WALL_PX, GRID_WALL_PX);
}

function drawBoardForCanvas(canvas, board) {
    for(var y=0; y<maxY; ++y)
        for(var x=0; x<maxX; ++x) {
            drawRect(canvas, x, y);

            if (board[y][x] == 1)
                fillRect(canvas, x, y);
        }
}

var currentIteration = 0;
function calculateIteration() {
    currentIteration += 1;

    var trimX = function(x) {
        return x >= 0? x % maxX : (maxX-1);
    };

    var calcBoard = function(board) {
        for(var x=0; x<maxX; ++x) {
            var prevY = currentIteration-1;

            var left = board[prevY][trimX(x-1)];
            var mid = board[prevY][x];
            var right = board[prevY][trimX(x+1)];

            var str = left.toString() + mid.toString() + right.toString();

            if (ruleMappings.indexOf(str) != -1)
                board[currentIteration][x] = 1;
        }
    };

    calcBoard(lboard);
    calcBoard(rboard);
    drawBoardForCanvas(lcanvas, lboard);
    drawBoardForCanvas(rcanvas, rboard);

    if (currentIteration < maxY-1)
        setTimeout(calculateIteration, delay);
}

function setLeftBoard() {
    lboard[0][Math.floor(maxX/2)] = 1;
}

function clearCanvas() {
}

function fire() {
    currentIteration = 0;
    getInputs();
    fillRuleMappings();
    getCanvasContexts();
    createBoards();

    console.log("-- Starting simulation --");
    console.log("ruleInBinary = " + ruleInBinary, "ruleMappings = " + ruleMappings);
    console.log("maxY = " + maxY + ", maxY = " + maxX);
    console.log("-------------------------");

    setLeftBoard();
    drawBoardForCanvas(lcanvas, lboard);
    drawBoardForCanvas(rcanvas, rboard);

    setTimeout(calculateIteration, delay);
}
