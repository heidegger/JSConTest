(function () {
	function genAInt(x, y) {
		if ( x == 2 * y + 10 ) {
			return 0;
		}
		return;
	}
	function genIInt(x) {
		if ((x > 0) && (x < 10)) {
			return {};
		} else {
			return "Error";
		}
	}
	var genTopCheck = (function () {
		var trues = 0,
			falses = 0, 
			bools = 0, 
			numbers = 0, 
			ints = 0, 
			undefs = 0, 
			nulls = 0, 
			strings = 0, 
			objs = 0, 
			arrays = 0, 
			count = 0;
		return (function (t) {
			count += 1;
			if (JSConTest.check.isTrue(t)) {
				trues += 1;
			}
			if (JSConTest.check.isFalse(t)) {
				falses += 1;
			}
			if (JSConTest.check.isBoolean(t)) {
				bools += 1;
			}
			if (JSConTest.check.isNumber(t)) {
				numbers += 1;
			}
			if (JSConTest.check.isInt(t)) {
				ints += 1;
			}
			if (JSConTest.check.isUndefined(t)) {
				undefs += 1;
			}
			if (JSConTest.check.isNull(t)) {
				nulls += 1;
			}
			if (JSConTest.check.isString(t)) {
				strings += 1;
			}
			if (JSConTest.check.isObject(t)) {
				objs += 1;
			}
			if (JSConTest.check.isSArray(t)) {
				arrays += 1;
			}			
			if (count > 4000) {
				if (bools < 1 || numbers < 1 || ints < 1 || undefs < 1 || nulls < 1 || strings < 1 
						|| objs < 1 || arrays < 1 || trues < 1 || falses < 1) {
					return "Error";
				}
			}
		});
	}());
	function genObjectFail(o) {
		if (o.test && o.blablubtest) {
			return "wrong string";
		}
		return true; 
	}
	function genTOUndef(nudef) {
		if (nudef === undefined) {
			return "Error";
		}
		return 0;
	}
	function genBoolean(p1, p2) {
		if (JSConTest.check.isBoolean(p1) 
				&& JSConTest.check.isBoolean(p2)) {
			return true;
		}
		return "Error"; 
	}
	function genNumber(f) {
		if (JSConTest.check.isNumber(f)) {
			return true;
		}
		return "Error";
	}
	function genBooleanFail(p1, p2) {
		if ( p1 && p2 ) {
			return "Error";
		} else {
			return false;
		}
	}
	function genNumberFail(f) {
		if (f > 0) {
			return "Error";
		} else {
			return false;
		}
	}
	
	var anz = 100;
	JSConTest.tests.add("genTopCheck",
	                    genTopCheck,
	                    JSConTest.contracts.Function([JSConTest.contracts.Top], JSConTest.contracts.Undefined),
	                    5000);
	JSConTest.tests.add("genBoolean", 
  		genBoolean, 
  		JSConTest.contracts.Function([JSConTest.contracts.Boolean,
  								  JSConTest.contracts.Boolean],
  								  JSConTest.contracts.Boolean),
  		anz,
  		{ checker: makeChecker("success") }
  );
  JSConTest.tests.add("genNumber", 
  		genNumber, 
  		JSConTest.contracts.Function([JSConTest.contracts.Number],
  								 JSConTest.contracts.Boolean),
  		anz,
  		{ checker: makeChecker("success") }
  );

  JSConTest.tests.add("genBooleanFail", 
  		genBooleanFail, 
  		JSConTest.contracts.Function([JSConTest.contracts.Boolean,
  								  JSConTest.contracts.Boolean],
  								  JSConTest.contracts.Boolean),
  		anz,
  		{ checker: makeChecker("fail") }

  );
  JSConTest.tests.add("genNumberFail",
  		genNumberFail, 
  		JSConTest.contracts.Function([JSConTest.contracts.Number],
  								 JSConTest.contracts.Boolean),
  		anz,
  		{ checker: makeChecker("fail") }
  );
	JSConTest.tests.add("genObjectFail", 
	            	   		genObjectFail, 
	            	   		JSConTest.contracts.Function(
	            	   			[JSConTest.contracts.PObject(["test", "blablubtest"])],
	            	   			JSConTest.contracts.Boolean),
	            	   		anz,
                  		{ checker: makeChecker("fail") }
	);
	JSConTest.tests.add("genObjectFail", 
	            	   		genObjectFail, 
	            	   		JSConTest.contracts.Function(
	            	   			[JSConTest.contracts.EObject([{ name: "test", 
	            	   																			contract : JSConTest.contracts.Boolean },
	            	   																		{ name: "blablubtest", 
            	   																				contract: JSConTest.contracts.String }])],
	            	   			JSConTest.contracts.Boolean),
	            	   		anz,
                  		{ checker: makeChecker("fail") }
	);
  JSConTest.tests.add("genTOUndef", 
                  		genTOUndef, 
                  		JSConTest.contracts.Function([JSConTest.contracts.TopOUndef],
                  								  JSConTest.contracts.Number),
                  		anz,
                  		{ checker: makeChecker("success") }
                  );

  JSConTest.tests.add("genAInt", 
                  		genAInt, 
                  		JSConTest.contracts.Function([JSConTest.contracts.AInteger([0,1,2,10]),
                  		                              JSConTest.contracts.AInteger([0,1,2,10])],
                  								  JSConTest.contracts.Undefined),
                  		anz,
                  		{ checker: makeChecker("fail") }
                  );
  JSConTest.tests.add("genIInt", 
                  		genIInt, 
                  		JSConTest.contracts.Function([JSConTest.contracts.IIntervall(1,9)],
                  								  JSConTest.contracts.Object),
                  		anz,
                  		{ checker: makeChecker("success") }
                  );
  JSConTest.tests.add("genIInt", 
                  		genIInt, 
                  		JSConTest.contracts.Function([JSConTest.contracts.IIntervall(0,9)],
                  								  JSConTest.contracts.Object),
                  		anz,
                  		{ checker: makeChecker("fail") }
                  );
}());
