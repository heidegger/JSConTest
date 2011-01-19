/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function (JSC) {
	var H = {},
		module;

	if (!JSC.events) {
		JSC.events = {};
	}
	if (!JSC.events.handler) {
		JSC.events.handler = {};
	}
	JSC.events.handler.data = H;

	function create(handlername) {
		return {
			"__default__": function () {
				var slice = Array.prototype.slice, 
					args = slice.apply(arguments);				
				
				if (this && this.data && this.data[handlername]) {
					JSC.events.fire_handler.call(this, this.data[handlername], args);
				}
			}
		};
	}
	
	H.create = create;
	
	
	
})(JSConTest);