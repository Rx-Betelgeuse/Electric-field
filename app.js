var canvas = document.getElementById("field");
var context = canvas.getContext("2d");
var iterations;
var scale = 1;
var currentPoint;
var maxPower = 10;
var points = [];
var speed = 0;




class Point {
    constructor(x, y, power, color) {
        this.x = x;
        this.y = y;
        this.colors = color;
        this.power = power;
    }

    get color() {
        this._color = this.getColor();
        return this._color;
    }

    getColor() {
        var red = 0;
        var green = 0;
        var blue = 0;
        if (this.power > 0) {
            red = Math.round(this.power * 155 / maxPower) + 100;
        }
        else {
            blue = Math.round(-this.power * 155 / maxPower) + 100;
        }
        return `rgb(${red}, ${green}, ${blue})`;
    }

}



function drawPoint(point) {
    context.beginPath();
    context.arc(point.x, point.y, Math.abs(point.power), 0, 2 * Math.PI, false);
    context.fillStyle = point.color;
    context.strokeStyle = point.color;
    context.linewidth = 1;
    context.fill();
}

function drawAllPoints() {
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fff";
    context.fill();
    context.stroke();
    points.forEach(function (item, i, points) {
        if (item.power > 0) {
            scale = 1;
        }
        else {
            scale = -1;
        }
        currentPoint = item;
        drawPowerLines(item);
        context.stroke();
    });
    points.forEach(function (item, i, points) {
        drawPoint(item)
    });
    context.stroke();
    canvas.mouseMove = null;
    window.setTimeout(function () { canvas.mouseMove = mouseMove }, 1000 / 30);
}

function drawPowerLines(point) {
    var x = [1, 0, -1, 1, -1, 1, 0, -1];
    var y = [1, 1, 1, 0, 0, -1, -1, -1];
    var tempPoint;

    context.beginPath();
    context.strokeStyle = point.color;
    for (i = 0; i < 8; i++) {
        tempPoint = new Point(point.x + x[i], point.y + y[i], 0, point.color);
        iterations = 0;
        drawLine(tempPoint);
    }
    context.closePath();
}

function getRadius(a, b) {
        var v1 = Math.pow((a.x - b.x), 2);
        var v2 = Math.pow((a.y - b.y), 2);
        return  Math.pow(v1 + v2, 0.5);        
}

function drawLine(currentPoint) {
    context.moveTo(currentPoint.x, currentPoint.y);
    while (insideScreen(currentPoint) && checkCollision(currentPoint, 9) && iterations < 2000) {
        iterations++;
        var vector = calculateVector(currentPoint);
        var finishPoint = new Point(currentPoint.x + vector.x, currentPoint.y + vector.y, 0, currentPoint.color)
        context.lineTo(Math.round(finishPoint.x), Math.round(finishPoint.y));
        currentPoint = finishPoint;
    }
    context.moveTo(currentPoint.x, currentPoint.y);
    return;
}

function insideScreen(point) {
    return (point.x >= -100 && point.y >= -100 && point.y <= canvas.height + 100 && point.x <= canvas.width + 100)
}

function checkCollision(point, range) {
    var nearestPoint = getNearestPoint(point, range);
    if (nearestPoint == null || nearestPoint == currentPoint)
        return true;
    else return false;
}

function calculateVectorInPoint(point) {
    var vector = new Point(0.0, 0.0, 0.0, "");
    points.forEach(function callback(item, i, points) {
        if (item != point) {
            var radius = getRadius(point, item);
            var E = 100 * speed * point.power * item.power / Math.pow(radius, 3);
            vector.x += E * (point.x - item.x);
            vector.y += E * (point.y - item.y);
        }
    });
    return vector;
}

function calculateVector(point) {
    var vector = new Point(0.0, 0.0, 0.0, "");
    var margin = 5;
    points.forEach(function (item, i, points) {
        var radius = getRadius(point, item);
        var E = item.power / Math.pow(radius, 3);
        vector.x += E * (point.x - item.x);
        vector.y += E * (point.y - item.y);
    });
    var localE = currentPoint.power / Math.pow(getRadius(currentPoint, point), 2);
    var lenght = getRadius(new Point(0, 0, 0, ""), vector);

    if (lenght > 2 * margin || lenght < margin) {
        scale /= Math.abs(scale);
        scale *= margin / lenght;
        vector.x *= scale;
        vector.y *= scale;
    }
    return vector;
}


function AddPoint() {
    var point = new Point(event.clientX, event.clientY, document.getElementById("power").value/*Math.random() * 20 - 10, getRandomColor()*/)
    points.push(point);
    drawAllPoints();
}

function getNearestPoint(point, range) {
    var nearest = points[0];
    points.forEach(function (item, i, points) {
        if (getRadius(point, item) < getRadius(nearest, point))
            nearest = item;
    });
    if (getRadius(nearest, point) <= range)
        return nearest;
    else
        return null;
}

function OnLoad() {
    alert("Click on screen to add point");
    setInterval(calculatePointMoving, 1000 / 30);
    drawAllPoints();
}

function calculatePointMoving() {
    var vector;
    points.forEach(function (item, i, points) {
        vector = calculateVectorInPoint(item);
        points[i].x += vector.x;
        points[i].y += vector.y;
        if (!insideScreen(points[i])) {
            points.splice(i, 1);
        }
        fusion(item);
    });

    drawAllPoints();
}

function fusion(point) {
    points.forEach(function (item, i, points) {
        if (getRadius(point, item) < 10 && item != point) {
            var index = points.indexOf(point);
            points[index].power = Number(points[index].power) + Number(points[i].power);
            var temp = points[index];
            points.splice(i, 1);
            if (temp.power == 0) {
                points.splice(points.indexOf(temp), 1);
            }
        }
    })
}

var isMoved;

function mouseDown() {
    var mouse = window.event;
    isMoved = getNearestPoint(new Point(mouse.clientX, mouse.clientY, 0, ""), 15)
    canvas.onmousemove = mouseMove;
}

function mouseMove() {
    if (isMoved != null) {
        canvas.onclick = null;
        var index = points.indexOf(isMoved);
        if (index != null) {
            var mouse = window.event;
            points[index].x = mouse.clientX;
            points[index].y = mouse.clientY;
        }
    }
}

function onMouseUp() {

    if (isMoved != null) {
        canvas.onmousemove = null;
    }
    else {
        AddPoint();
    }
}


function SetPower(val) {
    var previous;
    if (val == 0) {
        if (previous > 0) {
            val = Number(val) - 0.5;
        }
        else {
            val = Number(val) + 0.5;
        }
        document.getElementById("power").value = val;
    }
    document.getElementById("currentPower").textContent = val;
    function setPrevious(val) {
        previous = val;
    }
}

function SetSpeed(val) {
    document.getElementById("speedCaption").textContent = val + 'x';
    speed = val;
}

function Clear() {
    points = [];
}

(function () {
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        drawStuff();
    }
    resizeCanvas();
    function drawStuff() {
        drawAllPoints();
    }
})();
