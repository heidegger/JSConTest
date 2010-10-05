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
					  	document.getElementById("checker").innerHTML +=
					    	("<b>Expected</b>: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]
					    			+ "<br /><br />");
						break;
					case "success":
					  	document.getElementById("checker").innerHTML +=
					    	("<b>Expected</b>: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]
					    			+ "<br /><br />");
						break;
					case "error":
					  	document.getElementById("checker").innerHTML +=
					    	("<b>Expected</b>: " + e.msg 
					    			+ ", <br /><b>got message</b>: " + msg 
									+ ", error message: " + arguments[1]
									+ ", constraint: " + arguments[2]
					    			+ "<br /><br />");
						break;
					default:
					  	document.getElementById("checker").innerHTML +=
					    	("Expected:" + e.msg + ", Not expected: " + msg + "<br />");
					}
				}
	    	} else {
			    document.getElementById("checker").innerHTML +=
				  ("expected empty, got: " + msg + "<br />")        		
	    	}
		}
	};
	return o;
}
