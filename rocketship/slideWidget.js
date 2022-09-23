/*
This  class is used for representing graphical sliding widgets that allow the
visual selection of a value from a range of allowed values.

This widget is unique in that it can slide along any line, not just the
vertical or horizontal.  The "handle" that the user can grab  will be an
arbitrary HTML element.

The values used can be an array of arbitrary ones, a series of integers, or a
floating point value.

An arbitrary number of elements can be added which will be used by this slider.
For example, two images could be added as handles, and when either of them is
moved by the user, the other one would move as well.

It also has event handlers:
	OnSlide - called on any motion of the slider
	OnRelease - called when the mouse button is released from the slider
	OnSelect - called when the slider is initially clicked

*/

/** @constructor */
var slideWidget = function(){
	this.allowedRangeTypes = {'set':'set', 'int':'int', 'integer':'integer', 'float':'float'};
	this.allowedValues = [];
	this.rangeType = 'float';
	this.selectCallbacks = [];
	this.releaseCallbacks = [];
	this.slideCallbacks = [];
	this.valueChangeCallbacks = [];
	this.maxPos = {x : 0, y : 0};
	this.minPos = {x : 0, y : 0};
	this.value = {min : 0, max : 1, val : 0, old : 0};
	this.mousePos = {x : 0, y : 0};
	this.position = {x : 0, y : 0};
	this.oldPosition = {x : 0, y : 0};
	this.dragOffset = {dx : 0, dy : 0};
	this.elements = [];
	this.workingArea = $(document);
	this.parentElement = null;
	this.snap = 0;

	if(arguments.length == 1 && typeof(arguments[0]) == 'object'){
		for(arg in arguments[0]){
			switch(arg){
				case 'minX': case 'x1': this.minPos.x = arguments[0][arg]; break;
				case 'minY': case 'y1': this.minPos.y = arguments[0][arg]; break;
				case 'maxX': case 'x2': this.maxPos.x = arguments[0][arg]; break;
				case 'maxY': case 'y2': this.maxPos.y = arguments[0][arg]; break;
				case 'minVal': case 'minValue': case 'min': this.setMinVal(arguments[0][arg]); break;
				case 'maxVal': case 'maxValue': case 'max': this.setMaxVal(arguments[0][arg]); break;
				case 'val': case 'value': this.setVal(arguments[0][arg]); break;
				case 'rangeType': case 'type': this.setRangeType(arguments[0][arg]); break;
				case 'snap': this.snap = arguments[0][arg] ? 1 : 0; break;
				case 'handle': case 'element': this.addElement(arguments[0][arg]); break;
				case 'maxPos': case 'minPos':
					var throwError = 0, x, y;
					if(typeof(arguments[0][arg]) == 'object'){
						x = arguments[0][arg]['x'];
						y = arguments[0][arg]['y'];
						if(x == undefined || y == undefined){
							throwError = 1;
						}else{
							if(arg == 'maxPos'){
								this.maxPos.x = x;
								this.maxPos.y = y;
							}else{
								this.minPos.x = x;
								this.minPos.y = y;
							}
						}
					}else{
						throwError = 1;
					}
					if(throwError){
						throw 'slideWidget: "' + arg + '" parameter expected to be an object with "x" and "y" values';
					}
					break;
				case 'values': case 'allowedValues':
					if(typeof(arguments[0][arg]) == 'object'){
						this.setValues(arguments[0][arg]);
					}else{
						throw 'slideWidget: "' + arg + '" parameter should be an array of possible values.';
					}
					break;
				case 'onSelect': case 'onRelease': case 'onSlide': case 'onValueChange': case 'onChange':
					if(typeof(arguments[0][arg]) == 'function'){
						this[arg](arguments[0][arg]);
					}else{
						throw 'slideWidget: "' + arg + '" parameter should be a function.';
					}
					break;

			}
		}
	}
};

slideWidget.prototype.setValues = function(values){
	var n;
	this.allowedValues = [];
	for(n in values){
		this.allowedValues[n] = values[n];
	}
};

slideWidget.prototype.draw = function(target){
	var elements = this.elements;
	this.recalcPosition();
	this.parentElement = target;
	for(n in elements){
		elements[n].appendTo(target);
		elements[n].css({
			'position': 'absolute',
			'top' : this.position.y + 'px',
			'left' : this.position.x + 'px'
		});
	}
};

// recalculate the position of the widgets based on the value of the slider;
slideWidget.prototype.recalcPosition = function(){
	if(this.value.max == this.value.min){
		this.position = {x: this.maxPos.x, y : this.maxPos.y};
	}else{
		var ratio = (this.value.val - this.value.min) / (this.value.max - this.value.min);
		this.position = {
			x : this.minPos.x + ratio * (this.maxPos.x - this.minPos.x),
			y : this.minPos.y + ratio * (this.maxPos.y - this.minPos.y)
		};
	}

	if(this.snap == 1){
		// if snapping is enabled, we need to move our slider widget to the correct value location
		switch(this.rangeType){
			case 'int': case 'integer':
				this.position = {
					x : this.minPos.x + Math.round((this.value.val - this.value.min) * (this.maxPos.x - this.minPos.x) / (this.value.max - this.value.min)),
					y : this.minPos.y + Math.round((this.value.val - this.value.min) * (this.maxPos.y - this.minPos.y) / (this.value.max - this.value.min))
				};
				break;
			case 'set':
				for(n = 0; n < this.allowedValues.length && this.allowedValues[n] != this.value.val; n++){};
				if(n < this.allowedValues.length){
					this.position = {
						x : this.minPos.x + Math.round(n * (this.maxPos.x - this.minPos.x) / (this.allowedValues.length - 1)),
						y : this.minPos.y + Math.round(n * (this.maxPos.y - this.minPos.y) / (this.allowedValues.length - 1))
					};
				}

				break;
		}
	}
};

// called by the mousedown event on one of the slider's elements.
slideWidget.prototype.activate = function(evt){
	var me = this;
	this.mousePos = {x : evt.pageX, y : evt.pageY};
	var parentOffset = this.parentElement.offset();
	var handlePosition = $(evt.target).position();
	this.dragOffset = {
		dx : (this.mousePos.x - parentOffset.left - handlePosition.left),
		dy : (this.mousePos.y - parentOffset.top - handlePosition.top)
	};

	this.workingArea.bind('mousemove.slideWidget', function(e){
		var n;
		me.mousePos = {x : e.pageX, y : e.pageY};
		me.handleMotion();
		for(n in me.slideCallbacks){
			me.slideCallbacks[n].call(me);
		}
	});

	for(var n in this.selectCallbacks){
		this.selectCallbacks[n].call(this);
	}

	$(document).mouseup(function(){
		var n;
		me.deactivate();
		for(n in me.releaseCallbacks){
			me.releaseCallbacks[n].call(me);
		}
	});
};

slideWidget.prototype.deactivate = function(){
	this.workingArea.unbind('mousemove.slideWidget');
};

// handle the motion of the mouse when this slider is active
slideWidget.prototype.handleMotion = function(){
	var n, ratio, hypSq, dx, dy, x, y, min, max, minval, maxval;
	var parentOffset = this.parentElement.offset();

	// take the current position of the mouse and project it on to the line
	// defined by our minimum and maximum positions.
	if(this.minPos.x == this.maxPos.x && this.minPos.y == this.maxPos.y){
		x = this.minPos.x;
		y = this.minPos.y;
	}else{
		hypSq = (this.maxPos.x - this.minPos.x) * (this.maxPos.x - this.minPos.x) + 
			(this.maxPos.y - this.minPos.y) * (this.maxPos.y - this.minPos.y);

		ratio = (
			(this.mousePos.x - this.dragOffset.dx - parentOffset.left - this.minPos.x) * (this.maxPos.x - this.minPos.x) + 
			(this.mousePos.y - this.dragOffset.dy - parentOffset.top - this.minPos.y) * (this.maxPos.y - this.minPos.y)
		    ) / hypSq;

		x = this.minPos.x + ratio * (this.maxPos.x - this.minPos.x); 
		y = this.minPos.y + ratio * (this.maxPos.y - this.minPos.y);
	}


	// now restrict that position to lie within the limits of our range
	if(Math.abs(this.maxPos.x - this.minPos.x) > Math.abs(this.maxPos.y - this.minPos.y)){
		// we'll restrict based on the x coordinate
		if(this.maxPos.x > this.minPos.x){
			min = this.minPos;
			max = this.maxPos;
			minval = 0;
			maxval = 1;
		}else{
			min = this.maxPos;
			max = this.minPos;
			minval = 1;
			maxval = 0;
		}
		if(x < min.x){
			x = min.x;
			y = min.y;
			ratio = minval;
		}
		if(x > max.x){
			x = max.x; 
			y = max.y;
			ratio = maxval;
		}
	}else{
		if(this.maxPos.y > this.minPos.y){
			min = this.minPos;
			max = this.maxPos;
			minval = 0;
			maxval = 1;
		}else{
			min = this.maxPos;
			max = this.minPos;
			minval = 1;
			maxval = 0;
		}
		if(y < min.y){
			x = min.x; 
			y = min.y;
			ratio = minval;
		}
		if(y > max.y){
			x = max.x;
			y = max.y;
			ratio = maxval;
		}
	}


	// and now we have a floating point value between one and zero.  We
	// need to fit that to our value range, and massage it accoriding to
	// our data type.
	this.getValueFromRatio(ratio);
	this.oldPosition = {x : this.position.x, y:this.position.y};
	this.position.x = x;
	this.position.y = y;
	if(this.snap == 1){
		// if snapping is enabled, we need to move our slider widget to the correct value location
		switch(this.rangeType){
			case 'int': case 'integer':
				this.position = {
					x : this.minPos.x + Math.round((this.value.val - this.value.min) * (this.maxPos.x - this.minPos.x) / (this.value.max - this.value.min)),
					y : this.minPos.y + Math.round((this.value.val - this.value.min) * (this.maxPos.y - this.minPos.y) / (this.value.max - this.value.min))
				};
				break;
			case 'set':
				//v = Math.round(this.allowedValues.length * ratio);
				v = Math.round((this.allowedValues.length - 1) * ratio);
				this.position = {
					x : this.minPos.x + Math.round(v * (this.maxPos.x - this.minPos.x) / (this.allowedValues.length - 1)),
					y : this.minPos.y + Math.round(v * (this.maxPos.y - this.minPos.y) / (this.allowedValues.length - 1))
				};

				break;
		}
	}

	//$('#debug').html(this.value.val);	


	for(n in this.elements){
		this.elements[n].css({
			'position': 'absolute',
			'top' : this.position.y + 'px',
			'left' : this.position.x + 'px'
		});
	}

};

// take the specified slide ratio and calculate our resulting value from it.
// The expected value of "ratio" is between 0 and 1.
slideWidget.prototype.getValueFromRatio = function(ratio){
	var oldVal = this.value.val;
	var n;
	switch(this.rangeType){
		case 'float':
			this.value.val = this.value.min + (this.value.max - this.value.min) * ratio;
			break;
		case 'int': case 'integer':
			this.value.val = this.value.min + Math.round((this.value.max - this.value.min) * ratio);
			break;
		case 'set':
			this.value.val = this.allowedValues[Math.round((this.allowedValues.length - 1) * ratio)];
			//$('#debug2').html(ratio + ', ' + Math.floor((this.allowedValues.length) * ratio));
			//$('#debug3').html(this.allowedValues.length);
			break;
	}
	if(oldVal != this.value.val){
		this.value.old = oldVal;
		for(n = 0; n < this.valueChangeCallbacks.length; n++){
			this.valueChangeCallbacks[n].call(this);
		}
	}
}

// set the minimum value
slideWidget.prototype.setMinVal = function(v){
	this.value.min = v;
};

// set the location at which the minimum value is chosen
slideWidget.prototype.setMinPos = function(x, y){
	this.minPos = {'x' : x, 'y' : y};
};

// set the maximum value
slideWidget.prototype.setMaxVal = function(v){
	this.value.max = v;
};

// set the location at which the maximum value is chosen
slideWidget.prototype.setMaxPos = function(x, y){
	this.maxPos = {'x' : x, 'y' : y};
};

slideWidget.prototype.setVal = function(v){
	var n;
	if(this.rangeType == 'set'){
		for(n = 0; n < this.allowedValues.length && this.allowedValues[n] != v; n++){};
		if(v == this.allowedValues[n]){
			this.value.val = v;
		}
	}else{
		if(this.value.min < this.value.max){
			v = v < this.value.min ? this.value.min : (v > this.value.max ? this.value.max : v);
		}else if(this.value.max < this.value.min){
			v = v < this.value.max ? this.value.max : (v > this.value.min ? this.value.min : v);
		}else{
			v = this.value.min;
		}
		this.value.val = v;
	}
};

// add an HTML element as a part of this slider
slideWidget.prototype.addElement = function(element){
	var me = this;
	this.elements[this.elements.length] = element;
	element.mousedown(function(e){
		me.activate(e);
		return false;
	});
};

slideWidget.prototype.onSelect = function(f){
	this.selectCallbacks[this.selectCallbacks.length] = f;
};

slideWidget.prototype.onSlide = function(f){
	this.slideCallbacks[this.slideCallbacks.length] = f;
};

slideWidget.prototype.onRelease = function(f){
	this.releaseCallbacks[this.releaseCallbacks.length] = f;
};

slideWidget.prototype.onChange = 
slideWidget.prototype.onValueChange = function(f){
	this.valueChangeCallbacks[this.valueChangeCallbacks.length] = f;
};

slideWidget.prototype.useValSet = function(values){
	this.values = values;
	this.rangeType = 'set';
};

slideWidget.prototype.setRangeType = function(rangeType){
	if(this.allowedRangeTypes[rangeType] != undefined){
		this.rangeType = rangeType;
	}else{
		throw ('slideWidget::setRangeType: Invalid rangeType type, "' + rangeType + '"');
	}
};
