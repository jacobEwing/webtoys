/* 
------- TODO --------
- create an arbitrary multiplication function, which takes two functions and a
  pair of matrices, and applies multiplication logic to them.  Instead of
  actually multiplying and adding values though, it would use the specified
  multiplication and addition functions.
- create a similar function as described above, but which applies the logic
  between a matrix and a scalar.
- same logic as above, but applied to addition
- same logic as all above, but as prototype members, passing in only one matrix
  and the functions.

A usage case for the above operations would be if we have a matrix of another
class that can't use the normal mathematical operators that are applied to
floats/ints/etc.  A good example of this would be if we want to do something
with a matrix of complex numbers.  We would need a custom multiplication
function beyond basic JavaScript operators.

...ooohh...

Another way to handle that would be to allow the user to define arbitrary
multipcation and addition functions to be used by this class.  If those
functions are defined then it would use them.  Otherwise it just uses the
normal math operators.

- add a determinant function
- an invertible function 
- an inverse function
- a "transpose" and "transposed" function, the first applying to the object
  itself, the latter to the return value only.
- transposeval(x, y), return: the value at cell x/y of this matrix transposed,
  without actually transposing the matrix.
*/


var matrixClass = function(){
	this.state = {};
	this.width = this.height = 0;
	this.data = [];
	if(arguments.length == 1){
		this.setVals(arguments[0]);
	}else if(arguments.length == 2){
		this.init(arguments[0], arguments[1]);
		this.clear();
	}
}

// create a new matrix and populate it with the specified data
matrixClass.createNew = function(data){
	var rval = new matrixClass();
	rval.setVals(data);
	return rval;
};

// Receive a 2-d array of data that will be assigned to this matrix.  The
// dimensions of the matrix will be the same as the array.
matrixClass.prototype.setVals = function(data){
	var x, y;
	this.data = [];
	this.height = data.length;
	this.width = data[0].length;

	for(y = 0; y < data.length; y++){
		for(x = 0; x < data[y].length; x++){
			if(y == 0) this.data[x] = [];
			this.data[x][y] = data[y][x];
		}
	}
};

// output this matrix as some HTML text
matrixClass.prototype.dump = function(){
	return "<pre>" + this + "</pre><br/>";
};

matrixClass.prototype.toString = function(){
	var numchars, maxchars = 0;
	var str, rval;

	rval = '';
	for(x = 0; x < this.width; x++){
		for(y = 0; y < this.height; y++){
			numchars = this.val(x, y).toString().length + 2;
			if(numchars > maxchars) maxchars = numchars;
		}
	}
	for(y = 0; y < this.height; y++){
		for(x = 0; x < this.width; x++){
			rval += x ? ',' + new Array(maxchars - str.length).join(' ') : '\n';
			str = this.val(x, y).toString();
			rval += str;
		}
	}
	return rval;
};


// get the value at position (x, y) in the matrix
matrixClass.prototype.val = function(x, y){
	if(x < 0 || x >= this.width || y < 0 || y >= this.height){
		throw "coordinate outside of matrix range";
	}
	return this.data[x][y];
};

// set the value at position (x, y) in the matrix
matrixClass.prototype.setVal = function(x, y, value){
	if(x < 0 || x >= this.width || y < 0 || y >= this.height){
		throw "coordinate outside of matrix range";
	}
	this.data[x][y] = value;
};

// initialize this matrix with the specified dimensions
matrixClass.prototype.init = function(w, h){
	//if(w < 1 || h < 1) throw "matrixClass::init(): Invalid matrix dimensions " + w + "x" + h;
	this.width = w;
	this.height = h;
	this.data = [];
	for(var x = 0; x < this.width; x++){
		this.data[x] = [];
	}
};

// set all values in the matrix to the specified value.  zero by default.
matrixClass.prototype.clear = function(){
	var val = arguments.length == 0 ? 0 : arguments[0];
	for(var x = 0; x < this.width; x++){
		for(var y = 0; y < this.height; y++){
			this.data[x][y] = val;
		}
	}
};

// append a column of values on the right end of the matrix
matrixClass.prototype.appendCol = function(column){
	if(column.length != this.height) throw "matrixClass::appendCol(): incorrect column length";
	this.data = this.data.concat([column]);
	this.width++;
};

// an alias for the function above, as I seem to have written it twice.
matrixClass.prototype.addCol = matrixClass.prototype.appendCol;

// prepend a column of values on the left end of the matrix
matrixClass.prototype.prependCol = function(column){
	var x, y;
	if(column.length != this.height) throw "matrixClass::prependCol(): incorrect column length";
	this.data = [column].concat(this.data);
	this.width++;
};

// append a row of values on the bottom end of the matrix
matrixClass.prototype.appendRow = function(row){
	if(row.length != this.width) throw "matrixClass::appendRow(): incorrect row length";
	for(var n = 0; n < this.width; n++){
		this.data[n][this.height] = row[n];
	}
	this.height++;
};

// an alias for the function above, as I seem to have written it twice.
matrixClass.prototype.addRow = matrixClass.prototype.appendCol;

// prepend a row of values on the top end of the matrix
matrixClass.prototype.prependRow = function(row){
	if(row.length != this.width) throw "matrixClass::prependRow(): incorrect row length";
	for(var n = 0; n < this.width; n++){
		this.data[n] = [row[n]].concat(this.data[n]);
	}
	this.height++;
};


// append another matrix on the end of this one, on either the x or y axis as
// specified or as compatible
matrixClass.prototype.appendMatrix = function(mat, axis){
	if(mat == this) throw "matrixClass::appendMatrix(): matrix can not be appended on to itself";
	if(axis == undefined){
		if(mat.height == this.height){
			axis = 'x';
		}else if(mat.width == this.width){
			axis = 'y';
		}else{
			throw "matrixClass::appendMatrix(): matrices do not have matching dimensions";
		}
	}else{
		if(axis == 'y'){
			if(mat.width != this.width){
				throw "matrixClass::appendMatrix(): matrices do not have matching widths";
			}
		}else{
			axis = 'x';
			if(mat.height != this.height){
				throw "matrixClass::appendMatrix(): matrices do not have matching heights";
			}
		}
	}
	var x, y;
	if(axis == 'x'){
		for(x = 0; x < mat.width; x++){
			this.data[this.width] = [];
			for(y = 0; y < mat.height; y++){
				this.data[this.width][y] = mat.data[x][y];
			}
			this.width++;
		}
	}else{
		for(y = 0; y < mat.height; y++){
			for(x = 0; x < mat.width; x++){
				this.data[x][this.height] = mat.data[x][y];
			}
			this.height++;
		}
	}
};

// for each row in this matrix, pass its values into function f()
matrixClass.prototype.eachRow = function(f){
	for(var y = 0; y < this.height; y++){
		var vals = [];
		for(var x = 0; x < this.width; x++){
			vals.push(this.data[x][y]);
		}
		f(vals);
	}
};

// for each column in this matrix, pass its values into function f()
matrixClass.prototype.eachCol = function(f){
	for(var x = 0; x < this.width; x++){
		var vals = [];
		for(var y = 0; y < this.height; y++){
			vals.push(this.data[x][y]);
		}
		f(vals);
	}
};

// assign and array of values to a specific row in this matrix
matrixClass.prototype.setRow = function(idx, data){
	if(data.length != this.width) throw "matrixClass::setRow(): Incorrect number of values passed";
	if(idx < 0 || idx >= this.height) throw "matrixClass::setRow(): Invalid row index";
	for(var n = 0; n < this.width; n++){
		this.data[n][idx] = data[n];
	}
};

// assign and array of values to a specific column in this matrix
matrixClass.prototype.setCol = function(idx, data){
	if(data.length != this.height) throw "matrixClass::setCol(): Incorrect number of values passed";
	if(idx < 0 || idx >= this.width) throw "matrixClass::setCol(): Invalid column index";
	for(var n = 0; n < this.height; n++){
		this.data[idx][n] = data[n];
	}
};

// create a duplicate of this matrix
matrixClass.prototype.duplicate = function(){
	var rval = new matrixClass();
	rval.width = this.width;
	rval.height = this.height;
	rval.data = [];
	for(var x = 0; x < this.width; x++){
		rval.data[x] = this.data[x].slice(0);
	}
	return rval;
};

// return a matrix that is grabbed from a subset of this one
matrixClass.prototype.subset = function(x, y, w, h){
	if(x < 0 || y < 0 || x + w > this.width || y + h > this.height || x + w < -1 || x + h < -1 || w == 0 || h == 0){
		throw "The specified subset is outside the dimensions of the parent matrix";
	}
	var dx = w > 0 ? 1 : -1;
	var dy = h > 0 ? 1 : -1;
	var rval = new matrixClass(Math.abs(w), Math.abs(h));
	var wx = 0, wy;

	for(cx = x; cx != x + w; cx += dx){
		wy = 0;
		for(cy = y; cy != y + h; cy += dy){
			rval.setVal(wx, wy, this.data[cx][cy]);
			wy ++;
		}
		wx++;
	}
	return rval;
};

// add together two matrices, returning a third one with their sum values
matrixClass.add = function(mat1, mat2){
	if(mat1.height != mat2.height || mat1.width != mat2.width){
		throw "Cannot add matrices of different dimensions";
	}
	var x, y;
	var rval = mat1.duplicate();
	for(x = 0; x < mat1.width; x++){
		for(y = 0; y < mat1.height; y++){
			rval.data[x][y] += mat2.data[x][y];
		}
	}
	return rval;
};

// add a matrix to this one
matrixClass.prototype.add = function(mat2){
	var rval = matrixClass.add(this, mat2);
	this.data = rval.data;
	this.width = rval.width;
	this.height = rval.height;
};

// subtract the values in mat2 from those in mat1, returning a matrix of those values
matrixClass.subtract = function(mat1, mat2){
	if(mat1.height != mat2.height || mat1.width != mat2.width){
		throw "Cannot add matrices of different dimensions";
	}
	var x, y;
	var rval = mat1.duplicate();
	for(x = 0; x < mat1.width; x++){
		for(y = 0; y < mat1.height; y++){
			rval.data[x][y] -= mat2.data[x][y];
		}
	}
	return rval;
};

// subtract the values of mat2 from this matrix
matrixClass.prototype.subtract = function(mat2){
	var rval = matrixClass.subtract(this, mat2);
	this.data = rval.data;
	this.width = rval.width;
	this.height = rval.height;
};

// return the product of two matrices
matrixClass.mul = function(mat1, mat2){
	var x, y, rpos, val;
	if(mat1.height != mat2.width){
		throw "Cannot mulitply the specified matrices";
	}
	var rval = new matrixClass(mat1.width, mat2.height);


	for(x = 0; x < rval.width; x++){
		for(y = 0; y < rval.height; y++){
			val = 0;
			for(rpos = 0; rpos < rval.height; rpos++){
				val += mat1.val(x, rpos) * mat2.val(rpos, y);
			}
			rval.setVal(x, y, val);
		}   
	}   
	return rval;
};

// multiply this matrix by another one
matrixClass.prototype.mul = function(mat2){
	var rval = matrixClass.mul(this, mat2);
	this.data = rval.data;
	this.width = rval.width;
	this.height = rval.height;
};

// multiply this matrix by a scalar
matrixClass.prototype.mulScalar = function(scalar){
	for(var n in this.data){
		for(var m in this.data[n]){
			this.data[n][m] *= scalar;
		}
	}
};

// return a copy of this matrix multiplied by a scalar
matrixClass.mulScalar = function(mat, scalar){
	var rval = mat.duplicate();
	for(var n in rval.data){
		for(var m in rval.data[n]){
			rval.data[n][m] *= scalar;
		}
	}
	return rval;
};

// treating each column in the matrix as a vertex, translate each one of them
// with the vector that's passed in, either in the form of a 1xN matrix, or as
// a set of N scalar values.  Where N is the height of our matrix.
matrixClass.prototype.translate = function(){
	var paramType = 'vals';
	if(arguments.length == 1 && typeof arguments[0] == 'object'){
		paramType = 'matrix';
		if(arguments[0].height != this.height){
			throw "translation matrix dimensions do not match";
		}
	}else if(arguments.length != this.height){
		throw "translation dimensions do not match matrix";
	}

	if(paramType == 'vals'){
		for(var x = 0; x < this.width; x++){
			for(var y = 0; y < this.height; y++){
				this.data[x][y] += arguments[y];
			}
		}
	}else{
		for(var x = 0; x < this.width; x++){
			for(var y = 0; y < this.height; y++){
				this.data[x][y] += arguments[0].val(0, y);
			}
		}
	}
};

// returns a 2 by y matrix, containing the minimum and maximum values for each row in this matrix
matrixClass.prototype.rowRange = function(){
	var rval = new matrixClass(2, this.height);
	var x, y;
	var min, max;
	for(y = 0; y < this.height; y++){
		min = this.val(0, y);
		max = this.val(0, y);
		for(x = 1; x < this.width; x++){
			var v = this.val(x, y);
			if(v > max) max = v;
			if(v < min) min = v;
		}
		rval.setRow(y, [min, max]);
	}
	return rval;
};

// return a 1 by Y matrix whose values are the sum of each horizontal row in this matrix
matrixClass.prototype.sumX = function(){
	var x, y, rval = new matrixClass(1, this.height);
	for(x = 0; x < this.width; x++){
		for(y = 0; y < this.height; y++){
			rval.data[0][y] += this.data[x][y];
		}
	}
	return rval;
};

// return an X by 1 matrix whose values are the sum of each vertical column in this matrix
matrixClass.prototype.sumY = function(){
	var x, y, rval = new matrixClass(this.width, 1);
	for(x = 0; x < this.width; x++){
		for(y = 0; y < this.height; y++){
			rval.data[x][0] += this.data[x][y];
		}
	}
	return rval;
};

// generate an identity matrix of the specified size
matrixClass.identity = function(size){
	if(size == undefined) size = 2;
	if(size < 1) throw "Cannot create a matrix with a size less than 1x1";
	rval = new matrixClass(size, size);
	rval.clear();
	for(var n = 0; n < size; n++){
		rval.setVal(n, n, 1);
	}
	return rval;
};

// generate a 2x2 rotation matrix for the specified angle
matrixClass.rotate2d = function(angle){
	var sine = Math.sin(angle);
	var cosine = Math.cos(angle);
	rval = new matrixClass();
	rval.setVals([
		[cosine, -sine],
		[sine, cosine]
	]);
	return rval;
};

// return a copy of this matrix, with each column treated as a vector and converted to a unit vector
matrixClass.prototype.unit = function(){
	var x, y, hyp;
	var rval = new matrixClass(this.width, this.height);
	for(x = 0; x < this.width; x++){
		hyp = 0;
		for(y = 0; y < this.height; y++){
			hyp += this.data[x][y] * this.data[x][y];
		}
		if(hyp == 0){
			for(y = 0; y < this.height; y++){
				rval.data[x][y] = 0
			}
		}else{
			hyp = Math.pow(hyp, 0.5);
			for(y = 0; y < this.height; y++){
				rval.data[x][y] = this.data[x][y] / hyp
			}
		}
	}
	return rval;
};

// save the current state into an array, from which it can be restored
matrixClass.prototype.saveState = function(){
	var stateName = arguments.length == 1 ? arguments[0] : 0;
	var x, y, dat = [];
	for(x = 0; x < this.width; x++){
		dat[x] = [];
		for(y = 0; y < this.height; y++){
			dat[x][y] = this.data[x][y];
		}
	}

	this.state[stateName] = {
		'width' : this.width,
		'height' : this.height,
		'data' : dat
	};
};

// restore a previously saved state
matrixClass.prototype.restoreState = function(){
	var stateName = arguments.length == 1 ? arguments[0] : 0;
	var x, y;
	if(this.state[stateName] == undefined){
		throw "matrixClass::restoreState: invalid state name: " + stateName;
	}

	this.width = this.state[stateName].width;
	this.height = this.state[stateName].height;
	this.data = [];
	for(x = 0; x < this.width; x++){
		this.data[x] = [];
		for(y = 0; y < this.height; y++){
			this.data[x][y] = this.state[stateName].data[x][y];
		}
	}
};

// delete a previously saved state
matrixClass.prototype.deleteState = function(){
	var stateName = arguments.length == 1 ? arguments[0] : 0;
	this.state[stateName] = undefined;
};

// delete all previously saved states
matrixClass.prototype.resetStates = function(){
	this.state = [];
};

// return the determinant of the matrix
matrixClass.prototype.determinant = function(){
	var x, y, rval;
	if(this.width != this.height){
		throw "matrixClass::determinant: this matrix must be square";
	}
	switch(this.width){
		case 1:
			rval = this.data[0][0];
			break;
		case 2:
			rval = this.data[0][0] * this.data[1][1] - this.data[1][0] * this.data[0][1];
			break;
		case 3:
			rval = 0;
			for(x = 0; x < this.width; x++){
				a = b = 1;
				for(y = 0; y < this.width; y++){
					a *= this.data[(x + y) % this.width][y];
					b *= this.data[(x + this.width - y) % this.width][y];
				}
				rval += a - b;
			}
			break;
		default:
			throw "matrixClass::determinant: not yet available for 4x4 or greater matrices";
	}
	return rval;
};
