var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var keymap = { '37': '', '38': '', '39': '', '32': '' };
const dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
);

canvas.width = dimensions.width;
canvas.height = dimensions.height;


var bubble_array = [];

function generateThrust() {
    for (var i = 0; i < ship.thrustLength; i++) {
        console.log(i);
        ctx.beginPath();
        ctx.arc(ship.cX / 2 + bubble_array[i][0], bubble_array[i][1], bubble_array[i][2], 0, 2 * Math.PI);
        ctx.lineWidth = 3 / bubble_array[i][0];
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        if (i % 3 == 0) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        bubble_array[i][2] -= (bubble_array[i][2] > 0.5) ? 0.5 : 0;
    }
}

setInterval(updateGameArea, 20);

var gameArea = {
    new: true,
    gaveOver: [false, false],
}

function updateGameArea() {
    if (bubble_array.length == 0) {
        for (var j = 0; j < ship.thrustLength; j++) {
            x = getRandom(1.5, 9);
            y = getRandom(100, ship.cY / 2);
            bubble_array.push([x, y, getRandom(3, 5)]);
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    updateShip();
}

document.onkeydown = function (e) {
    if (e.keyCode == 38) {
        if(keymap[38] == false){
            ship.speed = 0;
        }
    }
    keymap[e.keyCode] = true;
}

document.onkeyup = function (e) {
    keymap[e.keyCode] = false;
    if (e.keyCode == 37 || e.keyCode == 39) {
        ship.w = 5;
    }else if(e.keyCode == 38){
        setTimeout(() => {
            ship.vX = ship.vY = 0;
            ship.speed=10;
        }, 1000);
    
    }
}
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    dir: 0,
    cX: 10,
    cY: 6.67,
    vX: 0,
    vY: 0,
    speed: 0,
    w: 5,
    brake: false,
    thrustLength: 15,
    addThrust: function () {
        generateThrust();
        for (var j = 0; j < ship.thrustLength; j++) {
            if (bubble_array[j][1] < 30) {
                bubble_array[j][1] += (Math.cos(bubble_array[j][3] * Math.PI / 180)) * 4;
            }
        }
        x = getRandom(1.5, 9);
        y = getRandom(100, ship.cY / 2);
        bubble_array.push([x, y, getRandom(3, 5), ship.angle]);
        ship.thrustLength++;
    }
}
var previousShipAngle = 0, counter = 0, finalAngle = 0;
function updateShip() {
    if (ship.angle > 360) {
        ship.angle -= 360;
    } else if (ship.angle <= 0) {
        ship.angle += 360;
    }
    ctx.translate(ship.x, ship.y);
    ctx.translate(ship.cX, -ship.cY);
    ctx.rotate(ship.angle * Math.PI / 180);
    ctx.translate(-ship.cX, ship.cY);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -20);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    if (keymap[38] == true) {
        //    ship.addThrust();
    }
    ctx.translate(-ship.x, -ship.y);
    ctx.restore();
    if (keymap[37] == true) {
        previousShipAngle = ship.angle;
        ship.angle -= ship.w;
        ship.w += 0.1;
    }
    if (keymap[39] == true) {
        previousShipAngle = ship.angle;
        ship.angle += ship.w;
        ship.w += 0.1;
    }
    if (keymap[38] == true ) {
        if (keymap[37] == true || keymap[39] == true) {
            ship.dir = (previousShipAngle + ship.angle) / 2;
            previousShipAngle = ship.dir;
            ship.speed = 3;
            ship.dir = ship.angle;
            ship.vY = (Math.cos(ship.dir * Math.PI / 180)) * ship.speed;
            ship.vX = (Math.sin(ship.dir * Math.PI / 180)) * ship.speed;
        } else {
            ship.dir = ship.angle;
            ship.vY = (Math.cos(ship.dir * Math.PI / 180)) * ship.speed;
            ship.vX = (Math.sin(ship.dir * Math.PI / 180)) * ship.speed;
        }
        ship.speed += (ship.speed < 10) ? 1 : 0;
    } else {
        ship.speed -= (ship.speed > 0) ? 0.1 : 0;
    }
    ship.x += ship.vX;
    ship.y -= ship.vY;
    if (ship.x > canvas.width) {
        ship.x = 0;
    } else if (ship.x < 0) {
        ship.x = canvas.width;
    }
    if (ship.y > canvas.width) {
        ship.y = 0;
    } else if (ship.y < 0) {
        ship.y = canvas.height;
    }
}