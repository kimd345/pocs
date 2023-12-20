class Player {
	constructor(game) {
		this.game = game;
		this.width = 100;
		this.height = 100;
		this.x = this.game.width / 2 - this.width / 2;
		this.y = this.game.height - this.height;
		this.speed = 5;
	}

	draw(context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	update() {
		if (this.game.keys.indexOf('ArrowLeft') > -1) this.x -= this.speed;
		if (this.game.keys.indexOf('ArrowRight') > -1) this.x += this.speed;

		if (this.x < 0) this.x = 0;
		else if (this.x > this.game.width - this.width)
			this.x = this.game.width - this.width;
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
		if (!this.free) this.y -= this.speed;
	}
	start() {
		this.free = false;
	}
	reset() {
		this.free = true;
	}
}

class Enemy {}

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.keys = []; // keep track of keys that are pressed
		this.player = new Player(this);

		this.projectilesPool = [];
		this.numberOfProjectiles = 10;
		this.createProjectiles();
		// console.log(this.projectilesPool);

		// event listeners
		window.addEventListener('keydown', (e) => {
			if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
		});
		window.addEventListener('keyup', (e) => {
			const index = this.keys.indexOf(e.key);
			if (index > -1) this.keys.splice(index, 1);
		});
	}
	render(context) {
		this.player.draw(context);
		this.player.update();
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
}

window.addEventListener('load', () => {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 600;
	canvas.height = 800;

	const game = new Game(canvas);

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx);
		requestAnimationFrame(animate);
	}
	animate();
});
