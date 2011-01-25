/* Version: 0.2.0 */
/* author: Phillip Heidegger */

/* This library will not change the global namespace in any sense. 
 But it assumes that the global variable JSConTest exists and 
 register all its methods in JSConTest.tests.

 In order to change this behavior, please go to the end of the
 file and pass another object to the function. 
 */
/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, 
  eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, 
  immed: true, maxerr: 150 */

"use strict";
(function (P) {
	var DEBUG = false,
		/*
		 * create a new object, and register it in the namespace JSConTest
		 */
		T = {},
		/* private variables */
		/* collects all the tests that are added by TESTS.add(v,c,t); */
		tests = {},
		/* number of tests added to the library */
		 added_tests = 0,	
		 /* collects counterexamples */
		 counterexp = {},
		 cexpuid = 0,
		 /* the actual module */
		 module = "",
		 /* Number of tests after which events in the browser are handled */
		 testCountPerStep = 5000,
		 iterStatTime,
		 maxTime = 5000,
		 testmode,
		 intoTest,
		 leafTest,
		 getTestMode;

	P.tests = T;

	/** ******** test interface ********* */
	function fire(msg) {
		var slice = Array.prototype.slice, 
			args = slice.apply(arguments),
			f;
		if (P.events && P.events.fire && (typeof P.events.fire === 'function')) {
			f = P.events.fire;
			f.apply(this, args);
		}
	}
	function logTest(contract, value, result, count) {
		if (result.normal === true) {
			fire.call(this, 'success', contract, value, count);
		} else if (result.normal === false) {
			fire.call(this, 'fail', contract, value, count);
		} else if (result.error) {
			// FIXME: pass parameters and value of this
			fire.call(this, 'error', result.error, contract, result.params, result.that);
		}
	}

	/** Gets the counter example of a check, and registers it.
	 *  Also tries to perform delta debugging to reduce 
	 *  counter example size. */
	function failedCheck(test) {
		function check_ddresult(values) {
			var slice = Array.prototype.slice,
				thisv = values[0],
				params = slice.call(values,1);
			
			var r = !(test.contract.checkWithGenValues(test.value, thisv, params));
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
				var values = [];
				values.push(ce.getThisValue());
				var params = ce.getParams();
				for (var i = 0; i < params.length; i += 1) {
					values.push(params[i]);
				}
				P.ddmin.ddmin(check_ddresult, values);
				ce = test.contract.getCExp();
			}
			collectCounterExample(ce);
		}
	}

	function checker(test, stat) {
		var contract = test.contract,
			value = test.value,
			result;
		function run() {
			return { 
				normal: contract.check(value) 
			};
		}
		function handleError(e) {
			return { error: e };
		}
		
		result = P.utils.withTry(!DEBUG, run, handleError);
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

	function simpleTester(test, stat, count, resultHandler, iterStatTime, maxTime) {
		var contract = test.contract,
			value = test.value, 
			done = test.done || 0,
			cont = true,
			result, i, aTime;
		if (iterStatTime && maxTime) {
			for (i = 0; cont && i < count; i += 1) {			
				result = checker(test);
				aTime = new Date();
				cont = cont && (result.normal === true) && (aTime - iterStatTime <= maxTime);
			}			
		} else {
			for (i = 0; cont && i < count; i += 1) {			
				result = checker(test);
				cont = cont && (result.normal === true);
			}						
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
		return function (test, stat, count, resultHandler) {
			return function () {
				var doInThisCall  = Math.min(count - test.done, perCall);
				if (doInThisCall < 1  || result.error || result.normal === false) {
					if (result.normal === true) {
						stat.incWellTested();
					} else if (result.normal === false) {
						stat.incFailTested();
					} else if (result.error) {
						stat.incErrors();
					}
					resultHandler(result);
				} else {
					simpleTester(test, stat, doInThisCall, rH, iterStatTime, maxTime);
				}			
			};
		};
	}

	//	(test, 
	//	statistic, 
	//	(result) -> result, 
	//	(test, statistic) -> result, 
	//	(test, statistic, int, (result) -> result) -> (() -> ()) )  
	//	->
	//  (() -> () || { normal: boolean } || { error : error } 
	function testOrCheck(param) {
		function id(r) {
			return r;
		}
		var test = param.test,
			stat = param.stat,
			resultHandler = param.resultHandler || id,
			ch = param.checker || checker,
			tester = param.tester || 
				function (t, s, c, rH) {
					function statrH(result) {
						if (result.normal === true) {
							stat.incWellTested();
						} else if (result.normal === false) {
							stat.incFailTested();
						} else if (result.error) {
							stat.incErrors();
						}						
						return rH(result);
					}
					return function () {
						simpleTester(t, s, c, statrH);
					};
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
			return function () {
				var result = ch(test, stat);
				logTest.call(test, test.contract, test.value, result);
				// passes the result of the checker  and returns the 
				// result of the result handler
				return resultHandler(result);
			};
		}
	}

	function logCExp(stat) {
		var cm, m, i;
		
		fire.call(P, 'CExpStart');
		for (m in counterexp) {
			if (counterexp.hasOwnProperty(m)) {
				cm = counterexp[m];
				for (i = 0; i < cm.length; i += 1) {
					fire.call(P, 'CExp', cm[i]);						
				}				
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
		var obj = { };
		mixbFlag(obj, "Cancel");
		mixbFlag(obj, "CancelAC");
		mixbFlag(obj, "CancelAM");
		return obj;
	}

	function run(param) {
		var statistic = param && param.statistic || P.statistic.Statistic(),
			afterRun = param && param.afterRun || function () {},
			toDoM = [],				// List of all modules
			toDoT = [],				// stores all tests of the actual module.
			testIter = false,
			test,
			cancel = initCancel(),
			m;
			
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
			var module = toDoM.pop(),
				tm, i;
			fire.call(P, 'moduleChange', module.mname);
			tm = module.m;
			for (i = 0; i < tm.length; i += 1) {
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
				fire.call(P, 'statistic', statistic);
			}
			if (cancel.getCancel() || (!testIter && toDoT.length < 1 && toDoM.length < 1)) {
				return afterRunHandler();
			} else {
				setTimeout(iterSteps, 0);
				iterStatTime = new Date();
				if (reset(cancel)) {
					return;
				} else {
					doOneStep();
				}
			}
		}

		// put all test cases into modules. 
		for (m in tests) {
			if (tests.hasOwnProperty(m)) {
				toDoM.push({
					mname : m.substr(1),
					m : tests[m]
				});				
			}
		}
		toDoM.reverse();
		fire.call(P, 'cancel', cancel);
		setTimeout(iterSteps, 0);
		if (statistic) {
			statistic.setTotalTodo(added_tests);
		}
		return cancel;
	}	

	function runLazy(f, stat) {	
		var statistic = stat || P.statistic.Statistic(),
			m, i;
		function runFactory(m, i, test) {
			function run() {
				return testOrCheck({ test: test, stat: statistic })();
			}	
			f(m, i, test, run);			
		}
		for (m in tests ) {
			if (tests.hasOwnProperty(m)) {
				//jstestdriver.console.log("outer loop");
				for (i = 0; i < tests[m].length; i += 1) {
					//jstestdriver.console.log("inner loop" + i);
					runFactory(m, i, tests[m][i]);
				}					
			}
		}
	}
	
	function add(module, value, contract, count, data) {
		if (!(tests[":" + module])) {
			tests[":" + module] = [];
		}
		tests[":" + module].push({
			value : value,
			contract : contract,
			count : count,
			data : data
		});
		added_tests += 1;
        return value;
	}
  function addContracts(module, value, ccdlist) {
    var i = 0,
      v = value;
    if (P.check.isSArray(ccdlist)) {
      for (; i < ccdlist.length; ++i) {
        v = add(module, v, ccdlist[i].contract, ccdlist[i].count, ccdlist[i].data);
      }
    }
    return v;
  }

	function collectCounterExample(ce) {
		var cem, i;
		
		if (!(counterexp[module])) {
			counterexp[module] = [];
		}
		cem = counterexp[module];
		for (i = 0; i < cem.length; i += 1) {
			if (cem[i].compare(ce)) {
				return;
			}
		}
		ce.uid = cexpuid;
		counterexp[module].push(ce);
	}


	(function () {
		var vars = {};
		T.setVar = function (vname, value) {
			vars[vname] = value;
            return value;
		};
		T.getVar = function (vname) {
			return vars[vname];
		};
		T.pushVar = function (vname, value) {
			if (!P.check.isSArray(vars[vname])) {
				vars[vname] = [];
			}
			vars[vname].push(value);
            return value;
		};
		T.popVar = function (vname) {
			if (P.check.isSArray(vars[vname])) {
				return vars[vname].pop();
			}
			//else {
			// something strange happens...
		};
	}());

	testmode = (function () {
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
	}());
	intoTest = testmode.iT;
	leafTest = testmode.lT;
	getTestMode = testmode.gT;

	function assertParamsReal(clreal, pl, str, fname) {
		var ret, i, pla;
		if (getTestMode()) {
			ret = clreal;
		} else {
			ret = [];
			for (i = 0; i < clreal.length; i += 1) {
				if (clreal[i].checkParams(pl)) {
					if (clreal[i].registerEffects) {
						ret.push(clreal[i].registerEffects(pl, fname));
					} else {
						ret.push(clreal[i]);
					}
				}
			}
			if (ret.length < 1) {
				pla = [];
				for (i = 0; i < pl.length; i += 1) {
					pla.push(pl[i]);
				}
				fire.call(P, 'assertParam', clreal, pla, str);
			}
		}
		ret.assertReturn = function (v) {
			var i, c;
			
			if (getTestMode()) {
				return v;
			}
			for (i = 0; i < this.length; i += 1) {
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
	}
	function assertParams(cl, pl, str, fname) {
		var clreal = [], i;
		for (i = 0; i < cl.length; i += 1) {
			if (P.check.isString(cl[i])) {
				clreal.push(T.getVar(cl[i]));
			} else {
				clreal.push(cl[i]);
			}
		}
		return assertParamsReal(clreal, pl, str, fname);
	}
	
	function enableAsserts(f, cl, fname) {
		return function () {
			var rc, result;
			rc = assertParams.call(this, cl, arguments, f, fname);
			result = f.apply(this, arguments);
			return rc.assertReturn(result);			
		};
	}
	T.enableAsserts = enableAsserts;
	
	T.overrideToStringOfFunction = function (f, fstr, asserts) {
		f.toString = function () {
			if (asserts) {
				return "" + fstr + "\n// (with assert check enabled)";
			} else {
				return "" + fstr;
			}
		};
		return f;
	};

	/******************************/
	/* Interface */
	/******************************/
	T.run = run;
	T.runLazy = runLazy;
	T.add = add;
	T.addContracts = addContracts;
	T.setStepCount = function (ns) {
		testCountPerStep = ns;
	};
	T.callback = {};


}(JSConTest));
