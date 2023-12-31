class Player {
	constructor(game) {
		this.game = game;
		this.width = 100;
		this.height = 100;
		this.x = this.game.width * 0.5 - this.width * 0.5;
		this.y = this.game.height - this.height;
		this.lives = 3;
		// this.speed = 5;
	}

	draw(context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	// update() {
	// // horizontal keyboard movement
	// if (this.game.keys.indexOf('ArrowLeft') > -1) this.x -= this.speed;
	// if (this.game.keys.indexOf('ArrowRight') > -1) this.x += this.speed;

	// 	// horizontal boundaries
	// 	if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
	// 	else if (this.x > this.game.width - this.width * 0.5)
	// 		this.x = this.game.width - this.width * 0.5;
	// }

	shoot() {
		const projectile = this.game.getProjectile();
		// pass in player's x & y to initialize the projectile
		if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
	}
	restart() {
		this.x = this.game.width * 0.5 - this.width * 0.5;
		this.y = this.game.height - this.height;
		this.lives = 3;
	}
}

class Projectile {
	constructor() {
		this.width = 4;
		this.height = 20;
		this.x = 0;
		this.y = 0;
		this.speed = 20;
		this.free = true;
	}
	draw(context) {
		if (!this.free) context.fillRect(this.x, this.y, this.width, this.height);
	}
	update() {
		if (!this.free) {
			this.y -= this.speed;
			// reset projectile if it leaves top boundary of canvas
			if (this.y < -this.height) this.reset();
		}
	}
	start(x, y) {
		this.x = x - this.width * 0.5; // off-set to center projectile
		this.y = y;
		this.free = false;
	}
	reset() {
		// return projectile to pool
		this.free = true;
	}
}

class Enemy {
	// enemy super class
	constructor(game, positionX, positionY) {
		this.game = game;
		this.width = this.game.enemySize;
		this.height = this.game.enemySize;
		this.x = 0;
		this.y = 0;
		this.positionX = positionX; // relative coords of enemy position within wave
		this.positionY = positionY;
		this.markedForDeletion = false;
	}
	draw(context) {
		// No object-pool functionality for now, keep it simple (33:30)
		// context.strokeRect(this.x, this.y, this.width, this.height);	// rectangle template around enemies
		context.drawImage(
			this.image, // image file path
			this.frameX * this.width, // source x coord of crop area
			this.frameY * this.height, // source y coord of crop area
			this.width, // source width
			this.height, // source height
			this.x, //
			this.y, //
			this.width, //
			this.height //
		);
	}
	update(x, y) {
		this.x = x + this.positionX;
		this.y = y + this.positionY;
		// check collision enemies - projectiles
		this.game.projectilesPool.forEach((projectile) => {
			if (
				!projectile.free &&
				this.game.checkCollision(this, projectile) &&
				this.lives > 0	// prevent projectile blocking by enemies undergoing frameX animation
			) {
				this.hit(1); //
				projectile.reset(); // projectile is free after collision and prevents penetrating all enemies
			}
		});
		if (this.lives < 1) {
			if (this.game.spriteUpdate) this.frameX++;
			if (this.frameX > this.maxFrame) {
				this.markedForDeletion = true; // will be removed from enemies arr, no longer referenced and deleted by garbage collection
				if (!this.game.gameOver) this.game.score += this.maxLives; // increase score
			}
		}
		// check collision enemies - player
		if (this.game.checkCollision(this, this.game.player)) {
			this.markedForDeletion = true;
			if (!this.game.gameOver && this.game.score > 0) this.game.score--; // decrement score
			this.game.player.lives--; // decrement life
			if (this.game.player.lives < 1) this.game.gameOver = true;
		}
		// lose condition -- enemy reaches bottom of canvas
		if (this.y + this.height > this.game.height) {
			this.game.gameOver = true;
			this.markedForDeletion = true;
		}
	}
	hit(damage) {
		this.lives -= damage;
	}
}

class Beetlemorph extends Enemy {
	// enemy sub class
	constructor(game, positionX, positionY) {
		super(game, positionX, positionY); // call parent class constructor
		// JS prototypal inheritance behavior will look in parent which doesn't have this.image
		this.image = document.getElementById('beetlemorph');
		this.frameX = 0; // horizontal navigation across sprite sheet
		this.maxFrame = 2;
		this.frameY = Math.floor(Math.random() * 4); // vertical navigation across sprite sheet
		this.lives = 1;
		this.maxLives = this.lives; // store original lives to reward pts on kill
	}
}

class Wave {
	constructor(game) {
		this.game = game;
		this.width = this.game.columns * this.game.enemySize;
		this.height = this.game.rows * this.game.enemySize;
		this.x = this.game.width * 0.5 - this.width * 0.5; // start from middle of canvas, shifted left by half of wave width
		this.y = -this.height; // start from off-screen
		this.speedX = 1.5 * (Math.random() < 0.5 ? -1 : 1); // randomize initial left or right movement
		this.speedY = 0;
		this.enemies = []; // contains enemies active in wave
		this.nextWaveTrigger = false; // flag to trigger new wave, initialized to false every wave
		this.create(); // invoke create wave
	}
	render(context) {
		if (this.y < 0) this.y += 5; // make wave slide in
		this.speedY = 0;
		// if hitting x boundaries
		if (this.x < 0 || this.x > this.game.width - this.width) {
			this.speedX *= -1; // reverse x direction
			this.speedY = this.game.enemySize; // bump wave down by y
		}
		this.x += this.speedX;
		this.y += this.speedY;
		this.enemies.forEach((enemy) => {
			enemy.update(this.x, this.y);
			enemy.draw(context);
		});
		// filter out enemies marked for deletion
		this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
	}
	create() {
		for (let y = 0; y < this.game.rows; y++) {
			for (let x = 0; x < this.game.columns; x++) {
				let enemyX = x * this.game.enemySize;
				let enemyY = y * this.game.enemySize;
				this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY));
			}
		}
	}
}

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.keys = []; // keep track of keys that are pressed
		this.player = new Player(this);

		this.projectilesPool = [];
		this.numberOfProjectiles = 3;
		this.createProjectiles();

		// enemy grid needs to be globally available in Game (ie not reinitialized on new Wave instantiation where columns and rows are incremented)
		this.columns = 3;
		this.rows = 3;
		this.enemySize = 80; // adjust to sprite sheet

		this.waves = [];
		this.waves.push(new Wave(this));

		// game status / text
		this.score = 0;
		this.gameOver = false;
		this.waveCount = 1;

		// flag for sprite update
		this.spriteUpdate = false;
		this.spriteTimer = 0;
		this.spriteInterval = 100;

		canvas.addEventListener('mousedown', (e) => {
			this.keys.push(e.type);
			if (e.type === 'mousedown') this.player.shoot();
		});
		canvas.addEventListener('mouseup', (e) => {
			const index = this.keys.indexOf(e.type);
			if (index > -1) this.keys.splice(index, 1);
		});

		// mouse movement to get the x & y position of the mouse cursor on hover
		// calculate x position relative to canvas
		const rect = canvas.getBoundingClientRect();
		canvas.addEventListener('mousemove', (e) => {
			if (e.target.id !== 'canvas1') return; // exit if the mouse is outside the canvas
			const x = e.clientX - rect.left - this.player.width * 0.5 - 5; // offset 5 for canvas border
			const y = e.clientY - rect.top - this.player.height * 0.5 - 5; // offset 5 for canvas border
			this.player.x = x;
			this.player.y = y;
		});

		// reset game
		window.addEventListener('keydown', (e) => {
			if (e.key === 'r' && this.gameOver) this.restart();
		});
	}
	render(context, deltaTime) {
		// sprite timing
		if (this.spriteTimer > this.spriteInterval) {
			this.spriteUpdate = true;
			this.spriteTimer = 0;
		} else {
			this.spriteUpdate = false;
			this.spriteTimer += deltaTime; // deltaTime is actual frame time in milliseconds and will trigger in same interval on slow and on fast refresh screens
		}

		this.drawStatusText(context);
		this.player.draw(context);
		// this.player.update();	// old implementation for movement inside Player class
		// cycle through projectilesPool
		this.projectilesPool.forEach((projectile) => {
			projectile.update();
			projectile.draw(context);
		});
		// Enemy Waves
		this.waves.forEach((wave) => {
			wave.render(context);
			// condition to trigger new wave
			if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
				this.newWave();
				this.waveCount++;
				wave.nextWaveTrigger = true;
				this.player.lives++; // bonus life per new wave
			}
		});
	}
	// create projectiles object pool
	createProjectiles() {
		for (let i = 0; i < this.numberOfProjectiles; i++) {
			this.projectilesPool.push(new Projectile());
		}
	}
	// get free projectile object from the pool
	getProjectile() {
		for (let i = 0; i < this.projectilesPool.length; i++) {
			if (this.projectilesPool[i].free) return this.projectilesPool[i];
		}
	}
	// collision detection between 2 rectangles
	checkCollision(rect1, rect2) {
		return (
			rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y
		);
	}
	//
	drawStatusText(context) {
		context.save(); // saves global context settings inside window load event listener
		context.fillText(`Score: ${this.score}`, 20, 40);
		context.fillText(`Wave: ${this.waveCount}`, 20, 80);
		// display lives in rectangles
		for (let i = 0; i < this.player.lives; i++) {
			context.fillRect(20 + 10 * i, 100, 5, 20);
		}
		if (this.gameOver) {
			context.textAlign = 'center';
			context.font = '100px Impact';
			context.fillText('gg', this.width * 0.5, this.height * 0.5);
			context.font = '20px Impact';
			const reset = context.fillText(
				'Press "r" to restart',
				this.width * 0.5,
				this.height * 0.5 + 40
			);
		}
		context.restore(); // restores from last saved context settings
	}
	// create new wave with more difficulty (TODO: adjust logic to taste)
	newWave() {
		if (
			Math.random() < 0.5 &&
			this.columns * this.enemySize < this.width * 0.8
		) {
			this.columns++; // increment y dimension
		} else if (this.rows * this.enemySize < this.height * 0.6) {
			this.rows++; // increment x dimension
		}
		this.waves.push(new Wave(this));
	}
	restart() {
		this.player.restart();
		this.columns = 3;
		this.rows = 3;
		this.waves = [];
		this.waves.push(new Wave(this));
		this.score = 0;
		this.gameOver = false;
		this.waveCount = 1;
	}
}

// on load create canvas and instantiate Game
window.addEventListener('load', () => {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 600;
	canvas.height = 800;
	// ctx.fillStyle = 'white';
	// ctx.strokeStyle = 'black';
	ctx.lineWidth = 5;
	ctx.font = '30px Impact';

	const game = new Game(canvas);

	let lastTime = 0;
	function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx, deltaTime);
		// 2 special features:
		// 1. automatically speed at which it serves next animation frame and adjusts to client screen refresh rate to prevent unnecessary frames
		// 2. automatically creates timestamp in milliseconds of first animation frame in the sequence
		requestAnimationFrame(animate);
	}
	animate(0);
});
