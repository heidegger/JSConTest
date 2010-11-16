/* Version: 0.2.0 */
/* author: Phillip Heidegger */


"use strict";	
(function (P) {
	
	/* Array with all the log observers */
	var handler = [],
		E = {};

	P.events = E;
	
	function fire(msg) {
		var l, // key
			slice = Array.prototype.slice,
			args = slice.call(arguments);
			
		for (l in handler) {
			if (handler.hasOwnProperty(l)) {
				// convert arguments into real array and call fire_handler
				fire_handler.call(this, handler[l], args);				
			}
		}
	}
	
	function fire_handler(h, params) {
		var msg = params[0],
			slice = Array.prototype.slice;
		
		if (h) {
			if ((h[msg]) && (typeof h[msg] === 'function')) {
				// remove msg from the parameters, since the special handler is called
				h[msg].apply(this, slice.call(params, 1));
			} else {
				if ((h.__default__) && (typeof h.__default__ === 'function')) {
					// keep msg inside of params. This allows the default handler
					// to make a case distinction over the massage.
					h.__default__.apply(this, params);
				}
			}
		}		
	}
	
	function register(o) {
		handler.push(o);
	}

	function create_fire_function(msg) {
		return function () {
			// turn arguments into real array 
			var args = Array.prototype.slice.call(arguments);
			// add msg at the beginning
			args.unshift(msg);
			// call fire function
			fire.apply(this, args);
		};
	}

	/** INTERFACE */
	E.create_fire_function = create_fire_function;
	E.register = register;
	E.fire = fire;
	E.fire_handler = fire_handler;
	
}(JSConTest));
