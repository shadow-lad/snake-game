const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const text = document.getElementById("messages");
const playPause = document.getElementById("play-pause");
const restart = document.getElementById("restart");
const help = document.getElementById("help");
const howToPlayModal = document.getElementById("htp-details");
const howToPlayClose = document.getElementById("close-modal-help");
const gameOverModal = document.getElementById("game-over");
const gameOverClose = document.getElementById("close-modal-go");
const reason = document.getElementById("reason");
const finalScore = document.getElementById("final-score");
const highscoreText = document.getElementById("highscore");

const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

var gameLoop;
var paused = false;
var gameover = false;
var canChangeDirection = true;
var score = 0;
var interval = 200;
var touchStartX = null;
var touchStartY = null;
var touchEndX = null;
var touchEndY = null;
var highscore = 0;

const Snake = {
	body: [],
	xspeed: 10,
	yspeed: 0,
	direction: RIGHT,
	update: function () {
		var len = this.body.length;
		for (let i = len - 1; i > 0; i--) {
			this.body[i] = { ...this.body[i - 1] };
		}
		let x = this.body[0].x + this.xspeed;
		let y = this.body[0].y + this.yspeed;
		for (point of this.body) {
			if (point.x === x && point.y === y) {
				togglePause();
				text.innerHTML = "Game Over";
				gameOver("ate yourself");
				return;
			}
		}
		this.body[0].x = x;
		this.body[0].y = y;
	},
	show: function () {
		var len = this.body.length;
		for (let i = len - 1; i >= 0; i--) {
			ctx.fillStyle = "rebeccapurple";
			if (i == 0) {
				ctx.fillStyle = "green"
			}
			ctx.fillRect(this.body[i].x, this.body[i].y, 10, 10);
			ctx.strokeStyle = "black";
			ctx.strokeRect(this.body[i].x, this.body[i].y, 10, 10);
		}

		canChangeDirection = true;
	},
	checkBounds: function () {
		let x = this.body[0].x;
		let y = this.body[0].y;
		if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
			togglePause();
			text.innerHTML = "Game Over";
			gameOver("hit your head in the wall.");
		}
	},
	ate: function (food) {
		if (food.x === this.body[0].x && food.y === this.body[0].y) {
			this.upgrade();
			updateScore();
			return true;
		}
		return false;
	},
	upgrade: function () {
		this.body.unshift({ ...this.body[0] });
	},
	occupies: function (pos) {
		for (point of this.body) {
			if (point.x === pos.x && point.y === pos.y) {
				return true;
			}
		}
		return false;
	},
};

const Food = {
	x: 0,
	y: 0,
	update: function () {
		do {
			this.x = Math.floor(Math.random() * (canvas.width / 10)) * 10;
			this.y = Math.floor(Math.random() * (canvas.height / 10)) * 10;
			var flag = Snake.occupies({ x: this.x, y: this.y });
		} while (flag);
	},
	show: function () {
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, 10, 10);
	},
};

function updateScore() {
	score = Snake.body.length - 5;
	if (score > highscore) {
		highscoreText.innerHTML = score;
	}
	if (score % 10 === 0 && interval > 50) {
		interval -= 10;
		clearInterval(gameLoop);
		gameLoop = setInterval(draw, interval);
	}
}

function gameOver(reasonText) {
	if (score > highscore) {
		setCookie("highscore", score);
	}
	reason.innerHTML = reasonText;
	finalScore.innerHTML = score;
	text.innerHTML = "Game Over";
	gameover = true;
	gameOverModal.classList.remove("hide");
}

function setCookie(name, value) {
	var d = new Date();
	d.setTime(d.getTime() + (10 * 365 * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
	var name = cookieName + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(let i = 0; i < ca.length; i++) {
		var c = ca[i];
		while(c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function setup() {
	canvas.focus();
	let icon = document.getElementById("play-button");
	icon.classList.remove("fa-play", "fa-pause");
	icon.classList.add("fa-pause");
	let x = Math.floor(Math.random() * (canvas.width / 10 - 10)) * 10;
	let y = Math.floor(Math.random() * (canvas.height / 10 - 10)) * 10;
	Snake.body = [];
	for (let i = 0; i < 5; i++) {
		Snake.body.push({x: x, y: y});
	}
	
	Food.update();
	paused = false;
	gameover = false;
	canChangeDirection = true;
	Snake.direction = LEFT;
	Snake.xspeed = 10;
	Snake.yspeed = 0;
	score = 0;
	interval = 200;
	highscore = parseInt(getCookie("highscore")) || 0;
	highscoreText.innerHTML = highscore;
	text.innerHTML = "Score: " + score;
	gameLoop = setInterval(draw, interval);
}

function draw() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	Food.show();
	Snake.update();
	Snake.show();
	if (Snake.ate(Food)) {
		Food.update();
	}
	text.innerHTML = "Score: " + score;
	Snake.checkBounds();
}

function togglePause() {

	let icon = document.getElementById("play-button");
	icon.classList.remove("fa-play", "fa-pause");

	if (!paused) {
		paused = true;
		clearInterval(gameLoop);
		text.innerHTML = "Game Paused";
		icon.classList.add("fa-play");
	} else {
		paused = false;
		gameLoop = setInterval(() => draw(), interval);
		icon.classList.add("fa-pause");
		canvas.focus();
	}
}

function keyPressed(e) {
	switch (e.keyCode) {
		case 65:
		case 37: //left key
			if (Snake.direction !== RIGHT && canChangeDirection) {
				Snake.direction = LEFT;
				Snake.xspeed = -10;
				Snake.yspeed = 0;
				canChangeDirection = false;
			}
			break;
		case 87:
		case 38: // up key
			if (Snake.direction !== DOWN && canChangeDirection) {
				Snake.direction = UP;
				Snake.xspeed = 0;
				Snake.yspeed = -10;
				canChangeDirection = false;
			}
			break;
		case 68:
		case 39: // right key
			if (Snake.direction !== LEFT && canChangeDirection) {
				Snake.direction = RIGHT;
				Snake.xspeed = 10;
				Snake.yspeed = 0;
				canChangeDirection = false;
			}
			break;
		case 83:
		case 40: // down key
			if (Snake.direction !== UP && canChangeDirection) {
				Snake.direction = DOWN;
				Snake.xspeed = 0;
				Snake.yspeed = 10;
				canChangeDirection = false;
			}
			break;
		default: console.log(e);
	}
}

function getTouches(evt) {
	return evt.touches || evt.originalEvent.touches;
}

function onTouchStart(e) {
	e.preventDefault();
	const touch = getTouches(e)[0];
	touchStartX = touch.clientX;
	touchStartY = touch.clientY;
}

function onTouchMove(e) {
	e.preventDefault();
	if (!touchStartX || !touchStartY) {
		return;
	}
	const touch = getTouches(e)[0];
	touchEndX = touch.clientX;
	touchEndY = touch.clientY;
}

function onTouchEnd(e) {
	e.preventDefault();

	if (!(touchStartX && touchStartY && touchEndX && touchEndY)) {
		return;
	}

	var xDiff = touchStartX - touchEndX;
	var yDiff = touchStartY - touchEndY;
	if (Math.abs(xDiff) > Math.abs(yDiff)) {
		if (xDiff > 0) {
			// Left Swipe
			keyPressed({keyCode: 37});
		} else {
			// Right Swipe
			keyPressed({keyCode: 39});
		}
	} else {
		if (yDiff > 0) {
			// up swipe
			keyPressed({keyCode: 38});
		} else {
			// down swipe
			keyPressed({keyCode: 40});
		}
	}
	touchStartX = null;
	touchStartY = null;
	touchEndX = null;
	touchEndY = null;
}

canvas.addEventListener("keydown", this.keyPressed);
canvas.addEventListener("touchstart", onTouchStart);
canvas.addEventListener("touchmove", onTouchMove);
canvas.addEventListener("touchend", onTouchEnd);

playPause.addEventListener("click", (e)=> {

	e.preventDefault();
	if (gameover) {
		setup();
	} else {
		togglePause();
	}
})

restart.addEventListener("click", (e)=>{
	e.preventDefault();
	if (!paused) {
		togglePause();	
	}
	setup();
	canvas.focus();
})

help.addEventListener("click", (e)=> {
	e.preventDefault();
	if (!paused) {
		togglePause();
	}

	howToPlayModal.classList.remove("hide");

});

howToPlayClose.addEventListener("click", (e)=> {
	e.preventDefault();
	howToPlayModal.classList.add("hide");
});

howToPlayModal.addEventListener("click", (e)=> {
	e.preventDefault();
	howToPlayModal.classList.add("hide");
});

gameOverModal.addEventListener("click", (e)=>{
	e.preventDefault();
	gameOverModal.classList.add("hide");
})

gameOverClose.addEventListener("click", (e)=> {
	e.preventDefault();
	gameOverModal.classList.add("hide");
});