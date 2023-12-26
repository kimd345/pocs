class Player {
	constructor(game) {
		this.game = game;
		this.width = 100;
		this.height = 100;
		this.x = this.game.width / 2 - this.width / 2;
		this.y = this.game.height - this.height;
		// this.speed = 5;
	}

	draw(context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	update() {
		// // horizontal keyboard movement
		// if (this.game.keys.indexOf('ArrowLeft') > -1) this.x -= this.speed;
		// if (this.game.keys.indexOf('ArrowRight') > -1) this.x += this.speed;

		// mouse movement to get the x & y position of the mouse cursor on hover
		const canvas = this.game.canvas;
		// calculate x position relative to canvas
		const rect = canvas.getBoundingClientRect();

		canvas.addEventListener('mousemove', (e) => {
			if (e.target.id !== 'canvas1') return; // exit if the mouse is outside the canvas
			const x = e.clientX - rect.left - this.width / 2 - 5; // offset 5 for canvas border
			const y = e.clientY - rect.top - this.height / 2 - 5; // offset 5 for canvas border
			this.x = x;
			this.y = y;
		});

		// horizontal boundaries
		if (this.x < -this.width / 2) this.x = -this.width / 2;
		else if (this.x > this.game.width - this.width / 2)
			this.x = this.game.width - this.width / 2;
	}

	shoot() {
		const projectile = this.game.getProjectile();
		// pass in player's x & y to initialize the projectile
		if (projectile) projectile.start(this.x + this.width / 2, this.y);
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
		this.x = x - this.width / 2; // off-set to center projectile
		this.y = y;
		this.free = false;
	}
	reset() {	// return projectile to pool
		this.free = true;
	}
}

class Enemy {
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
		context.strokeRect(this.x, this.y, this.width, this.height);
	}
	update(x, y) {
		this.x = x + this.positionX;
		this.y = y + this.positionY;
		// check collision enemies - projectiles
		this.game.projectilesPool.forEach((projectile) => {
			if (!projectile.free && this.game.checkCollision(this, projectile)) {
				this.markedForDeletion = true;
				projectile.reset();	// projectile is free after collision and prevents penetrating all enemies
			}
		});
	}
}

class Wave {
	constructor(game) {
		this.game = game;
		this.width = this.game.columns * this.game.enemySize;
		this.height = this.game.rows * this.game.enemySize;
		this.x = 0;
		this.y = -this.height; // start from off-screen
		this.speedX = 3;
		this.speedY = 0;
		this.enemies = [];
		this.create();	// invoke create wave
	}
	render(context) {
		// !!!! TODO: Does this cause performance issues for mouse move?
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
				this.enemies.push(new Enemy(this.game, enemyX, enemyY));
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

		// enemy grid needs to be globally available in Game
		this.columns = 3;
		this.rows = 3;
		this.enemySize = 60;

		this.waves = [];
		this.waves.push(new Wave(this));

		// event listeners
		// window.addEventListener('keydown', (e) => {
		// 	if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
		// 	// console.log(e.key);
		// 	if (e.key === 'q' || 'Q') this.player.shoot()
		// });
		// window.addEventListener('keyup', (e) => {
		// 	const index = this.keys.indexOf(e.key);
		// 	if (index > -1) this.keys.splice(index, 1);
		// });
		window.addEventListener('mousedown', (e) => {
			this.keys.push(e.type);
			// console.log(e);
			if (e.type === 'mousedown') this.player.shoot();
		});
		window.addEventListener('mouseup', (e) => {
			const index = this.keys.indexOf(e.type);
			if (index > -1) this.keys.splice(index, 1);
		});
	}
	render(context) {
		this.player.draw(context);
		this.player.update();
		// cycle through projectilesPool
		this.projectilesPool.forEach((projectile) => {
			projectile.update();
			projectile.draw(context);
		});
		//
		this.waves.forEach((wave) => {
			wave.render(context);
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
}

// on load create canvas and instantiate Game
window.addEventListener('load', () => {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 600;
	canvas.height = 800;
	// ctx.fillStyle = 'white';
	// ctx.strokeStyle = 'black';

	const game = new Game(canvas);

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx);
		requestAnimationFrame(animate);
	}
	animate();
});
