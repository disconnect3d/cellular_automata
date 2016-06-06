var stopCondition = false;
var iterationDelay = 400;

function gridPainter(canvasId, gridWallPx) {
    //var canvasDiv = $("#" + canvasId + "Div");
    var canvas = $("#" + canvasId)[0];
    console.log(canvas);
    console.log("#" + canvasId);
    var ctx = canvas.getContext("2d");

    return {
        clear: function () {
            ctx.clearRect(0, 0, ctx.width, ctx.height);
        },

        getMaxX: function () {
            return Math.floor(canvas.width / gridWallPx);
        },

        getMaxY: function () {
            return Math.floor(canvas.height / gridWallPx);
        },

        strokeRect: function(x, y, color) {
            ctx.strokeStyle = color;
            ctx.strokeRect(x * gridWallPx, y * gridWallPx, gridWallPx, gridWallPx);
        },

        fillRect: function(x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * gridWallPx, y * gridWallPx, gridWallPx, gridWallPx);
        },

        drawGrid: function() {
            var maxY = this.getMaxY();
            var maxX = this.getMaxX();
            for(var y=0; y<maxY; ++y)
                for(var x=0; x<maxX; ++x)
                    this.strokeRect(x, y, "black");
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


function baseModel(gridPainter) {
    var gp = gridPainter;
    var maxX = gp.getMaxX();
    var maxY = gp.getMaxY();

    var boxesSpawned = 0;
    var maxBoxes = maxX * maxY;
    var boxMadeMove = true;
    var boxY;
    var boxX;

    var map = new Array(maxY);
    for (var y = 0; y < maxY; ++y)
        map[y] = new Array(maxX);

    var spawnNewBox = function() {
        // randomizes X where to spawn box
        // the spawned box appears on the ground (boxY = maxY-1) or on another box.
        // if the map is full of boxes on particular boxX, another boxX is randomized
        boxY = -1;
        boxesSpawned += 1;

        while(boxY == -1) {
            boxX = Math.round(Math.random() * (maxX-1));
            boxY = maxY - 1;

            while (boxY != -1 && map[boxY][boxX] != MAP_FIELD.NOTHING)
                boxY -= 1;
        }

        map[boxY][boxX] = MAP_FIELD.CURRENT;
    };

    var redraw = function() {
        gp.clear();
        gp.drawGrid();

        for(var y=0; y<maxY; ++y)
            for(var x=0; x<maxX; ++x)
                gp.fillRect(x, y, COLORS[map[y][x]]);
    };

    var obj = {
        getMap: function() { return map; },

        getMaxX: gp.getMaxX,
        getMaxY: gp.getMaxY,

        getBoxX: function() { return boxX; },
        getBoxY: function() { return boxY; },
        setBoxX: function(newBoxX) { boxX = newBoxX; },
        setBoxY: function(newBoxY) { boxY = newBoxY; },

        getMaxYwithoutBox: function(x) {
            for(var y=maxY-1; y>=0; --y)
                if (map[y][x] == MAP_FIELD.NOTHING)
                    return y;

            return -1;
        },

        generateMap: function() {
            for(var y=0; y<maxY; ++y)
                for(var x=0; x<maxX; ++x)
                    map[y][x] = MAP_FIELD.NOTHING;

            spawnNewBox();
            boxMadeMove = true;
        },

        simulate: function() {
            calcIteration();
            redraw();

            if (boxesSpawned == maxBoxes) {
                map[boxY][boxX] = MAP_FIELD.BOX;
                redraw();
                return;
            }

            if (!stopCondition)
                window.setTimeout(obj.simulate, iterationDelay);
        }
    };

    var calcIteration = function() {
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
        }
    };

    return obj;
}

// inheritance like
//  model familiego - u mnie r=1 wiec patrzymy tylko w lewo i prawo, jesli jest mozliwosc spadniecia to spadamy
function familyModel(gridPainter) {
    var model = baseModel(gridPainter);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function() {
        var y = this.getBoxY();

        // do only if box is not on the ground
        if (y != maxY - 1) {
            var x = this.getBoxX();

            var canGoLeft = false;
            var canGoRight = false;

            if (x != 0 && map[y+1][x-1] == MAP_FIELD.NOTHING)
                canGoLeft = true;

            if (x != maxX - 1 && map[y+1][x+1] == MAP_FIELD.NOTHING)
                canGoRight = true;

            if (canGoLeft && canGoRight)
                x += Math.random() > 0.5? 1 : -1;
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

// model wolf vilian - liczba koordynacyjna oznacza liczbe sasiadow - idziemy tam gdzie bedzie najwiecej sasiadow
function wvModel(gridPainter) {
    var model = baseModel(gridPainter);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function() {
        var y = this.getBoxY();
        var x = this.getBoxX();

        // -1 value means the block can't go left/right
        var neighboursAfterLeft = -1;
        var neighboursAfterRight = -1;
        console.log(x);
        console.log(map);
        console.log(y);
        if (x != 0 && map[y][x - 1] == MAP_FIELD.NOTHING) {
            neighboursAfterLeft = 0;
            var posX = x - 1;
            var posY = this.getMaxYwithoutBox(posX);

            if (posX != 0 && map[posY][posX - 1] == MAP_FIELD.BOX)
                neighboursAfterLeft += 1;
            if (map[posY][posX + 1] == MAP_FIELD.BOX)
                neighboursAfterLeft += 1;
        }

        if (x != maxX - 1 && map[y][x + 1] == MAP_FIELD.NOTHING) {
            neighboursAfterRight = 0;
            var posX = x + 1;
            var posY = this.getMaxYwithoutBox(posX);

            if (posX != maxX - 1 && map[posY][posX + 1] == MAP_FIELD.BOX)
                neighboursAfterRight += 1;
            if (map[posY][posX - 1] == MAP_FIELD.BOX)
                neighboursAfterRight += 1;
        }

        var canGoLeft = neighboursAfterLeft > 0;
        var canGoRight = neighboursAfterRight > 0;

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
    };

    return model;
}

// model das Sarmy-Tamborenea
function dstModel(gridPainter) {
    var model = baseModel(gridPainter);

    var maxY = model.getMaxY();
    var maxX = model.getMaxX();
    var map = model.getMap();

    model['calculateBoxPos'] = function() {
        var y = this.getBoxY();
        var x = this.getBoxX();

        // -1 value means the block can't go left/right
        var canGoLeft = false;
        var canGoRight = false;

        if (x != 0 && map[y][x - 1] == MAP_FIELD.NOTHING) {
            var posX = x - 1;
            var posY = this.getMaxYwithoutBox(posX);

            if (posX != 0 && map[posY][posX - 1] == MAP_FIELD.BOX || map[posY][posX + 1] == MAP_FIELD.BOX)
                canGoLeft = true;
        }

        if (x != maxX - 1 && map[y][x + 1] == MAP_FIELD.NOTHING) {
            var posX = x + 1;
            var posY = this.getMaxYwithoutBox(posX);

            if (posX != maxX - 1 && map[posY][posX + 1] == MAP_FIELD.BOX || map[posY][posX - 1] == MAP_FIELD.BOX)
                canGoRight = true;
        }

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
    };

    return model;
}

var gridWallPx = 10;
// wolf model painter


$(document).ready(function () {
    var models = [
        familyModel(gridPainter('familyCanvas', gridWallPx)),
        wvModel(gridPainter('wvCanvas', gridWallPx)),
        dstModel(gridPainter('dstCanvas', gridWallPx))
    ];

    for(var i=0; i<3; ++i) {
        var m = models[i];
        m.generateMap();
        m.simulate();
    }
});