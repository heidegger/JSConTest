(function () {
	var anz = 1000;
	function returnTrue() {
		return true;
	}
	function returnFalse() {
		return false;
	}
	function unionf(x) {
		if (x === true) {
			throw "Error";
		}
		return true;
	}
		
	var contr = JSConTest.contracts;
	JSConTest.tests.add("UnionFun",
	                    unionf,
	                    contr.Function([contr.Union(contr.Boolean, contr.String)],
	                                   contr.Boolean),
	                    1000,
	                    { checker: makeChecker("error") });
	JSConTest.tests.add("simpleFun",
	                    true,
	                    contr.Function([],contr.Top),
	                    1,
	                    { checker: makeChecker("fail") } );
  JSConTest.tests.add("simpleFun",
                      function () { throw "error" },
                      contr.Function([], contr.Top),
                      1,
                      { checker: makeChecker("error") });
	JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		contr.Function([],contr.Boolean),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		contr.Function([],contr.True),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnTrue", 
    		returnTrue, 
    		contr.Function([],contr.False),
    		anz,
    		{ checker: makeChecker("fail") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		contr.Function([],contr.Boolean),
    		anz,
    		{ checker: makeChecker("success") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		contr.Function([],contr.True),
    		anz,
    		{ checker: makeChecker("fail") }
    );
    JSConTest.tests.add("returnFalse", 
    		returnFalse, 
    		contr.Function([],contr.False),
    		anz,
    		{ checker: makeChecker("success") }
    );
    
}());

