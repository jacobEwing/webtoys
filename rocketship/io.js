var io = function(){
	var keyState = {};
	var keyBuffer = Array();
	var KEYMAP = {
		'UP' : 38,		'DOWN' : 40,		'LEFT' : 37,		'RIGHT' : 39,
		'ESC' : 27,		'ENTER' : 13,		'TAB' : 9,		'SPACE' : 32,
		'SHIFT' : 16,		'CTRL' : 17,		'ALT' : 18,		'PAUSE' : 19,
		'BACKSPACE' : 8,	'CAPS_LOCK' : 20,	'NUM_LOCK' : 144,	'SCROLL_LOCK' : 145,
		'PGUP' : 33,		'PGDN' : 34,		'END' : 35,
		'HOME' : 36,		'INSERT' : 45,		'DELETE' : 46,		'/' : 191,
		'TILDE' : 192,		"'" : 222,		'[' : 219,		']' : 221,
		'\\' : 220,		';' : 59,		'=' : 61,		'-' : 173,
		'META' : 91,		'MENU' : 93,		'NUMPAD_.' : 110,
		'NUMPAD_*' : 106,	'NUMPAD_+' : 107,	'NUMPAD_-' : 109,	'NUMPAD_/' : 111,
		',' : 188,		'.' : 190

	};
	var REV_KEYMAP = {};

	var buildMap = function(){
		var n, customMaps;

		// tailor the characters that vary by browser
		switch(true){
			case !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0:
				//opera (not yet mapped - taking a guess here)
				customMaps = {';' : 186, 	'=' : 187, 	'-' : 189, 	'PRTSCR' : 44 };
				break;
			case typeof InstallTrigger !== 'undefined': 
				//firefox
				customMaps = {';' : 59, 	'=' : 61, 	'-' : 173, 	'PRTSCR' : 42 };
				break;
			case Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0:
				//'safari
				customMaps = {';' : 186, 	'=' : 187, 	'-' : 189, 	'PRTSCR' : 44 };
				break;
			case !!window.chrome:
				// chrome
				customMaps = {';' : 186, 	'=' : 187, 	'-' : 189, 	'PRTSCR' : 42 };
				break;
			case /*@cc_on!@*/false || !!document.documentMode:
				// ie
				customMaps = {';' : 186, 	'=' : 187, 	'-' : 189, 	'PRTSCR' : 42 };
				break;
			default: 
				// unknown browser
				customMaps = {';' : 186, 	'=' : 187, 	'-' : 189, 	'PRTSCR' : 42 };
		};

		for(var character in customMaps){
			KEYMAP[character] = customMaps[character];
		}

		// generate the ones whose names are based on the character and which have no special variations
		for(n = 65; n < 91; n++) KEYMAP[String.fromCharCode(n)] = n;
		for(n = 0; n < 10; n++) KEYMAP[n] = 48 + n;
		for(n = 1; n <= 12; n++) KEYMAP['F' + n] = 111 + n;
		for(n = 0; n < 10; n++) KEYMAP['NUMPAD_' + n] = 96 + n;

		// now build our reverse map
		for(n in KEYMAP){
			keyState[n] = 0;
			REV_KEYMAP[KEYMAP[n]] = n;
		}
	};
	buildMap();

	var _callBacks = function(){
		var events = {};

		var keyup = [], keydown = [];

		var handlekeyup = function(element){
			var n;
			for(n = 0; n < keyup[element].length; n++){
				keyup[element][n]();
			}
		};

		var handlekeydown = function(element){
			var n;
			for(n = 0; n < keydown[element].length; n++){
				keydown[element][n]();
			}
		};

		return {
			onkeyup: function(element, callback){
				if(keyup[element] == undefined){
					keyup[element] = [];
					//if(typeof(keyup[eventname]) == 'function'){
					if(typeof element.onkeyup == 'function'){
						keyup[element][0] = element.onkeyup;
					}
					element.onkeyup = handlekeyup;
				}
				keyup[element][keyup[element].length] = callback;
			},
			onkeydown: function(element, callback){
				if(keydown[element] == undefined){
					keydown[element] = [];
					if(typeof element.onkeydown == 'function'){
						keydown[element][0] = element.onkeydown;
					}
					element.onkeydown = handlekeydown;
				}
				keydown[element][keydown[element].length] = callback;
			}
		};
	}();

	_callBacks.onkeydown(document, function(e){
		keyState[e.which] = 1;
	});

	_callBacks.onkeyup(document, function(e){
		keyState[e.which] = 0;
	});

	return function(){
		return {
			keyMap : function(num){ return KEYMAP[num]; },
			revKeyMap : function(character){ return REV_KEYMAP[character]; },
			onKeyUp : function(element, callback){
				_callBacks.onkeyup(element, callback);
			},
			onKeyDown : function(element, callback){
				_callBacks.onkeydown(element, callback);
			}
		};
	}();
	
}();
