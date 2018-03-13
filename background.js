window.addEventListener('load', eventWindowLoaded, false);	
function eventWindowLoaded() {

	canvasApp();
	
}

function canvasSupport () {
  	return Modernizr.canvas;
}

class Shot {
 	constructor(posX, posY, speedX, speedY) {
 		this.posX = posX;
 		this.posY = posY;
 		this.speedX = speedX;	// Per frame movement in X
 		this.speedY = speedY;	// Per frame movement in Y
 	}

 	move() {
 		this.posX += this.speedX;
 		this.posY -= this.speedY;
 	}
}

class Vector2 {
 	constructor(x, y) {
 		this.x = x;
 		this.y = y;
 		this.magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}

 	normalize() {
 		return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
 	}
 }

function canvasApp(){
	window.addEventListener("mousedown", mouseDownFunction, false);

	if (!canvasSupport()) {
			 return;
  	}
  	else{
	    var theCanvas = document.getElementById('canvas');
	    var context = theCanvas.getContext('2d');
	}

	function clearScreen() {
		context.beginPath();
 		context.clearRect(0, 0, theCanvas.width, theCanvas.height);
 		context.stroke();
	}

	var playerX = theCanvas.width / 2;
	const playerY = theCanvas.height - theCanvas.height / 10;
	var shots = [];
	const shotSpeed = 0.7;

	function drawEnvironment() {
		context.save();

		context.fillStyle = "lightgrey";

		context.beginPath();

		context.fillRect(0, 0, theCanvas.width, theCanvas.height);

		context.stroke();

		context.fillStyle = "black";
		context.lineWidth = 2.0;

		context.beginPath();

		context.strokeRect(0, 0, theCanvas.width, theCanvas.height);

		context.stroke();

		context.fillStyle = "lightgreen";

		context.beginPath();

		context.fillRect(2, theCanvas.height - (theCanvas.height / 5), theCanvas.width - 4, theCanvas.height / 5 - 2);

		context.restore();
	}

	function drawPlayer() {
		// TODO: If I have time, better looking player
		context.save();

		context.fillStyle = "blue";

		context.beginPath();

		context.fillRect(playerX - 15, theCanvas.height - (theCanvas.height / 10) - 15, 30, 30);

		context.stroke();

		context.restore();
	}

	function shootAt(destX, destY) {
		var speedVector = (new Vector2(destX - playerX, -(destY - playerY))).normalize();

		var newShot = new Shot(playerX, playerY - 20, speedVector.x * shotSpeed, speedVector.y * shotSpeed);
		shots.push(newShot);
		console.log(shots);
	}

	function mouseDownFunction(e) {
		var x = e.pageX - 50;
		var y = e.pageY - 50;
		if (x > 0 && x < theCanvas.width && y > 0 && y < theCanvas.height) {
			shootAt(x, y);
		}
	}

	function outOfBounds(shot) {
		return shot.posX > theCanvas.width || shot.posX < 0 || shot.posY > theCanvas.height || shot.posY < 0;
	}

	function movePieces() {
		// Move shots
		for (var count = shots.length - 1; count >= 0; count--) {
			shots[count].move();
			if (outOfBounds(shots[count])) {
				shots.splice(count, 1);
			}
		}
	}

	function drawPieces() {
		// Draw shots
		var curShot;

		context.save();
		context.fillStyle = "black";
		for (var count = 0; count < shots.length; count++) {
			curShot = shots[count];

			context.beginPath();

			context.fillRect(curShot.posX - 5, curShot.posY - 5, 10, 10);

			context.stroke();
		}
		context.restore();
	}

	function gameLoop() {
		clearScreen();

		drawEnvironment();

		drawPlayer();

		movePieces();

		//detectCollisions();

		drawPieces();

		window.setTimeout(gameLoop, 1);
	}

	gameLoop();
}