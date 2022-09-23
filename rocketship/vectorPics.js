function drawRocket(ctx, showFire, angle){
	ctx.save();
		ctx.translate(-59.65, -85.3);
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.fillStyle = 'rgb(200, 32, 0)';
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 4;
		ctx.save();
			ctx.beginPath();
				ctx.moveTo(21.29464,159.91371);
				ctx.bezierCurveTo(29.60339,181.73666,37.3669,197.47588000000002,52.54464,208.52847);
				ctx.lineTo(2.0089200000000034,242.36776);
				ctx.lineTo(2.1068200000000035,195.35217);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
				ctx.moveTo(98.4375,159.82442);
				ctx.bezierCurveTo(90.12875,181.64737,82.36524,197.38659,67.1875,208.43918);
				ctx.lineTo(117.72322,242.27847);
				ctx.lineTo(117.62532,195.26288);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.strokeStyle = "#000000";
			ctx.lineJoin = "round";
			ctx.miterLimit = 3.25;
			ctx.beginPath();
				ctx.moveTo(59.58206,1.92265);
				ctx.bezierCurveTo(146.97105,98.95449,86.93906,210.84039,59.58206,210.84039);
				ctx.bezierCurveTo(33.86587,210.84039,-28.36824,100.43404000000001,59.58206,1.9226500000000044);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.fillStyle = "#a0ced0";
			ctx.strokeStyle = "#000000";
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.miterLimit = 3.25;
			ctx.translate(-201.17043,-146.05892);
			ctx.beginPath();
				ctx.moveTo(277.87088,231.4554);
				ctx.bezierCurveTo(277.87088,240.91341,270.20365,248.58064,260.74564,248.58064);
				ctx.bezierCurveTo(251.28762999999998,248.58064,243.62039,240.91341,243.62039,231.4554);
				ctx.bezierCurveTo(243.62039,221.99739,251.28762999999998,214.33016,260.74564,214.33016);
				ctx.bezierCurveTo(270.20365,214.33016,277.87088,221.99739,277.87088,231.4554);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.fillStyle = "#ffffff";
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 3;
			ctx.lineCap = "butt";
			ctx.lineJoin = "miter";
			ctx.miterLimit = 4;

			ctx.beginPath();
				ctx.moveTo(34.78201,37.32311);
				ctx.lineTo(84.93533,37.32311);
				ctx.lineTo(92.84925999999999,55.09655);
				ctx.lineTo(26.486679999999993,55.09655);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

		ctx.restore();
		
		ctx.save();
			ctx.fillStyle = "#dbffff";
			ctx.strokeStyle = "rgba(0, 0, 0, 0)";

			ctx.translate(59.65 - 8 * Math.sin(angle + 1), 85.3 - 8 * Math.cos(angle + 1));
			ctx.rotate(-angle);
			//ctx.transform(1.7146131,0,0,1.7146131,-392.13851,-306.70001);
			ctx.beginPath();
				ctx.moveTo(3.03906, 2.51062);
				ctx.lineTo(-1.13211, 3.4853);
				ctx.lineTo(-4.0618, 0.3603);
				ctx.lineTo(-2.82031, -3.73938);
				ctx.lineTo(1.35086, -4.71406);
				ctx.lineTo(4.28055, -1.58906);

			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		
	ctx.restore();


	if(showFire){
		ctx.save();
			ctx.translate(-25, 130);
			drawFire(ctx);
		ctx.restore();
	}
	ctx.save();
		ctx.translate(-59.65, -85.3);
		ctx.save();
			ctx.fillStyle = "#ffffff";
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 3;
			ctx.lineCap = "butt";
			ctx.lineJoin = "miter";
			ctx.miterLimit = 4;

			ctx.beginPath();
				ctx.moveTo(20.817165,217.20591);
				ctx.lineTo(99.53494,216.03403999999998);
				ctx.bezierCurveTo(103.5549,210.35862999999998,88.51349,185.17839999999998,91.38442,179.11997999999997);
				ctx.lineTo(29.611680000000007,178.72934999999998);
				ctx.bezierCurveTo(31.830550000000006,185.20006999999998,17.894185000000007,211.56034,20.817165000000006,217.20591);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.fillStyle = 'rgb(200, 32, 0)';
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 4;
		ctx.save();
			ctx.fillStyle = "#8b2600";
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 4;
			ctx.lineCap = "butt";
			ctx.lineJoin = "miter";
			ctx.miterLimit = 4;
			ctx.beginPath();
				ctx.moveTo(55.87571,160.31977);
				ctx.lineTo(55.87571,228.14666);
				ctx.bezierCurveTo(56.28114,234.48514,57.78154,238.19568999999998,59.47374,241.44594);
				ctx.bezierCurveTo(61.184,238.22341,63.13056,235.85156,63.59711,228.15171);
				ctx.lineTo(63.59711,160.21349);
				ctx.bezierCurveTo(63.59711,160.21349,64.13088,152.66516000000001,59.74947,153.04389);
				ctx.bezierCurveTo(55.4731,152.73481,55.875710000000005,160.31977,55.875710000000005,160.31977);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
	ctx.restore();
}

function drawStar (ctx, star){
	var ang = Math.sin(star.angle) * 0.5;
	var alpha = star.alpha;
	var colour;
	ctx.save();
		ctx.lineWidth = 1;
		ctx.lineCap = 'butt';
		ctx.miterLimit = 4;
		ctx.scale(star.scale, star.scale);
		ctx.rotate(ang);
		ctx.translate(-33, -32);
		ctx.strokeStyle = 'rgb(0, 0, 0)';

		ctx.save();
			ctx.fillStyle = "rgb(" + star.colour.R + ", " + star.colour.G + ", " + star.colour.B + ")";
			ctx.lineJoin = 'miter';
			ctx.transform(0.49747795,0.86747663,-0.86747663,0.49747795,44.456863,-11.681756);
			ctx.beginPath();
				ctx.moveTo(42.004794,36.915896);
				ctx.bezierCurveTo(40.91047,38.811319999999995,42.339031,48.07028,40.339602,48.960482999999996);
				ctx.bezierCurveTo(38.340173,49.850685999999996,32.415318,42.593605,30.274498,42.13856);
				ctx.bezierCurveTo(28.133678,41.683513999999995,19.769333000000003,45.903332,18.304842,44.276849999999996);
				ctx.bezierCurveTo(16.840352,42.65036799999999,21.911365,34.772935,21.682589,32.59627699999999);
				ctx.bezierCurveTo(21.453813,30.419619999999995,14.855803,23.768649999999994,15.950126000000001,21.873225999999995);
				ctx.bezierCurveTo(17.04445,19.977801999999997,26.103364,22.366361999999995,28.102793,21.476158999999996);
				ctx.bezierCurveTo(30.102221,20.585955999999996,34.388771999999996,12.255611999999996,36.529592,12.710657999999995);
				ctx.bezierCurveTo(38.670412,13.165702999999995,39.198115,22.519347999999994,40.662606000000004,24.145828999999996);
				ctx.bezierCurveTo(42.127097000000006,25.772310999999995,51.374341,27.274845999999997,51.603117000000005,29.451502999999995);
				ctx.bezierCurveTo(51.83189300000001,31.628160999999995,43.099118000000004,35.02047099999999,42.004794000000004,36.915896);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.save();
			colour = {R:Math.floor(98 * alpha), G:Math.floor(72 * alpha), B:Math.floor(15 * alpha)};
			ctx.fillStyle = "rgb(" + colour.R + ", " + colour.G + ", " + colour.B + ")";
			ctx.miterLimit = 4;
			ctx.translate(0.09090909,-1.9090909);
			ctx.beginPath();
				ctx.moveTo(40.090909,35.090908);
				ctx.bezierCurveTo(40.090909,39.710017,36.916201,43.454544,33,43.454544);
				ctx.bezierCurveTo(29.083799,43.454544,25.909091,39.710017,25.909091,35.090908);
				ctx.bezierCurveTo(25.909091,34.929282,25.913091,34.767689,25.921001,34.606334);
				ctx.lineTo(33,35.090908);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();

		colour = {R:Math.floor(214 * alpha), G:Math.floor(238 * alpha), B:Math.floor(150 * alpha)};
		ctx.fillStyle = "rgb(" + colour.R + ", " + colour.G + ", " + colour.B + ")";
		ctx.save();
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.miterLimit = 4;
			ctx.translate(-1.7272727,0.63636364);
			ctx.beginPath();
				ctx.moveTo(32.980909,28.542978);
				ctx.bezierCurveTo(32.180707999999996,29.999693,31.796975999999997,29.819290000000002,30.254906999999996,29.252915);
				ctx.bezierCurveTo(28.712837999999994,28.68654,28.332755999999996,28.401877000000002,28.398859999999996,26.860688000000003);
				ctx.bezierCurveTo(28.464959999999994,25.319498000000003,28.762497999999997,24.823919000000004,30.252569999999995,24.239636000000004);
				ctx.bezierCurveTo(31.742640999999995,23.655353000000005,32.18501499999999,24.125520000000005,33.213210999999994,25.467243000000003);
				ctx.bezierCurveTo(34.241406999999995,26.808965000000004,33.78110999999999,27.086262000000005,32.980909,28.542978000000005);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.miterLimit = 4;
			ctx.transform(1.0464536,0.23164817,-0.24692148,0.98172525,10.966857,-6.2069728);
			ctx.beginPath();
				ctx.moveTo(32.980909,28.542978);
				ctx.bezierCurveTo(32.180707999999996,29.999693,31.796975999999997,29.819290000000002,30.254906999999996,29.252915);
				ctx.bezierCurveTo(28.712837999999994,28.68654,28.332755999999996,28.401877000000002,28.398859999999996,26.860688000000003);
				ctx.bezierCurveTo(28.464959999999994,25.319498000000003,28.762497999999997,24.823919000000004,30.252569999999995,24.239636000000004);
				ctx.bezierCurveTo(31.742640999999995,23.655353000000005,32.18501499999999,24.125520000000005,33.213210999999994,25.467243000000003);
				ctx.bezierCurveTo(34.241406999999995,26.808965000000004,33.78110999999999,27.086262000000005,32.980909,28.542978000000005);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.lineWidth = 15.531464576721191;
			ctx.miterLimit = 4;
			ctx.transform(0.06438543,0,0,0.06438543,26.906473,25.199499);
			ctx.beginPath();
				ctx.moveTo(43.000001,34.31818);
				ctx.bezierCurveTo(43.000001,38.15907,39.886345,41.272726,36.045455999999994,41.272726);
				ctx.bezierCurveTo(32.204567,41.272726,29.090909999999994,38.15907,29.090909999999994,34.31818);
				ctx.bezierCurveTo(29.090909999999994,30.477290999999997,32.204567,27.363635,36.045455999999994,27.363635);
				ctx.bezierCurveTo(39.88634499999999,27.363635,43.000001,30.477290999999997,43.000001,34.31818);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		ctx.save();
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.lineWidth = 15.531464576721191;
			ctx.miterLimit = 4;
			ctx.transform(0.06438543,0,0,0.06438543,34.588289,25.244955);
			ctx.beginPath();
				ctx.moveTo(43.000001,34.31818);
				ctx.bezierCurveTo(43.000001,38.15907,39.886345,41.272726,36.045455999999994,41.272726);
				ctx.bezierCurveTo(32.204567,41.272726,29.090909999999994,38.15907,29.090909999999994,34.31818);
				ctx.bezierCurveTo(29.090909999999994,30.477290999999997,32.204567,27.363635,36.045455999999994,27.363635);
				ctx.bezierCurveTo(39.88634499999999,27.363635,43.000001,30.477290999999997,43.000001,34.31818);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		if(star.blinkStep > 0){
			ctx.save();
				var colour = {R:Math.floor(244 * alpha), G:Math.floor(217 * alpha), B:Math.floor(92 * alpha)};
				ctx.fillStyle = "rgb(" + colour.R + ", " + colour.G + ", " + colour.B + ")";
				ctx.strokeStyle = 'rgb(0, 0, 0)';
				ctx.lineWidth = 0.2;
				ctx.lineJoin = "miter";
				ctx.miterLimit = 4;
				ctx.beginPath();
				ctx.translate(15, -15.5);
				
				for(var n = 0; n < 2; n++){
					ctx.moveTo(11.1875,43.0625);
						ctx.bezierCurveTo(11.22214,47.249765,17.211782,47.234847,17.3125,43.0625);
						ctx.bezierCurveTo(17.22548,38.874014,11.203373,39.072301,11.1875,43.0625);
					ctx.closePath();
					ctx.translate(7.5, -0.25);
				}
				ctx.fill();
				ctx.stroke();
			ctx.restore();
		}
	ctx.restore();
}

function drawFire(ctx) {
	ctx.save();
		ctx.strokeStyle = 'rgba(0,0,0,0)';
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 4;
		g=ctx.createRadialGradient(25, 0, 20, 25, 22, 50);
		g.addColorStop(0,"rgba(255, 244, 196, 1)");
		g.addColorStop(Math.random() * 0.4,"rgba(255, 210, 0, 1)");
		g.addColorStop(0.4 + Math.random() * 0.4,"rgba(255, 148, 0, 0.8)");
		g.addColorStop(1,"rgba(126, 64, 0, 0.7)");
		ctx.fillStyle = g;
		ctx.strokeStyle = "rgba(0, 0, 0, 0)";
		var flamelength = 60;
		ctx.beginPath();
			ctx.moveTo(48, -12);
			ctx.bezierCurveTo(
				48, -12,
				0, -32,
				0, 4
			);
			for(var n = 3; n <= 51; n += 3){
				flamelength = 40 + 80 * Math.pow(Math.cos((n - 26) * Math.PI / 52), 2);
				ctx.bezierCurveTo(
					n - 3 * Math.random() * 2, 10 + Math.random() * flamelength,
					n, 10 + Math.random() * flamelength,
					n + 3 * Math.random() * 2, 10 + Math.random() * flamelength
				);
			}
			ctx.bezierCurveTo(
				n - 3 * Math.random() * 2, 10 + Math.random() * flamelength,
				n, 10 + Math.random() * flamelength,
				54,0 
			);
		ctx.closePath();
		ctx.fill();
	ctx.restore();
}

function drawBrakes(ctx){
	ctx.save();
		ctx.translate(0, 30);
		ctx.fillStyle = 'rgba(' + Math.floor(Math.random() * 100) + ', ' + Math.floor(140 + Math.random() * 100) + ', ' + Math.floor(200 + Math.random() * 56) + ', 0.05)';
		var angle = Math.random();
		var numPoints = Math.floor(3 + 4 * Math.random());
		var angi = Math.PI / numPoints;
		var radius = Math.random() * 20 + 150;
		var bendFactor = 0.5 * Math.random() + .75;
		ctx.beginPath();
			ctx.moveTo(
				radius * Math.sin(angle - angi), radius * Math.cos(angle - angi)
			);
			for(var n = 0; n < numPoints; n++){
				ctx.quadraticCurveTo(
					bendFactor * radius * Math.sin(angle), bendFactor * radius * Math.cos(angle),
					radius * Math.sin(angle + angi), radius * Math.cos(angle + angi)
				);
				angle += angi * 2;
				
			}
		ctx.fill();
		ctx.stroke();
	ctx.restore();
}

function drawPlanet(ctx){
	var pointList = [
		[53, 64, 2],[50, 40, 2],[27, 35, 1.25],[70, 50, 1.75],[18, 62, 1.5],[38, 57, 1.5],[40, 27, 1.5],
		[62, 27, 1.5],[41, 12, 1.2],[18, 18, 1],[13, 40, .75],[56, 15, .75],[32, 70, .75],[26, 50, .65],
		[32, 13, .5],[57, 50, .5],[70, 38, .5]
	];
	var n;
	ctx.save();
		ctx.scale(3, 3);
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.fillStyle = "#f6f1ce";
		ctx.strokeStyle = "#371a0d";
		ctx.lineWidth = 1;
		ctx.beginPath();
			ctx.moveTo(24.24366,3.5713013);
			ctx.bezierCurveTo(26.769042,3.5713013,46.719555,0.5408436600000002,46.719555,0.5408436600000002);
			ctx.lineTo(65.154839,7.8644497);
			ctx.bezierCurveTo(65.154839,7.8644497,75.76144099999999,16.198208,77.27667,22.511662);
			ctx.bezierCurveTo(78.79189799999999,28.825115,82.57997,40.189332,80.812204,48.523089999999996);
			ctx.bezierCurveTo(79.04443699999999,56.856849,76.398837,58.757543,72.225906,64.938069);
			ctx.bezierCurveTo(67.510448,71.922131,56.568541999999994,76.049746,53.790623,76.302284);
			ctx.bezierCurveTo(51.012702999999995,76.554822,45.456863999999996,81.100509,36.112953,79.585281);
			ctx.bezierCurveTo(25.941157,77.935801,25.253813,78.32259,16.414978,72.514213);
			ctx.bezierCurveTo(7.5761442,66.705835,9.0913729,61.907611,5.8083772,59.634768);
			ctx.bezierCurveTo(2.5253814,57.361925,-0.75761444,47.007861,1.0101526,36.653797);
			ctx.bezierCurveTo(2.9679811,25.186516,2.7779195,23.269276,6.5659916,17.713437);
			ctx.bezierCurveTo(10.354063,12.157598,24.24366,3.5713013,24.24366,3.5713013);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		g = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
		g.addColorStop(0, "rgba(215, 189, 152, 0.5)");
		g.addColorStop(0.51769549, "rgba(177, 146, 103, 0.27)");
		g.addColorStop(0.93185186, "rgba(158, 125, 78, 0.87)");
		g.addColorStop(1, "rgba(139, 104, 54, 1)");
		ctx.strokeStyle = "rgba(55, 16, 13, 0.8)";
		ctx.fillStyle = g;
		ctx.setLineDash([.5, .25]);
		for(n in pointList){
			ctx.save();
				ctx.lineWidth = 0.3 / pointList[n][2];
				ctx.translate(pointList[n][0], pointList[n][1]);
				ctx.scale(pointList[n][2], pointList[n][2]);

				ctx.beginPath();
					ctx.arc(0,0,3.75,0,2 * Math.PI,0);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			ctx.restore();
		}
	ctx.restore();
}
