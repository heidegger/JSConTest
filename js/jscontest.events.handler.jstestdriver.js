/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function (P) {
	var R = {}, 
		module, 
		console = jstestdriver.console;

	if (!P.events) {
		P.events = {};
	}
	if (!P.events.handler) {
		P.events.handler = {};
	}
	P.events.handler.console = R;

	function fail_own(c, v, anz) {
		if (!anz) {
			console.warn("contract failed: " + c.failToString(v));		  		
		} else {
			console.warn("contract failed: " + c.failToString(v) + "Tests run: " + anz);		  		
		}		
	}
	
	function success(c, v, anz) {
		var s = c.okToString(v);
		if (!anz) {
			console.info(s);
		} else {
			console.info(s + " Tests run: " + anz);
		}		
	}
	
	function error(e, c) {
  	// this is the test case
		if (c.get_last_created_values) {
			console.warn("While testing contract " + c.getcdes() + ", an error happens: " + e +
			     "object.[parameter1,...]: " + c.get_last_created_values());		  		
		}	else {
			console.warn("While testing contract " + c.getcdes() + ", an error happens: " + e);
		}
	}
	
	function moduleChange(m) {
		module = m;
		console.info("Module: " + m);
	}
	
	function CExpStart() {
	  console.info("Start of counter example section.");		
	}
	
	function CExp(ce) {		
	  console.info(ce);		
	}
	
	function assertParam(cl, pl, str) {
		console.warn(str + ": " + "Parameters passed to function not valid: " +
		             cl + ", " + P.utils.valueToString(pl));
		throw "Effect Error";
	}
	
	function strEffect(obj, prop, effl_str, eff_str, kind) {		
		return "Effect Error, " + kind + " access not allowed! " +
		       "You try to read the property " + prop + 
		       " of object " + P.utils.valueToString(obj) + ". " +
		       "Permissions you have to respect: " + effl_str + ". " +
		       "The following was not respected: " + eff_str + ".";
	}

	function assertEffectsRead(o, p, effl_str, eff_str) {
		console.warn(module + ": " + strEffect(o, p, effl_str, eff_str, "read"));
		throw "Effect Error";
	}

	function assertEffectsWrite(o, p, effl_str, eff_str) {
		console.warn(module + ": " + strEffect(o, p, effl_str, eff_str, "write"));
		throw "Effect Error";
	}

	function create(divId, enType) {
		var o = 
		  { fail: fail_own,
        success: success,
			  error: error,
			  moduleChange: moduleChange,
			  CExpStart: CExpStart,
			  CExp: CExp,
			  assertParam: assertParam,
			  assertEffectsRead: assertEffectsRead,
			  assertEffectsWrite: assertEffectsWrite
			};
		return o;
	}

	R.create = create;

})(JSConTest);
