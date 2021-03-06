/* Version: 0.2.0 */
/* author: Phillip Heidegger, Dirk Kienle */

/* This library will change the global namespace.
	 It creates a global variable JSConTest.
	 
	 In order to change this behaviour, just rename it. Please note,
	 that you have to use the same global namespace identifier in
	 all librarys of "proglang.*" in order to work together correctly. 
*/

"use strict";

var JSConTest = (function (P) {
	/*members MAXINT, Top, TopOUndef, apply, arity, check, compare, 
		compareArray, constructor, contract, effToString, floor, gen, 
		genAInt, genBoolean, genEPL, genIInt, genInt, genLength, genNInt, 
		genNull, genNumber, genObject, genPObject, genString, genStringL, 
		genTopOUndef, genTree, genUndefined, getFun, getcdes, indexOf, initGen, 
		isArray, isBoolean, isFalse, isFunction, isIInt, isInt, isNInt, isNull, 
		isNumber, isObject, isSArray, isString, isTrue, isUndefined, length, 
		math, name, push, random, restrictTo, round, substring, tests, toString, 
		trans, utils, valueToString, f, gObj, prototype, slice, call, smem, sadd,
		withTry, bind, condBind, hasOwnProperty, concat, isEmptyObject, isGObject, E,
		LN2, LN10, LOG2E, LOG10E, PI, SQRT2, SQRT1_2, pow, contracts, genTop, 
		genArray, isPInt, genPInt
	*/
		
	P.math = {};
	P.utils = {};
	P.check = {};
	P.gen = {};
	
	(function () {
		/* compute maxint */
		if (!(P.math.MAXINT)) {
			var y = 1, x = 0, i;
			for (i = 0; i < 31; i += 1) {
				x = x + y;
				y = y * 2;
			}
			P.math.MAXINT = x;
		}
	}());
	P.math.E = Math.E;
	P.math.LN10 = Math.LN10;
	P.math.LN2 = Math.LN2;
	P.math.LOG10E = Math.LOG10E;
	P.math.LOG2E = Math.LOG2E;
	P.math.PI = Math.PI;
	P.math.SQRT1_2 = Math.SQRT1_2;
	P.math.SQRT2 = Math.SQRT2;
	P.math.abs = Math.abs;
	P.math.acos = Math.acos;
	P.math.asin = Math.asin;
	P.math.atan = Math.atan;
	P.math.atan2 = Math.atan2;
	P.math.ceil = Math.ceil;
	P.math.cos = Math.cos;
	P.math.exp = Math.exp;
	P.math.floor = Math.floor;
	P.math.log = Math.log;
	P.math.max = Math.max;
	P.math.min = Math.min;
	P.math.pow = Math.pow;
	P.math.random = Math.random;
	P.math.round = Math.round;
	P.math.sin = Math.sin;
	P.math.sqrt = Math.sqrt;
	P.math.tan = Math.tan;
	P.utils.hasOwnProperty = Object.prototype.hasOwnProperty;
	
	for (var p in Math) {
		P.math[p] = Math[p];
	}
	
	/********** utils **********/
	function smem(e, set) {
		var j;
		for (j in set) {
			if (set[j] === e) {
				return true;
			}
		}
		return false;
	}
	function sadd(e, set) {
		var nset, j;
		if (smem(e, set)) {
			return set;
		} else {
			nset = [e];
			for (j in set) {
				if (set.hasOwnProperty(j)) {
					nset.push(set[j]);					
				}
			}
			return nset;
		}
	} 
	function compareArray(a, testArr) {
		if (a.length !== testArr.length) {
			return false;
		}
		for (var i = 0; i < testArr.length ; i += 1) {
			if (a[i] && a[i].compare) { 
				if (!a[i].compare(testArr[i])) {
					return false;
				}
			}
			if (a[i] !== testArr[i]) {
				return false;
			}
		}
		return true;
	}
	function unSafePick(a) {
		return a[P.path.floor(P.math.random() * a.length)];
	}
	function pick(a) {
		if (isSArray(a)) {
			return a[P.math.floor(P.math.random() * a.length)];
		} else {
			throw "Call pick with an array";
		}
	}
	function pickOrF(a, p, f) {
		if (isSArray(a) && p && (p >= 0) && (p <= 1) && (P.math.random() < p)) {
			return pick(a);
		} else {
			return f();
		}
	}
	function getFun(f1, f2) {
		if (isFunction(f1)) {
			return f1;
		} else {
			return f2;
		}
	}
	function singleQuote(param) {
		return "'" + param + "'";
	}
	function concat(a, sep, left, right, showProp, showValues, nextLine, depth) {
		var numberOfProp = 0,
			s = "",
			sepWithNL = sep,
			context = {},
			i, j;
		if (depth === undefined) {
			depth = 5;
		}
		if (nextLine && showProp) {
			sepWithNL += nextLine();
		}
		for (i in a) {
			if (a.hasOwnProperty(i)) {
				s += sepWithNL;
				numberOfProp = numberOfProp + 1; 
				if (showProp) {
					s += i + ": ";
				}
				if (showValues) {
					s += valueToString(a[i], nextLine, depth - 1);
				} else {
					s += a[i];
				}
			}
		}
		if (numberOfProp > 1) {
			return left + s.substring(sep.length) + right;
		} else {
			return left + s.substring(sepWithNL.length) + right;
		}
	}

	/*** TODO: use YUI Components */
//  function showValue(parent, v) {
		// TODO: create html entry, that represents the value v
		// v : string -> v 
		// v : boolean -> true,false
		// v : object -> TreeView
		// v : array -> TreeView
		// v : function -> TODO
//	}
	
	function valueToString(v, nextLine, depth) {
		if (depth === undefined) {
			depth = 5;
		}
		if (depth < 1) {
			return "-omitted value-";
		}
		var modnextLine;
		if (nextLine) {
			modnextLine = function () {
				return nextLine() + "&nbsp;&nbsp;&nbsp;"; 
			};
		}
		if (v === null) {
			return 'null';
		}
		if (v === undefined) {
			return 'udf';
		}
		switch (typeof(v)) {
		case 'string': 
			return singleQuote(v);
		case 'object':
			if (v === P.utils.gObj) {
				return "window";
			}
			if (isSArray(v)) {
				return concat(v, ",", '[', ']', false, true, modnextLine, depth);
			} else {
				if (v.getcdes) {
					return v.getcdes();
				} else {
					return concat(v, ",", '{', '}', true, true, modnextLine, depth);
				}
			}
			break;
		case 'function':
			return "" + v;
		default:
			return "" + v;
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
	function bind(f, that) {
		return function () {
			return f.apply(that, Array.prototype.slice.call(arguments));
		};
	}
	
	// condBind(f, ...) calls f never with wrap as this.
	// If condBind(f, that, ...) is called with the object wrap, then 
	// that is passed instead. 
	// If condBind(f, that, wrap, check) was called with an other this 
	// object (unequal to that), then f is called with the this object 
	function condBind(f, that, wrap) {
		return function () {
			if (this === wrap) {
				return f.apply(that, Array.prototype.slice.call(arguments));
			} else {
				return f.apply(that, Array.prototype.slice.call(arguments));
			}
		};
	}

	/** utils exports */
	P.utils.smem = smem;
	P.utils.sadd = sadd;
	P.utils.getFun = getFun;
	P.utils.valueToString = valueToString;
	P.utils.compareArray = compareArray;
	P.utils.withTry = withTry;
	P.utils.bind = bind;
	P.utils.condBind = condBind;
	P.utils.gObj = (function () { 
		return this; 
	}());
	P.utils.concat = concat;
	
	/********** checks **********/
	function isNull(v) { 
		return v === null; 
	}
	function isTrue(v) { 
		return v === true; 
	}
	function isFalse(v) { 
		return v === false; 
	}
	function isBoolean(v) { 
		return typeof(v) === 'boolean'; 
	}
	function isUndefined(v) { 
		return v === undefined; 
	}
	function isNumber(v) { 
		return (typeof(v) === 'number' && (!isNaN(v))); 
	}
	function isInt(v) {
		return (typeof(v) === 'number' && (!isNaN(v)) && (P.math.floor(v) === v));
	}
	function isPInt(v) {
		return (typeof(v) === 'number' && (!isNaN(v)) && (v >= 0) && (P.math.floor(v) === v));
	}
	function isIInt(low, high, v) {
		return ((low <= v) && (v <= high) && isInt(v));
	}
	function isNInt(low, high, v) {
		return ((low <= v) && (v <= high) && isNumber(v));
	}
	function isString(v) { 
		return typeof(v) === 'string'; 
	}
	function isObject(v, pl) {
		var j, p, t;
		if (v === null) {
			return false;
		}
		t = typeof(v);
		if (!((t === 'object') || (t === 'function'))) {
			return false;
		}
		for (j in pl) {
			if (pl.hasOwnProperty(j)) {
				p = pl[j];
				if (p.contract && !p.contract.check(v[p.name])) {
					return false;
				}				
			}
		}
		return true;
	}
	function isEmptyObject(v) {
		var p;
		
		if (!isObject(v)) {
			return false;
		}
		for (p in v) {
			if (v.hasOwnProperty(p)) {
				return false;
			}
		}
		return true;
	}
	function isGObject(v) {
		return v === P.utils.gObj;
	}
	function isSArray(obj) {
		if (!obj) {
			return false;
		}
		// @see the good parts, p. 61
		return Object.prototype.toString.apply(obj) === '[object Array]';
	}
	function isArray(obj, type) {
		if (!obj) {
			return false;
		}
		if (type) {
			for (var j = 0; j < obj.length; j = j + 1) {
				if (!(type.check(obj[j]))) {
					return false;
				}
			}
		}
		// either all elements fulfills the type, or the type does not
		// exits. Hence the check, if obj is an array, is the only thing
		// we need to check now. 
		return Object.prototype.toString.apply(obj) === '[object Array]';
	}
	function isFunction(v) {
		return typeof(v) === 'function';
	}
	
	/* Check Exports. */
	P.check.isNull = isNull;
	P.check.isTrue = isTrue;
	P.check.isFalse = isFalse;
	P.check.isBoolean = isBoolean;
	P.check.isUndefined = isUndefined;
	P.check.isNumber = isNumber;
	P.check.isInt = isInt;
	P.check.isPInt = isPInt;
	P.check.isIInt = isIInt;
	P.check.isNInt = isNInt;
	P.check.isString = isString;
	P.check.isFunction = isFunction;
	P.check.isArray = isArray;
	P.check.isSArray = isSArray;
	P.check.isObject = isObject;
	P.check.isEmptyObject = isEmptyObject;
	P.check.isGObject = isGObject;
	
	/********** generator **********/
	/* You can call every generate without any parameters.
		 Then all parameters are chosen randomly. 
		 If you specify the parameters, they are taken to
		 account, and the generated value fulfills then
		 restrictions represented by them. */
	function genNull() { 
		return null; 
	}
	function genUndefined() { 
		return undefined; 
	}
	function genBoolean() {
		if (P.math.random() < 0.5) {
			return true;
		} else {
			return false;
		}
	}
	function genInt() {
		var ri = P.math.round(P.math.random() * P.math.MAXINT);
		if (P.math.random() < 0.5) {
			ri = ri * -1;
			ri = ri - 1;
		}
		return ri;
	}
	function genPInt() {
		var i = genInt();
		if (i < 0) {
			return -i;
		} else {
			return i;
		}
	}
	function genIInt(low, high) {
		if (isInt(low) && isInt(high)) {
			return P.math.floor(P.math.random() * (high - low)) + low;
		} else {
			return genInt();
		}
	}
	
	/* genNInt generates a floating point value between 
		 low and high, if both parameters are given.
		 If one parameter is given, a floating point
		 value in [0,p] is generated. 
		 If no bound is specified, an arbitrary floating
		 point is generated. 
	*/
	function genNInt(low, high) {
		if (isNumber(low) && isNumber(high)) {
			return (P.math.random() * (high - low)) + low;
		} else {
			return genNumber();
		}
	}
	function genRNDFloat() {
		var r, e, i;
		if (P.math.random() < 0.2) {
			return unSafePick([P.math.E, P.math.LN2, P.math.LN10, 
												 P.math.LOG2E, P.math.LOG10E,
												 P.math.PI, P.math.SQRT2, P.math.SQRT1_2,
												 1 / 0, -1 / 0]);
		}
		r = P.math.random();
		e = genIInt(-1074, 971);
		return r * P.math.pow(2, e);
	}
	function genNumber(low, high) {
		if (isNumber(low) && isNumber(high)) {
			// generate random float in range
			return P.math.random() * (high - low) + low;
		} else {
			if ((!isNumber(low)) && (!isNumber(high))) {
				return genRNDFloat();
			} else {
				// generate random double in range [0,p], where p = low or high
				return genNumber(0, (0 + low) || (0 + high));
			}
		}
	}
	function genLength() {
		var i = 0;
		while (P.math.random() < 0.8) {
			i += 1;
		}
		return i;
	}
	function genTree(pred, leafGen, nodeGen, p, functions) {
		var q, i;
		function genNode(p) {
			var op = unSafePick(nodeGen),
				tl = [],
				arity = op.arity,
				newp = p / arity,
				r, j;
			for (j = 0; j < arity; j = j + 1) {
				tl.push(gen(newp));
			}
			r = op.f.apply(null, tl);
			if (pred(r)) {
				return r;
			} else {
				return gen(p * 0.9);
			}
		}
		function gen(p) {
			var r;
			if (P.math.random() < p) {
				r = genNode(p);
				return r;
			}
			if (functions) {
				r = unSafePick(leafGen)();
			} else {
				r = unSafePick(leafGen);
				return r;
			}
			if (pred(r)) {
				return r;
			}
			return gen(p * 0.9);
		}
		if (!isSArray(leafGen)) {
			throw "Call genTree with an array that can generate leafs";
		}
		if (!isSArray(nodeGen) || nodeGen.length < 1) {
			return pick(leafGen)();
		}
		if (p === undefined) {
			p = 0.5;
		}
		if (!isNumber(p)) {
			p = 0.5;
		}
		q = 0.5;
		if (leafGen.length > 0) {
			q = 1 / leafGen.length;
		}
		if (!functions) {
			for (i = 0; i < leafGen.length; i = i + 1) {
				if (!pred(leafGen[i])) {
					throw "Leaf does not fulfill predicate";
				}
			}
		}
		return gen(p);
	}
	function genAInt(iList, fList, p) {
		if (!isSArray(iList)) {
			return genInt();
		}
		return genTree(isInt, iList, fList, p);
	}
//	function genAIntOld(iList, fList, p) {
//		function genFInt(p) {
//			var op = pick(fList),
//				tl = [],
//				arity = op.arity,
//				newp = p / arity,
//				j, r;
//			for (j = 0; j < arity; j = j + 1) {
//				tl.push(gen(newp));
//			}
//			r = op.f.apply(null, tl);
//			if (isInt(r)) {
//				return r;
//			} else {
//				return gen(p * 0.9);
//			}
//		}
//		function gen(p) {
//			var r;
//			if (P.math.random() < p) {
//				r = genFInt(p);
//				return r;
//			}
//			if (P.math.random() < q) {
//				return genInt();
//			}
//			r = pick(iList);			
//			if (isInt(r)) {
//				return r;
//			}
//			return gen(p * 0.9);
//		}
//		
//		if (!fList || !fList.length || fList.length < 1) {
//			return pick(iList);
//		}
//		if (p === undefined) {
//			p = 0.5;
//		}
//		if (!isNumber(p)) {
//			p = 0.5;
//		}
//		var q = 0.5;
//		if (iList.length > 0) {
//			q = 1 / iList.length;
//		}
//		return gen(p);
//	}
	function genEPL(gS) {
		var l = genLength(),
			pl = [], 
			j, pn;
		if (!gS) {
			gS = genString;
		}
		for (j = 0; j < l; j += 1) {
			pn = gS();
			pl.push({name: pn, contract: P.contracts.TopOUndef});
		}
		return pl;
	}
	function genRPL() {
		// TODO
		return [];
	}
	function genString(chars, length) {
		var i = 0, 
			r = "",
			j;
		if (!chars) {
			chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321!@#$%^&*()_+-=[]\\{}|'\",/<>?~`";
		}
		if (!length) {
			i = genLength();
		} else {
			i = length;
		}
		if (i < 1) {
			return "";
		} else {
			r = "";
			for (j = 0; j < i; j = j + 1) {
				r += chars[P.math.floor(P.math.random() * chars.length)];
			}
			return r;
		}
	}
	function genPropString() {
		return genString('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321');
	}
	function genSEPL() {
		return genEPL(genPropString);
	}
	function genStringL(minlength, maxlength) {
		var isIntmin = isInt(minlength),
			isIntmax = isInt(maxlength),
			l;
		if (!isIntmin && !isIntmax) {
			return genString();
		}
		/* one of the two is an integer */
		if (!isIntmin) {
			minlength = 0;
		}
		if (!isIntmax) {
			l = minlength + genLength();
			return genString(undefined, l);
		}
		/* both, min and max are defined and both are ints */
		if (minlength > maxlength) {
			return genString();
		}
		l = minlength + genLength();
		if (maxlength < l) {
			return genStringL(minlength, maxlength);
		}
		return genString(undefined, l);
	}
	function genPPropString(pl, p) {
		return pickOrF(pl, p, genString);
	}
	function genObject(exactPropList) {
		var ps = [], 
			r = {}, 
			rand = 0,
			i, j, ep;
		function addProp(p, r, c) {
			if (p && (ps.indexOf(p) < 0)) {
				ps.push(p);
				r[p] = c.gen();
			}
		}
		/* If no pl is given, generate a random set of properties,
			 with Top Contract */
		if (!exactPropList) {
			exactPropList = genEPL();
		}
		for (j in exactPropList) {
			if (exactPropList.hasOwnProperty(j)) {
				ep = exactPropList[j];
				if ((ep.name) && (ep.contract)) { // name and contract exists
					// generate a new value for property, and assign it to 
					// the property of the object r.
					addProp(ep.name, r, ep.contract);
				} else {
					// do we have a random property without a name?
					rand = 0;
					if (isInt(ep.random) && (ep.random > 0)) {
						rand = ep.random;
					} else {
						rand = genLength();
					}
					for (i = 0; i < ep.random; j = j + 1) {
						addProp(genString(), r, P.contract.TopOUndef);
					}
				}				
			}
		}
		return r;
	}
	function genSObject() {
		var eSPL = genSEPL();
		return genObject(eSPL);
	}
	function genPObject(pl, p) {
		if (!p) {
			p = 0.5;
		}
		var pSPL = genEPL(function () { 
			return genPPropString(pl, p); 
		});
		return genObject(pSPL);
	}
	function genObjectWithRegEx(regexPropList) {
		if (!regexPropList) {
			regexPropList = genRPL();
		}
		// TODO
		return {};
	}
	function genArray(contract, length) {
		var a = [],
			j;
		if (!length) {
			length = genLength();
		}
		if (!contract) {
			contract = P.contracts.Top;
		}
		for (j = 0; j < length; j = j + 1) {
			a.push(contract.gen());
		}
		return a;
	}
	var genFoU = [genNull, genBoolean, genNumber, genInt, genString,
								genPropString, genSObject, genObject, genArray],
		genF = [genUndefined, genNull, genBoolean, genNumber, genInt, genString,
						genPropString, genSObject, genObject, genArray];
	function genTop() {
		// reduce probability, that an object or array is
		// created. This ensures Termination. 
		var r = P.math.floor(P.math.random() * 1000);
		if (r < 2) {
			genF.push(genBoolean);
		}
		if (r < 4) {
			genF.push(genNumber);
		}
		if (r < 6) {
			genF.push(genInt);
		}
		if (r < 8) {
			genF.push(genUndefined);
		}
		if (r < 10) {
			genF.push(genNull);
		}
		if (r < 12) {
			genF.push(genString);
		}
		if (r < 14) {
			genF.push(genPropString);
		}
		return (pick(genF))();
	}
	function genTopOUndef() {
		// reduce probability, that an object or array is
		// created. This ensures Termination. 
		var r = P.math.floor(P.math.random() * 1000);
		if (r < 2) {
			genFoU.push(genBoolean);
		}
		if (r < 4) {
			genFoU.push(genNumber);
		}
		if (r < 6) {
			genFoU.push(genInt);
		}
		if (r < 8) {
			genFoU.push(genNull);
		}
		if (r < 10) {
			genFoU.push(genString);
		}
		if (r < 12) {
			genFoU.push(genPropString);
		}
		return (pick(genFoU))();
	}
	function initGen() {
		genFoU = [genNull, genBoolean, genNumber, genInt, genString,
							genPropString, genSObject, genObject, genArray];
		genF = [genUndefined, genNull, genBoolean, genNumber, genInt, genString,
						genPropString, genSObject, genObject, genArray];
	}
	/* This generator takes a predicate isValid
	 * together with an arbitrary generator (gen),
	 * and return a value that fulfills isValid.
	 * It may take some time to find a value, such
	 * that isValid is fulfilled, so please use
	 * this generator only, if the probability,
	 * that isValid(gen()) == true is high.
	 */
	function restrictTo(isValid, gen) {
		function g() {
			var v = gen();
			if (isValid(v)) {
				return v;
			}
			return g();
		}
		return g;
	}
	
	/********* Generaters *********/
	P.gen.genNull = genNull;
	P.gen.genUndefined = genUndefined;
	P.gen.genBoolean = genBoolean;
	P.gen.genObject = genObject;
     P.gen.genString = genString;
     P.gen.genPropString = genPropString;

	P.gen.genStringL = genStringL;
	P.gen.genInt = genInt;
	P.gen.genPInt = genPInt;
	/* genIInt: (int,int) -> int
		 genIInt(low,high) is a uniform random genrator 
		 over the integer intervall [low,high]. 
	*/
	P.gen.genIInt = genIInt;
	P.gen.genNInt = genNInt;
	
	/* genNumber: void -> float
		 genNumber generates a random float.
	*/
	P.gen.genNumber = genNumber;
	/* genLength : void -> int
		 genLength() is a random generator that is used
		 to randomly decide how long a string should be, 
		 or how many properties an object should have.
		 It generates positive integer value, while
		 i has the probability 1/2^i.
	*/
	P.gen.genLength = genLength;
	/* genAInt : ( [int],[op], float ) -> int
		 genAInt(iList,fList,p):
		 iList: is a list of integers that are used as leafs 
		 of the tree
		 fList: is a list of operators which has a arity, a
		 string representation and a function that 
		 evaluates the opertor on two integers.
		 p:		 is the probability, that a leaf is picked, and
		 no operator is choosen.
	*/
	P.gen.genAInt = genAInt;
	
	/* genTree : (value -> bool, [value], [op], float, bool) -> value 
		 genTree(pred,leafList,nodeList,p,functions):
		 pred:			Is the predicate that determins, if a generated tree is valid
		 leafList:	Either a list of leafs or a list of functions that generate
		 trees (depending on the value of functions).
		 nodeList:	A list of functions that allows combining a number of 
		 already generated trees. 
		 { arity: int, f: (v1,...,v_arity) -> value }
		 p:				 Probability, that a leaf is picked, and no operator is choosen
		 functions: Determens if leafList is a list of functions or values.		
	*/
	P.gen.genTree = genTree;
	
	/* restrictTo: (Top -> bool, void -> value) -> value
		 the call restrictTo(isA,genB) is a generator for
		 value of the set A, if genB generates all values
		 from B, and it holds A \subset B, and the probability
		 is greater than zero. The higher the probablity is,
		 the faster the new generator will work.
	*/
	P.gen.restrictTo = restrictTo;
	
	/* genEPL : (void -> string) -> [{name: string, contract: contract}]
		 genEPL takes a function which generates property names,
		 and randomly generate a list of objects, which themselfs
		 saves the generated name and a suiteable contract for
		 this property.
		 Use the array of objects to create an object call gen from 
		 the contract to generate suiteable values for each property.
		 If the parameter is omited, genString is used. 
	*/
	P.gen.genEPL = genEPL;

	
	P.gen.initGen = initGen;
	P.gen.genPObject = genPObject;
	P.gen.genTopOUndef = genTopOUndef; 
	P.gen.genTop = genTop;
	P.gen.genArray = genArray;
	P.gen.initGen = initGen;
	
	return P;
}({}));
