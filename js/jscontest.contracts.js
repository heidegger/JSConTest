/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function (P) {
	var C = {},	
	/* Contract Types */
	/*
	 * Each contract must have a type that is one of these. They will be used in a
	 * further version to implement rewriting of complex contracts, e.g.
	 * intersections.
	 */
	/* No type is given */
		ctNoType = 0,
	/* Basic Contracts: Singletons, String, Bool, Number, ... */
		ctBasic = 1,
	/* Objects */
		ctObject = 2,
	/* Arrays */
		ctArray = 3,
	/* Functions */
		ctFunction = 4,
	/* Union, Intersection, ... */
		ctComplex = 5,
	/* Names */
		ctName = 6,
		Union, 
		UnionAddSimplRule,
		cc = {};
	
	P.contracts = C;

	function makeContractType(ct) {
		if (P.check.isInt(ct) && (ct >= 0) && (ct < 7)) {
			return ct;
		} else {
			return 0;
		}
	}
	function fire(msg) {
		var slice = Array.prototype.slice, args = slice.apply(arguments);
		if (P.events && P.events.fire && (typeof P.events.fire === 'function')) {
			P.events.fire.apply(this, args);
		}
	}

	/* contractType: 
	 * check: 
	 * generate: 
	 * initcdes:
	 * simplValue: 
	 * getcdes: 
	 * setcdes: 
	 * genNeeded:
	 */
	function Contract(p) {
		var contract = {},
			ct = makeContractType(p.contractType), 
			cdes = p.initcdes,	
			ce;
		
		if (P.check.isFunction(p.generate)) {
			contract.gen = function () {
				var g = p.generate.apply(contract, arguments),
					args = Array.prototype.slice.call(arguments);
				args.unshift(g);
				if (contract.check.apply(contract, args)) {
					return g;
				} else {
					throw ("Implemenation of Generator is not valid. Please ensure " +
					       "that each value that is generated by the " +
								 "do_generate function passes the do_check function.");
				}				
			};
		} else {
			contract.gen = function () { 
				return p.generate; 
			};
		}
		if (P.check.isFunction(p.check)) {
			contract.check = P.utils.bind(p.check, contract);
		} else {
			contract.check = function (v) { 
				return v === p.check; 
			};
		}
		//contract.simpl = P.utils.bind(sv, contract);
		contract.failToString = function (v) {
			var r = ("Contract '" + contract.getcdes() +
							 "' is <em>not</em> fulfilled by the value: " + v + ".");
			return r;
		};
		contract.okToString = function (v) {
			var r = "Contract '" + contract.getcdes() + "' is fulfilled by value: " + v +
							".";
			return r;
		};
		contract.getcdes = P.utils.getFun(p.getcdes, function () {
			return cdes;
		});
		contract.setcdes = P.utils.getFun(p.setcdes, function (s) {
			cdes = s;
		});
		contract.genNeeded = P.utils.getFun(p.genNeeded, function (v) {
			return false;
		});
		contract.getCExp = function () {
			return ce;
		};
		contract.registerCExp = function (setce) {
			ce = setce;
		};
		contract.toString = contract.getcdes;
		contract.getContractType = function () {
			return ct;
		};
		return contract;
	}

	function SContract(check, generate, cdes, ct, genNeeded) {
		var p = {
			contractType : ct,
			initcdes : cdes,
			generate : generate,
			check : check,
			genNeeded : genNeeded
		};
		return Contract.call(this, p);
	}
	function PContract(ct, check, pl, probability, gen, cdes, genNeeded) {
		if (!probability) {
			probability = 0.5;
		}
		var p = {
			contractType : ct,
			check : check,
			generate : function () {
				return pickOrF(pl, probability, gen);
			},
			genNeeded : genNeeded,
			initcdes : cdes
		};
		if (P.check.isSArray(pl)) {
			return Contract.call(this, p);
		} else {
			throw "PContract needs array as parameter";
		}
	}
	function SingletonContract(value, cdes, genNeeded) {
		return new Contract({
			contractType : ctBasic,
			check : value,
			generate : value,
			genNeeded : genNeeded,
			initcdes : cdes
		});
	}
	
	/** ******** Null, Undefined, Boolean, String, Number ********* */
	C.Top = new SContract(function () {
		return true;
	}, P.gen.genTop, "top");
	C.TopOUndef = new SContract(function (v) {
		return (v !== undefined);
	}, P.gen.genTopOUndef, "utop");
	C.PTop = function (a, p) {
		return new PContract(ctNoType, function () {
			return true;
		}, a, p, P.gen.genTop, "top");
	};
	C.SingletonContract = function (v, s) {
		return new SingletonContract(v, s);
	};
	C.Singleton = function (v) {
		return new SingletonContract(v, v);
	};
	C.Null = new SingletonContract(null, "null");
	C.Undefined = new SingletonContract(undefined, "undefined");
	C.Boolean = new SContract(P.check.isBoolean, P.gen.genBoolean, "boolean",
														ctBasic);
	C.True = new SingletonContract(true, 'true');
	C.False = new SingletonContract(false, 'false');
	C.String = new SContract(P.check.isString, P.gen.genString, 'string', ctBasic);
	C.Number = new SContract(P.check.isNumber, P.gen.genNumber, "number", ctBasic);
	C.Natural = new SContract(P.check.isPInt, P.gen.genPInt, "natural", ctBasic);
	C.Length = new SContract(P.check.isPInt, P.gen.genLength, "length", ctBasic);
	C.Integer = new SContract(P.check.isInt, P.gen.genInt, "integer", ctBasic);
	C.PInteger = function (iA, p) {
		return new PContract(ctBasic, P.check.isInt, iA, p, P.gen.genInt,
												 "PInteger{" + P.utils.valueToString(iA) + "}");
	};
	C.AInteger = function (iList, fList) {
		if (!iList) {
			iList = [ 0, 1 ];
		}
		iList = P.utils.sadd(0, iList);
		iList = P.utils.sadd(1, iList);
		if (!fList) {
			fList = C.ABasicFuns;
		}
		return new SContract(P.check.isInt, function () {
			return P.gen.genAInt(iList, fList);
		}, "AInteger{" + P.utils.valueToString(iList) + "; " +
			 P.utils.valueToString(fList) + "}", ctBasic);
	};
	C.Id = new SContract(function (x, y) {
		return x === y;
	}, function (x) {
		return x;
	}, "Id", ctBasic);
	C.ABasicFuns = [ {
		getcdes : function () {
			return "+";
		},
		arity : 2,
		f : function (x, y) {
			return x + y;
		}
	}, {
		getcdes : function () {
			return "-";
		},
		arity : 2,
		f : function (x, y) {
			return x - y;
		}
	}, {
		getcdes : function () {
			return "*";
		},
		arity : 2,
		f : function (x, y) {
			return x * y;
		}
	}, {
		getcdes : function () {
			return "/";
		},
		arity : 2,
		f : function (x, y) {
			return x / y;
		}
	} ];
	C.IIntervall = function (low, high) {
		if (P.check.isInt(low) && P.check.isInt(high)) {
			var o = new SContract(function (v) {
				return P.check.isIInt(low, high, v);
			}, function () {
				return P.gen.genIInt(low, high);
			}, "[" + low + "..." + high + "]", ctBasic);
			return o;
		} else {
			if ((!isNumber(low)) || (!isNumber(high))) {
				throw "Intervall needs numbers as bounds";
			} else {
				throw "An Integer Intervall needs Integers as bounds, not floats.";
			}
		}
	};
	C.NIntervall = function (low, high) {
		if (P.check.isNumber(low) && P.check.isNumber(high)) {
			var o = new SContract(function (v) {
				return P.check.isNInt(low, high, v);
			}, function () {
				return P.gen.genNInt(low, high);
			}, "[/" + low + "..." + high + "]", ctBasic);
			return o;
		} else {
			throw "Invervall needs number as bounds";
		}
	};

	/** ******** Objects ********* */
	// Object without additional informations
	C.Object = new SContract(P.check.isObject, P.gen.genObject, "object",
													 ctObject);
	/*
	 * Object with properties, that are simple. Property names only contains
	 * characters and digits.
	 */
	C.SObject = new SContract(P.check.isObject, P.gen.genSObject, "sobject",
														ctObject);
	/*
	 * Object like "Object", but with additional information about properties that
	 * are important. If a property name is generated randomly, p is the
	 * probability that a name from the list pl of property names is choose. If no
	 * name is choose from pl, a simple property, only containing characters and
	 * digits is generated.
	 */
	C.PObject = function (pl, p) {
		return new SContract(P.check.isObject, function () {
			return P.gen.genPObject(pl, p);
		}, "pobject{" + P.utils.valueToString(pl) + "}", ctObject);
	};
	/*
	 * Objects with an exact property list. pl is a list of objects which contains
	 * property names (as name) and contracts (as contract). The checker ensures
	 * that each property given by pl exists and that the value of the property
	 * fulfills the suitable contract. The generator creates objects randomly with
	 * exactly the given set of properties, calling gen() for each contract given
	 * in pl for each property.
	 */
	C.EObject = function (pl) {
		var p = {
			contractType : ctObject,
			check : function (v) {
				return P.check.isObject(v, pl);
			},
			generate : function () {
				return P.gen.genObject(pl);
			},
			getcdes : function () {
				var s = "{", 
					pls = [],
					random = false,
					j,
					p;
				for (j in pl) {
					if (pl.hasOwnProperty(j)) {
						p = pl[j];
						if (p.name && p.contract) {
							pls.push(p.name + ": " + p.contract.getcdes());
						} else {
							if (p.random) {
								random = true;
							} else {
								pls.push(P.utils.valueToString(p));
							}
						}						
					}
				}
				s += P.utils.concat(pls, ",", "", "", false);
				if (random) {
					s += ",...";
				}
				return s + "}";
			}
		};
		return new Contract(p);
	};
	C.EmptyObject = new SContract(P.check.isEmptyObject, { }, "{ }", ctObject);		
	
	/* An Array. t is the type of the elements. */
	C.Array = function (t) {
		var p = {
			contractType : ctArray,
			check : function (v) {
				return P.check.isArray(v, t);
			},
			generate : function () {
				return P.gen.genArray(t);
			},
			getcdes : function () {
				return "array[" + t.getcdes() + "]";
			}
		};
		return new Contract(p);
	};

	(function function_stuff() {
		/** ********* FUNCTION ********* */
		var FUNCTION = 1, METHOD = 2, CONSTRUCTOR = 3;
		
		/*
		 * A function contract. pl is a list of contracts for the parameters of the
		 * function, while rt describes the result value of the function. eff is an
		 * array representing the effects of a function. The effect can be omited.
		 * C.Function([C.Boolean,C.String], C.String) states: (boolean, string) ->
		 * string The check for a function is done by generating a value for each
		 * parameter, then call the function and checking, if the result value
		 * fulfills rt.
		 */
	
		function runFailSafeRh(f, thisv, pl, rh, eh) {
			var res;
			
			try {
				res = f.apply(thisv, pl);
			} catch (e) {
				return eh(e);
			}
			return rh(res);
		}
		function runFailSafe(f, thisv, pl, rh, eh) {
			try {
				return f.apply(thisv, pl);
			} catch (e) {
				return eh(e);
			}
		}
		function runRh(f, thisv, pl, rh) {
			return rh(f.apply(thisv, pl));
		}
		function run(f, thisv, pl) {
			return f.apply(thisv, pl);
		}
		
		function FunctionBaseConstructor(t, thisC, paramC, returnC, rh, failSafe) {
			var contract,
				pldes = "", p, i, 
				arrow = (t === FUNCTION ? "->" : (t === METHOD ? "~>" : "=>")),
				setcdes, getcdes, 
				gen,
				check, checkWithGenValues,	
				checkParams, checkThis, checkReturn,
				runcheck,
				getLastCreatedValues, lcvs;

			setcdes = function () {
				throw "Setting description for function contract not supported";
			};
			getcdes = function () {
				return pldes + arrow + returnC.getcdes();
			};
			gen = function () {
				return function () {
					if (contract.checkThis(this) && contract.checkParams(arguments)) {
						return returnC.gen();
					}
				};
			};

			check = function (v) {
				var t = typeof (v), 
					pvl, 
					thisv, 
					i, l;

				if (t !== 'function') {
					return false;
				}			
				thisv = thisC.gen();
				pvl = [];
				l = paramC.length;
				for (i = 0; i < l; i += 1) {
					pvl[i] = paramC[i].gen();
				}
				return checkWithGenValues.call(this, v, thisv, pvl);
			};
			
			checkWithGenValues = function (v, thisv, pvl) {
				var res;
				// execute rh and perform the execution inside of a try/catch
				// depending on rh and failSafe
				res = runcheck(v, thisv, pvl, rh, failSafe);
				if (returnC.check(res)) {
					return true;
				}
				/* create and store counterexample */
				this.registerCExp(new P.cexp.CExp({
					value: v,
					contract: this,
					t: t,
					thisv: thisv,
					parameter: pvl,
					returnv: res
				}));
				return false;				
			};
			checkThis = function (thisv) {
				return thisC.check(thisv);
			};
			checkParams = function (plv) {
				var v, c, i;
				for (i in paramC) {
					if (paramC.hasOwnProperty(i)) {
						v = plv[i];
						c = paramC[i];
						if (!(c.check(v))) {
							return false;
						}						
					}
				}
				return true;
			};
			checkReturn = function (v) {
				var ok = returnC.check(v);
				if (!ok) {
					fire.call(P, 'assertReturn', contract, v);
				}
			};
			getLastCreatedValues = function () {
				return lcvs;
			};

			
			if (P.check.isFunction(rh)) {
				runcheck = (P.check.isFunction(failSafe)) ? runFailSafeRh : runRh;
			} else {
				runcheck = (P.check.isFunction(failSafe)) ? runFailSafe : run;
			}
			for (i = 0; i < paramC.length; i += 1) {
				if (i > 0) {
					pldes += ", ";
				}
				pldes += paramC[i].getcdes();
			}
			switch (t) {
			case FUNCTION:
				pldes = "(" + pldes + ")";
				break;
			case METHOD:
				pldes = thisC.getcdes() + ".(" + pldes + ")";
				break;
			case CONSTRUCTOR:
				break;
			}
			contract = new Contract({	
				contractType : ctFunction,
				check : check,
				generate : gen,
				getcdes : getcdes,
				setcdes : setcdes,
				genNeeded : P.check.isFunction
			});
			
			contract.checkParams = checkParams;
			contract.checkReturn = checkReturn;
			contract.checkThis = checkThis;
			contract.checkWithGenValues = checkWithGenValues;
			//contract.checkWithParams = checkWithParams;
			//contract.getLastCreatedValues = getLastCreatedValues;
			return contract;
		}
		
		function mixInEffect(contract, eff, pl, thisC, fname) {
			function registerEffects() {
				if (P.tests.callback.registerEffect) {
					// call registerEffect, which will return a uid
					// create new object, that has a method called
					// unregisterEffect, that is able to call
					// the callback function unregisterEffect with
					// the uid gernerated by registerEffect.
					var uid = P.tests.callback.registerEffect(eff, pl, thisC, fname);
					if (P.tests.callback.unregisterEffect) {
						return {
							unregisterEffect : function () {
								P.tests.callback.unregisterEffect(uid);
								return contract;
							}
						};
					}
				}
				return contract;			
			}
			contract.registerEffects = registerEffects;
			return contract;			
		}
		
		C.Function = function (pl, rt, eff, fname) {
			var thisC = new SContract(P.check.isGObject,
																P.utils.gObj, 
																"window", 
																ctFunction);
			return mixInEffect(FunctionBaseConstructor(FUNCTION, thisC, pl, rt, false, false),
			                   eff, pl, thisC, fname);
		};
		C.FunctionFailSafe = function (pl, rt, eff, fname, handler) {
			var thisC = new SContract(P.check.isGObject,
																P.utils.gObj, 
																"window", 
																ctFunction);
			return mixInEffect(FunctionBaseConstructor(FUNCTION, thisC, pl, rt, false, handler),
												 pl, thisC, fname);
		};
		C.Method = function (thisC, pl, rt, eff, mname) {
			// warp this contract to ensure, that the global object (ES3) and
			// undefined (ES5/Strict) is not allowed for this.
			function NTC(org) {
				var p,
					check = P.utils.condBind(org.check, org, this);
				for (p in org) {
					if (org.hasOwnProperty(p)) {
						this[p] = P.utils.condBind(org[p], org, this);						
					}
				}
				this.check = function (v) {
					if (P.check.isGObject(this)) {
						return false;
					} else {
						return check.apply(this, arguments);
					}				
				};
			}
			NTC.prototype = thisC;
			return mixInEffect(FunctionBaseConstructor(METHOD, 
																								 new NTC(thisC), 
																								 pl,
																								 rt),
												 eff, pl, thisC, mname);
		};
		C.Constructor = function (pl, rt, eff, mname) {
			// TODO
			function NTC() {
				this.gen = function (v) {
					function Dummy() {}
					Dummy.prototype = v.prototype;
					var x = new Dummy();
					//x.constructor = v;
					return x;
				};
			}
			var thisC = new NTC();
			thisC.getcdes = function () {
				return "new Method object";
			};
			return C.Function(pl, rt, eff, mname, thisC, "=>");
		};
		C.Depend = function (order, dl) {
			var dparam = {};
			function getDepend(i) {
				if (i < dl.length - 1) {
					return dl[i];					
				}
			}
			function getDependResult() {
				return dl[dl.length - 1];
			}
			function getOrder() {
				return order;
			}
			dparam.getDepend = getDepend;
			dparam.getDependResult = getDependResult;
			dparam.getOrder = getOrder;
			return dparam;
		};
		C.DFunction = function (pl, rt, dparam) {
			function DValues() {
				var scope = [ [] ], as = 0;
				this.getValue = function (s, p) {
					return scope[s - 1][p - 1];
				};
				this.setValue = function (param, value) {
					scope[as][param] = value;
				};
			}
			var lsvs = "", lcvs, // TODO: ?
				pldes = "", 
				i, p, c;
			
			for (i = 0; i < pl.length; i += 1) {
				if (i > 0) {
					pldes += ", ";
				}
				pldes += pl[i].getcdes();					
			}
			function getValues(dvalues, dpl) {
				var dvl = [], i;
				for (i = 0; i < dpl.length; i += 1) {
					dvl.push(dvalues.getValue.apply(dvalues, dpl[i]));
				}
				return dvl;
			}
			function check(v, dvalues) {
				var t = typeof (v), 
					pvl = [], 
					order, i, res, cres,
					p, dpl, dvl, value;
				if (t !== 'function') {
					return false;
				}
				if (dvalues === undefined) {
					dvalues = new DValues();
				}

				order = dparam.getOrder();
				for (i = 0; i < order.length; i += 1) {
					/* index of parameter, that should be generated */
					p = order[i];

					/* list of ($,anz) tuppels, from which the parameter depends */
					dpl = dparam.getDepend(p);

					/* collected values, corresponding to the ($,anz) list */
					dvl = getValues(dvalues, dpl);

					/* call the generator, this = pl[p], other parameters dvl */
					value = pl[p].gen.apply(pl[p], dvl);
					pvl[p] = value;

					dvalues.setValue(p, value);
				}
				lcvs = P.utils.valueToString(pvl);
				res = v.apply(null, pvl);
				cres = rt.check(res);
				if (!cres) {
					/* collect counterexample */
					this.registerCExp(new P.cexp.CExp(v, this, pvl, res));
					return false;
				} else {
					return true;
				}
			}
			function getcdes() {
				return pldes + "-D>" + rt.getcdes();
			}
			function setcdes() {
				throw "Setting description for function contract not supported";
			}
			p = {
				contractType : ctFunction,
				check : check,
				generate : {},
				getcdes : getcdes,
				setcdes : setcdes,
				genNeeded : P.check.isFunction
			};
			// var c = new Contract(ctFunction,check,{},getcdes,setcdes,
			// P.check.isFunction);
			c = new Contract(p);
			c.checkParams = function (plv) {
				var i, v, c;
				
				for (i = 0; i < pl.length; i += 1) {
					v = plv[i];
					c = pl[i];
					if (!(c.check(v))) {
						return false;
					}
				}
				return true;
			};
			c.checkReturn = function (v) {
				var ok = rt.check(v);
				if (!ok) {
					fire.call(P, 'assertReturn', c, v);
				}
			};
			c.get_last_created_values = function () {
				return lcvs;
			};
			return c;
		};		
	}());
	
	/** ********* UNION ********* */
	//var Union, UnionAddSimplRule;
	(function () {
		var simplRules = [];
		
		function addSimpl(sr) {
			if (P.check.isFunction(sr)) {
				simplRules.push(sr);
			}
		}
		function createUnion(c1, c2) {
			function check(v) {
				var c1r = c1.check(v),
					c2r, ce1, ce2;
				if (c1r) {
					return true;
				} else {
					c2r = c2.check(v);
					if (!c2r) {
						// TODO: Is this the intended semantics?
						ce1 = c1.getCExp();
						ce2 = c2.getCExp();
						if (ce1 && ce2) {
							this.registerCExp(new P.cexp.CExpUnion(this, ce1, ce2));
						} else {
							if (ce1) {
								this.registerCExp(ce1);
							} else {
								if (ce2) {
									this.registerCExp(ce2);
								}
							}
						}
						return false;
					} else {
						return true;
					}
				}
			}
			function generate() {
				var r = Math.random();
				if (r < 0.5) {
					return c1.gen();
				} else {
					return c2.gen();
				}
			}
			function getcdes() {
				return ("(" + c1.getcdes() + " or " + c2.getcdes() + ")");
			}
			var i, sr, c, p;
			
			for (i = 0; i < simplRules.length; i += 1) {
				sr = simplRules[i];
				c = sr(c1, c2);
				if (c) {
					return c;					
				}
			}
			p = {
				contractType : ctComplex,
				check : check,
				generate : generate,
				getcdes : getcdes
			};
			// return new Contract(ctComplex,check,generate,getcdes);
			return new Contract(p);
		}

		Union = createUnion;
		UnionAddSimplRule = addSimpl;

		function simplTrueFalseBool(c1, c2) {
			if (((c1 === C.True) && (c2 === C.Boolean)) || 
					((c1 === C.Boolean) && (c2 === C.True)) || 
					((c1 === C.False) && (c2 === C.Boolean)) || 
					((c1 === C.Boolean) && (c2 === C.False))) {
				return C.Boolean;
			} else {
				return false;
			}
		}
		function simplIntervall(c1, c2) {

		}

		addSimpl(simplTrueFalseBool);
	}());

	/** ******** Intersection ********* */
	C.Intersection = function (c1, c2) {
		if (c1.getContractType && (c1.getContractType() === ctFunction) &&
				c2.getContractType && (c2.getContractType() === ctFunction)) {
			// TODO
		} else {
			throw "Intersections are only allowed for two function contracts";
		}
	};

	/** ******** NAMES ********* */
	(function () {
		var names = {},
			ntable = {},
			cnames = [],
			testTable;
		C.names = names;
		testTable = function (name, f, g, err) {
			var c = ntable[name], r;
			if (c) {
				if (!(c.marked)) {
					c.marked = true;
					r = f(c.contract);
					c.marked = false;
					return r;
				} else {
					return g(c.contract);
				}
			} else {
				throw ("Invalid contract! There exists no contract with name: '" + name +
							 "'. " + err);
			}
		};
		names.Name = function (name) {
			var gcdes = function (i) {
					return "Name: " + name + ", Image: " + i;
				},
				p, o;
			function throwRecError(cstr) {
				throw ("Invalid Contract '" + cstr + "'! Recursion, but no function contract visted");
			}
			function check(v) {
				var r = testTable(name, function (c) {
					var tmp = c.check(v);
					return tmp;
				}, function (c) {
					throwRecError(gcdes(c.getcdes()));
				}, "Invalid call of check.");
				return r;
			}
			function generate() {
				var r = testTable(name, function (c) {
					var tmp = c.gen();
					return tmp;
				}, function (c) {
					throwRecError(gcdes(c.getcdes()));
				}, "Invalid call of generate.");

				return r;
			}
			function getcdes() {
				var r = testTable(name, function (c) {
					var tmp = c.getcdes();
					return gcdes(tmp);
				}, function (c) {
					return "Name: " + name;
				}, "Name: " + name + "(no Image)");
				return r;
			}
			p = {
				contractType : ctName,
				check : check,
				generate : generate,
				getcdes : getcdes
			};
			// var o = new Contract(ctName,check,generate,getcdes);
			o = new Contract(p);
			cnames.push({
				name : name,
				contract : o,
				marked : false
			});
			return o;
		};

		names.Let = function (name, c) {
			ntable[name] = {
				name : name,
				contract : c
			};
		};
		names.resetMarked = function () {
			var i, o;
			for (i in ntable) {
				if (ntable.hasOwnProperty(i)) {
					o = ntable[i];
					o.marked = false;					
				}
			}
		};
	}());


	/********************************* */
	/* Interface */
	/********************************* */

	/* Contract */
	/**
	 * Contract Interface: { Checks if the parameter fulfills the value. check:
	 * value -> boolean;
	 * 
	 * generate parameters for functions gen: void -> vlaue;
	 * 
	 * simplify counterexamples simpl: value -> value;
	 * 
	 * Tests if we need to generate value to check function This will be true if
	 * value is a function, or an object that does provide methods. Otherwise we
	 * can do the check without generating examples. genNeeded : value -> boolean
	 * 
	 * Returns the counterexample that breaks the contraint if a test find a
	 * counterexample. getCExp: void -> CExp
	 * 
	 * Register a counterexample for a contract registerCExp: CExp -> void
	 * 
	 * String methods, to generate logging infos failToString: value -> string;
	 * okToString: value -> string; getcdes: void -> string; setcdes: string ->
	 * void; toString: void -> string; }
	 */
	C.Name = C.names.Name;
	C.Let = C.names.Let;
	C.Union = Union;

	/** TODO: needs type signature and docu */
	C.Contract = Contract;

	/**
	 * SContract: (check, generate, cdes, ctype, genNeeded) -> Contract The
	 * function newSContract creates a new Contract. It takes 5 parameters, but
	 * you can omit the last two of them. check is a predicate for the contract,
	 * generate is a generator and cdes is a string representation for a contract.
	 */
	C.SContract = SContract;

	
	C.load = function (s) {
		return cc[s];
	};
	C.store = function (s, c) {
		cc[s] = c;
	};

}(JSConTest));
