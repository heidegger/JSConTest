/**
 * 
 */



function checker(ignore, expected) {
	function get_e(msg) {
		var e = expected.pop();
		if (e) {
			if (e.msg === msg || !e.keep) {
				if (e.keep) {
					e.used = true;
					expected.unshift(e);
				}
				return e;
			} else { // e.msg !== msg && e.keep
				if (e.used) {
					return get_e(msg);
				} else {
					return e;
				}
			}
		}
	}
	expected.reverse();
	var o = { 
		"__default__": function(msg) {
			for (i in ignore) {
				if (ignore.hasOwnProperty(i)) {
					if (msg === ignore[i]) {
						return;
					}
				}
			}
			var e = get_e(msg);
    	if (e) {
    		if (e.msg !== msg) {
					if (e.keep) {
						
					}
    			switch (msg) {
					case "fail": 
						fail( "Expected: " + e.msg 
				    			+ ", <br /><b>got message</b>: " + msg 
									+ ", value: " + arguments[2]
									+ ", constraint: " + arguments[1]);
						break;
					case "success":
					  	fail( "Expected: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", value: " + arguments[2]
									+ ", constraint: " + arguments[1]);
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
