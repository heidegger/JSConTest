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


	var testContracts = 0;
	var verifyContracts = 0;
	var testCount = 0;
	var failCount = 0;
	var errorContract = 0;
	var wellTestedCount = 0;
	/** ******** test interface ********* */
	function fire(msg) {
		var slice = Array.prototype.slice, args = slice.apply(arguments);
		if (P.events && P.events.fire && (typeof P.events.fire === 'function')) {
			P.events.fire.apply(this, args);
		}
	}
	function logTest(v, c, test, anz) {
		if (test) {
			fire.call(this, 'success', v, c, anz);
		} else {
			fire.call(this, 'fail', v, c, anz);
		}
	}

	function run(afterRun) {
		function logCExp() {
			fire.call(P, 'CExpStart');
			for ( var m in counterexp) {
				var cm = counterexp[m];
				for ( var i in cm) {
					fire.call(P, 'CExp', cm[i]);
				}
			}
			fire.call(P, 'stat', testContracts, testCount, failCount,
			          verifyContracts, errorContract, wellTestedCount);
		}

		/* List of all modules */
		var toDoM = [];

		/*
		 * List that stores all tests we are going to check in this module.
		 */
		var toDoT = [];

		/*
		 * object that stores information about the actual test contract. It
		 * contains: - c is the contract - v is the value that is tested against the
		 * contract
		 */
		var test;

		/* Some numbers */
		var anz = 0;
		var toDoMax = 0;
		var toDoCount = 0;

		for ( var m in tests ) {
			toDoM.push({
			  mname : m,
			  m : tests[m]
			});
		}
		toDoM.reverse();

		/* run handler */
		function min(a, b) {
			if (a < b) {
				return a;
			} else {
				return b;
			}
		}
		function withTry(flag, f, handler) {
			if (flag) {
				try {
					return f();
				} catch (e) {
					if (handler) {
						return handler(e);
					}
				}
			} else {
				return f();
			}
		}

		function runChecks() {
			var t = min(toDoCount + testCountPerStep, toDoMax);
			function performCheck() {
				function check_ddresult(p) {
					// return boolean value
					var r = !(test.contract.checkWithParams(test.value, p));
					if (r) {
						collectCounterExample(test.contract.getCExp());
					}
					return r;
				}
				var b = true;
				for (; toDoCount < t; toDoCount = toDoCount + 1) {
					P.gen.initGen();
					/*
					 * this notation results in searching one counterexample per each
					 * contract, and then stop
					 */
					testCount = testCount + 1;
					b = b && test.contract.check(test.value);
					if (!b) {
						var ce = test.contract.getCExp();
						if (ce.isCExp && (ce.isCExp())) {
							cexpuid = cexpuid + 1;
							if (P.ddmin) {
								collectCounterExample(ce);
								P.ddmin.ddmin(check_ddresult, ce.params);
								ce = test.contract.getCExp();
							}

							/*
							 * We have to think about the event interface for the
							 * minimization, since this may lead into infinite loops (if the
							 * value is a function), that we can not stop or detect in
							 * advance.
							 */
							collectCounterExample(ce);
						}
						break;
					}
					/*
					 * Use this notation to continue searching counterexamples for a
					 * contract, even if an other counterexampe is found.
					 */
					// b = c.check(v) && b;
				}

				if (!b) {
					failCount = failCount + 1;
					toDoMax = toDoCount;
				} else {
					if (toDoCount >= toDoMax) {
						wellTestedCount = wellTestedCount + 1;
					}
				}
				if (toDoCount >= toDoMax) {
					logTest.call(test, test.value, test.contract, b, toDoCount);
				}
			}
			function errHandler(e) {
				if ((test.contract) && test.contract.get_last_created_values) {
					var params = test.contract.get_last_created_values();
					errorContract = errorContract + 1;
					fire.call(test, 'error', e, test.contract, params);
					toDoMax = toDoCount;
				} else {
					errorContract = errorContract + 1;
					fire.call(test, 'error', e);
					toDoMax = toDoCount;
				}
			}
			withTry(!DEBUG, performCheck, errHandler);
			resetMarked();
			fire.call(P, 'stat', testContracts, testCount, failCount,
			          verifyContracts, errorContract, wellTestedCount);
		}
		function runTest() {
			test = toDoT.pop();
			testContracts += 1;
			function performTestRun() {
				if (test.contract.genNeeded && (test.contract.genNeeded(test.value))) {
					toDoCount = 0;
					toDoMax = test.count;
					return;
				} else {
					/* check contract without test it */
					toDoCount = 0;
					toDoMax = 0;
					var b = test.contract.check(test.value);
					if (b) {
						++verifyContracts;
					} else {
						++failCount;
					}
					logTest.call(test, test.value, test.contract, b);
				}
			}
			function errorHandler(e) {
				if ((test.contract) && test.contract.get_last_created_values) {
					var params = test.contract.get_last_created_values();
					++errorContract;
					fire.call(test, 'error', e, test.contract, params);
					toDoMax = toDoCount;
				} else {
					++errorContract;
					fire.call(test, 'error', e, test.contract);
					toDoMax = toDoCount;
				}
			}
			return withTry(!DEBUG, performTestRun, errorHandler);
		}
		/* select next modul */
		function runModul() {
			var modul = toDoM.pop();
			var m = modul.mname;
			fire.call(P, 'moduleChange', m);
			var tm = modul.m;
			for ( var i in tm) {
				toDoT.push(tm[i]);
			}
		}
		function resetAM() {
			if (cancelAM) {
				logTest.call(test, test.value, test.contract, true, toDoCount);
				cancelAC = false;
				cancelAM = false;
				toDoT = [];
				toDoCount = 0;
				toDoMax = 0;
				return true;
			} else {
				return false;
			}
		}
		function resetAC() {
			if (cancelAC) {
				logTest.call(test, test.value, test.contract, true, toDoCount);
				cancelAC = false;
				toDoCount = 0;
				toDoMax = 0;
				return true;
			} else {
				return false;
			}
		}
		/* function which is called in regular intervals */
		var cancel = false;
		var cancelAC = false;
		var cancelAM = false;
		doCancel = function() {
			cancel = true;
		};
		doCancelAC = function() {
			cancelAC = true;
		};
		doCancelAM = function() {
			cancelAM = true;
		};
		T.doCancel = doCancel;
		T.doCancelAC = doCancelAC;
		T.doCancelAM = doCancelAM;

		(function toRun() {
			fire.call(P, 'stat', testContracts, testCount, failCount,
			          verifyContracts, errorContract, wellTestedCount);
			if (cancel) {
				cancelAM = true;
				resetAM();
				if (afterRun) {
					afterRun();
				}
				return;
			}
			if ((toDoM.length < 1) && (toDoT.length < 1) && (toDoCount >= toDoMax)) {
				logCExp();
				if (afterRun) {
					afterRun();
				}
			} else {
				setTimeout(toRun, 0);
				if (resetAM()) {
					return;
				}
				if (resetAC()) {
					return;
				}
				if ((toDoCount < toDoMax) && (!cancelAC)) {
					return runChecks();
				}
				if ((toDoT.length > 0) && (!cancelAM)) {
					return runTest();
				} else {
					runModul();
				}
			}
		}());
	}
	var doCancel, doCancelAM, doCancelAC;

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
			;
			vars[vname].push(value);
		};
		T.popVar = function(vname) {
			if (!P.check.isSArray(vars[vname])) {
				// something strange happens...
			} else {
				return vars[vname].pop();
			}
			;
		};
	})();

	var testmode = (function() {
		var inTestMode = false;
		function intoTest() {
			inTestMode = true;
		}
		;
		function leafTest() {
			inTestMode = false;
		}
		;
		function getTestMode() {
			return inTestMode;
		}
		;
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
	T.add = add;
	T.setStepCount = function(ns) {
		testCountPerStep = ns;
	};
	T.callback = {};


})(JSConTest);
