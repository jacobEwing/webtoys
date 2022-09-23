function trim(stringToTrim) {
	// make sure it is indeed a string:
	stringToTrim = ' ' + stringToTrim;
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

var cSprite = function(newTemplate){
	// orientation variables
	this.position = { x : 0, y : 0 };
	this.angle = 0;
	this.zIndex = 0;
	this.scale = 1;

	this.template = null;
	this.image = null;
	this.frameName = this.frame = null;
	this.currentSequence = null;
	this.currentSequenceName = null;
	this.frameIndex = 0;
	this.animating = null;

	// parent/child sprite management variables
	this.children = [];
	this.numChildren = 0;
	this.myParent = 0;
	

	if(newTemplate != undefined){
		this.setTemplate(newTemplate);
	}
};

cSprite.prototype.setScale = function(ratio, relationship){
	if(relationship != 'relative'){ // mildly confusing if, but this is correct
		this.scale = ratio;
	}else{
		this.scale *= ratio;
	}
};

cSprite.prototype.rotate = function(rot){
	this.angle += 1 * rot;
};

cSprite.prototype.setTemplate = function(template){
	this.template = template;
	this.image = template.image;
};

cSprite.prototype.setFrame = function(frameName){
	this.frameName = frameName;
	this.frame = this.template.frames[frameName];
};

cSprite.prototype.startSequence = function(sequenceName){
	if(this.template.sequences[sequenceName] != undefined){
		this.animating = true;
		this.currentSequenceName = sequenceName;
		this.currentSequence = this.template.getSequence(sequenceName);
		this.frameIndex = 0; // <-- fixme, allow this to be passed as an argument to this function
		this.setFrame(this.currentSequence.frames[this.frameIndex]);
	}
};

cSprite.prototype.draw = function(context, params){
	if(params == undefined) praams = {};
	var x = this.position.x;
	var y = this.position.y;
	var n;
	var drawScale = null;
	context.save();
	context.translate(x, y);
	context.rotate(this.angle);
	for(n in params){
		switch(n){
			case 'x': x = params[n]; break;
			case 'y': y = params[n]; break;
			case 'scale' : drawScale = params[n]; break;
		}
	}

	if(drawScale == null){
		drawScale = this.scale;
	}
	context.scale(drawScale, drawScale);
	if(this.frame != null) context.translate(-this.frame.centerx, -this.frame.centery);

	for(n = 0; n < this.numChildren; n++){
		if(this.children[n].zIndex > this.zIndex){
			this.children[n].draw(context);
		}
	}
	if(this.frame != null){
		context.drawImage(
			this.image,
			this.frame.x + 0.5, this.frame.y + 0.5,
			this.frame.width - 1, this.frame.height - 1,
			0, 0,
			this.frame.width, this.frame.height
		);
	}

	for(n = 0; n < this.numChildren; n++){
		if(this.children[n].zIndex <= this.zIndex){
			this.children[n].draw(context);
		}
	}

	if(this.animating){
		this.frameIndex = (this.frameIndex + 1) % this.currentSequence.frames.length;
		this.frameName = this.currentSequence.frames[this.frameIndex];
		this.setFrame(this.frameName);
	}
	context.restore();
};

// parent/child sprite management functions
cSprite.prototype.detach = function(oldChild){
	if(oldChild == undefined){
		// separate this sprite from it's parent
		if(this.myParent) this.myParent.detach(this);
	}else{
		// separate the specified child from it's parent
		var foundit = false;
		for(var n in this.children){
			if(this.children[n] == oldChild){
				foundit = true;
			}else if(foundit){
				this.children[n - 1] = this.children[n];
			}
		}
		if(foundit){
			this.numChildren--;
			this.children[this.numChildren].myParent = 0;
			this.children[this.numChildren] = null;
		}
	}
};

cSprite.prototype.attach = function(newChild){
	newChild.detach();
	newChild.myParent = this;
	this.children[this.numChildren] = newChild;
	this.numChildren++;
};

cSprite.prototype.attachTo = function(newParent){
	this.detach();
	newParent.attach(this);
};

cSprite.prototype.doSequenceStep = function(params){
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

	if(params.currentFrame == undefined){
		params.currentFrame = 0;
	}

	this.setFrame(params.frames[params.currentFrame]);
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


////////////////////////////////////////////////////////////////////////////////////

var spriteSet = function(filename, callback){
	var me = this;
	this.frames = [];
	this.sequences = {};
	this.defaultFrameRate = 40;
	this.centerx = this.centery = 0;
	this.loadingImage = false;


	if(filename != undefined){
		this.load(filename, callback);
	}

}
spriteSet.prototype.newSprite = function(){
	return new cSprite(this);
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

spriteSet.prototype.load = function(fileName, callback){
	var me = this;
	if(typeof(fileName) == 'object'){
		// this allows passing in a raw json object instead of a file
		me.loadJSON(fileName, callback);
	}else {
		$.get(fileName, {}, function(result){
			me.loadJSON(result, callback);
		}, 'json');
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
		this.loadCheck(callback);
	}
};

spriteSet.prototype.loadCheck = function(callback){
	var me = this;
	var recheck = function(){
		me.loadCheck(callback);
	};
	if(this.loadingImage){
		setTimeout(recheck, 50);
	}else{
		callback();
	}
};

spriteSet.prototype.setFrameSize = function(w, h){
	this.frameWidth = w;
	this.frameHeight = h;
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
spriteSet.prototype.setImage = function(file, callback){
	var me = this;
	if(callback == undefined) callback = function(){};
	this.image = new Image();
	this.image.onload = function(){
		me.loadingImage = false;
		callback();
	}
	this.loadingImage = true;
	this.image.src = file;
};

spriteSet.prototype.getSequence = function(name){
	var n;
	var seq = this.sequences[name];
	if(seq == undefined){
		throw "spriteSet::getSequence: invalid sequence name '" + name + "'";
	}
	var rval = {};
	for(n in seq){
		rval[n] = seq[n];
	}
	return rval;
};
