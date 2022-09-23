function trim(stringToTrim) {
	// make sure it is indeed a string:
	stringToTrim = ' ' + stringToTrim;
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

var spriteClass = function(set){
	this.set = set;
	this.frame = null;
	this.image = $('<img src="' + set.image + '">');
	this.element = $('<div></div>');
	this.width = this.height = this.x = this.y = 0;
	this.centerx = this.centery = 0;
	this.scale = 1;
	this.currentFrame = null;
	this.currentSequence = null;

	this.image.css({
		'position': 'absolute',
		'left': this.y,
		'top': this.x
	});
	this.element.append(this.image);
	this.element.css({
		'position':'absolute',
		'width': this.width + 'px',
		'height': this.height + 'px',
		'left': this.x + 'px',
		'top': this.y + 'px',
		'overflow': 'hidden'
	});
	this.setFrameSize(this.set.frameWidth, this.set.frameHeight);
};


spriteClass.prototype.remove = function(){
	this.image.remove();
	this.element.remove();
};

spriteClass.prototype.setFrame = function(framename){
	framename = trim(framename).toLowerCase();

	if(this.set.frames[framename] != undefined){
		this.frame = this.set.frames[framename];
		this.currentFrame = framename;
		this.setFrameSize(this.frame.width * this.scale, this.frame.height * this.scale);
		this.refreshFrame();
	}
};

// draw a particular frame at a particular location (if specified).  That frame and it's contents are not managed by the sprite
// returns the wrapping element of the drawn frame
spriteClass.prototype.drawFrame = function(target, framename, drawx, drawy){
	if(this.set.frames[framename] == undefined) return false;
	var frame = this.set.frames[framename];
	var style = {
		'width' : frame.width,
		'height' : frame.height,
		'overflow' : 'hidden'
	};
	if(drawx == undefined && drawy == undefined){
		style['position'] = 'relative';
		style['display'] = 'inline-block';
	}else{
		if(drawx == undefined) drawx = 0;
		if(drawy == undefined) drawy = 0;
		style['left'] = drawx + 'px';
		style['top'] = drawy + 'px';
		style['position'] = 'absolute';
	}
	var picture = $('<div></div>');
	var img = $('<img src="' + this.set.image + '">');

	picture.css(style);
	picture.append(img);
	img.css({
		'position': 'absolute',
		'left': -(frame.x * this.scale) + 'px',
		'top': -(frame.y * this.scale) + 'px'
	});

	target.append(picture);
	return picture;
};

spriteClass.prototype.setFrameSize = function(w, h){
	this.width = w;
	this.height = h;
	this.element.css({
		width: this.width + 'px',
		height: this.height + 'px'
	});
};

spriteClass.prototype.setScale = function(newScale){
	this.centerx = this.centery = 0;
	if(this.frame != undefined){
		this.centerx = this.frame.centerx;
		this.centery = this.frame.centery;
	}
	this.scale = newScale;
	this.image.css({
		width: (this.set.imageWidth * this.scale) + 'px',
		height: (this.set.imageHeight * this.scale) + 'px'
	});
	// also need to adjust our element's position, as that will be dependent on scale when we have a center point other than 0,0
	this.element.css({
		'left': (this.x - this.centerx * this.scale) + 'px',
		'top': (this.y - this.centery * this.scale) + 'px'
	});
	this.setFrameSize(this.frame.width * this.scale, this.frame.height * this.scale);
	this.refreshFrame();
};

spriteClass.prototype.refreshFrame = function(){
	this.image.css({
		'position': 'absolute',
		'left': -(this.frame.x * this.scale) + 'px',
		'top': -(this.frame.y * this.scale) + 'px'
	});
};

spriteClass.prototype.refreshImage = function(){
	this.image = $('<img src="' + this.set.image + '">');
	this.element.empty();
	this.element.append(this.image);
	this.setScale(this.scale);
};

spriteClass.prototype.draw = spriteClass.prototype.appendTo = function(target){
	target.append(this.element);
};

spriteClass.prototype.prependTo = function(target){
	target.prepend(this.element);
};

spriteClass.prototype.detach = function(){
	this.element.detach();
};

spriteClass.prototype.move = function(dx, dy){
	this.position(this.x + dx, this.y + dy);
};

spriteClass.prototype.position = function(x, y){
	this.centerx = this.centery = 0;
	if(x != undefined && y != undefined){
		this.x = x;
		this.y = y;
		if(this.frame != undefined){
			this.centerx = this.frame.centerx;
			this.centery = this.frame.centery;
		}
		this.element.css({
			'left': (this.x - this.centerx * this.scale) + 'px',
			'top': (this.y - this.centery * this.scale) + 'px'
		});
	}
	return({'top':this.y, 'left':this.x});
};

spriteClass.prototype.startSequence = function(sequenceName, params){
	var n, callback, frameRate, sequence, iterations, newParams;

	if(this.set.sequences[sequenceName] == undefined) return false;
	newParams = {
		frames: this.set.sequences[sequenceName].frames,
		frameRate: this.set.sequences[sequenceName].frameRate,
		callback: function(){},
		stepCallback: function(){},
		iterations: 1,
		currentFrame: 0,
		stop: false,
		method: 'auto',
		sequence: sequenceName
	};

	/***** IMPORTANT ****
	If using this in another program in the future, remember that the "manual" method means that
	the animation callback will not be called automatically, and the appropriate line above should
	change the string 'manual' to 'auto' if that behavior is desired, or the parameter passed manually
	********************/

	if(params != undefined){
		for(n in params){
			switch(trim(n).toLowerCase()){
				case 'framerate':
					newParams.frameRate = params[n];
					break;
				case 'callback':
					newParams.callback = params[n];
					break;
				case 'iterations':
					newParams.iterations = params[n];
					break;
				case 'stepcallback':
					newParams.stepCallback = params[n];
					break;
				case 'frametimes':
					newParams.frameTimes = params[n];
					newParams.currentFrameTime = 0;
					break;
				case 'method':
					newParams.method = params[n];
					break;
				case 'startframe':
					newParams.currentFrame = params[n];
					break;
			}
		}
	}
	this.currentSequence = newParams;
	if(newParams.method == 'auto')
		this.doSequenceStep();
	return newParams;
};

// kill the current sequence
spriteClass.prototype.stopSequence = function(docallback){
	if(this.currentSequence == null) return;
	this.currentSequence.stop = true;
	if(docallback == true){
		this.currentSequence.callback();
	}
};

// make this iteration of the sequence it's final iteration, adding a new callback if desired
spriteClass.prototype.finishSequence = function(callback){
	this.currentSequence.iterations = 1;
	if(callback != undefined){
		var oldCallback = this.currentSequence.callback;
		var newCallback = function(){
			oldCallback();
			callback();
		}
		this.currentSequence.callback = newCallback;
	}
};


spriteClass.prototype.doSequenceStep = function(params){
	if(params == undefined){
		if(this.currentSequence != undefined){
			params = this.currentSequence;
		}else{
			return;
		}
	}
	if(!params || params.stop == true){
		return;
	}

	var doNextFrame = (params.method == 'auto');
	var animDelay = params.frameRate;

	if(params.frameTimes != undefined){
		animDelay = params.frameTimes[params.currentFrameTime];
		params.currentFrameTime = (params.currentFrameTime + 1) % params.frameTimes.length;
	}

	this.setFrame(params.frames[params.currentFrame]);
	params.stepCallback();
	params.currentFrame++;
	
	if(params.currentFrame == params.frames.length){
		if(params.iterations == 1){
			doNextFrame = false;
			this.currentSequence = null;
			params.callback();
		}else if(params.iterations == 0){
			params.currentFrame = 0;
			this.currentSequence = params;
		}else{
			params.currentFrame = 0;
			params.iterations--;
			this.currentSequence = params;
		}
	}
	if(doNextFrame){
		var me = this;
		setTimeout(function(){me.doSequenceStep(params)}, animDelay);
	}
	return params;
};


/// a spriteSet is a template from which the sprite instances above are loaded
var spriteSet = function(){
	this.frames = [];
	this.sequences = {};
	this.defaultFrameRate = 40;
	this.centerx = this.centery = 0;
	this.loadingImage = false;
};

spriteSet.prototype.load = function(fileName, callback){
	var me = this;
	$.get(fileName, {}, function(result){
		try{
			data = JSON.parse(result);
			me.loadJSON(data, callback);
		}catch(e){
			me.loadSimpletext(result, callback);
		}
	}, "html");
};

spriteSet.prototype.loadSimpletext = function(result, callback){
	var lines = result.split(';');
	var parts, n, m;
	for(n in lines){
		if(trim(lines[n]).length){
			parts = lines[n].split(':');
			switch(trim(parts[0]).toLowerCase()){
				case 'image':
					this.setImage(parts[1]);
					break;
				case 'framewidth':
					this.frameWidth = 1 * trim(parts[1]);
					break;
				case 'frameheight':
					this.frameHeight = 1 * trim(parts[1]);
					break;
				case 'frame':
					this.loadFrame(parts[1]);
					break;
				case 'sequence':
					this.loadSequence(parts[1]);
					break;
				case 'framerate':
					this.defaultFrameRate = 1 * trim(parts[1]);
					break;
				case 'centerx': case 'cx':
					this.centerx = 1 * trim(parts[1]);
					break;
				case 'centery': case 'cy':
					this.centery = 1 * trim(parts[1]);
					break;
			}
		}
	}
	
	if(callback != undefined){
		callback(result);
	}
};

spriteSet.prototype.loadJSON = function(data, callback){
	for(var key in data){
		switch(key){
			case 'image':
				this.setImage(data[key]);
				break;
			case 'frameWidth': case 'framewidth':
				this.frameWidth = 1 * data[key];
				break;
			case 'frameHeight': case 'frameheight':
				this.frameHeight = 1 * data[key];
				break;
			case 'centerx': case 'cx':
				this.centerx = 1 * data[key];
				break;
			case 'centery': case 'cy':
				this.centery = 1 * data[key];
				break;
			case 'framerate':
				this.defaultFrameRate = 1 * data[key];
				break;
			case 'frames':
				this.load_frames(data[key]);
				break;
			case 'sequences':
				this.load_sequences(data[key]);
				break;
		}
	}

	if(callback != undefined){
		callback(result);
	}
};

spriteSet.prototype.setFrameSize = function(w, h){
	this.frameWidth = w;
	this.frameHeight = h;
};

spriteSet.prototype.addFrame = function(id, params){
	var parts, arg, val, n;
	var newFrame = {
		'x': 0,
		'y': 0,
		'width': this.frameWidth,
		'height': this.frameHeight,
		'centerx': this.centerx,
		'centery': this.centery
	};
	for(n in params){
		switch(trim(n).toLowerCase()){
			case 'width': case 'height':
				newFrame[n] = 1 * params[n];
				break;
			case 'x': case 'left':
				newFrame['x'] = 1 * newFrame['x'] + 1 * params[n];
				break;
			case 'xoffset':
				newFrame['x'] = 1 * newFrame['x'] + 1 * params[n];
				break;
			case 'y': case 'top':
				newFrame['y'] = 1 * newFrame['y'] + 1 * params[n];
				break;
			case 'yoffset':
				newFrame['y'] = 1 * newFrame['y'] + 1 * params[n];
				break;
			case 'centerx': case 'cx':
				newFrame['centerx'] = 1 * params[n];
				break;
			case 'centery': case 'cy':
				newFrame['centery'] = 1 * params[n];
				break;
		}
	}
	this.frames[id] = newFrame;
};
// load animation sequences from a string (old method)
spriteSet.prototype.loadSequence = function(datastr){
	var sequenceName = undefined;
	var newSequence = {
		'frames':[],
		'frameRate': this.defaultFrameRate
	};
	var params = datastr.split(',');
	var parts, arg, val, n, m;
	var numParts, numFrames;
	for(n in params){
		parts = params[n].split('=');
		arg = trim(parts[0]).toLowerCase();
		val = trim(parts[1]);
		switch(arg){
			case 'name':
				sequenceName = val;
				break;
			case 'frames':
				frameSet = val.split(' ');
				numFrames = 0;
				for(m in frameSet){
					parts = frameSet[m].split('*');
					if(parts.length == 2){
						numParts = 1 * trim(parts[1]);
					}else{
						numParts = 1;
					}
					while(numParts > 0){
						newSequence.frames[numFrames++] = trim(parts[0]);
						numParts--;
					}
				}
				break;
			case 'framerate':
				newSequence.frameRate = 1 * val;
				break;
		}

	}
	if(sequenceName != undefined){
		this.sequences[sequenceName] = newSequence;
	}

};

// load animation sequences from a JSON object
spriteSet.prototype.load_sequences = function(data){
	var name, param, newSequence, n;

	for(name in data){
		newSequence = {
			'name': name,
			'frames':[],
			'frameRate': this.defaultFrameRate
		};
		for(param in data[name]){
			switch(param){
				case 'frames':
					for(n = 0; n < data[name][param].length; n++){
						newSequence.frames[n] = data[name][param][n];
					}
					break;
				case 'framerate': case 'frameRate':
					newSequence.frameRate = 1 * data[name][param];
					break;
			}
		}
		this.sequences[newSequence.name] = newSequence;
	}
};

// load frames from a raw string passed in (old method)
spriteSet.prototype.loadFrame = function(datastr){
	var params = datastr.split(',');
	var parts, arg, val, n;
	var frameName = undefined;
	var newFrame = {
		'x': 0,
		'y': 0,
		'width': this.frameWidth,
		'height': this.frameHeight,
		'centerx': this.centerx,
		'centery': this.centery
	};
	for(n in params){
		parts = params[n].toLowerCase().split('=');
		arg = trim(parts[0]);
		val = trim(parts[1]);
		switch(arg){
			case 'name':
				frameName = val;
				break;
			case 'width': case 'height':
				newFrame[arg] = 1 * val;
				break;
			case 'x':
				newFrame['x'] += this.frameWidth * val;
				break;
			case 'xoffset':
				newFrame['x'] += 1 * val;
				break;
			case 'y':
				newFrame['y'] += this.frameHeight * val;
				break;
			case 'yoffset':
				newFrame['y'] += 1 * val;
				break;
			case 'centerx': case 'cx':
				newFrame['centerx'] = 1 * val;
				break;
			case 'centery': case 'cy':
				newFrame['centery'] = 1 * val;
				break;
		}
	}
	if(frameName != undefined){
		this.frames[frameName] = newFrame;
	}
};

// load frames from a JSON object passed in
spriteSet.prototype.load_frames = function(data){
	var name, arg;
	for(name in data){
		this.frames[name] = {
			'x': 0,
			'y': 0,
			'width': this.frameWidth,
			'height': this.frameHeight,
			'centerx': this.centerx,
			'centery': this.centery
		};
		for(arg in data[name]){
			switch(arg){
				case 'width': case 'height':
					this.frames[name][arg] = 1 * data[name][arg];
					break;
				case 'x':
					this.frames[name]['x'] += this.frameWidth * data[name][arg];
					break;
				case 'xoffset':
					this.frames[name]['x'] += 1 * data[name][arg];
					break;
				case 'y':
					this.frames[name]['y'] += this.frameHeight * data[name][arg];
					break;
				case 'yoffset':
					this.frames[name]['y'] += 1 * data[name][arg];
					break;
				case 'centerx': case 'cx':
					this.frames[name]['centerx'] = 1 * data[name][arg];
					break;
				case 'centery': case 'cy':
					this.frames[name]['centery'] = 1 * data[name][arg];
					break;
				
			}
		}
	}
};

// set the image and cache it
spriteSet.prototype.setImage = function(file){
	this.loadingImage = true;
	this.image = file;
	var cacheDiv = $('<div><div>');
	cacheDiv.css({
		width:'0px',
		height: '0px',
		position: 'absolute',
		top: '-1px',
		left: '-1px',
		overflow: 'hidden'
	});
	$('body').append(cacheDiv);
	var imgElement = $('<img src="' + file + '">');
	imgElement.load(function(){
		this.loadingImage = false;
	});
	cacheDiv.append(imgElement);

	this.imageWidth = imgElement.width();
	this.imageHeight = imgElement.height();
};
