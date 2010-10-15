(function () {
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
	
	var anz = 100000;
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
}());
