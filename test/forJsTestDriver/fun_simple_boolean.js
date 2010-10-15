(function () {
	var anz = 1000;
	function returnTrue() {
		return true;
	}
	function returnFalse() {
		return false;
	}
	
    JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		JSConTest.contracts.Function([],JSConTest.contracts.Boolean),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		JSConTest.contracts.Function([],JSConTest.contracts.True),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		JSConTest.contracts.Function([],JSConTest.contracts.False),
    		anz,
    		{ checker: makeChecker("fail") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		JSConTest.contracts.Function([],JSConTest.contracts.Boolean),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		JSConTest.contracts.Function([],JSConTest.contracts.True),
    		anz,
    		{ checker: makeChecker("fail") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		JSConTest.contracts.Function([],JSConTest.contracts.False),
    		anz,
    		{ checker: makeChecker("success") }
    );
    
}());

