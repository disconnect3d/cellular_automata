var stopCondition = true;
var iterationDelay = 50;

function gridPainter(canvasId, gridWallPx) {
    var canvas = $("#" + canvasId)[0];
    var ctx = canvas.getContext("2d");

    return {
        clear: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },

        getMaxX: function () {
            return Math.floor(canvas.width / gridWallPx);
        },

        getMaxY: function () {
            return Math.floor(canvas.height / gridWallPx);
        },

        strokeRect: function (x, y, color) {
            ctx.strokeStyle = color;
            ctx.strokeRect(1 + x * gridWallPx, 1 + y * gridWallPx, gridWallPx, gridWallPx);
        },

        fillRect: function (x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(1 + x * gridWallPx, 1 + y * gridWallPx, gridWallPx, gridWallPx);
        },

        drawGrid: function () {
            ctx.strokeStyle = "black";
            ctx.strokeRect(1, 1, this.getMaxX() * gridWallPx, this.getMaxY() * gridWallPx);
        }
    };
}

MAP_FIELD = {
    NOTHING: 0,
    BOX: 1,
    CURRENT: 2
};


// Projekt 2 - model family, wolf vilian,  das sarmy tamborenea
// 13.3 w pdfie (s 116)
// mapa plaska na start
// w danym momencie spada tylko 1 boks

//  model familiego - u mnie r=1 wiec patrzymy tylko w lewo i prawo, jesli jest mozliwosc spadniecia to spadamy
// model wolf vilian - liczba koordynacyjna oznacza liczbe sasiadow - idziemy tam gdzie bedzie najwiecej sasiadow
// (r=1 wiec maks ruszamy sie o 1 kratke)
// model das sarmy -tamborenea - idziemy do kąta.

// W KAŻDYM Z MODELI CZĄSTECZKA PO UDERZENIU ZIEMI ROBI MAKSYMALNIE JEDEN RUCH!
// "czy powinienem robic animacje ze czasteczka spada?" wolalbym nie - moze sie teleportowac!
// tak samo z gory planszy nie trzeba robic animacji

// w czasie odchylenie standardowe wysokosci calego modelu

COLORS = {};
COLORS[MAP_FIELD.NOTHING] = "white";
COLORS[MAP_FIELD.BOX] = "black";
COLORS[MAP_FIELD.CURRENT] = "lime";


function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

function standardDeviation(values) {
    var avg = average(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}


function baseModel(name, gridPainter, chart) {
    var modelName = name;
    var gp = gridPainter;
    var maxX = gp.getMaxX();
    var maxY = gp.getMaxY();

    var stdChartData = [modelName];
    var iteration = 0;

    var boxesSpawned = 0;
    var maxBoxes = maxX * maxY;
    var boxMadeMove = true;
    var boxY;
    var boxX;

    // stores vector of heights
    var heights = new Array(maxX);
    for (var x = 0; x < maxX; ++x)
        heights[x] = 0;

    var map = new Array(maxY);
    for (var y = 0; y < maxY; ++y)
        map[y] = new Array(maxX);

    var spawnNewBox = function () {
        // randomizes X where to spawn box
        // the spawned box appears on the ground (boxY = maxY-1) or on another box.
        // if the map is full of boxes on particular boxX, another boxX is randomized
        boxY = -1;
        boxesSpawned += 1;

        while (boxY == -1) {
            boxX = Math.round(Math.random() * (maxX - 1));
            boxY = maxY - 1;

            while (boxY != -1 && map[boxY][boxX] != MAP_FIELD.NOTHING)
                boxY -= 1;
        }

        map[boxY][boxX] = MAP_FIELD.CURRENT;
    };

    var redraw = function () {
        gp.clear();
        gp.drawGrid();

        for (var y = 0; y < maxY; ++y)
            for (var x = 0; x < maxX; ++x)
                gp.fillRect(x, y, COLORS[map[y][x]]);
    };

    var obj = {
        getMap: function () {
            return map;
        },

        getMaxX: gp.getMaxX,
        getMaxY: gp.getMaxY,

        getBoxX: function () {
            return boxX;
        },
        getBoxY: function () {
            return boxY;
        },
        setBoxX: function (newBoxX) {
            boxX = newBoxX;
        },
        setBoxY: function (newBoxY) {
            boxY = newBoxY;
        },

        getMaxYwithoutBox: function (x) {
            for (var y = maxY - 1; y >= 0; --y)
                if (map[y][x] == MAP_FIELD.NOTHING)
                    return y;

            return -1;
        },

        generateMap: function () {
            for (var y = 0; y < maxY; ++y)
                for (var x = 0; x < maxX; ++x)
                    map[y][x] = MAP_FIELD.NOTHING;

            spawnNewBox();
            boxMadeMove = true;
        },

        simulate: function () {
            calcIteration();
            redraw();

            if (iteration % 10 == 0)
                chart.load({
                    columns: [stdChartData]
                });

            if (boxesSpawned == maxBoxes) {
                map[boxY][boxX] = MAP_FIELD.BOX;
                redraw();
                stdChartData.push(0);
                chart.load({
                    columns: [stdChartData]
                });
                return;
            }
            iteration += 1;

            if (!stopCondition)
                window.setTimeout(obj.simulate, iterationDelay);
        }
    };

    var calcIteration = function () {
        if (boxMadeMove) {
            map[boxY][boxX] = MAP_FIELD.BOX;
            spawnNewBox();
            boxMadeMove = false;
        }

        else {
            map[boxY][boxX] = MAP_FIELD.NOTHING;
            obj.calculateBoxPos(boxY, boxX);
            map[boxY][boxX] = MAP_FIELD.CURRENT;

            boxMadeMove = true;
            heights[boxX] = maxY - boxY;
            stdChartData.push(standardDeviation(heights));
        }
    };

    return obj;
}

//  Family model (the particles tends to minimize height)
function familyModel(name, gridPainter, chart) {
    var model = baseModel(name, gridPainter, chart);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function () {
        var y = this.getBoxY();

        // do only if box is not on the ground
        if (y != maxY - 1) {
            var x = this.getBoxX();

            var canGoLeft = false;
            var canGoRight = false;

            if (x != 0 && map[y + 1][x - 1] == MAP_FIELD.NOTHING)
                canGoLeft = true;

            if (x != maxX - 1 && map[y + 1][x + 1] == MAP_FIELD.NOTHING)
                canGoRight = true;

            if (canGoLeft && canGoRight)
                x += Math.random() > 0.5 ? 1 : -1;
            else if (canGoLeft)
                x -= 1;
            else if (canGoRight)
                x += 1;

            if (canGoLeft || canGoRight) {
                this.setBoxX(x);
                this.setBoxY(this.getMaxYwithoutBox(x));
            }
        }
    };

    return model;
}

// Wolf-Villain model (the particles tends to have more neighbours)
function wvModel(name, gridPainter, chart) {
    var model = baseModel(name, gridPainter, chart);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function () {
        var y = this.getBoxY();
        var x = this.getBoxX();

        var neighboursNow = 0;
        // -1 value means the block can't go left/right
        var neighboursAfterLeft = -1;
        var neighboursAfterRight = -1;

        if (x != 0)
            if (map[y][x - 1] == MAP_FIELD.NOTHING) {
                neighboursAfterLeft = 0;
                var posX = x - 1;
                var posY = this.getMaxYwithoutBox(posX);

                if (posX != 0 && map[posY][posX - 1] == MAP_FIELD.BOX)
                    neighboursAfterLeft += 1;
                if (map[posY][posX + 1] == MAP_FIELD.BOX)
                    neighboursAfterLeft += 1;
            }
            else
                neighboursNow += 1;

        if (x != maxX - 1)
            if (map[y][x + 1] == MAP_FIELD.NOTHING) {
                neighboursAfterRight = 0;
                var posX = x + 1;
                var posY = this.getMaxYwithoutBox(posX);

                if (posX != maxX - 1 && map[posY][posX + 1] == MAP_FIELD.BOX)
                    neighboursAfterRight += 1;
                if (map[posY][posX - 1] == MAP_FIELD.BOX)
                    neighboursAfterRight += 1;
            }
            else
                neighboursNow += 1;

        var neighbours = [neighboursNow, neighboursAfterLeft, neighboursAfterRight];

        var maxValue = Math.max.apply(null, neighbours);
        var maxNeighboursAfterMoveIndexes = [];
        for(var i=0; i<neighbours; ++i)
            if (neighbours[i] == maxValue)
                maxNeighboursAfterMoveIndexes.push(i);

        var index = maxNeighboursAfterMoveIndexes[Math.floor(Math.random() * maxNeighboursAfterMoveIndexes.length)];

        if (index == 0)
            return;
        else if (index == 1)
            x -= 1;
        else if (index == 2)
            x += 1;

        this.setBoxX(x);
        this.setBoxY(this.getMaxYwithoutBox(x));
    };

    return model;
}

// Das Sarma-Tamborenea model (the particles tends to move to corners)
function dstModel(name, gridPainter, chart) {
    var model = baseModel(name, gridPainter, chart);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function () {
        var y = this.getBoxY();
        var x = this.getBoxX();

        // -1 value means the block can't go left/right
        var canGoLeft = false;
        var canGoRight = false;
        var isInCorner = false;

        if (x != 0)
            if (map[y][x - 1] == MAP_FIELD.NOTHING) {
                var posX = x - 1;
                var posY = this.getMaxYwithoutBox(posX);

                if (posX != 0 && map[posY][posX - 1] == MAP_FIELD.BOX || map[posY][posX + 1] == MAP_FIELD.BOX)
                    canGoLeft = true;
            }
            else
                isInCorner = true;

        if (x != maxX - 1)
            if (map[y][x + 1] == MAP_FIELD.NOTHING) {
                var posX = x + 1;
                var posY = this.getMaxYwithoutBox(posX);

                if (posX != maxX - 1 && map[posY][posX + 1] == MAP_FIELD.BOX || map[posY][posX - 1] == MAP_FIELD.BOX)
                    canGoRight = true;
            }
            else
                isInCorner = true;

        var positionWithCorners = [];
        if (isInCorner)
            positionWithCorners.push(0);
        if (canGoLeft)
            positionWithCorners.push(1);
        if (canGoRight)
            positionWithCorners.push(2);

        var index = positionWithCorners[Math.floor(Math.random() * positionWithCorners.length)];
        console.log(index);
        if (index == 0)
            return;
        else if (index == 1)
            x -= 1;
        else if (index == 2)
            x += 1;

        this.setBoxX(x);
        this.setBoxY(this.getMaxYwithoutBox(x));
    };

    return model;
}

var gridWallPx = 30;
// wolf model painter

var models = [];

function startSimulation() {
    if (!stopCondition) {
        alert("Stop simulation first!");
        return;
    }
    stopCondition = false;
    changeSimulationDelay();
    changegridWallPx();

    var chart = c3.generate({
            bindto: '#modelsHeightStdPlot',
            data: {
                columns: []
            }
        }
    );
    models = [
        //familyModel('Family', gridPainter('familyCanvas', gridWallPx), chart),
        //wvModel('Wolf-Villain', gridPainter('wvCanvas', gridWallPx), chart),
        dstModel('Das Sarma-Tamborenea', gridPainter('dstCanvas', gridWallPx), chart)
    ];

    for (var i = 0; i < 3; ++i) {
        var m = models[i];
        m.generateMap();
        m.simulate();
    }
}

function changegridWallPx() {
    gridWallPx = parseInt($("#gridWallPx").val(), 10);
}

function changeSimulationDelay() {
    iterationDelay = parseInt($("#simulationDelay").val(), 10);
}

function stopSimulation() {
    stopCondition = true;
}

function continueSimulation() {
    if (stopCondition) {
        stopCondition = false;

        for (var i = 0; i < 3; ++i) {
            var m = models[i];
            m.simulate();
        }
    }
}


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
