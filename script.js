function init() {
  var canvas = document.getElementById("demoCanvas");
  var ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  var imgTag = new Image();
  var imgSize = 24;
  imgTag.src = "./icon.png";   // load image
  imgTag.onload = animate;

  var headTag = new Image();
  var headSize = 32;
  headTag.src = "./cat.png";   // load head

  var deadTag = new Image();
  var deadSize = 64;
  deadTag.src = "./cat_cry.png"; 

  var foodImgTag = new Image();
  var foodSize = 64;
  foodImgTag.src = "./sushi.png"
  var foodCords = generateRandomCords(canvas.width, canvas.height, foodSize);

  var backgroundColor = "salmon";
  var fontColor = "white";

  var x = 0;
  var y = 0;
  var initialSpeed = 5;
  var speedIncrease = 0.2;
  var maxSpeed = 10;

  var speed, speedX, speedY, param;

  var time, stopped, paused, length, snakeTrace;
  
  var headRect, foodRect;

  startGame();

  function startGame() {
    speed = initialSpeed;
    param = calculateSpeedParam(speed);
    speedX = speed;
    speedY = 0;
    length = 1;
    time = 0;
    stopped = false;
    paused = false;
    snakeTrace = [];
    headRect = calculateRect(0, 0, imgSize);
    foodRect = calculateRect(foodCords.x, foodCords.y, foodSize);
    snakeTrace.push({x: 0, y: 0});
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear canvas

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // fill background

    ctx.fillStyle = fontColor;
    ctx.font = "60px Arial";
    ctx.fillText(length, canvas.width - 120, 100);

    // update cords
    var cords = calculateSpeed(canvas, x, y, speedX, speedY);
    x = cords.x;
    y = cords.y;

    //add to timer
    time ++;

    //keep up with the last "n" (the same as length) things in the snakeTrace
    if (time % param === 0) {
      snakeTrace.push(cords);
      snakeTrace = snakeTrace.slice(0 - length);
    }

    //calculate food/snakehead collision
    if (intersectRect(headRect, foodRect, imgSize)) {
      foodCords = generateRandomCords(canvas.width, canvas.height, foodSize);
      foodRect = calculateRect(foodCords.x, foodCords.y, foodSize);
      length ++;
      //increase speed
      if (maxSpeed && speed <= maxSpeed) {
        speed += speedIncrease;
        param = calculateSpeedParam(speed);
      }
    }

    // render snake
    snakeTrace.forEach(function(cord, idx) {
      if (idx === snakeTrace.length - 1) {
        ctx.drawImage(headTag, cord.x, cord.y);
        headRect = calculateRect(cord.x, cord.y, headSize)
      } else {
        ctx.drawImage(imgTag, cord.x, cord.y);
      }
    })

    //calculate snakehead/snakebody collison
    var headIntersectBody = isHeadIntersectBody(snakeTrace, headRect, imgSize);
    if (headIntersectBody) {
      stopped = true;
      ctx.drawImage(deadTag, 10, 40);
      ctx.font = "30px Arial";
      ctx.fillText("You're jolly dead.", 80, 100);
    }

    // render food
    ctx.drawImage(foodImgTag, foodCords.x, foodCords.y);

    if (!stopped && !paused) {
      requestAnimationFrame(animate) 
    }
  }

  $(document).keydown(function(e){
    var dict = {
      37: function() {speedX = -speed; speedY = 0},
      39: function() {speedX = speed; speedY = 0},
      38: function() {speedY = -speed; speedX = 0},
      40: function() {speedY = speed; speedX = 0},
      13: function() {
        if (stopped) {
          stopped = false;
          startGame();
        } else {
          paused = !paused; 
        }
        animate();
      }
    };
    var action = dict[e.keyCode];
    if (action) {
      action();
    }
    return false;
  });
}

function calculateSpeedParam(speed) {
  return Math.ceil( 10 - speed * 3 / 4);
}

function isHeadIntersectBody(snakeTrace, headRect, imgSize) {
  return snakeTrace.some(function(cord, idx) {
    var bodyRect = calculateRect(cord.x, cord.y, imgSize);
    var isHead = idx === snakeTrace.length - 1 || idx === snakeTrace.length - 2 || idx === snakeTrace.length - 3; 
    return isHead ? false : intersectRect(headRect, bodyRect);
  })
}

function calculateRect(x, y, picSize) {
  return {
    top: y,
    bottom: y + picSize,
    left: x,
    right: x + picSize,
  }
}

function intersectRect(r1, r2) {
  return (r1.left < r2.right &&
    r2.left < r1.right &&
    r1.top < r2.bottom &&
    r2.top < r1.bottom)
}

function generateRandomCords(width, height, picSize) {
  var x = Math.floor(Math.random() * (width - picSize));
  var y = Math.floor(Math.random() * (height - picSize));

  return {
    x: x,
    y: y
  }
}

function calculateSpeed(canvas, x, y, speedX, speedY) {
  x += speedX;
  y += speedY;

  if (x > canvas.width) {
    x = 0;
  } else if (x < 0) {
    x = canvas.width;
  }
  if (y > canvas.height) {
    y = 0;
  } else if ( y < 0) {
    y = canvas.height;
  }

  return {
    x: x,
    y: y
  }
}