var bubble_array = [];
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var left, right, up,dir=[];
var newGame = true, gameOver = false, collided = false;
var counter=0,pressed=0;
const dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
  );

canvas.width = dimensions.width;
canvas.height = dimensions.height;

var ship = {
    x: canvas.width/2,
    y: canvas.height/2,
    angle: 0,
    cX: 10,
    cY: 6.67,
    a: 1,
}

var asteroids = {
    maxLength: 12,
    count: 0,
    sizes: [],
    coords: []
}

var bullet = [];

var objectPool = {
    bulletCount: 0,
    astCount: 6
}

var loop = setInterval(function(){
    window.requestAnimationFrame(updateGameArea);
    console.log(objectPool.astCount);
    if(objectPool.astCount == 0){
        gameOver = true;
    }
    if(gameOver==true){
        blast(ship.x,ship.y);
        setTimeout(function(){
            document.getElementById('gameover').style.visibility = 'visible';
            clearInterval(loop);
        },400)
        setTimeout(function(){
            location.reload();
        },3000);
    }
},10)

function updateGameArea(){
    if(newGame == true){
        for(var n=0;n<objectPool.astCount;n++){
            asteroids.sizes[n] = 90;
            asteroids.coords.push([getRandom(0,canvas.width),getRandom(0,canvas.height),getRandom(0,360),getRandom(-8,10)]);
        }    
        newGame = false;
    }
    if(bubble_array.length == 0){
        for(var j = 0; j < 15 ; j++ ){
            x = getRandom(1.5,9);
            y = getRandom(ship.cY*8,ship.cY);
            bubble_array.push([x,y]);
        }
    }
    if(left == true){
        ship.angle -= 4;
    }else if(right == true){
        ship.angle += 4;
    }
    if(up == true){
        ship.x -= Math.cos((90+ship.angle) * Math.PI / 180)*ship.a;
        ship.y -= Math.sin((90+ship.angle) * Math.PI / 180)*ship.a;
        if(ship.a<6)
          ship.a += 0.3;
    }
    if(ship.x > canvas.width){
        ship.x = 0;
    }else if(ship.x < 0){
        ship.x = canvas.width;
    }
    if(ship.y > canvas.width){
        ship.y = 0;
    }else if(ship.y < 0){
        ship.y = canvas.height;
    }
    for(var i=0;i<objectPool.astCount;i++){   
        if(asteroids.coords[i][0] > canvas.width){
            asteroids.coords[i][0] = 0;
        }else if(asteroids.coords[i][0] < 0){
            asteroids.coords[i][0] = canvas.width;
        }
        if(asteroids.coords[i][1] > canvas.width){
            asteroids.coords[i][1] = 0;
        }else if(asteroids.coords[i][1] < 0){
            asteroids.coords[i][1] = canvas.height;
        }
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(collided == true){
        if (dir.length == 0) {
            for(var i=0;i<100;i++){
                dir[i] = [ship.x+getRandom(-70,70),ship.y+getRandom(-70,70),getRandom(1,360)];
            }
        }
        blast();
    }        
    if(pressed ==  true){
        createBullet();
    }
    if(gameOver == false){
        createShip(ship.x, ship.y,ship.angle);
        checkCollision();
    }
    createAsteroids();
}


setInterval(function(){
    if(objectPool.bulletCount > 1){
        //
    }
},400)

document.onkeydown = function(e){
    if (e.keyCode == 37) {
        left = true
    }else if(e.keyCode == 38){
        up = true;
    }else if(e.keyCode == 39){
        right = true;
    }else if(e.keyCode == 32){
        objectPool.bulletCount++;
        bullet.push({x: ship.x,
                    y:ship.y,
                    ang:ship.angle
                    });
        pressed = true;
    }
    setTimeout(function(){
        bubble_array = [];
    },300);
    document.onkeyup = function(e){
        if(e.keyCode == 38){
            up = false;
            ship.a = 1;
        }else if(e.keyCode == 37){
            left = false;
        }else if(e.keyCode == 39){
            right = false;
        }
    }
}

function createShip(x,y,deg){
    ctx.save();
    var rad = deg * Math.PI / 180;
    ctx.translate(x,y);
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
    if(up == true){
        for(var i=0;i<15;i++){
            ctx.beginPath();
            ctx.arc(ship.cX/2+bubble_array[i][0],bubble_array[i][1], getRandom(0,6), 0, 2*Math.PI);
            ctx.lineWidth = 3/bubble_array[i][0];
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
        for(var j = 0; j < 15 ; j++ ){
            if(bubble_array[j][1] < 50)
                bubble_array[j][1] += getRandom(1,100);
        }
    }
    ctx.translate(-x,-y);
    ctx.restore();
}

function createAsteroids(){
    for(var i=0;i<objectPool.astCount;i++){
        ctx.save();
        ctx.translate(asteroids.coords[i][0],asteroids.coords[i][1]);
        ctx.rotate(asteroids.coords[i][2]*Math.PI/180);
        hex(asteroids.sizes[i]);
        ctx.translate(-asteroids.coords[i][0],-asteroids.coords[i][1]);
        ctx.restore();
        asteroids.coords[i][2] += asteroids.coords[i][3]/4;
        asteroids.coords[i][1] += asteroids.coords[i][3]/2;
        asteroids.coords[i][0] += asteroids.coords[i][3]/2;
    }
}

function hex(r) {
    ctx.beginPath();
    var a = ((Math.PI * 2)/7);
    ctx.strokeStyle='orange';
    ctx.lineWidth='3';
    ctx.moveTo(r,0);
    for (var i = 1; i < 7; i++) {
      ctx.lineTo(r*Math.cos(a*i),r*Math.sin(a*i));
    }
    ctx.closePath();
    ctx.stroke();
}

function createBullet(){
    for(var i=0;i<bullet.length;i++){
        ctx.save();
        ctx.beginPath();
        ctx.arc(bullet[i].x+10,bullet[i].y-6.67, 2, 0, 2*Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
        bullet[i].x -= Math.cos(((90+bullet[i].ang) * Math.PI / 180))*6;
        bullet[i].y -= Math.sin(((90+bullet[i].ang) * Math.PI / 180))*6;
    }
}


function checkCollision(){
    for(var i=0;i<objectPool.astCount;i++){
        if(ship.x < asteroids.coords[i][0]+asteroids.sizes[i] && ship.x > asteroids.coords[i][0]-asteroids.sizes[i] && ship.y < asteroids.coords[i][1]+asteroids.sizes[i] && ship.y > asteroids.coords[i][1]-asteroids.sizes[i]){
            collided = true;
            gameOver = true;
        }
        for (let j = 0; j < bullet.length; j++) {
            if(bullet[j].x < asteroids.coords[i][0]+asteroids.sizes[i] && bullet[j].x > asteroids.coords[i][0]-asteroids.sizes[i] && bullet[j].y < asteroids.coords[i][1]+asteroids.sizes[i] && bullet[j].y > asteroids.coords[i][1]-asteroids.sizes[i]){
                asteroids.coords.push([asteroids.coords[i][0],asteroids.coords[i][1],getRandom(0,360),getRandom(-4,6)]);
                asteroids.sizes[i] -= 30;
                objectPool.astCount++;
                asteroids.sizes.push(asteroids.sizes[i]);  
                bullet.splice(j,1);
                if(asteroids.sizes[i] == 0){
                    asteroids.sizes.splice(i,1);
                    asteroids.coords.splice(i,1);
                    objectPool.astCount--;
                }
                break;
            }                
        }
    }
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}``

function blast(){
    for(var i=0;i<15;i++){
        ctx.beginPath();
        ctx.arc(dir[i][0],dir[i][1], dir[i][2]/20, 0, 2*Math.PI);
        ctx.lineWidth = getRandom(0,3);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        dir[i][0] -= (Math.cos(dir[i][2]) * Math.PI / 180)*10;
        dir[i][1] -= (Math.sin(dir[i][2]) * Math.PI / 180)*10;
    }
}

function getObjectFitSize(
    contains,
    containerWidth,
    containerHeight,
    width,
    height
  ) {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;
  
    if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }
  
    return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2
    };
  }

