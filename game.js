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
	var playerY = theCanvas.height - theCanvas.height / 9;

	var canShoot = true;
	var shots = [];
	const shotSpeed = 1.5;
	const cooldown = 400;	// Shot CD in ms

	var enemies = [];
	const enemySpeed = 1.0;
	var enemySpawnTrigger = 100;
	const enemySpawnRate = 0.2;
	var enemySpawnTimer = 0.0;
	var totalEnemiesSpawned = 0;
	var level = 0;
	const levelSpawnArray = [70, 60, 50, 40, 30, 25, 20, 15, 10];

	var score = 0;

	var screenIsFlipped = false;
	var flipTimer = 0.0;
	var flipTrigger = 300;	// Initialized to 300 for first 3 enemies
	var flipRate = 0.1;

	var audioContext = new AudioContext();
	var MAX_SOUNDS = 9;
	var soundPool = new Array();
	var SOUND_HIT =  "hit";
	var SOUND_FLIP 	=  "flip";
	var SOUND_SHOOT = "shoot";
	var SOUND_GAME_OVER = "gameOver";
	var hitSound ;
	var hitSound2 ;
	var hitSound3 ;
	var flipSound;
	var flipSound2;
	var flipSound3;
	var shootSound;
	var shootSound2;
	var shootSound3;
	var gameOverSound;

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

		if (screenIsFlipped) {
			context.fillRect(2, 2, theCanvas.width - 4, theCanvas.height / 5 - 2);
		}
		else {
			context.fillRect(2, theCanvas.height - (theCanvas.height / 5), theCanvas.width - 4, theCanvas.height / 5 - 2);
		}
		context.restore();
	}

	function drawHUD() {
		context.save();

		context.fillStyle = "black";

		context.font = "25px Arial";

		context.fillText("Score: " + score, theCanvas.width / 2 - 50, theCanvas.height - 10);

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

	function itemLoaded(event) {
		flipSound.removeEventListener("canplaythrough",itemLoaded, false);
		flipSound2.removeEventListener("canplaythrough",itemLoaded, false);
		flipSound3.removeEventListener("canplaythrough",itemLoaded, false);
		hitSound.removeEventListener("canplaythrough",itemLoaded,false);
		hitSound2.removeEventListener("canplaythrough",itemLoaded,false);
		hitSound3.removeEventListener("canplaythrough",itemLoaded,false);
		shootSound.removeEventListener("canplaythrough",itemLoaded,false);
		shootSound2.removeEventListener("canplaythrough",itemLoaded,false);
		shootSound3.removeEventListener("canplaythrough",itemLoaded,false);
		soundPool.push({name:"hit", element:hitSound, played:false});
		soundPool.push({name:"hit", element:hitSound2, played:false});
		soundPool.push({name:"hit", element:hitSound3, played:false});
		soundPool.push({name:"flip", element:flipSound, played:false});
		soundPool.push({name:"flip", element:flipSound2, played:false});
		soundPool.push({name:"flip", element:flipSound3, played:false});
		soundPool.push({name:"shoot", element:shootSound, played:false});
		soundPool.push({name:"shoot", element:shootSound2, played:false});
		soundPool.push({name:"shoot", element:shootSound3, played:false});
	}

	function initSounds() {
		var tempSound = document.createElement("audio");
		document.body.appendChild(tempSound);

		hitSound = document.createElement("audio");
		document.body.appendChild(hitSound);
		hitSound.addEventListener("canplaythrough",itemLoaded,false);
		hitSound.setAttribute("src", "hit.mp3");
		
		
		hitSound2 = document.createElement("audio");
		document.body.appendChild(hitSound2);
		hitSound2.addEventListener("canplaythrough",itemLoaded,false);
		hitSound2.setAttribute("src", "hit.mp3");
		
		
		hitSound3 = document.createElement("audio");
		document.body.appendChild(hitSound3);
		hitSound3.addEventListener("canplaythrough",itemLoaded,false);
		hitSound3.setAttribute("src", "hit.mp3");
		
		
		
		
		flipSound = document.createElement("audio");
		document.body.appendChild(flipSound);
		flipSound.addEventListener("canplaythrough",itemLoaded,false);
		flipSound.setAttribute("src", "flip.mp3");
		
		
		flipSound2 = document.createElement("audio");
		document.body.appendChild(flipSound2);
		flipSound2.addEventListener("canplaythrough",itemLoaded,false);
		flipSound2.setAttribute("src", "flip.mp3");
		
		
		flipSound3 = document.createElement("audio");
		document.body.appendChild(flipSound3);
		flipSound3.addEventListener("canplaythrough",itemLoaded,false);
		flipSound3.setAttribute("src", "flip.mp3");




		shootSound = document.createElement("audio");
		document.body.appendChild(shootSound);
		shootSound.addEventListener("canplaythrough",itemLoaded,false);
		shootSound.setAttribute("src", "shoot.mp3");
		
		
		shootSound2 = document.createElement("audio");
		document.body.appendChild(shootSound2);
		shootSound2.addEventListener("canplaythrough",itemLoaded,false);
		shootSound2.setAttribute("src", "shoot.mp3");
		
		
		shootSound3 = document.createElement("audio");
		document.body.appendChild(shootSound3);
		shootSound3.addEventListener("canplaythrough",itemLoaded,false);
		shootSound3.setAttribute("src", "shoot.mp3");





		gameOverSound = document.createElement("audio");
		document.body.appendChild(gameOverSound);
		gameOverSound.addEventListener("canplaythrough",itemLoaded,false);
		gameOverSound.setAttribute("src", "gameOver.mp3");


		playSound(SOUND_HIT,0);
		playSound(SOUND_FLIP,0);
		playSound(SOUND_SHOOT, 0);
		playSound(SOUND_GAME_OVER, 0);

	}

	function playSound(sound,volume) {

		if (gameOver && sound != SOUND_GAME_OVER) {
			return;
		}
	
		var soundFound = false;
		var soundIndex = 0;
		var tempSound;
		
		if (soundPool.length > 0) {
			while (!soundFound && soundIndex < soundPool.length) {
			
				var tSound = soundPool[soundIndex];
				if ((tSound.element.ended || !tSound.played) && tSound.name == sound) {
					soundFound = true;
					tSound.played = true;
				} else {
					soundIndex++;
				}
		
			}
		}
		if (soundFound) {
			tempSound = soundPool[soundIndex].element;
			tempSound.volume = volume;
			tempSound.play();
			
		} else if (soundPool.length < MAX_SOUNDS){
			tempSound = document.createElement("audio");
			tempSound.setAttribute("src", sound + ".mp3");
			tempSound.volume = volume;
			tempSound.play();
			soundPool.push({name:sound, element:tempSound, played:true});
		}
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
		if (canShoot && x > 0 && x < theCanvas.width && y > 0 && y < theCanvas.height) {
			shootAt(x, y);
			playSound(SOUND_SHOOT, 0.5);
			canShoot = false;
			setTimeout(shotCD, cooldown);
		}
	}

	function flipEnemies() {
		for (var count = 0; count < enemies.length; count++) {
			enemies[count].posY = ((theCanvas.height + 100) - (enemies[count].posY + 50)) - 50;
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
		else if (e.keyCode == 46) {
			// DEBUG SCREENFLIP (DELETE KEY)
			screenIsFlipped = !screenIsFlipped;
			flipEnemies();
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

	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function spawnEnemies() {
		var newEnemy;

		enemySpawnTimer += enemySpawnRate;
		if (enemySpawnTimer >= enemySpawnTrigger) {
			enemySpawnTimer = 0.0;
			if (screenIsFlipped) {
				newEnemy = new Enemy(getRandomInt(50, theCanvas.width - 10), theCanvas.height + 50, enemySpeed, 60, 60);
			}
			else {
				newEnemy = new Enemy(getRandomInt(50, theCanvas.width - 10), -50, enemySpeed, 60, 60);
			}
			enemies.push(newEnemy);
			totalEnemiesSpawned++;
			if (totalEnemiesSpawned >= levelSpawnArray[levelSpawnArray.length - level - 1]) {
				if (level < levelSpawnArray.length - 1) {
					level++;
				}
				enemySpawnTrigger = levelSpawnArray[level];
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
				gameOver = true;
				playSound(SOUND_GAME_OVER, 0.5);
				return;
			}
			for (var shotCount = shots.length - 1; shotCount >= 0; shotCount--) {
				curShot = shots[shotCount];
				if (collision(curEnemy, curShot)) {
					enemies.splice(count, 1);
					shots.splice(shotCount, 1);
					playSound(SOUND_HIT, 0.5);
					score += 10;
					break enemy;
				}
			}
		}
	}

	function handleFlip() {
		flipTimer += flipRate;
		if (flipTimer >= flipTrigger) {
			screenIsFlipped = !screenIsFlipped;
			flipTimer = 0.0;
			flipTrigger = getRandomInt(50, 300);
			playSound(SOUND_FLIP, 0.5);
			flipEnemies();
		}

		if (screenIsFlipped) {
			playerY = theCanvas.height / 9;
		}
		else {
			playerY = theCanvas.height - theCanvas.height / 9;
		}
	}

	function gameOverFunction() {
		context.fillStyle = "black";
		context.font="45px Arial";
		context.fillText("GAME OVER", theCanvas.width / 3, theCanvas.height / 2);
	}

	function gameLoop() {
		handleFlip();

		clearScreen();

		drawEnvironment();

		drawHUD();

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