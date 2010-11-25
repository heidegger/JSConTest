function makeChecker(exp) {
	return {"__default__": 
		function (msg) {
			if (exp !== msg) {
				switch (msg) {
				case "fail": 
					fail("Expected: " + exp + 
					     ", got message: " + msg + 
					     ", value: " + arguments[1] +
								", constraint: " + arguments[2]);
					break;
				case "success":
				  	fail("Expected: " + exp +
				  	     ", got message: " + msg + 
				  	     ", value: " + arguments[1] +
				  	     ", constraint: " + arguments[2]);
					break;
				case "error":
				  	fail("Expected: " + exp +
				  	     ", got message: " + msg +
				  	     ", error message: " + arguments[1] +
				  	     ", constraint: " + arguments[2]);
					break;
				}
			}
		}
	};
}
