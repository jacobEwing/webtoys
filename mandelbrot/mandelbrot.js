'use strict';
var canvas, context;
var map;
var config, preferences;
var activeRendering = 0; // <-- keep track of whether the main interface is currently rendering.
var paletteTabs;
var colourBlack = { red : 0, green : 0, blue : 0, alpha : 1 };
var loadButtonSize = 96;

/*
	--- How the configuration is used ---

	In the "map" section, we have some fairly self explanatory values:

	width, height:
		The size of the area in the Mandelbrot set being rendered
	x, y:
		The centre point of the area being rendered

	accuracy:
		The maximum count allowed when calculating. 

	The "palette" section defines how colours are generated from the count:

	colourWavePeriod:
		Slightly less intuitive. When generating colours, the count returned by the
		Mandelbrot function is used to calculate an angle between 0 and 2pi radians.
		That angle is used in a sine function to generate smoothly tapering colour
		patterns.

		colourWavePeriod is the range of the count that scales to 2pi.  

		So if this is set to 100, then any pixels that receive a count of C will get an
		angle of 2 * pi * C / 100.

	For each primary colour, we have the values "offset", "stagger", and "period".

	When building a colour, we take the angle calculated from the count (see
	colourWavePeriod above), and apply a sine function to it.  The exact function
	is:
		primaryValue = 127.5 + 127.5 * sin(angle * period + offset + stagger)

	Note that stagger is only applied when the count is an odd number.  The exact
	code used can be found in the createColour function defined almost immediately
	below.

	The "options" section is for custom modifiers of the fractal or the colour
	selection.

*/
var defaultConfig = {
	"map": {
		"width": 4.1,
		"height": 4.1,
		"x": 0,
		"y": 0,
		"accuracy": 256
	},
	"palette": {
		"colourWavePeriod": 64,
		"red": {
			"offset": -.47,
			"stagger": 0,
			"period" : 1
		},
		"green": {
			"offset": 0,
			"stagger": 0,
			"period" : 1
		},
		"blue": {
			"offset": .7,
			"stagger": 0,
			"period" : 1
		},
		"master" : {
			"offset": 0,
			"stagger": 0
		},
		staggerMask : {
			red : "10",
			green : "10",
			blue : "10"
		}
	},
	"options" : {
		calculationFlags : {  // which data from the mandelbrot function will be used in determining the colour
			iterations : 1,
			displacement : 0,
			rotation : 0,
			displacementXOR : 0,
			polarCoordXOR : 0
		},
		coefficients : { // individual for the data used
			iterations : 1,
			displacement : 1,
			rotation : 1,
			displacementXOR : 1,
			polarCoordXOR : 1
		},
		"endCondition" : "",// alternate ending conditions to the mandelbrot loop
		"staggerTiming": "before", // a state to determine where in colour calculation a stagger gets added.
		"recursionDepth" : 1 // if > 1 then the mandelbot function is applied to the end displacement of (c, ci) x - 1 times.
	}
}

var defaultPreferences = {
	"showIntroduction" : 1
}


// This function takes the count, starting point, and ending point that was
// calculated for a given pixel, and uses that to generate its colour based on
// the selected options.
function createColour(countInfo, config){
	if(countInfo.count >= config.map.accuracy * config.options.recursionDepth){
		return colourBlack;
	}

	var stagger = {
		red : 0,
		green : 0,
		blue : 0
	};

	var count = 0;
	var dz = countInfo.z - countInfo.c;
	var dzi = countInfo.zi - countInfo.ci;
	var ang = rel_ang(countInfo.c, countInfo.ci, countInfo.z, countInfo.zi);
	var radius = Math.pow(dz * dz + dzi * dzi, .5);
	var staggerMask = config.palette.staggerMask;

	// apply the stagger before applying displacement when appropriate
	if(config.options.staggerTiming != 'after'){
		stagger = {
			red : ((1 << (countInfo.count % staggerMask.red.length)) & parseInt(staggerMask.red, 2) ? 1 : 0),
			green : ((1 << (countInfo.count % staggerMask.green.length)) & parseInt(staggerMask.green, 2) ? 1 : 0),
			blue : ((1 << (countInfo.count % staggerMask.blue.length)) & parseInt(staggerMask.blue, 2) ? 1 : 0)
		}
	}

	// Apply the various uses of the count and displacement

	// the basic iteration count
	if(config.options.calculationFlags.iterations){
		count += countInfo.count * config.options.coefficients.iterations;
	}

	// displacement from starting point to end calculated point
	if(config.options.calculationFlags.displacement){
		if(countInfo.count > 1) count += radius * config.options.coefficients.displacement;
	}

	// end rotation of the calculated point
	if(config.options.calculationFlags.rotation){
		if(countInfo.count > 1) count += (config.map.accuracy / (countInfo.count + 1)) * (.5 + Math.sin(ang) / 2) * config.options.coefficients.rotation;
	}

	// apply the stagger after rotation and displacement, but before exclusive or's
	if(config.options.staggerTiming != 'before'){
		stagger.red += ((1 << (count % staggerMask.red.length)) & parseInt(staggerMask.red, 2) ? 1 : 0);
		stagger.green += ((1 << (count % staggerMask.green.length)) & parseInt(staggerMask.green, 2) ? 1 : 0);
		stagger.blue += ((1 << (count % staggerMask.blue.length)) & parseInt(staggerMask.blue, 2) ? 1 : 0);
	}

	// xor the x, y coordinates of the displacement and add the result
	if(config.options.calculationFlags.displacementXOR){
		if(countInfo.count > 1){
			count += config.options.coefficients.displacementXOR * ((config.map.accuracy * (countInfo.zi - countInfo.ci)) ^ (config.map.accuracy * (countInfo.z - countInfo.c))) / (config.map.accuracy);
		}else{
			// allow the xor pattern to apply outside of the 4x4 Mandelbrot area
			count += config.options.coefficients.displacementXOR * ((config.map.accuracy * countInfo.zi) ^ (config.map.accuracy * countInfo.z)) / (config.map.accuracy);
		}
	}

	// xor the polar coordinates of the displacement and add the result
	if(config.options.calculationFlags.polarCoordXOR){
		if(countInfo.count > 1){
			count += config.options.coefficients.polarCoordXOR * ((config.map.accuracy * ang) ^ (config.map.accuracy * radius)) / (config.map.accuracy);
		}else{
			// allow the xor pattern to apply outside of the 4x4 Mandelbrot area
			count += config.options.coefficients.polarCoordXOR * ((countInfo.c * config.map.accuracy) ^ (countInfo.ci * config.map.accuracy)) / (config.map.accuracy);
		}
		
	}

	// now put it all together with the sine wave functions for the count
	ang = count * 2 * Math.PI / config.palette.colourWavePeriod;
	return {
		red : Math.round(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.red.period + config.palette.red.offset + config.palette.master.offset +
				(config.palette.red.stagger + config.palette.master.stagger) * stagger.red
			)
		),
		green : Math.round(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.green.period + config.palette.green.offset + config.palette.master.offset +
				(config.palette.green.stagger + config.palette.master.stagger) * stagger.green 
			)
		),
		blue : Math.round(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.blue.period + config.palette.blue.offset + config.palette.master.offset +
				(config.palette.blue.stagger + config.palette.master.stagger) * stagger.blue
			)
		),
		alpha : 1
	};
}

// returns the clockwise angle between the vertical axis and the line (x1, y1)-(x2, y2)
function rel_ang(x1, y1, x2, y2){
	var hyp, alpha, deltax, deltay;
	deltax = x2 - x1;
	deltay = y2 - y1;
	hyp = Math.sqrt(deltax * deltax + deltay * deltay);

	/********* figure out the value for alpha *********/
	if(x2 == x1){
		alpha = y2 > y1 ? Math.PI : 0;
	}else if(y2 == y1){
		alpha = (x2 < x1 ? 3 : 1) * Math.PI / 2
	}else if(x2 > x1){
		alpha = Math.PI - Math.acos(deltay / hyp);
	}else{
		alpha = 2 * Math.PI - Math.acos(-deltay / hyp);
	}

	return alpha;
}

function mandelbrot(c, ci, config, iterations){
	var accuracy = config.map.accuracy;
	var count = 0;
	var z = 0, zi = 0, zsq = 0;
	var zisq = 0;
	if(iterations == undefined) iterations = config.options.recursionDepth;

	// This ugly nesting of the loop inside the switch is for speed, as checking the end condition each time is much slower
	switch(config.options.endCondition){
		case 'multiplication':
			while(count <= accuracy && zsq * zisq < 4){
				zi = z * zi * 2 + ci;
				z = zsq - zisq + c;
				zsq = z * z;
				zisq = zi * zi;
				count++;
			}
			break;
		case 'subtraction':
			while(count <= accuracy && zsq - zisq < 4){
				zi = z * zi * 2 + ci;
				z = zsq - zisq + c;
				zsq = z * z;
				zisq = zi * zi;
				count++;
			}
			break;
		case 'fluffyCloud':
			while(count <= accuracy && Math.abs(z) + Math.abs(zi) < 2){
				zi = z * zi * 2 + ci;
				z = zsq - zisq + c;
				zsq = z * z;
				zisq = zi * zi;
				count++;
			}
			break;
		case 'foliage':
			while(count <= accuracy && Math.abs(z) - Math.abs(zi) < 2){
				zi = z * zi * 2 + ci;
				z = zsq - zisq + c;
				zsq = z * z;
				zisq = zi * zi;
				count++;
			}
			break;
		default:
			while(count <= accuracy && zsq + zisq < 4){
				zi = z * zi * 2 + ci;
				z = zsq - zisq + c;
				zsq = z * z;
				zisq = zi * zi;
				count++;
			}
	}

	var rval = {
		count : count,
		z : z,
		zi : zi,
		c : c,
		ci : ci
	};

	if(iterations > 1){
		let rval2 = mandelbrot(rval.z - rval.c, rval.zi - rval.ci, config, iterations - 1)
		for(let n in rval){
			rval[n] += rval2[n];
		}
	}


	return rval;
}

// used for rendering images outside of the view area
function staticRender(targetCanvas, width, height, config){
	var x, y, colour;
	var c, cStart = config.map.x - config.map.width / 2;
	var ci = config.map.y - config.map.height / 2;
	var cInc = config.map.width / width;
	var ciInc = config.map.height / height;

	var img = new ImageData(width, height);
	var idx = 0;

	for(y = 0; y < height; y++){
		c = cStart;
		for(x = 0; x < width; x++){
			
			colour = createColour(mandelbrot(c, ci, config), config);

			img.data[idx++] = colour.red;
			img.data[idx++] = colour.green;
			img.data[idx++] = colour.blue;
			img.data[idx++] = 255;
			c += cInc;

		}
		ci += ciInc;
	}

	targetCanvas.getContext('2d').putImageData(img, 0, 0);
	return img.data;
}

function render(){
	var x, y;
	var c = config.map.x - config.map.width / 2;
	var ci, ciStart = config.map.y - config.map.height / 2;
	var cInc = config.map.width / canvas.width;
	var ciInc = config.map.height / canvas.height;
	var colour, count;

	activeRendering = 1;
	map = [];

	// first calculate the value for each pixel
	for(x = 0; x < canvas.width; x++){
		map[x] = [];

		ci = ciStart;

		for(y = 0; y < canvas.height; y++){
			map[x][y] = mandelbrot(c, ci, config);
			ci += ciInc;
		}
		c += cInc;
	}

	redraw();

	activeRendering = 0;
}

function redraw(){
	var x, y, colour;
	var img = new ImageData(canvas.width, canvas.height);
	var idx = 0;
	for(y = 0; y < canvas.height; y++){
		for(x = 0; x < canvas.width; x++){
			colour = createColour(map[x][y], config)
			img.data[idx++] = colour.red;
			img.data[idx++] = colour.green;
			img.data[idx++] = colour.blue;
			img.data[idx++] = 255;
		}
	}
	context.putImageData(img, 0, 0);
}

function resetMandelbrot(){
	var map  = JSON.parse(JSON.stringify(defaultConfig.map));

	config.map.x = map.x;
	config.map.y = map.y;
	config.map.width = map.width;
	config.map.height = map.height;
	config.map.accuracy = map.accuracy;

	document.getElementById('xOffset').value = config.map.x;
	document.getElementById('yOffset').value = config.map.y;
	document.getElementById('width').value = config.map.width;
	document.getElementById('accuracy').value = config.map.accuracy;
	render();
}

function resetRenderOptions(){
	var palette  = JSON.parse(JSON.stringify(defaultConfig.palette));
	config.palette.colourWavePeriod = palette.colourWavePeriod;

	document.getElementById('numcolours').value = config.palette.colourWavePeriod;
	render();

}

function updateFields(){
	document.getElementById('xOffset').value = config.map.x;
	document.getElementById('yOffset').value = config.map.y;
	document.getElementById('width').value = config.map.width;
	document.getElementById('accuracy').value = config.map.accuracy;
	document.getElementById('numcolours').value = config.palette.colourWavePeriod;

	switch(config.options.endCondition){
		case 'foliage':
			document.getElementById('endCondition5').checked = true;
			break;
		case 'fluffyCloud':
			document.getElementById('endCondition4').checked = true;
			break;
		case 'multiplication':
			document.getElementById('endCondition3').checked = true;
			break;
		case 'subtraction':
			document.getElementById('endCondition2').checked = true;
			break;
		default:
			document.getElementById('endCondition1').checked = true;
	}
	
	document.getElementById('calculationIterations').checked = config.options.calculationFlags.iterations != 0;
	document.getElementById('calculationDisplacement').checked = config.options.calculationFlags.displacement != 0;
	document.getElementById('calculationRotation').checked = config.options.calculationFlags.rotation != 0;
	document.getElementById('calculationXORDisplacement').checked = config.options.calculationFlags.displacementXOR != 0;
	document.getElementById('calculationXORPolar').checked = config.options.calculationFlags.polarCoordXOR != 0;

	document.getElementById('iterationCoefficient').value = config.options.coefficients.iterations;
	document.getElementById('displacementCoefficient').value = config.options.coefficients.displacement;
	document.getElementById('rotationCoefficient').value = config.options.coefficients.rotation;
	document.getElementById('displacementXORCoefficient').value = config.options.coefficients.displacementXOR;
	document.getElementById('polarCoordXORCoefficient').value = config.options.coefficients.polarCoordXOR;


	if(config.options.staggerTiming == undefined){
		config.options.staggerTiming = 'after';
	}

	document.getElementById('staggerApplication').value = config.options.staggerTiming;
	document.getElementById('recursionDepth').value = config.options.recursionDepth;

};

function saveLocation(){
	var renderings;
	if(localStorage.renderings == undefined){
		renderings = [];
	}else{
		renderings = JSON.parse(localStorage.getItem('renderings'));
	}

	var record = JSON.parse(JSON.stringify(config));

	renderings[renderings.length] = record;
	document.getElementById('savedRenderings').appendChild(buildLoadButton(record));
	localStorage.setItem('renderings', JSON.stringify(renderings));

}

function deleteSavedLocation(idx){
	var renderings;
	if(localStorage.renderings == undefined) return;
	renderings = JSON.parse(localStorage.getItem('renderings'));

	if(renderings.length > idx){ // greater than because length is always max index + 1
		renderings.splice(idx, 1);
	}
	localStorage.setItem('renderings', JSON.stringify(renderings));

}

function buildLoadButton(rendering, button){

	var n;
	var cnvs = document.createElement('canvas');
	cnvs.width = loadButtonSize;
	cnvs.height = loadButtonSize;
	staticRender(cnvs, cnvs.width, cnvs.height, rendering);

	if(button == undefined){
		button = document.createElement('div');
		button.classList.add('previewButton');
	}

	button.appendChild(cnvs);

	button.onclick = function(){
		config = JSON.parse(JSON.stringify(rendering));
		if(config.options == undefined){
			config.options = {};
		}
		refreshAll();
	}
	button.onmouseleave = function(){
		var n;
		for(n of this.querySelectorAll('.deleteIcon')){
			n.parentElement.removeChild(n);
		}
	}
	button.onmouseenter = function(){
		if(this.querySelectorAll('.deleteIcon').length > 0) return;
		var deleteButton = document.createElement('div');
		deleteButton.classList.add('deleteIcon');
		deleteButton.innerHTML = 'x';
		button.prepend(deleteButton);

		deleteButton.onclick = function(e){
			if(confirm("are you sure want to delete this rendering?")){
				deleteSavedLocation(getNodePosition(button));
				button.parentNode.removeChild(button);
			}
			e.stopPropagation();
		}

	}
	return button;
}

function renderSavedLocations(){
	var renderings;
	if(localStorage.renderings == undefined){
		renderings = [defaultConfig];
		localStorage.setItem('renderings', JSON.stringify(renderings));
	}else{
		renderings = JSON.parse(localStorage.getItem('renderings'));
	}

	let target = document.getElementById('savedRenderings');
	let header = target.parentElement.querySelector('h1');
	let loadingSpan = document.createElement('span');
	loadingSpan.innerHTML = '(loading...)';
	loadingSpan.classList.add('loadingSpan');

	header.appendChild(loadingSpan);

	let numRenderings = Object.keys(renderings).length;
	let button = [];

	for(let n = 0; n  < numRenderings; n++){
		button[n] = document.createElement('div');
		button[n].classList.add('previewButton');
		button[n].style.width = loadButtonSize + 'px';
		button[n].style.height = loadButtonSize + 'px';
		target.append(button[n]);
		button[n].onclick = function(){
			config = JSON.parse(JSON.stringify(renderings[n]));
			refreshAll();
		}
	}

	let loadThumbnail = function(idx){
		if(activeRendering){
			// pause thumbnail rendering if the main window is
			// currently rendering as well
			setTimeout(function(){loadThumbnail(idx);}, 500);
		}else{
			console.log('*');
			buildLoadButton(renderings[idx], button[idx]);
			if(idx < numRenderings - 1){
				setTimeout(function(){loadThumbnail(idx + 1);}, 100);
			}else{
				header.removeChild(loadingSpan);
			}
		}
	}

	loadThumbnail(0);
}

// a popup blurb of basic instruction
function showWelcomeWindow(){
	popup(document.getElementById("introTemplate").cloneNode(true), [
		{label : 'Close', action : closePopup},
		{label : "Don't show again", action : function(){
			preferences.showIntroduction = 0;
			savePreferences();
			closePopup();
		}}
	]);
}

// show a popup dialogue containing the configuration JSON object
function exportParameters(){
	var buttons = [
		{
			label : 'Close',
			action : closePopup
		}
	];
	let content = document.getElementById("exportParametersTemplate").cloneNode(true);
	let textField = content.getElementsByTagName('textarea')[0];
	let textContent = JSON.stringify(config, null, "\t");;

	textField.value = textContent;

	popup(content, [{label : 'Close', action : closePopup}]);
}

// render the image in the background
// used strictly for downloading, to avoid page not responding errors
function bgRender(targetCanvas, width, height, config, onComplete){
	var x, y;
	var c, ci

	var colour;
	var ctx = targetCanvas.getContext('2d');
	var area = targetCanvas.width * targetCanvas.height;
	var idx = 0;
	var chunkSize = 2000;
	var cancelled = false;

	var progressBar = document.getElementById('progressBarTemplate').cloneNode(true);
	progressBar.style.background = "linear-gradient(90deg, rgba(48, 107, 255, 1) 0%, rgba(0, 0, 0, 0) 0%)";
	document.body.appendChild(progressBar);

	var cancelButton = progressBar.querySelector('a');
	cancelButton.onclick = function(){ cancelled = true; };

	var renderSegment = function(){
		var n;
		for(n = idx; n < area && n < idx + chunkSize; n++){
			x = n % targetCanvas.width;
			y = Math.floor(n / targetCanvas.width);
			c =  config.map.x - config.map.width / 2 + x * config.map.width / width;
			ci = config.map.y - config.map.height / 2 + y * config.map.height / height;

			colour = createColour(mandelbrot(c, ci, config), config);
			ctx.fillStyle = 'rgb(' + colour.red + ', ' + colour.green + ', ' + colour.blue + ')';
			ctx.fillRect(x, y, 1, 1);

		}
		idx = n;
		if(cancelled == true){
			progressBar.remove();
		}else if(idx < area){
			progressBar.style.background = "linear-gradient(90deg, rgba(48, 107, 255, 1) " + Math.round(100 * idx / area) + "%, rgba(0, 0, 0, 0) 0%)";
			setTimeout(renderSegment, 1);
		}else{
			progressBar.remove();
			onComplete();
		}
	};

	renderSegment();
}

// show a popup dialogue for downloading images
function exportImage(){
	var buttons = [
		{
			label : 'Close',
			action : closePopup
		},
		{
			label : 'Download',
			action : function(){
				var cfg = JSON.parse(JSON.stringify(config));
				var rendering = document.createElement('canvas');
				var ctx = rendering.getContext('2d');

				var width = 1 * widthField.value;
				var height = 1 * heightField.value;
				if(width > height){
					cfg.map.width = cfg.map.width * width / height;
				}else{
					cfg.map.height = cfg.map.height * height / width;
				}
				rendering.width = width;
				rendering.height = height;
				closePopup();

				bgRender(rendering, width, height, cfg, function(){
					var image = rendering.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
					var link = document.createElement('a');
					link.download = 'rendering.png';
					link.href = image;
					link.click();
				});

			}


		}

	];

	// clone the web form
	var content = document.getElementById("downloadImageTemplate").cloneNode(true);
	content.id = "downloadImageForm";

	// enter the current dimensions in the size fields
	var widthField = content.querySelector('[name="imageWidth"]')
	var heightField = content.querySelector('[name="imageHeight"]');
	widthField.value = canvas.width;
	heightField.value = canvas.height;

	// create our preview image
	var previewMaxSize = 256;
	var previewArea = {};
	var previewTarget = content.querySelector('.previewWrapper');

	var updatePreview = function(){
		var newConfig = JSON.parse(JSON.stringify(config));

		var newWidth = 1 * widthField.value;
		var newHeight = 1 * heightField.value;
		var ratio;
		if(newWidth > newHeight){
			if(newWidth > previewMaxSize){
				previewArea = {
					width : previewMaxSize,
					height : Math.round(newHeight * previewMaxSize / newWidth)
				}
			}else{
				previewArea = {
					width: newWidth,
					height: newHeight
				}
			}
			newConfig.map.width = newConfig.map.height * previewArea.width / previewArea.height;
		}else{
			if(newHeight > previewMaxSize){
				previewArea = {
					width : Math.round(newWidth * previewMaxSize / newHeight),
					height : previewMaxSize
				}
			}else{
				previewArea = {
					width: newWidth,
					height: newHeight
				}
			}
			newConfig.map.height = newConfig.map.width * previewArea.height / previewArea.width;
		}

		// we now have dimensions within the preview limits
		// next we create a canvas, render, and add to the div


		var previewCanvas = document.createElement('canvas');
		previewCanvas.width = previewArea.width;
		previewCanvas.height = previewArea.height;
		var ctx = previewCanvas.getContext('2d');
		staticRender(previewCanvas, previewArea.width, previewArea.height, newConfig);

		emptyNode(previewTarget);
		previewTarget.appendChild(previewCanvas);

	}

	widthField.onchange = updatePreview;
	heightField.onchange = updatePreview;
	updatePreview();

	popup(content, buttons);
}

function editBitmask(){
	var redField, greenField, blueField;
	var div = popup(document.getElementById("editBitmaskTemplate").cloneNode(true), [
		{
			label : 'Apply',
			action : function(){
				config.palette.staggerMask.red = redField.value;
				config.palette.staggerMask.green = greenField.value;
				config.palette.staggerMask.blue = blueField.value;
				redraw();
				closePopup();
			}
		},
		{
			label : 'Cancel',
			action : closePopup
		}

	]);

	redField = div.querySelector('[name="red"]');
	greenField = div.querySelector('[name="green"]');
	blueField = div.querySelector('[name="blue"]');

	for(let input of div.getElementsByTagName('input')){
		input.value = config.palette.staggerMask[input.name];
		input.addEventListener('input', function(){
			this.value = this.value.replace(/[^0-1]/g, '');
		});
	}

}

function getNodePosition(element){
	var i = 0;
	while (element = element.previousElementSibling){
		i++;
	}
	return i;
}

function emptyNode(node){
	while (node.firstChild) {
		node.removeChild(node.lastChild);
	}
}

// show a popup dialogue explaining how the palette is generated
function showPaletteInfo(){
	popup(document.getElementById("paletteInfoTemplate").cloneNode(true), [{label : 'Close', action : closePopup}]);
}

// create an interactive popup window
function popup(content, buttons){
	var n, button, wrapper, popup;

	wrapper = document.createElement('DIV');
	wrapper.classList.add('popupContent');
	wrapper.appendChild(content);

	var popup = document.getElementById('popupWrapper');
	popup.innerHTML = '';
	popup.appendChild(wrapper);

	for(var n in buttons){
		button = document.createElement('DIV');
		button.classList.add('button');
		button.innerHTML = buttons[n].label;
		button.onclick = buttons[n].action;
		popup.appendChild(button);
	}
	popup.style.display = 'block';

	return popup;
}

function closePopup(){
	var wrapper = document.getElementById('popupWrapper');
	wrapper.style.display = 'none';
	wrapper.innerHTML = '';
}

// take the children of a given element and make them a set of tabs
function tabinate(element, params){

	if(params == undefined) params = {};
	var n;
	var defaults = {
		activeTab : 0,
		spacing : 2,
		leftTabMargin : 2
	}
	for(n in defaults){
		if(params[n] == undefined){
			params[n] = defaults[n];
		}
	}

	var tabs = element.children;
	var tab, content, spacing = params.spacing;
	var tabX = params.leftTabMargin;

	element.classList.add('tabinator');
	for(n = 0; n < tabs.length; n++){
		content = tabs[n];
		tab = document.createElement('div');
		content.prepend(tab);
		tab.innerHTML = content.dataset.tab;
		tab.classList.add('tab');
		tab.style.left = tabX + 'px';

		if(n == params.activeTab){
			content.classList.add('active');
		}
		tab.onclick = function(){
			var n;
			for(n = 0; n < tabs.length; n++){
				if(tabs[n] == this.parentElement){
					tabs[n].classList.add('active');
				}else{
					tabs[n].classList.remove('active');
				}
			}
		}

		tabX += tab.getBoundingClientRect().width + params.spacing;
	}

}

// save the preferences to localStorage
function savePreferences(){
	localStorage.setItem('preferences', JSON.stringify(preferences));
}

// The initial startup procedure
function initialize(){
	// load the default configuration
	config = JSON.parse(JSON.stringify(defaultConfig));

	// get preferences
	preferences = localStorage.getItem('preferences');
	if(preferences == null){
		preferences = JSON.parse(JSON.stringify(defaultPreferences));
		savePreferences();
	}else{
		preferences = JSON.parse(preferences);
	}


	tabinate(document.getElementById('paletteTabs'));
	tabinate(document.getElementById('modifierTabs'));

	// create the canvas
	var canvasWrapper = document.getElementById('canvasWrapper');
	canvas = document.createElement('canvas');
	canvas.width = canvasWrapper.offsetWidth;
	canvas.height = canvasWrapper.offsetHeight;
	canvas.style.backgroundColor = '#000';
	canvasWrapper.appendChild(canvas);


	context = canvas.getContext('2d');


	//initialize the fractal
	// make sure that our area rendered is the same proportions as the actual viewport
	config.map.height = config.map.width * canvas.height / canvas.width;
	render();
	updateFields();

	// add event triggers
	initMouseWheel();
	initMouseDrag();
	initMouseClick();
	initFieldUpdates();
	initPaletteAdjusters();
	initModifiers();
	document.getElementById('doubleAccuracy').onclick = function(){ multiplyAccuracy(2); }
	document.getElementById('halveAccuracy').onclick = function(){ multiplyAccuracy(.5); }

	// handle backwards compatability
	updateOldStoredData();

	// show the intro popup
	if(preferences.showIntroduction == 1){
		showWelcomeWindow();
	}

	// render the thumbnails
	renderSavedLocations();
/*
	// some playing around if I want to put all of the components in windows
	let renderWindow = new WinBox({
		title: "Rendering", 
		mount : document.getElementById("canvasWrapper"),
		width: canvas.width + 'px', 
		height: canvas.height + 'px',
		scrollbars: false,
		background: "#346"
	});

	renderWindow.body.style.overflow = "hidden"
*/


}

/* This function is used to handle backwards compatability with old saved
 * renderings.  The structure in which they're stored has been modified
 * multiple times and will continue to be so.  This allows old renderings to be
 * retained. */
function updateOldStoredData(){
	let renderings = JSON.parse(localStorage.getItem('renderings'));
	let numRenderings = Object.keys(renderings).length;


	for(let n = 0; n < numRenderings; n++){
		// Account for old versions having "maxColourIndex" or having
		// "colourWavePeriod" stored with the mandelbrot info instead of the
		// palette info.
		if(renderings[n].palette.colourWavePeriod == undefined){
			if(renderings[n].map.colourWavePeriod != undefined){
				renderings[n].palette.colourWavePeriod = renderings[n].map.colourWavePeriod;
			}else if(renderings[n].map.maxColourIndex != undefined){
				renderings[n].palette.colourWavePeriod = renderings[n].map.maxColourIndex;
			}else{
				renderings[n].palette.colourWavePeriod = defaultConfig.palette.colourWavePeriod;
			}
		}

		// While we're here, update for old copies missing the wave period settings
		for(let primary of ['red', 'green', 'blue']){
			if(renderings[n].palette[primary].period == undefined){
				renderings[n].palette[primary].period = 1;
			}
		}

		// Handle the migration from distinct colour calculation types to separate boolean options for each modification
		if(renderings[n].options.calculationFlags == undefined){
			renderings[n].options.calculationFlags = JSON.parse(JSON.stringify(defaultConfig.options.calculationFlags));
			if(renderings[n].options.calculationMethod != undefined){
				switch(renderings[n].options.calculationMethod){
					case 'countPlusDisplacement':
						renderings[n].options.calculationFlags.displacement = 1;
						break;
					case 'countPlusDisplacementAngle':
						renderings[n].options.calculationFlags.rotation = 1;
						break;
					case 'countPlusAnglePlusRadius':
						renderings[n].options.calculationFlags.displacement = 1;
						renderings[n].options.calculationFlags.rotation = 1;
						break;
					case 'countXORDisplacement':
						renderings[n].options.calculationFlags.displacementXOR = 1;
						break;
					case 'classic':
						// we just stick with the already set defaults
						break;
					default:
						throw "updateOldStoredData: Unhandled configuration";
				}
			}
		}

		// Add the new coefficients section in options
		if(renderings[n].options.coefficients == undefined){
			renderings[n].options.coefficients = JSON.parse(JSON.stringify(defaultConfig.options.coefficients));
		}

		// Add the new stagger bitmask
		if(renderings[n].palette.staggerMask == undefined){
			renderings[n].palette.staggerMask = JSON.parse(JSON.stringify(defaultConfig.palette.staggerMask));
		}

		// add the new recursion option
		if(renderings[n].options.recursionDepth == undefined){
			renderings[n].options.recursionDepth = 1;
		}
	}


	// write the updates back to localStorage
	localStorage.setItem('renderings', JSON.stringify(renderings));

}

// load the default presets and refresh
function loadDefaults(){
	config = JSON.parse(JSON.stringify(defaultConfig));
	refreshAll();
}


function refreshAll(){
	initPaletteAdjusters();
	updateFields();
	render();
}


// initialize mouse interaction
function initMouseWheel(){
	canvas.onwheel = (function(){
		var zoomChange = 0;
		return function(e){
			e.preventDefault();
			e.stopPropagation();

			zoomChange += e.deltaY > 0 ? 1 : -1;
			var myDelta = zoomChange;

			setTimeout(function(){
				if(myDelta == zoomChange){
					var oldWidth = config.map.width;
					var oldHeight = config.map.height;

					// zoom based on how much the mouse wheel rolled
					var multiple = (1 - Math.abs(zoomChange) * .1);
					if(multiple < .1) multiple = .1;
					if(zoomChange > 0){
						config.map.width /= multiple;
					}else{
						config.map.width *= multiple;
					}
					config.map.height = config.map.width *  canvas.height / canvas.width;

					var clickX = e.offsetX;//pageX - canvas.offsetLeft;
					var clickY = e.offsetY;//pageY - canvas.offsetTop;

					// offset so that the point under the mouse remains under the mouse
					config.map.x = (clickX * oldWidth - clickX * config.map.width) / canvas.width - (oldWidth - config.map.width) / 2 + config.map.x;
					config.map.y = (clickY * oldHeight - clickY * config.map.height) / canvas.height - (oldHeight - config.map.height) / 2 + config.map.y;

					zoomChange = 0;
					updateFields();
					render();
				}
			}, 200);
			return false;
		};
	})();
}

function initMouseClick(){
	canvas.onclick = function(e){
		var clickX = e.offsetX;
		var clickY = e.offsetY;
		var leftX = config.map.x - config.map.width / 2;
		var topY = config.map.y - config.map.height / 2;
		var newX = clickX * config.map.width / canvas.width + leftX;
		var newY = clickY * config.map.height / canvas.height + topY;
		config.map.x = newX;
		config.map.y = newY;
		render();
	}
}

function initMouseDrag(){
	var dragStart = {}, dragging = 0;
	canvas.onmousedown = function(e){
		dragging = 1;
		dragStart.x = e.offsetX;
		dragStart.y = e.offsetY;
	}
	canvas.onmouseup = function(e){
		dragging = 0;
		var dx = dragStart.x - e.offsetX;
		var dy = dragStart.y - e.offsetY;
		dx *=  config.map.width / canvas.width;
		dy *=  config.map.height / canvas.height;
		config.map.x = 1 * config.map.x + dx;
		config.map.y = 1 * config.map.y + dy;
		updateFields();
		render();
	}
}

// initialize settings fields to react on change
function initFieldUpdates(){
	document.getElementById('xOffset').onchange = function(){
		if(isNaN(this.value)){
			this.classList.add('error');
		}else{
			config.map.x = 1 * this.value;
			this.classList.remove('error');
			render();
		}
	}
	document.getElementById('yOffset').onchange = function(){
		if(isNaN(this.value)){
			this.classList.add('error');
		}else{
			config.map.y = 1 * this.value;
			this.classList.remove('error');
			render();
		}
	}
	document.getElementById('width').onchange = function(){
		if(isNaN(this.value)){
			this.classList.add('error');
		}else{
			config.map.width = 1 * this.value;
			config.map.height = 1 * this.value;
			this.classList.remove('error');
			render();
		}
	}
	document.getElementById('accuracy').onchange = function(){
		if(isNaN(this.value)){
			this.classList.add('error');
		}else{
			config.map.accuracy = 1 * this.value;
			this.classList.remove('error');
			render();
		}
	}

	document.getElementById('numcolours').onchange = function(){
		if(isNaN(this.value) || this.value <= 0){
			this.classList.add('error');
		}else{
			config.palette.colourWavePeriod = 1 * this.value;
			this.classList.remove('error');
			redraw();
		}
	}
}

function multiplyAccuracy(factor){
	config.map.accuracy = Math.round(config.map.accuracy * factor) ;
	document.getElementById('accuracy').value = config.map.accuracy;
	render();
}

// initialize the input fields in the "modifiers" section
function initModifiers() {
	var endConditions = document.getElementsByName('endCondition');
	for(let n = 0; n < endConditions.length; n++){
		endConditions[n].onchange = function(){
			config.options.endCondition = this.value;
			render();
		}
	}

	// initialize calculation options
	document.getElementById('calculationIterations').onchange = function(){
		config.options.calculationFlags.iterations = this.checked ? 1 : 0;
		redraw();
	}
	document.getElementById('calculationDisplacement').onchange = function(){
		config.options.calculationFlags.displacement = this.checked ? 1 : 0;
		redraw();
	}
	document.getElementById('calculationRotation').onchange = function(){
		config.options.calculationFlags.rotation = this.checked ? 1 : 0;
		redraw();
	}
	document.getElementById('calculationXORDisplacement').onchange = function(){
		config.options.calculationFlags.displacementXOR = this.checked ? 1 : 0;
		redraw();
	}
	document.getElementById('calculationXORPolar').onchange = function(){
		config.options.calculationFlags.polarCoordXOR = this.checked ? 1 : 0;
		redraw();
	}

	// initialize their coefficients
	document.getElementById('iterationCoefficient').onchange = function(){
		config.options.coefficients.iterations = 1 * this.value;
		redraw();
	}
	document.getElementById('displacementCoefficient').onchange = function(){
		config.options.coefficients.displacement = 1 * this.value;
		redraw();
	}
	document.getElementById('rotationCoefficient').onchange = function(){
		config.options.coefficients.rotation = 1 * this.value;
		redraw();
	}
	document.getElementById('displacementXORCoefficient').onchange = function(){
		config.options.coefficients.displacementXOR = 1 * this.value;
		redraw();
	}
	document.getElementById('polarCoordXORCoefficient').onchange = function(){
		config.options.coefficients.polarCoordXOR = 1 * this.value;
		redraw();
	}

	// additional options
	var staggerTiming = document.getElementById('staggerApplication');
	staggerTiming.onchange = function(){
		config.options.staggerTiming = this.value;
		redraw();
	}

	var recursionDepth = document.getElementById('recursionDepth');
	recursionDepth.onchange = function(){
		let val = Math.floor(1 * this.value);
		if(val < 1) val = 1;
		this.value = val;
		config.options.recursionDepth = val;
		render();
	}

}

// initialize the slidey widgets and text fields for the palette
function initPaletteAdjusters(){
	var n, c, elements = {};

	// assemble the elements that we need to handle in an array for easy implementation
	for(c of ['red', 'green', 'blue', 'master']){
		elements[c] = {
			offset: document.getElementById(c + 'Offset'),
			offsetText: document.getElementById(c + 'OffsetText'),
			stagger: document.getElementById(c + 'Stagger'),
			staggerText: document.getElementById(c + 'StaggerText'),
		}

		// this separate if is needed because period has no "master" value
		if(c != 'master'){
			elements[c].period = document.getElementById(c + 'Period');
			elements[c].periodText = document.getElementById(c + 'PeriodText');
		}
	}

	for(n in elements){
		(function(n){
			//////////// setting the offset values ///////////
			elements[n].offset.value = config.palette[n].offset;
			elements[n].offsetText.value = config.palette[n].offset;
			if(n != 'master'){
				elements[n].period.value = config.palette[n].period;
				elements[n].periodText.value = config.palette[n].period;
			}

			// add slide widget event trigger
			elements[n].offset.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].offset = val;
				elements[n].offsetText.value = val;
				redraw();
			};

			// add text field event trigger
			elements[n].offsetText.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].offset = val;
				elements[n].offset.value = val;
				redraw();
			};

			//////////// setting the stagger values ///////////
			elements[n].stagger.value = config.palette[n].stagger;
			elements[n].staggerText.value = config.palette[n].stagger;

			// add slide widget event trigger
			elements[n].stagger.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].stagger = val;
				elements[n].staggerText.value = val;
				redraw();
			};

			// add text field event trigger
			elements[n].staggerText.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].stagger = val;
				elements[n].stagger.value = val;
				redraw();
			};

			//////////// setting the period values ///////////
			// we need the if because there is no "master" slider for wave period
			if(elements[n].period != undefined){
				// add the slide widget event trigger
				elements[n].period.onchange = function(){
					var val = 1 * this.value;
					config.palette[n].period = val;
					elements[n].periodText.value = val;
					redraw();
				};

				// add the text field event trigger
				elements[n].periodText.onchange = function(){
					var val = 1 * this.value;
					config.palette[n].period = val;
					elements[n].period.value = val;
					redraw();
				}
			}
		})(n)
	}

}

window.onload = function(){initialize()};
