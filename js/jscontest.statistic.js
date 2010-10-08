(function (JSCT) {
	var S = {};
	JSCT.statistic = S;
	S.Statistic = Statistic;

	function Statistic() {
		function mixGet(o, mname, pname, o2) {
			o["get" + mname] = (function () {
				return o2[pname];
			});
		}
		var statistic = {   // Object that stores the statistic information for this run
		  total : 0,      // Number of contract, value pair checked or tested

		  // the checks
		  verified : 0,		// Number of verified contracts

		  // both
		  failed : 0,     // Number of failed contracts
		  errors : 0,     // Number of contracts, where check exits with an error
		        			  
		  // the tests
		  tested : 0,  		// Number of tested contracts	
		  wellTested : 0,	// Number of contracts where tests did not find errors
		  failTested : 0,	// Number of contracts that failed, and where the error was found by testing
		        			             										// failTested + wellTested = tested
		  tests: 0				// Number of tests performed while checking contracts
		},
		obj = this || {};
		mixGet(obj, "Total", "total", statistic);
		mixGet(obj, "Verified", "verified", statistic);
 		mixGet(obj, "Failed", "failed", statistic);
	  mixGet(obj, "Errors", "errors", statistic);
		mixGet(obj, "Tested", "tested", statistic);
		mixGet(obj, "WellTested", "wellTested", statistic);
		mixGet(obj, "FailTested", "failTested", statistic);
		mixGet(obj, "Tests", "tests", statistic);
		obj.incVerified = function () {
			statistic.verified += 1;
			statistic.total += 1;
		};
		obj.incFailed = function () {
			statistic.failed += 1;
			statistic.total += 1;
		};
		obj.incErrors = function () {
			statistic.errors += 1;
			statistic.total += 1;
		};
		obj.incWellTested = function () {
			statistic.wellTested += 1;
			statistic.tested += 1;
			statistic.total += 1;
		};
		obj.incFailTested = function () {
			statistic.FailTested += 1;
			obj.incFailed();
		};
		obj.incTests = function (acc) {
			statistic.tests += acc;
		};

		return obj;
	}
	
}(JSConTest));	