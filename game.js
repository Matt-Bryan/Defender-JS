window.addEventListener('load', eventWindowLoaded, false);	
function eventWindowLoaded() {

	canvasApp();
	
}

function canvasSupport () {
  	return Modernizr.canvas;
}

class Shot {
 	constructor(posX, posY, speedX, speedY, sizeX, sizeY) {
 		this.posX = posX;
 		this.posY = posY;
 		this.speedX = speedX;	// Per frame movement in X
 		this.speedY = speedY;	// Per frame movement in Y
 		this.sizeX = sizeX;
		this.sizeY = sizeY;
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

class Enemy {
	constructor(posX, posY, speed, sizeX, sizeY) {
		this.posX = posX;
		this.posY = posY;
		this.speed = speed;
		this.sizeX = sizeX;
		this.sizeY = sizeY;
	}

	move(playerX, playerY) {
		var difX = playerX - this.posX;
		var difY = playerY - this.posY;
		var movementVec = new Vector2(difX, difY);
		movementVec = movementVec.normalize();
		movementVec.x *= this.speed;
		movementVec.y *= this.speed;
		this.posX += movementVec.x;
		this.posY += movementVec.y;
	}
}

function canvasApp(){
	window.addEventListener("mousedown", mouseDownFunction, false);
	window.addEventListener("keydown", doKeyDown, true);

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
	const playerY = theCanvas.height - theCanvas.height / 9;
	var canShoot = true;
	var shots = [];
	var enemies = [];
	const shotSpeed = 1.5;
	const cooldown = 500;	// Shot CD in ms
	const enemySpeed = 1.0;
	const enemySpawnTrigger = 100;
	const enemySpawnRate = 0.2;
	var enemySpawnTimer = 0.0;

	var gameOver = false;

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

		context.fillRect(playerX - 15, playerY - 15, 30, 30);

		context.stroke();

		context.restore();
	}

	function shotCD() {
		canShoot = true;
	}

	function shootAt(destX, destY) {
		var speedVector = (new Vector2(destX - playerX, -(destY - playerY))).normalize();

		var newShot = new Shot(playerX, playerY - 20, speedVector.x * shotSpeed, speedVector.y * shotSpeed, 10, 10);
		shots.push(newShot);
	}

	function mouseDownFunction(e) {
		if (gameOver) {
			return;
		}
		var x = e.pageX - 50;
		var y = e.pageY - 50;
		if (canShoot && x > 0 && x < theCanvas.width && y > 0 && y < theCanvas.height && y < playerY) {
			shootAt(x, y);
			canShoot = false;
			setTimeout(shotCD, cooldown);
		}
	}

	function doKeyDown(e) {
		if (gameOver) {
			return;
		}
		if (e.keyCode == 65 && playerX > 20) {
			// A
			playerX -= 10.0;
		}
		else if (e.keyCode == 68 && playerX < theCanvas.width - 20) {
			// D
			playerX += 10.0;
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

		// Move enemies
		for (var count = enemies.length - 1; count >= 0; count--) {
			enemies[count].move(playerX, playerY);
		}
	}

	function spawnEnemies() {
		enemySpawnTimer += enemySpawnRate;
		if (enemySpawnTimer >= enemySpawnTrigger) {
			enemySpawnTimer = 0.0;
			var newEnemy = new Enemy(theCanvas.width / 2, 50, enemySpeed, 60, 60);
			enemies.push(newEnemy);
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

			context.fillRect(curShot.posX - 5, curShot.posY - 5, curShot.sizeX, curShot.sizeY);

			context.stroke();
		}

		// Draw enemies
		var curEnemy;

		context.fillStyle = "red";

		for (var count = 0; count < enemies.length; count++) {
			curEnemy = enemies[count];

			context.beginPath();

			context.fillRect(curEnemy.posX - 30, curEnemy.posY - 30, curEnemy.sizeX, curEnemy.sizeY);

			context.stroke();
		}

		context.restore();
	}

	function collision(enemy, shot) {
		var enemyMinX = enemy.posX - (enemy.sizeX / 2);
		var enemyMaxX = enemyMinX + enemy.sizeX;
		var enemyMinY = enemy.posY - (enemy.sizeY / 2);
		var enemyMaxY = enemyMinY + enemy.sizeY;

		var shotMinX = shot.posX - (shot.sizeX / 2);
		var shotMaxX = shotMinX + shot.sizeX;
		var shotMinY = shot.posY - (shot.sizeY / 2);
		var shotMaxY = shotMinY + shot.sizeY;

		var result = false;

		if (enemyMinX > shotMaxX || shotMinX > enemyMaxX || enemyMinY > shotMaxY || shotMinY > enemyMaxY) {
			result = false;
		}
		else {
			result = true;
		}

		return result;
	}

	function playerHit(enemy) {
		var enemyMinX = enemy.posX - (enemy.sizeX / 2);
		var enemyMaxX = enemyMinX + enemy.sizeX;
		var enemyMinY = enemy.posY - (enemy.sizeY / 2);
		var enemyMaxY = enemyMinY + enemy.sizeY;

		var playerMinX = playerX - 15;
		var playerMaxX = playerMinX + 30;
		var playerMinY = playerY - 15;
		var playerMaxY = playerMinY + 30;

		var result = false;

		if (enemyMinX > playerMaxX || playerMinX > enemyMaxX || enemyMinY > playerMaxY || playerMinY > enemyMaxY) {
			result = false;
		}
		else {
			result = true;
		}

		return result;

	}

	function detectCollisions() {
		var curEnemy;
		var curShot;
		enemy: for (var count = enemies.length - 1; count >= 0; count--) {
			curEnemy = enemies[count];
			if (playerHit(curEnemy)) {
				// TODO
				gameOver = true;
				return;
			}
			for (var shotCount = shots.length - 1; shotCount >= 0; shotCount--) {
				curShot = shots[shotCount];
				if (collision(curEnemy, curShot)) {
					enemies.splice(count, 1);
					shots.splice(shotCount, 1);
					break enemy;
				}
			}
		}
	}

	function gameOverFunction() {
		context.fillStyle = "black";
		context.font="45px Arial";
		context.fillText("GAME OVER", theCanvas.width / 3, theCanvas.height / 2);
	}

	function gameLoop() {
		clearScreen();

		drawEnvironment();

		drawPlayer();

		spawnEnemies();

		movePieces();

		detectCollisions();

		drawPieces();

		if (!gameOver) {
			window.setTimeout(gameLoop, 1);
		}
		else {
			gameOverFunction();
		}
	}

	gameLoop();
}