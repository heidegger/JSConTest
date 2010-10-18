/* Version: 0.2.0 */
/* author: Phillip Heidegger */

/* This library will not change the global namespace in any sense. 
 But it assumes that the global variable JSConTest exists and 
 register all its methods in JSConTest.tests.

 In order to change this behaviour, please go to the end of the
 file and pass another object to the function. 
 */

"use strict";
(function(P) {
	var DEBUG = false;

	/*
	 * create a new object, and register it in the namespace JSConTest
	 */
	var T = {};
	P.tests = T;

	/* private variables */
	/* collects all the tests that are added by TESTS.add(v,c,t); */
	var tests = {};
	/* collects counterexamples */
	var counterexp = {};
	var cexpuid = 0;
	/* the actual module */
	var module = "";
	/* Number of tests after which events in the browser are handled */
	var testCountPerStep = 5000;


	/** ******** test interface ********* */
	function fire(msg) {
		var slice = Array.prototype.slice, args = slice.apply(arguments);
		if (P.events && P.events.fire && (typeof P.events.fire === 'function')) {
			P.events.fire.apply(this, args);
		}
	}
	function logTest(contract, value, result, count) {
		if (result.normal === true) {
			fire.call(this, 'success', contract, value, count);
		} else if (result.normal === false) {
			fire.call(this, 'fail', contract, value, count);
		} else if (result.error) {
			fire.call(this, 'error', result.error, contract);
		}
	}

	/** Gets the counter example of a check, and registers it.
	 *  Also tries to perform delta debugging to reduce 
	 *  counter example size. */
	function failedCheck(test) {
		function check_ddresult(p) {
      // return boolean value
      var r = !(test.contract.checkWithParams(test.value, p));
      if (r) {
        collectCounterExample(test.contract.getCExp());
      }
      return r;
    }
		
		var ce = test.contract.getCExp();
		if (ce && ce.isCExp && (ce.isCExp())) {
			cexpuid += 1;
			if (P.ddmin) {
				collectCounterExample(ce);
				P.ddmin.ddmin(check_ddresult, ce.getParams() );
				ce = test.contract.getCExp();
			}
			collectCounterExample(ce);
		}
	}

	function checker(test, stat) {
		var contract = test.contract,
			value = test.value;
			result = P.utils.withTry(!DEBUG, 
			                         function () { 
																 return { 
																	 normal: contract.check(value) 
																 }; 
															 }, 
			                         function (e) { 
																 return { error: e }; 
															 });
		P.gen.initGen();
		if (stat) {
			if (result.normal === true) {
				stat.incVerified();
			} else if (result.normal === false) {
				stat.incFailed();
			} else if (result.error) {
				stat.incErrors();
			}
		}
		return result;
	}

	function simpleTester(test, stat, count, resultHandler) {
		var contract = test.contract,
			value = test.value, 
			done = test.done || 0,
			cont = true,
			result;

		for (i = 0; cont && i < count; i += 1) {			
			result = checker(test);
			cont = cont && (result.normal === true);
		}
		if (stat && P.check.isFunction(stat.incTests)) {
			stat.incTests(i);
		}
		test.done = done + i;
		if (result.normal === false || (result.error)) {
			failedCheck(test);
		}
		if (P.check.isFunction(resultHandler)) {
			return resultHandler(result);
		}
		return result;
	}

	// the incTester(perCall) return a tester functions, 
	// which does not perform the tests directly itself. 
	// Instead the tester function will return an iterator, that performs
	// perCall tests each time it is called. 
	// integer -> ((test, statistics, count, result -> a) -> (unit -> a))
	// if all tests are performed, the iterator will call the resultHanlder.
	// So if the result handler is called, please do not call the
	// iterator again. It just will call the result handler another time.
	function incTester(perCall) {
		var result = { normal : true };
		function rH(r) {
			result = r;
		}
		return (function (test, stat, count, resultHandler) {
			return (function () {
				var doInThisCall  = Math.min(count - test.done, perCall);
				if ( doInThisCall < 1  || result.error || result.normal === false ) {
					if (result.normal === true) {
						stat.incWellTested();
					} else if (result.normal === false) {
						stat.incFailTested();
					} else if (result.error) {
						stat.incErrors();
					}
					resultHandler(result);
				} else {
					simpleTester(test, stat, doInThisCall, rH);
				}			
			});
		});
	}

	// (test, 
	//	statistic, 
	//	(result) -> result, 
	//	(test, statistic) -> result, 
	//  (test, statistic, int, (result) -> result) -> (() -> ()) )  
	// 	->  
	//  (() -> () || { normal: boolean } || { error : error } 
	function testOrCheck(param) {
		var test = param["test"],
			stat = param["stat"],
			resultHandler = param["resultHandler"] || function (r) { return r; },
			ch = param["checker"] || checker,
			tester = param["tester"] || 
				function (t,s,c,rH) {
					function statrH(r) {
						if (result.normal === true) {
							stat.incWellTested();
						} else if (result.normal === false) {
							stat.incFailTested();
						} else if (result.error) {
							stat.incErrors();
						}						
						return rH(r);
					}
					return (function () {
						simpleTester(t,s,c,statrH);
					});
				},
			contract = test.contract,
			value = test.value;

		//jstestdriver.console.log("JsTestDriver", "Run test case.");
		function testrH(result) {
			logTest.call(test, test.contract, test.value, result, test.done);
			return resultHandler(result);
		}
		if (contract.genNeeded && (contract.genNeeded(value))) {
			test.done = 0;
			// returns a function
			return tester(test, stat, test.count, testrH);
		} else {
			return (function () {
				var result = ch(test, stat);
				logTest.call(test, test.contract, test.value, result);
				// passes the result of the checker  and returns the 
				// result of the result handler
				return resultHandler(result);
			});
		}
	}

	function logCExp(stat) {
		fire.call(P, 'CExpStart');
		for ( var m in counterexp ) {
			var cm = counterexp[m];
			for ( var i in cm) {
				fire.call(P, 'CExp', cm[i]);
			}
		}
	}
	
	function initCancel() {
		function mixbFlag(obj, flagName) {
			var flag = false;
			obj["do" + flagName] = function () {
				flag = true;
			};
			obj["reset" + flagName] = function () {
				flag = false;
			};
			obj["get" + flagName] = function () {
				return flag;
			};
		}
		var obj = {};
		mixbFlag(obj,"Cancel");
		mixbFlag(obj,"CancelAC");
		mixbFlag(obj,"CancelAM");
		return obj;
	}

	function run(param) {
		var statistic = param && param.statistic || P.statistic.Statistic(),
			afterRun = param && param.afterRun || function () {},
			toDoM = [],				// List of all modules
			toDoT = [], 			// stores all tests of the actual module.
			testIter = false,
			test,
			cancel = initCancel();
			
		function reset(cancel) {
			function resetAM() {
				var t;
				cancel.resetCancelAM();
				while (toDoT.length > 0) {
					t = toDoT.pop();
					fire.call(t, 'skipped', t.contract, t.value);
				}
			}
			function resetAC() {
				cancel.resetCancelAC();
				testIter = false;
			}
			if (cancel.getCancelAM()) {
				fire.call(test, 'skipped', test.contract, test.value, test.done);
				resetAM();
				resetAC();
				return true;
			} else if (cancel.getCancelAC()) {
				fire.call(test, 'skipped', test.contract, test.value, test.done);
				resetAC();
				return true;
			}
			return false;
		}
		function runModule() {
			var module = toDoM.pop();
			fire.call(P, 'moduleChange', module.mname);
			var tm = module.m;
			for ( var i in tm ) {
				toDoT.push(tm[i]);
			}
		}
		function afterRunHandler() {
			logCExp();
			afterRun();
		}
		function doOneStep() {
			function resultHandler(r) {
				testIter = false;
				return r;
			}
			if (P.check.isFunction(testIter)) {
				testIter(); 
			} else {
				if (toDoT.length > 0) {
					// test and testIter are local variable of run
					test = toDoT.pop();
					testIter = testOrCheck({ test: test, 
																	 stat: statistic, 
																	 checker: checker,
																	 tester: incTester(testCountPerStep),
																	 resultHandler : resultHandler
																 });					
					doOneStep();
				} else { // => toDoM.length > 0, since toDoT.length < 0 and !testIter
					runModule();
					doOneStep();
				}
			}
		}
		function iterSteps() {
			if (statistic) {
				fire.call(P, 'statistic', statistic );
			}
			if (cancel.getCancel() || (!testIter && toDoT.length < 1 && toDoM.length < 1)) {
				return afterRunHandler();
			} else {
				setTimeout(iterSteps, 0);
				if (reset(cancel)) {
					return;
				} else {
					doOneStep();
				}
			}
		}

		// put all test cases into modules. 
		for ( var m in tests ) {
			toDoM.push({
			  mname : m,
			  m : tests[m]
			});
		}
		toDoM.reverse();
		fire.call(P, 'cancel', cancel);
		setTimeout(iterSteps, 0);
		return cancel;
	}	

	function runLazy(f, stat) {	
		var statistic = stat || P.statistic.Statistic();
		for (var m in tests ) {
			//jstestdriver.console.log("outer loop");
			for (var i = 0; i < tests[m].length; i += 1) {
				//jstestdriver.console.log("inner loop" + i);
				(function (m, i, test) {
					function run() {
						return testOrCheck({ test: test, stat: statistic })();
					}	
					f(m, i, test, run);				
				})(m, i, tests[m][i]);
			}	
		}
	}
	
	function add(module, value, contract, count, data) {
		if (!(tests[module])) {
			tests[module] = [];
		}
		tests[module].push({
		  value : value,
		  contract : contract,
		  count : count,
		  data : data
		});
	}

	function collectCounterExample(ce) {
		if (!(counterexp[module])) {
			counterexp[module] = [];
		}
		var cem = counterexp[module];
		for ( var i in cem) {
			if (cem[i].compare(ce)) {
				return;
			}
		}
		ce.uid = cexpuid;
		counterexp[module].push(ce);
	}


	(function() {
		var vars = {};
		T.setVar = function(vname, value) {
			vars[vname] = value;
		};
		T.getVar = function(vname) {
			return vars[vname];
		};
		T.pushVar = function(vname, value) {
			if (!P.check.isSArray(vars[vname])) {
				vars[vname] = [];
			}
			vars[vname].push(value);
		};
		T.popVar = function(vname) {
			if (!P.check.isSArray(vars[vname])) {
				// something strange happens...
			} else {
				return vars[vname].pop();
			}
		};
	})();

	var testmode = (function() {
		var inTestMode = false;
		function intoTest() {
			inTestMode = true;
		}
		function leafTest() {
			inTestMode = false;
		}
		function getTestMode() {
			return inTestMode;
		}
		return {
		  iT : intoTest,
		  lT : leafTest,
		  gT : getTestMode
		};
	})();
	var intoTest = testmode.iT;
	var leafTest = testmode.lT;
	var getTestMode = testmode.gT;

	T.assertParams = function(cl, pl, str, fname) {
		var clreal = [];
		// TODO: Why does this work with for (var in ...)?
		// If cl is an array, this will not work
		for ( var i in cl) {
			clreal.push(T.getVar(cl[i]));
		}
		;
		var ret = [];
		if (getTestMode()) {
			ret = clreal;
		} else {
			ret = [];
			for ( var i in cl) {
				var c = T.getVar(cl[i]);
				if (c.checkParams(pl)) {
					if (c.registerEffects) {
						ret.push(c.registerEffects(pl, fname));
					} else {
						ret.push(c);
					}
				}
			}
			if (ret.length < 1) {
				var pla = [];
				for ( var i = 0; i < pl.length; i++)
					pla.push(pl[i]);
				fire.call(P, 'assertParam', clreal, pla, str);
			}
		}
		ret.assertReturn = function(v) {
			if (getTestMode()) {
				return v;
			}
			for ( var i = 0; i < this.length; i++) {
				var c;
				if (this[i] && this[i].unregisterEffect) {
					c = this[i].unregisterEffect();
				} else {
					c = this[i];
				}
				c.checkReturn(v);
			}
			return v;
		};
		return ret;
	};
	T.overrideToStringOfFunction = function(f, fstr) {
		f.toString = function() {
			return "" + fstr;
		};
	};

	/******************************/
	/* Interface */
	/******************************/
	T.run = run;
	T.runLazy = runLazy;
	T.add = add;
	T.setStepCount = function(ns) {
		testCountPerStep = ns;
	};
	T.callback = {};


}(JSConTest));
