var bubble_array = [];
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var left, right, up, dir = [], acc;
var newGame = true, gameOver = false, collided = false;
var counter = 0, pressed = 0;
const dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
);

canvas.width = dimensions.width;
canvas.height = dimensions.height;

function updateGameArea() {
    if (newGame == true) {
        for (var n = 0; n < objectPool.astCount; n++) {
            asteroids.sizes[n] = 90;
            asteroids.coords.push([getRandom(0, canvas.width), getRandom(0, canvas.height), getRandom(0, 360), getRandom(-8, 10) / 2]);
        }
        newGame = false;
    }
    if (bubble_array.length == 0) {
        for (var j = 0; j < 15; j++) {
            x = getRandom(1.5, 9);
            y = getRandom(ship.cY * 8, ship.cY);
            bubble_array.push([x, y]);
        }
    }
    if (left == true) {
        ship.angle -= 3;

    } else if (right == true) {
        ship.angle += 3;

    }
    if (up == true) {
        setTimeout(() => {
            ship.x -= Math.cos((90 + ship.angle) * Math.PI / 180) * ship.w;
            ship.y -= Math.sin((90 + ship.angle) * Math.PI / 180) * ship.w;
        }, 20);
    }
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
    for (var i = 0; i < objectPool.astCount; i++) {
        if (asteroids.coords[i][0] > canvas.width) {
            asteroids.coords[i][0] = 0;
        } else if (asteroids.coords[i][0] < 0) {
            asteroids.coords[i][0] = canvas.width;
        }
        if (asteroids.coords[i][1] > canvas.width) {
            asteroids.coords[i][1] = 0;
        } else if (asteroids.coords[i][1] < 0) {
            asteroids.coords[i][1] = canvas.height;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (collided == true) {
        if (dir.length == 0) {
            for (var i = 0; i < 100; i++) {
                dir[i] = [ship.x + getRandom(-70, 70), ship.y + getRandom(-70, 70), getRandom(1, 360)];
            }
        }
        blast();
    }
    if (pressed == true) {
        updateBullet();
    }
    if (gameOver == false) {
        updateShip(ship.x, ship.y, ship.angle);
        checkCollision();
    }
    updateAsteroids();
}

var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    cX: 10,
    cY: 6.67,
    thrust: 0,
    vX: 0,
     vY: 0,
    w: 1
}

function updateShip(x, y, deg) {
    ctx.save();
    var rad = deg * Math.PI / 180;
    ctx.translate(x, y);
    ctx.translate(ship.cX, -ship.cY);
    ctx.rotate(rad);
    ctx.translate(-ship.cX, ship.cY);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -20);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    if (up == true) {
        for (var i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.arc(ship.cX / 2 + bubble_array[i][0], bubble_array[i][1], getRandom(0, 6), 0, 2 * Math.PI);
            ctx.lineWidth = 3 / bubble_array[i][0];
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
        for (var j = 0; j < 15; j++) {
            if (bubble_array[j][1] < 50)
                bubble_array[j][1] += getRandom(1, 100);
        }
    }
    ctx.translate(-x, -y);
    ctx.restore();
}
var asteroids = {
    count: 0,
    sizes: [],
    coords: []
}

var bullet = [];

var objectPool = {
    bulletCount: 0,
    astCount: 1
}

var loop = setInterval(function () {
    window.requestAnimationFrame(updateGameArea);
    if (gameOver == true) {
        if (objectPool.astCount != 0) {
            blast(ship.x, ship.y);
        }
        setTimeout(function () {
            if (objectPool.astCount != 0) {
                document.getElementById('gameover').style.visibility = 'visible';
            } else {
                document.getElementById('gameover').style.visibility = 'visible';
                document.getElementById('gameover').innerHTML = 'YOU WIN';
            }
            clearInterval(loop);
        }, 400)
        setTimeout(function () {
            location.reload();
        }, 3000);
    }
}, 1)

var map = { 37: '', 38: '', 39: '', 32: '' };

document.onkeydown = function (e) {
    map[e.keyCode] = true;
    if (map[37]) {
        left = true;
    }
    if (map[38]) {
        up = true;
    }
    if (map[39]) {
        right = true;
    }
    if (map[32]) {
        objectPool.bulletCount++;
        bullet.push({
            x: ship.x,
            y: ship.y,
            ang: ship.angle
        });
        pressed = true;
    }
    setTimeout(function () {
        bubble_array = [];
    }, 300);
}

document.onkeyup = function (e) {
    map[e.keyCode] = false;
    if (!map[38]) {
        up = false;
    }
    if (!map[37]) {
        left = false;
    }
    if (!map[39]) {
        right = false;
    }
}

function updateAsteroids() {
    for (var i = 0; i < objectPool.astCount; i++) {
        ctx.save();
        ctx.translate(asteroids.coords[i][0], asteroids.coords[i][1]);
        ctx.rotate(asteroids.coords[i][2] * Math.PI / 180);
        hex(asteroids.sizes[i]);
        ctx.translate(-asteroids.coords[i][0], -asteroids.coords[i][1]);
        ctx.restore();
        asteroids.coords[i][2] += asteroids.coords[i][3] / 6;
        asteroids.coords[i][1] += asteroids.coords[i][3] / 4;
        asteroids.coords[i][0] += asteroids.coords[i][3] / 4;
    }
}

function hex(r) {
    ctx.beginPath();
    var a = ((Math.PI * 2) / 7);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = '3';
    ctx.moveTo(r, 0);
    for (var i = 1; i < 7; i++) {
        ctx.lineTo(r * Math.cos(a * i), r * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.stroke();
}

function updateBullet() {
    for (var i = 0; i < bullet.length; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(bullet[i].x + 10, bullet[i].y - 6.67, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
        bullet[i].x -= Math.cos(((90 + bullet[i].ang) * Math.PI / 180)) * 9;
        bullet[i].y -= Math.sin(((90 + bullet[i].ang) * Math.PI / 180)) * 9;
    }
}


function checkCollision() {
    if (objectPool.astCount != 0) {
        for (var i = 0; i < objectPool.astCount; i++) {
            if (ship.x < asteroids.coords[i][0] + asteroids.sizes[i] && ship.x > asteroids.coords[i][0] - asteroids.sizes[i] && ship.y < asteroids.coords[i][1] + asteroids.sizes[i] && ship.y > asteroids.coords[i][1] - asteroids.sizes[i]) {
                collided = true;
                gameOver = true;
            }
            for (let j = 0; j < bullet.length; j++) {
                if (bullet[j].x < asteroids.coords[i][0] + asteroids.sizes[i] && bullet[j].x > asteroids.coords[i][0] - asteroids.sizes[i] && bullet[j].y < asteroids.coords[i][1] + asteroids.sizes[i] && bullet[j].y > asteroids.coords[i][1] - asteroids.sizes[i]) {
                    asteroids.sizes[i] -= 30;
                    console.log(asteroids.sizes[i]);
                    if (asteroids.sizes[i] == 0) {
                        asteroids.sizes.splice(i, 1);
                        asteroids.coords.splice(i, 1);
                        objectPool.astCount--;
                    } else {
                        objectPool.astCount++;
                        asteroids.sizes.push(asteroids.sizes[i]);
                        asteroids.coords.push([asteroids.coords[i][0], asteroids.coords[i][1], getRandom(0, 360), getRandom(-4, 6)]);
                    }
                    bullet.splice(j, 1);
                }
            }
            if (objectPool.astCount == 0) {
                gameOver = true;
                break;
            }
        }
    }
}



function blast() {
    for (var i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(dir[i][0], dir[i][1], dir[i][2] / 20, 0, 2 * Math.PI);
        ctx.lineWidth = getRandom(0, 3);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        dir[i][0] -= (Math.cos(dir[i][2]) * Math.PI / 180) * 10;
        dir[i][1] -= (Math.sin(dir[i][2]) * Math.PI / 180) * 10;
    }
}


