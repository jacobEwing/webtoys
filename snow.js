	var snowCount = 0;
	var mousePos = {x : null, y : null};
	function renderSnowflake(){
		if(snowCount > 70) return;
		snowCount++;
		var n;
		var rad2 = Math.random() / 2 + .5;
		var arms = 6;
		var radius = Math.round(5 + 10 * Math.random());
		var width = height = 2 * radius + 1;
		var canvas = document.createElement('CANVAS');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		var angle = 0;
		var angi = Math.random() * .2 + .05;
		var position = {
			'x' : Math.floor(Math.random() * window.innerWidth),
			'y' : -2 * (rad2 + radius)
		};
		var lastMousePos = {x : null, y : null};
		var velocityAdjust = {dx : 0, dy : 0};
		var fullRad = Math.random() >= .5 ? 1 : 0;

		var armFactor = Math.random() * .6 + .1;
		var drawArm = function(rad){
			ctx.moveTo(0, 0);
			var l = Math.floor(rad * armFactor);
			if(l >= 3){
				ctx.lineTo(0, fullRad ? l  : rad);
				ctx.save();
				ctx.translate(0, l);
				ctx.rotate(Math.PI / 3.5);
				drawArm(rad - l);
				ctx.rotate(-Math.PI / 1.75);
				drawArm(rad - l);
				ctx.restore();
			}else{
				ctx.lineTo(0, rad);
			}
		};

		
		ctx.strokeStyle = '#FFFFFF';
		ctx.translate(radius, radius);
		ctx.beginPath();
		for(n = 0; n < arms; n++){
			ctx.save();
			drawArm(radius * (n % 2 ? 1 : rad2));
			ctx.restore();
			ctx.rotate(2 * Math.PI / arms);
		}
		ctx.stroke();
		
		document.body.appendChild(canvas);

		canvas.style.position = 'absolute';
		canvas.style.top = position.y + 'px';
		canvas.style.left = position.x + 'px';
		canvas.style['padding-right'] = Math.floor(Math.random() * 3 * radius) + 'px';

		var velocity = {
			dx :  Math.random() * 6 - 3,
			dy :  Math.random() * 5 + 5
		}

		var animate = function(){
			if(mousePos.x != null && mousePos.y != null){
				if(lastMousePos.x != null && lastMousePos.y != null){
					var dx = mousePos.x - lastMousePos.x;
					var dy = mousePos.y - lastMousePos.y;
					var hyp = hypotenuse(mousePos.x, mousePos.y, position.x, position.y);
					if(hyp < 1) hyp = 1;
					velocityAdjust.dx += dx * 2 / hyp;
					velocityAdjust.dy += dy * 2 / hyp;
				}
				lastMousePos.x = mousePos.x;
				lastMousePos.y = mousePos.y;
			}

			velocityAdjust.dx *= .9;
			velocityAdjust.dy *= .9;
			position.x += velocity.dx + velocityAdjust.dx;
			position.y += velocity.dy + velocityAdjust.dy;
			var maxX = window.innerWidth;
			if(position.x > maxX + radius){
				position.x -= maxX + radius;
			}else if(position.x < -radius){
				position.x += maxX + radius;
			}


			if(position.y < window.innerHeight){
				angle += angi;
				canvas.style.transform = 'rotate(' + angle + 'rad)';
				canvas.style.top = position.y + 'px';
				canvas.style.left = position.x + 'px';
				setTimeout(animate, 60);
			}else{
				snowCount --;
				canvas.parentNode.removeChild(canvas);
			}

		};
		animate();
	}
	function hypotenuse(x1, y1, x2, y2){
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}


	window.onload = function(){
		setInterval(renderSnowflake, 100);
		document.onmousemove = function(event){
			mousePos = {
				x : event.clientX,
				y : event.clientY
			};
		};
	};
