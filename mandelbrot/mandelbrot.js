'use strict';
var canvas, context;
var map;
var config;
var paletteTabs;
var colourBlack = { red : 0, green : 0, blue : 0, alpha : 1 };


/*
	--- How the configuration is used ---

	In the "map" section, we have some fairly self explanatory values:

	width, height:
		The size of the area in the Mandelbrot set being rendered
	x, y:
		The centre point of the area being rendered

	accuracy:
		The maximum count allowed when calculating. 

	colourWavePeriod:
		Slightly less intuitive. When generating colours, the count returned by the
		Mandelbrot function is used to calculate an angle between 0 and 2pi radians.
		That angle is used in a sine function to generate smoothly tapering colour
		patterns.

		colourWavePeriod is the range of the count that scales to 2pi.  

		So if this is set to 100, then any pixels that receive a count of C will get an
		angle of 2 * pi * C / 100.

	The "palette" section defines how colours are generated from the count.

	For each primary colour, we have the values "offset", "stagger", and "period".

	When building a colour, we take angle calculated from the count (see
	colourWavePeriod above), and apply a sine function to it.  The exact function
	is:
		primaryValue = 127.5 + 127.5 * sin(angle * period + offset + stagger)
	
	Note that stagger is only applied when the count is an odd number.  The exact
	code used can be found in the createColour function defined almost immediately
	below.

*/

var defaultConfig = {
	"map": {
		"width": 4,
		"height": 4,
		"x": 0,
		"y": 0,
		"accuracy": 256,
		"colourWavePeriod": 64
	},
	"palette": {
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
		}
	}
}

// generate a colour to match given index
function createColour(idx, config){
	let ang = idx * 2 * Math.PI / config.map.colourWavePeriod;
	return {
		red : Math.floor(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.red.period + config.palette.red.offset + config.palette.master.offset +
				(config.palette.red.stagger + config.palette.master.stagger) * (idx & 1)  
			)
		),
		green : Math.floor(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.green.period + config.palette.green.offset + config.palette.master.offset +
				(config.palette.green.stagger + config.palette.master.stagger) * (idx & 1)  
			)
		),
		blue : Math.floor(127.5 + 127.5 * 
			Math.sin(
				ang * config.palette.blue.period + config.palette.blue.offset + config.palette.master.offset +
				(config.palette.blue.stagger + config.palette.master.stagger) * (idx & 1)  
			)
		),
		alpha : 1
	};
}

function mandelbrot(c, ci, accuracy){
	var count = 0;
	var z = 0, zi = 0, zsq = 0;
	var zisq = 0;

	while(count <= accuracy && zsq + zisq < 4){
		zi = z * zi * 2 + ci;
		z = zsq - zisq + c;
		zsq = z * z;
		zisq = zi * zi;
		count++;
	}
	return count;
}

// used for rendering images outside of the view area
function staticRender(targetCanvas, width, height, config, callback){
	var x, y;
	var c, ci

	var colour;
	var ctx = targetCanvas.getContext('2d');
	for(x = 0; x < targetCanvas.width; x++){
		c =  config.map.x - config.map.width / 2 + x * config.map.width / width;

		for(y = 0; y < targetCanvas.height; y++){
			ci = config.map.y - config.map.height / 2 + y * config.map.height / height;

			colour = mandelbrot(c, ci, config.map.accuracy);
			if(colour > config.map.accuracy){
				colour = colourBlack;
			}else{
				colour = createColour(colour, config)
			}
			ctx.fillStyle = 'rgb(' + colour.red + ', ' + colour.green + ', ' + colour.blue + ')';
			ctx.fillRect(x, y, 1, 1);

		}
	}
	if(callback != undefined){
		callback();
	}
}

function render(){
	var x, y;
	var c, ci

	var colour;
	var count;

	map = [];
	for(x = 0; x < canvas.width; x++){
		c =  config.map.x - config.map.width / 2 + x * config.map.width / canvas.width;
		map[x] = [];

		for(y = 0; y < canvas.height; y++){
			ci = config.map.y - config.map.height / 2 + y * config.map.height / canvas.height;
			map[x][y] = mandelbrot(c, ci, config.map.accuracy);
			if(map[x][y] > config.map.accuracy){
				colour = colourBlack;
			}else{
				colour = createColour(map[x][y], config)
			}
			putPixel(x, y, colour);

		}
	}
}

function refresh(){
	var x, y, colour;
	for(x = 0; x < canvas.width; x++){
		for(y = 0; y < canvas.height; y++){
			if(map[x][y] > config.map.accuracy){
				colour = colourBlack;
			}else{
				colour = createColour(map[x][y], config)
			}
			putPixel(x, y, colour);

		}
	}
}

function putPixel(x, y, colour){
	context.fillStyle = 'rgb(' + colour.red + ', ' + colour.green + ', ' + colour.blue + ')';
	context.fillRect(x, y, 1, 1);
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
	var map  = JSON.parse(JSON.stringify(defaultConfig.map));
	config.map.colourWavePeriod = map.colourWavePeriod;

	document.getElementById('numcolours').value = config.map.colourWavePeriod;
	render();

}

function updateFields(){
	document.getElementById('xOffset').value = config.map.x;
	document.getElementById('yOffset').value = config.map.y;
	document.getElementById('width').value = config.map.width;
	document.getElementById('accuracy').value = config.map.accuracy;
	document.getElementById('numcolours').value = config.map.colourWavePeriod;

};


/* file management */
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

function buildLoadButton(rendering){
	var button, n;
	button = document.createElement('div');
	button.classList.add('previewButton');
	var cnvs = document.createElement('canvas');
	cnvs.width = 96;
	cnvs.height = 96;
	staticRender(cnvs, cnvs.width, cnvs.height, rendering);
	button.appendChild(cnvs);
	var data = {};

	button.onclick = function(){
		config = JSON.parse(JSON.stringify(rendering));
		initPaletteAdjusters();

		updateFields();
		render();
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

	/*****
	This small block of code was required to handle the renaming of a key variable.
	Previously, each config JSON object had a field called "maxColourIndex".  This
	originally made sense because the system was written to work with a fixed
	palette size for compatability with Manyland.com.  I have since migrated away
	from that palette limit.  Instead, that varible now represents the period of
	the sine wave that is used to calculate colours.  i.e. what count from the
	mandelbrot set cycles through every angle that passed to the sine function used
	in generating colours.  Renaming it to colourWavePeriod has been long overdue,
	and this block of code offers backward compatability with previously saved
	configurations.

	I doubt this program gets a lot of public usage, and probably don't need to
	leave this in for long.
	*****/
	for(let n in renderings){
		if(renderings[n].map.maxColourIndex != undefined){
			renderings[n].map.colourWavePeriod = renderings[n].map.maxColourIndex;
			delete(renderings[n].map.maxColourIndex);
		}
	}
	localStorage.setItem('renderings', JSON.stringify(renderings));
	/*******************/


	let target = document.getElementById('savedRenderings');
	let header = target.parentElement.querySelector('h1');
	let loadingSpan = document.createElement('span');
	loadingSpan.innerHTML = '(loading...)';
	loadingSpan.classList.add('loadingSpan');

	header.appendChild(loadingSpan);

	let loadThumbnail = function(){
		let button = buildLoadButton(renderings.pop());

		target.prepend(button);
		target.scrollTo(target.scrollWidth, 0);
		if(renderings.length > 1){
			setTimeout(loadThumbnail, 100);
		}else{
			header.removeChild(loadingSpan);
		}

	}

	loadThumbnail();


}

// a popup blurb of basic instruction
function showWelcomeWindow(){
	popup(document.getElementById("introTemplate").cloneNode(true), [{label : 'Close', action : closePopup}]);
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
	let numLines = textContent.split(/\r\n|\r|\n/).length

	textField.style.height = numLines + 'lh';
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

			colour = mandelbrot(c, ci, config.map.accuracy);
			if(colour > config.map.accuracy){
				colour = colourBlack;
			}else{
				colour = createColour(colour, config)
			}
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

// The initial startup procedure
function initialize(step){
	if(step == undefined) step = 'initialize';
	switch(step){
		case 'initialize':
			config = JSON.parse(JSON.stringify(defaultConfig));
			
			setTimeout(function(){initialize('create canvas');}, 0);

			tabinate(document.getElementById('paletteTabs'));

			break;
		case 'create canvas':
			var canvasWrapper = document.getElementById('canvasWrapper');
			canvas = document.createElement('canvas');
			canvas.width = canvasWrapper.offsetWidth;
			canvas.height = canvasWrapper.offsetHeight;
			canvas.style.backgroundColor = '#000';
			canvasWrapper.appendChild(canvas);


			context = canvas.getContext('2d');

			setTimeout(function(){initialize('initialize fractal');}, 0);
			break;

		case 'initialize fractal':
			// make sure that our area rendered is the same proportions as the actual viewport
			config.map.height = config.map.width * canvas.height / canvas.width;
			render();
			updateFields();
			setTimeout(function(){initialize('add event triggers');}, 0);
			break;

		case 'add event triggers':
			initMouseWheel();
			initMouseDrag();
			initMouseClick();
			initFieldUpdates();
			initPaletteAdjusters();
			setTimeout(function(){initialize('populate saved files');}, 0);
			break;

		case 'populate saved files':
			showWelcomeWindow();
			renderSavedLocations();



	}
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

					var clickX = e.pageX - canvas.offsetLeft;
					var clickY = e.pageY - canvas.offsetTop;

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
			config.map.colourWavePeriod = 1 * this.value;
			this.classList.remove('error');
			refresh();
		}
	}
}

function multiplyAccuracy(factor){
	config.map.accuracy = Math.round(config.map.accuracy * factor) ;
	document.getElementById('accuracy').value = config.map.accuracy;
	render();
}

// initialize the slidey widgets and text fields for the palette
function initPaletteAdjusters(){
	var n, c, elements = {};
	for(c of ['red', 'green', 'blue', 'master']){
		elements[c] = {
			offset: document.getElementById(c + 'Offset'),
			offsetText: document.getElementById(c + 'OffsetText'),
			stagger: document.getElementById(c + 'Stagger'),
			staggerText: document.getElementById(c + 'StaggerText'),
		}
		if(c != 'master'){
			elements[c].period = document.getElementById(c + 'Period');
			elements[c].periodText = document.getElementById(c + 'PeriodText');
		}
	}

	for(n in elements){
		(function(n){
			if(config.palette[n] != undefined){
				elements[n].offset.value = config.palette[n].offset;
				elements[n].offsetText.value = config.palette[n].offset;
				if(n != 'master'){
					elements[n].period.value = config.palette[n].period;
					elements[n].periodText.value = config.palette[n].period;
				}
			}else{
				elements[n].offset.value = defaultConfig.palette[n].offset;
				elements[n].offsetText.value = defaultConfig.palette[n].offset;
				if(n != 'master'){
					elements[n].period.value = defaultConfig.palette[n].period;
					elements[n].periodText.value = defaultConfig.palette[n].period;
				}

				config.palette[n] = elements[n];
			}
			elements[n].offset.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].offset = val;
				elements[n].offsetText.value = val;
				refresh();
			};

			elements[n].offsetText.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].offset = val;
				elements[n].offset.value = val;
				refresh();
			};

			elements[n].stagger.value = config.palette[n].stagger;
			elements[n].staggerText.value = config.palette[n].stagger;
			elements[n].stagger.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].stagger = val;
				elements[n].staggerText.value = val;
				refresh();
			};

			elements[n].staggerText.onchange = function(){
				var val = 1 * this.value;
				config.palette[n].stagger = val;
				elements[n].stagger.value = val;
				refresh();
			};

			if(elements[n].period != undefined){
				elements[n].period.onchange = function(){
					var val = 1 * this.value;
					config.palette[n].period = val;
					elements[n].periodText.value = val;
					refresh();
				};

				elements[n].periodText.onchange = function(){
					var val = 1 * this.value;
					config.palette[n].period = val;
					elements[n].period.value = val;
					refresh();
				}
			}



		})(n)
	}

}

window.onload = function(){initialize()};
