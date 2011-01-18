"use strict";
(function (JSC) {
	var H = {}, 
		i = 0;
	
	if (!JSC.events) {
		JSC.events = {};
	}
	if (!JSC.events.handler) {
		JSC.events.handler = {};
	}
	JSC.events.handler.ajax = H;
	
	
	function create(port) {
		if (!port) {
			port = 8080;
		};
		return {
			assertEffectsRead: function (o, p, effl_str, eff_str, context) {
				$.post('http://localhost:' + port + '/log.htm',
				       { entry: JSON.stringify(['read', context]), 
								 counter: i });
				i++;
			},
			assertEffectsWrite: function (o, p, effl_str, eff_str, context) {
				$.post('http://localhost:' + port + '/log.htm',
				       { entry: JSON.stringify(['write', context]), 
								 counter: i });
				i++;3
			}
		};
	}
	
	H.create = create;

}(JSConTest));