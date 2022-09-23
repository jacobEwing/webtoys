class Particle {
	constructor(params){
		if( params == undefined ){
			params = {};
		}

		// assign the starting x/y coordinate
		if( params.position != undefined ){
			this.position = {x : params.position.x, y : params.position.y };
		}else{
			this.position = {x : 0, y : 0};
		}

		this.game = params.game == undefined ? null : params.game;
		this.radius = params.radius == undefined ? 1 : params.radius;


		this.colour = 'rgb(' 
			+ Math.floor(Math.random() * 160 + 64) + ', ' +
			+ Math.floor(Math.random() * 160 + 64) + ', ' +
			+ Math.floor(Math.random() * 160 + 64) + ')';
	}

	draw(context){
		context.save();
		context.fillStyle = this.colour;
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		context.closePath()
		context.fill();
		context.restore();
	}

	moveBy(force){
		this.position.x += force.dx;
		this.position.y += force.dy;
	}

	force(neighbour){
		// Get the force applied to this particle by the specified one.
		// Force is calculated by taking a base repulsion constant and
		// raising it to a power between -1 and 0.
		// This gives a return value ranging from 0 to 1, which will in
		// turn be multiplied by a unit vector of the space between them.

		// first get the vector and it's scalar value
		let dx = this.position.x - neighbour.position.x;
		let dy = this.position.y - neighbour.position.y;
		let rad = Math.sqrt(dx * dx + dy * dy);

		// rad is our denominator, so avoid division by zero:
		if(rad == 0){
			return {dx : 1, dy : 1};
		}
		// make it a unit vector
		dx /= rad;
		dy /= rad;
		
		// calculate the force
		let amplitude = Math.pow(this.game.repulsion, -rad);

		// apply it to the unit
		dx *= amplitude;
		dy *= amplitude;

		return { dx : dx, dy : dy };
	}
}

class Game {
	constructor(params){
		if(params == undefined){
			params = {};
		}
		this.particles = [];

		let defaults = {
			width : 800,
			height : 800,
			numParticles : 200,
			mouseRadius : 60,
			target : document.body,
			repulsion : 1.006,
			rotation : 0
		};

		this.area = {
			width : params.width == undefined ? defaults.width : params.width,
			height : params.height == undefined ? defaults.height : params.height
		}
		this.numParticles = params.numParticles == undefined ? defaults.numParticles : params.numParticles;
		this.mouseRadius = params.mouseRadius == undefined ? defaults.mouseRadius :  params.mouseRadius;
		this.target = params.target == undefined ? defaults.target : params.target;
		this.repulsion = params.repulsion == undefined ? defaults.repulsion : params.repulsion;
		this.rotation = params.rotation == undefined ? defaults.rotation : params.rotation;


		// build the necessary elements
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.area.width;
		this.canvas.height = this.area.height;

		this.target.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');

		// add mouse tracking
		this.mouseParticle = new Particle();
		this.mouseParticle.position = null;

		this.addMouseEvents();
		this.initParticles();

		// we're ready to go!
		this.animate();

	}

	setNumParticles = function(quantity){
		let n = 0;
		if(quantity > this.numParticles){
			for(n = this.numParticles; n < quantity; n++){
				this.particles[this.particles.length] = new Particle({
					radius : Math.floor(8 + Math.random() * 8),
					game : this,
					position: {
						x : (this.area.width >> 1) + Math.random(),
						y : (this.area.height >> 1) + Math.random(),
					}
				});
				
			}
			this.numParticles = quantity;

		}else if(quantity < this.numParticles){
			this.numParticles = quantity;
			this.particles.splice(this.numParticles);
		}
		
	}

	addMouseEvents(){
		var me = this;
		this.canvas.onmousemove = function(e){
			me.mouseParticle.position = { 
				x : e.clientX - e.currentTarget.offsetLeft,
				y : e.clientY - e.currentTarget.offsetTop 
			}
		}

		this.canvas.onmouseleave = function(){
			me.mouseParticle.position = null;
		}
	}

	resetCanvas(){
		this.area = {
			width : this.target.offsetWidth,
			height : this.target.offsetHeight
		};
		this.target.removeChild(this.canvas);
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.area.width;
		this.canvas.height = this.area.height;

		this.target.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');

		this.addMouseEvents();
	}

	animate(){
		this.moveParticles();
		this.clearCanvas();
		this.renderParticles();
		requestAnimationFrame(this.animate.bind(this));

	}

	clearCanvas(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	renderParticles(){
		for(let n = 0; n < this.particles.length; n++){
			this.particles[n].draw(this.context);
		}
	}

	moveParticles(){
		var netForce = [], n, m, f, mouseForce;
		let center = { x : this.area.width / 2, y : this.area.height / 2 };
		// calculate the net force applied to each particle
		for(n = 0; n < this.particles.length; n++){

			// radial force holding them to the center
			netForce[n] = {
				dx : (center.x - this.particles[n].position.x) * .1,
				dy : (center.y - this.particles[n].position.y) * .1
			}

			// add swirling rotation if it's active:
			if(this.rotation != 0){
				// get a copy of that radial force, rotated 90 degrees
				let rotForce = {
					dx : -netForce[n].dy,
					dy : netForce[n].dx
				};

				// make it a unit, scale it, and add it to our new force
				let hypot = Math.sqrt(rotForce.dx * rotForce.dx +rotForce.dy * rotForce.dy);
				rotForce.dx = this.rotation * rotForce.dx / hypot;
				rotForce.dy = this.rotation * rotForce.dy / hypot;
				netForce[n].dx += rotForce.dx;
				netForce[n].dy += rotForce.dy;
			}

			// force relative to mouse position
			if(this.mouseParticle.position != null){
				mouseForce = this.particles[n].force(this.mouseParticle)
				netForce[n].dx += this.mouseRadius * mouseForce.dx;
				netForce[n].dy += this.mouseRadius * mouseForce.dy;
			}

			// force relative to other particles
			for(m = 0; m < n; m++){
				f = this.particles[n].force(this.particles[m]);
				netForce[n].dx += f.dx;
				netForce[n].dy += f.dy;
				netForce[m].dx -= f.dx;
				netForce[m].dy -= f.dy;

			}

		}

		// Now do the actual motion
		for(n = 0; n < this.particles.length; n++){
			this.particles[n].moveBy(netForce[n]);
		}
	}

	initParticles(){
		let idealLength = Math.floor(Math.sqrt(this.numParticles));
		var n, m, y = 0, tally = 0, length = 0, rowY = 0;

		// distribute the particles using a variant of bresenham's line algorithm to evenly
		// spread out arbitrary quantities into a roughly square formation
		for(n = 0; n < this.numParticles; n++){
			length++;
			tally += idealLength;
			if(tally >= this.numParticles){
				// "length" is now the number of particles to go in this row
				let spacing = Math.floor(this.area.width / (length + 1));
				rowY += Math.floor(this.area.height / (idealLength + 1));
				for(m = 0; m < length; m++){
					let newParticle = new Particle({
						position : {
							x : m * spacing + spacing,
							y : rowY
						},
						radius : Math.floor(8 + Math.random() * 8),
						game : this
					});
					this.particles[this.particles.length] = newParticle;
				}
				length = 0;
				tally -= this.numParticles;
			}
		}
		
	}
}
