let canvas = document.querySelector('#canvas'),
    ctx = canvas.getContext('2d'),
    fps = 30,
    up = 0,
    down = 0,
    left = 0,
    right = 0,
    gravity = 0,

    mouseX = 0,
    mouseY = 0,
    
    player = {
      width: 15,
      height: 30,
      x: canvas.width/2,
      y: canvas.height/2-50,
      centerX: 0,
      centerY: 0,
      speed: 3,
      jumpHeight: 15,
      jumpSpeed: 0,
    },
    gun = {
      circleR: 100,
      CircleArea: 0,
      chorda: 0,
      angle: 90
    },
    bullet = {
      radius: 5,
      speed: 9,
      speedX: 0,
      speedY: 0,
      color: 'RGBA(0,255,78,0.63)',
      x: 0,
      y: 0,
      width: 5,
      height: 5,
    },
    bullets = [],
    brick = {
      width: 60,//60
      height: 60,//60
      cols: 10,
      color: 'tomato',
      x: canvas.width/2-5,
      y: 350
    },
    bricks = [],
    brickGrid = [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,0,0,1,1,0,0,0,0,0,0,1,
      1,1,1,0,0,0,1,0,0,1,0,0,0,1,
      1,0,0,0,0,0,0,0,1,1,0,0,1,1,
      1,0,0,0,1,0,0,0,0,0,0,1,1,1,
      1,0,0,0,1,1,0,0,0,0,0,0,1,1,
      1,1,0,0,0,0,0,0,1,1,0,0,0,1,
      1,1,1,0,0,1,1,1,1,1,1,0,0,0,
      1,1,1,1,1,1,1,1,1,1,1,1,0,0

    ],
    money = {
      width: 10,
      height: 10,
      color: 'yellow',
      x: canvas.width/2-5,
      y: 350
    },
    keyPressed = e => {
      if (e.keyCode == 38) {
        up = 1;
      }
      if (e.keyCode == 40) {
        down = 1;
      }
      if (e.keyCode == 37) {
        left = 1;
      }
      if (e.keyCode == 39) {
        right = 1;
      }
    },
    keyReleased = e => {
      if (e.keyCode == 38) {
        up = 0;
      }
      if (e.keyCode == 40) {
        down = 0;
      }
      if (e.keyCode == 37) {
        left = 0;
      }
      if (e.keyCode == 39) {
        right = 0;
      }
    },
    bgDraw = (bgColor) =>{
      ctx.fillStyle = bgColor;
      ctx.fillRect(0,0, canvas.width, canvas.height);
    },
    brickDraw = (color) =>{
      bricks = [];
    let brickGridNum = 0;
      for(eachRows = 0; eachRows<canvas.height/brick.height; eachRows++){
        for(eachCols = 0; eachCols<canvas.width/brick.width; eachCols++){
          if(brickGrid[brickGridNum]){
            ctx.fillStyle = color;
            ctx.fillRect(brick.width*eachCols,brick.height*eachRows, brick.width-2, brick.height-2);
              bricks.push({
                width: brick.width-2,//60
                height: brick.height-2,//60
                x: brick.width*eachCols,
                y: brick.height*eachRows
              });
  
          }
          brickGridNum++;
        }
      }    
      // ctx.fillStyle =  'orange';
      // ctx.fillRect(brick.x, brick.y, brick.width, brick.height-2);
    },

    playerDraw = (x, y, width, height, color) =>{
      ctx.fillStyle = color;
      ctx.fillRect(x,y,width,height);
    },
    rotateBrickDraw = () =>{
      ctx.save();
      ctx.translate(player.centerX,player.centerY);

      ctx.rotate(-gun.angle * Math.PI/180);
      ctx.fillStyle = 'RGBA(0,255,255,0.3)';
      ctx.fillRect(-brick.width/4,-15/2,brick.height,15);
      ctx.restore();
      ctx.strokeStyle = 'rgba(10, 255, 63, 0.38)';
      ctx.beginPath();
      ctx.arc(player.centerX,player.centerY, gun.circleR, 0,  gun.angle * Math.PI/180);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player.centerX,player.centerY);
      ctx.lineTo(player.centerX+gun.circleR,player.centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player.centerX,player.centerY);
      ctx.lineTo(mouseX,mouseY);
      ctx.stroke();
      if(gun.angle < 180){
        ctx.beginPath();
        ctx.moveTo(player.centerX+gun.circleR,player.centerY);
        ctx.lineTo(mouseX,mouseY);
        ctx.stroke();
      }

      ctx.fillText(Math.floor(gun.angle)+'gr.', player.centerX+35, player.centerY+35);
    },
    bulletDraw = (color) =>{
      for(i=0;i<bullets.length;i++){
        if(bullets[i].visible){
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(bullet.x,bullet.y,bullet.radius,0,Math.PI*2);
          ctx.fill();
        }
      }
    },
    textDraw =(text, x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      
    },
    playerFall = () =>{
        if(placeFree(player.x, player.y + 1, player.width, player.height)) {
          if(gravity<10){//MAX_GRAVITY
            gravity += 1;
          }
          for (var i = gravity; i > 0; i--) {
          player.y += i;
          break;
          }
        }
        if(!placeFree(player.x, player.y + 10, player.width, player.height)) {
          gravity = 0;
        }
      
    },
    playerJump = () =>{
        for (var i = player.jumpSpeed; i > 0; i--) {
        if(placeFree(player.x, player.y - 5, player.width, player.height)){
        player.y -= player.jumpSpeed;
        }
        break;
        }
          player.jumpSpeed -= 1;
      
      if (!up) {
        player.jumpSpeed = 0;
      }
    },
    playerPosition = () =>{
      let dir = right - left;
      for(s = player.speed; s>0; s--){
        if (placeFree(player.x + player.speed * dir, player.y, player.width, player.height)) {
          player.x += s * dir;
        }
      }

      if(up && !placeFree(player.x, player.y+1, player.width, player.height)){
        player.jumpSpeed = player.jumpHeight;
      }
      if (player.jumpSpeed > 0) {
        playerJump();
      } else if(player.jumpSpeed <= 0) {
        playerFall();
      }
      player.centerX = player.x+player.width/2;
      player.centerY = player.y+player.height/2;

      //Bullet pos
      bullet.x += bullet.speedX;
      bullet.y += bullet.speedY;
      

        if(placeFree(bullet.x, bullet.y -1, bullet.width, bullet.height)){
          bullet.speedY += 1;
        }
        if(!placeFree(bullet.x, bullet.y +bullet.speedY, bullet.width, bullet.height)){
          bullet.speedY *= -0.6;
        } else if(!placeFree(bullet.x-bullet.speedX, bullet.y, bullet.width, bullet.height) || 
                  !placeFree(bullet.x+bullet.speedX, bullet.y, bullet.width, bullet.height)) {
              bullet.speedX *= -0.8;
        } 
      
    },
    placeFree = (xNew, yNew, wNew, hNew) => {
      let check = true;
    for(i=0;i<bricks.length;i++){
      if (xNew + wNew > bricks[i].x &&
        xNew < bricks[i].x + bricks[i].width &&
        bricks[i].y + bricks[i].height > yNew &&
        bricks[i].y < yNew + hNew) {
          check = false; 
      }
    }
    return check;
    },
    collision = (r1, r2, posX, posY) => {
        if ((r1.x+posX) + r1.width > r2.x &&
            (r1.x+posX) < r2.x + r2.width &&
            r2.y + r2.height > (r1.y+posY) &&
            r2.y < (r1.y+posY) + r1.height) {
              return true;
        } else {
          return false;
        }
    },
    updateMousePos = e =>{
      let rect = canvas.getBoundingClientRect(),
          root = document.documentElement;

          mouseX = e.clientX - rect.left - root.scrollLeft;
          mouseY = e.clientY - rect.top - root.scrollTop;
          gun.circleR = Math.sqrt(Math.pow(mouseX-player.centerX,2)+Math.pow(mouseY-player.centerY,2));  
          gun.chorda = Math.sqrt(Math.pow((player.centerX+gun.circleR)-mouseX,2)+Math.pow(player.centerY-mouseY,2));
          gun.CircleArea = Math.acos((Math.pow(gun.circleR,2)+Math.pow(gun.circleR,2)-Math.pow(gun.chorda,2))/(2*gun.circleR*gun.circleR));
          gun.angle = (gun.CircleArea/Math.PI)*180;
          if(mouseY-player.centerY>0){
            gun.angle = 360 - ((gun.CircleArea/Math.PI)*180);
          }
          if(mouseY-player.centerY<0){
            gun.CircleArea = Math.PI*2 - gun.CircleArea;
          }

          // console.log(gun.CircleArea)

    },
    updateDraw = () =>{
      bgDraw('#435');
      brickDraw(brick.color);
      playerDraw(player.x, player.y, player.width, player.height, '#0ff324');
      rotateBrickDraw();
      textDraw(`X: ${mouseX-player.centerX}, Y: ${mouseY-player.centerY} r: ${gun.circleR}`, mouseX, mouseY, 'ultramarin');
      bulletDraw(bullet.color);

    },
    updateAll = () =>{
      playerPosition();
      updateDraw();
    };
setInterval(updateAll, 1000/fps);
window.addEventListener('keydown', keyPressed);
window.addEventListener('keyup', keyReleased);
canvas.addEventListener('mousemove', updateMousePos);
canvas.addEventListener('click', () => {
  bullet.x = player.centerX;
  bullet.y = player.centerY;

  bullet.speed = Math.floor(gun.circleR/10);
  if(bullet.speed < 8) bullet.speed = 8;
  bullet.speedX = bullet.speed*Math.cos(gun.CircleArea);
  bullet.speedY = bullet.speed*Math.sin(gun.CircleArea);
  bullets.push({
    radius: 5,
    speed: 10,
    x: player.centerX,
    y: player.centerY,
    visible: true
  });
  // console.log('shot');
});
