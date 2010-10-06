/**
 * 
 */

function checker(ignore, expected) {
	expected.reverse();
	var o = { 
		"default": function(msg) {
			for (i in ignore) {
				if (ignore.hasOwnProperty(i)) {
					if (msg === ignore[i]) {
						return;
					}
				}
			}
			var e = expected.pop();
	    	if (e) {
				if (e.msg !== msg) {
					switch (msg) {
					case "fail": 
						fail( "Expected: " + e.msg 
					    			+ ", got message: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					case "success":
					  	fail( "Expected: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					case "error":
					  	fail( "Expected</b>: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", error message: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					default:
						fail( "Expected:" + e.msg + ", Not expected: " + msg);
					}
				}
	    	} else {
	    		fail( "expected empty, got: " + msg );        		
	    	}
		}
	};
	return o;
}
