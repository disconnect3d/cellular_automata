var GRID_WALL_PX = 10;

var DEFAULT_RULE = "22";
var DEFAULT_DELAY = "70";
var DEFAULT_MAX_HEIGHT = GRID_WALL_PX;
var MAX_ITERATIONS = 1000;

var delay = 100; // [ms]
var stop = false;
var autoScroll = true;

var ruleInBinary = null;

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


// array statuses:
var BIT_OFF = 0;
var BIT_ON = 1;
var BIT_OFF_REF_BOARD_ON = 2;
var BIT_ON_REF_BOARD_OFF = 3;

function isBitOn(bit) {
    return (bit == BIT_ON || bit == BIT_ON_REF_BOARD_OFF) ? BIT_ON : BIT_OFF;
}

var copyCanvas;
function createBoard(elementId) {
    var canvasColElement = $("#" + elementId + "Col");
    var canvasElement = $("#" + elementId)[0];
    var canvasCtx = canvasElement.getContext("2d");

    var cols;
    var rows;
    var iteration;

    return {
        init: function () {
            iteration = 0;
            canvasElement.width = canvasColElement.width();
            canvasElement.height = DEFAULT_MAX_HEIGHT;
            cols = Math.floor(canvasElement.width / GRID_WALL_PX) - 1;
            rows = Math.floor(canvasElement.height / GRID_WALL_PX);

            if (cols % 2 == 0)
                cols -= 1;

            this.prevArray = createArray(cols);
            this.currArray = createArray(cols);

            this.clearCanvas();
        },

        initRandBits: function () {
            this.init();
            for (var x = 0; x < cols; ++x)
                this.currArray[x] = Math.random() > 0.5 ? BIT_ON : BIT_OFF;
        },
        initMidBit: function () {
            this.init();
            this.clearCurrArray();
            this.currArray[Math.floor(cols / 2)] = BIT_ON;
        },
        initCopyOtherAddRandomDifference: function (otherBoard) {
            this.init();
            for (var x = 0; x < cols; ++x)
                this.currArray[x] = otherBoard.currArray[x];

            var bitIndex = Math.floor(Math.random() * cols);
            this.currArray[bitIndex] = this.currArray[bitIndex] == BIT_ON ? BIT_OFF_REF_BOARD_ON : BIT_ON_REF_BOARD_OFF;
            this.otherBoard = otherBoard;
        },

        clearCurrArray: function () {
            for (var x = 0; x < cols; ++x)
                this.currArray[x] = 0;
        },
        calculateCurrent: function () {
            var trimX = function (x) {
                return x >= 0 ? x % cols : (cols - 1);
            };
            console.log(this.prevArray);
            for (var x = 0; x < cols; ++x) {
                var left = isBitOn(this.prevArray[trimX(x - 1)]);
                var mid = isBitOn(this.prevArray[x]);
                var right = isBitOn(this.prevArray[trimX(x + 1)]);

                var bitIndex = parseInt(left.toString() + mid.toString() + right.toString(), 2);

                if (ruleBitsIndexes.indexOf(bitIndex) != -1)
                    this.currArray[x] = BIT_ON;
            }
            console.log(this.currArray);
         //   aa
        },

        calcDiffWithOtherBoard: function () {
            for (var x = 0; x < cols; ++x)
                if (this.otherBoard.currArray[x] && !this.currArray[x])
                    this.currArray[x] = BIT_OFF_REF_BOARD_ON;
                else if (!this.otherBoard.currArray[x] && this.currArray[x])
                    this.currArray[x] = BIT_ON_REF_BOARD_OFF;
        },

        nextIteration: function () {
            iteration += 1;

            var tmp = this.prevArray;
            this.prevArray = this.currArray;
            this.currArray = tmp;
            this.clearCurrArray();

            if (iteration % rows == 0 && iteration < MAX_ITERATIONS)
                this.setHeight(canvasElement.height + DEFAULT_MAX_HEIGHT);
        },

        // view methods
        clearCanvas: function () {
            canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
        },
        drawCurrent: function () {
            for (var x = 0; x < cols; ++x) {
                drawRect(canvasCtx, x, iteration);
                switch (this.currArray[x]) {
                    case BIT_OFF:
                        drawRect(canvasCtx, x, iteration);
                        continue;

                    case BIT_ON:
                        canvasCtx.fillStyle = "black";
                        break;

                    case BIT_ON_REF_BOARD_OFF:
                        canvasCtx.fillStyle = "#f68b5c";
                        break;

                    case BIT_OFF_REF_BOARD_ON:
                        canvasCtx.fillStyle = "#b00c0a";
                        break;
                }
                fillRect(canvasCtx, x, iteration);
                canvasCtx.fillStyle = "black";
                drawRect(canvasCtx, x, iteration);
            }
        },

        setHeight: function (newHeight) {
            // create backing canvas
            copyCanvas.width = canvasElement.width;
            copyCanvas.height = canvasElement.height;

            var copyCtx = copyCanvas.getContext('2d');

            copyCtx.drawImage(canvasElement, 0, 0);

            // restore main canvas
            canvasElement.height = newHeight;
            canvasCtx.drawImage(copyCanvas, 0, 0);
        },

        getIteration: function () {
            return iteration;
        }
    };
}

function getInputs() {
    // '#' in jquery means getById attribute
    ruleInBinary = parseInt($("#rule").val(), 10).toString(2);
    delay = parseInt($("#speed").val(), 10);
    $("#ruleRepresentation").text(ruleInBinary);
}

var ruleBits = {
    0: [0, 0, 0],
    1: [0, 0, 1],
    2: [0, 1, 0],
    3: [0, 1, 1],
    4: [1, 0, 0],
    5: [1, 0, 1],
    6: [1, 1, 0],
    7: [1, 1, 1]
};

var ruleBitsIndexes = null;

function fillRuleBitsIndexes() {
    ruleBitsIndexes = [];
    for (var i = 0; i < ruleInBinary.length; ++i)
        if (ruleInBinary[ruleInBinary.length - i - 1] == "1")
            ruleBitsIndexes.push(i);
}

function clearAndDrawRuleMappings() {
    var canvas_id = "ruleMapping";
    for (var i = 0; i <= 7; ++i) {
        var canvas = $("#" + canvas_id + i)[0];

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var s = 0; s < 3; ++s) {
            if (ruleBits[i][s] == BIT_ON)
                fillRect(ctx, s, 0);
            drawRect(ctx, s, 0);
        }

        drawRect(ctx, 0, 1);
        if (ruleBitsIndexes.indexOf(i) != -1)
            fillRect(ctx, 1, 1);

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
    rndDiffPointBoard.calcDiffWithOtherBoard();
    invokeOnBoards('drawCurrent');
    invokeOnBoards('nextIteration');

    if (autoScroll)
        window.scrollTo(0, (midPointBoard.getIteration() + 1) * GRID_WALL_PX);

    if (!stop)
        setTimeout(loop, delay);
}


////////////// Buttons logic //////////////
function startSimulation() {
    stop = false;

    getInputs();
    fillRuleBitsIndexes();

    midPointBoard.initMidBit();
    rndPointBoard.initRandBits();
    rndDiffPointBoard.initCopyOtherAddRandomDifference(rndPointBoard);

    console.log("--------- Starting simulation ---------");
    console.log("ruleInBinary = " + ruleInBinary);
    console.log("ruleBitsIndexes = " + ruleBitsIndexes);
    console.log("---------------------------------------");

    clearAndDrawRuleMappings();
    invokeOnBoards('drawCurrent');
    invokeOnBoards('nextIteration');

    setTimeout(loop, delay);
}

function stopSimulation() {
    stop = true;
}

function changeSpeed() {
    delay = parseInt($("#speed").val(), 10);
}

function changeAutoScroll() {
    autoScroll = !autoScroll;
    $("#autoScroll").text(autoScroll ? "ON" : "OFF");

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