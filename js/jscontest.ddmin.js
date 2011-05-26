/* Version: 0.2.0 */
/* author: Phillip Heidegger, Dirk Kienle */

"use strict";

(function (P) {
	P.ddmin = {};

	/********** shrinking **********/
	/* This function takes a predicate pred and 
		 an array of parameters paraml,
		 where the signature of the predicate is:
			 (paraml) -> bool.
		 It also holds for the parameter list:
			 pred(paraml) = true.
		 It computes a new list [p1',...,pn'], such that
			 [p1',...,pn'] <= paraml
		 and
			 pred([p1',...,pn') = true 
		 and that no futher local minimaziation is possible.
	*/
	/** ddmin: 'a -> boolean , 'a -> 'a
			ddmin(p,params) does:
			p: is something valid counter example? If it is, true
			is returned, otherwise false.
			Please do not use predicates that has sideeffects,
			then maybe nothing works!
			params: an initial counter example that should be
			minimized.
			@result: returns a local minium, such that @result
			fulfills p.
	*/
	function ddmin(p, params) {
		return p_ddmin_obj_array_prop(p, params);					 
	}


	function p_ddmin(p, params, gran) {	
		if (!p(params)) {
			throw ("Invalid call to ddmin, it is not allowed to call it with a parameter " +
						 "that do not pass the predicate");
		} else {
			if (P.check.isArray(params)) {
				return p_ddmin_array(p, params, gran);
			}
			if (P.check.isObject(params)) {
				params = p_ddmin_obj(p, params, gran);
				return p_ddmin_obj_array_prop(p, params);
			}
			if (P.check.isString(params)) {
				return p_ddmin_string(p, params);
			}
			if (P.check.isNumber(params)) {
				return p_ddmin_number(p, params);
			}
			return params;
		}
	}

	/** ddmin_obj: obj -> boolean, obj -> obj
			ddmin_obj(p,o) does:
			p: the predicate
			o: the objct
			It removes properties from o, such that the
			result fulfills p and there is no property that
			can be removed from the result such that p is
			fulfilled.	
	*/
	function p_ddmin_obj(p, o, gran) {
		var osize, os, key;
		
		function split(o) {
			var k = 0,
				result = [],
				key, i, prop_val;
			for (key = 0; key < gran; key += 1) { 
				result[key] = {}; 
			}
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					i = k % gran;
					prop_val = o[key];
					result[i][key] = prop_val;
					k += 1;					
				}
			}
			return result;
		}
		function osplit(o) {
			var k = 0, 
				result = [],
				key, i, j, prop_val;
			for (key = 0; key < result.length; key += 1) { 
				result[key] = {}; 
			}
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					i = k % gran;
					prop_val = o[key];
					for (j = 0; j < result.length; j += 1) {
						if (j !== i) {
							result[j][key] = prop_val;
						}
					}
					k += 1;					
				}
			}
			return result;
		}
		function getSize(o) {
			var j = 0, key;
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					j += 1;					
				}
			}
			return j;
		}
		
		if (!p(o)) {
			throw ("Invalid call to ddmin, it is not allowed to call it with an object " +
						 "that do not pass the predicate");
		} else {
			if (p({})) {
				return {};
			}
			
			//o = _ddmin_obj_array_prop(p,o);
			
			osize = getSize(o);
			while (gran <= osize) {
				// try split
				os = split(o);
				for (key = 0; key < os.length; key += 1) {
					if (p(os[key])) {
						return p_ddmin(p, os[key], gran);
					}
				}
				// try oposite of split, if gran > 2
				// (if gran = 2, split and osplit will do the same)
				if (gran > 2) {
					os = osplit(o);
					for (key = 0; key < os.length; key += 1) {
						if (p(os[key])) {
							return p_ddmin(p, os[key], Math.max(gran - 1, 2));
						}
					}
				}
				// increase gran
				if (gran === osize) {
					gran += 1;
				} else {
					gran = gran * 2;
					if (gran > osize) {
						gran = osize;
					}
				}
			}
			return o;
		}
	}
	
	
	/** ddmin_array: array -> boolean, array -> array
		ddmin_array(p,a) does:
		p: the predicate
		a: the array
		It removes elements from a, such that
		result fulfills p and there is no property that
		can be removed from the result such that p is
		fulfilled.	
	*/
	function p_ddmin_array(p, a, gran) {
		var as, na, key;
		
		function split(a) {
			var result = [], 
				key, pos, i, prop_val;
			for (key = 0; key < a.length; key += 1) {
				result[key] = [];
			}
			for (pos = 0; pos < a.length; pos += 1) {
				i = pos % gran;
				prop_val = a[pos];
				result[i].push(prop_val);
				
				//result[i][Math.floor(pos/gran)] = prop_val;
			}
			return result;
		}
		function osplit(a) {
			var result = [], 
				key, pos, i, j, prop_val;
			for (key = 0; key < a.length; key += 1) { 
				result[key] = [];
			}
			for (pos = 0; pos < a.length; pos += 1) {
				i = pos % gran;
				prop_val = a[pos];
				for (j = 0; j < result.length; j += 1) {
					if (j !== i) {
						result[j].push(prop_val);
						//result[j][result[j].length] = prop_val;						
					}
				}
			}
			return result;
		}
		
		if (!p(a)) {
			throw ("Invalid call to ddmin, it is not allowed to call it with an object " +
						 "that do not pass the predicate");
		} else {
			na = [];
			if (p(na)) {
				return na;
			}
			
			a = p_ddmin_obj_array_prop(p, a);
			
			while (gran <= a.length) {
				// try split
				as = split(a);
				for (key = 0; key < as.length; key += 1) {
					if (p(as[key])) {
						return p_ddmin(p, as[key], gran);
					}
				}
				// try oposite of split, if gran > 2
				// (if gran = 2, split and osplit will do the same)
				if (gran > 2) {
					as = osplit(a);
					for (key = 0; key < as.length; key += 1) {
						if (p(as[key])) {
							return p_ddmin(p, as[key], Math.max(gran - 1, 2));
						}
					}
				}
				// increase gran
				if (gran === a.length) {
					gran += 1;
				} else {
					gran = gran * 2;
					if (gran > a.length) {
						gran = a.length;
					}
				}
			}
			return a;
		}
	}
	
	/** ddmin_string: string -> boolean, string -> string
			ddmin_string(p,param) does:
			p: the predicate
			param: the string
			It sets param to the empty string and checks
			if the empty string fulfills p. If it does not,
			the functon will return param.
	*/
	function p_ddmin_string(p, param)
	{
		var result,str, i;
		if (!p(param)) {
			throw ("Invalid call to ddmin, it is not allowed to call it with an object " +
						 "that do not pass the predicate");
		} else {
			if (p("")) {
				return "";
			} else if (param.length > 1){
				str = "";
				result = p_ddmin(createPred(p),param.split(""),2);
				for (i = 0;i<result.length;i++){
					
					str += result[i];
				}
				return str;
			}
		}
	
		return param;
	
		function createPred (p){
			return function (a){
				
				var str = "";
				if (P.check.isString(a)) {
					return p(a);
				} else if (P.check.isArray(a)) {
					for (i = 0; i < a.length; i++){
				
						str += a[i];
					}
					return p(str);
				}
				return false;
				
			};
			
		}
	}


	/** ddmin_number: number -> boolean, number -> number
			ddmin_number(p,param) does:
			p: the predicate
			param: the number
			It sets param to zero and checks
			if this value fulfills p. If it does not,
			the functon will return param.
	*/
	function p_ddmin_number(p, param) {
		function divideByPrims(p, x) {
			var result = 0;
			var testResult = 0;
			var prims = new Array(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31,
					37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
					101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
					157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211,
					223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271,
					277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347,
					349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409,
					419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467,
					479, 487, 491, 499, 503, 509, 521, 523, 541);

			for ( var z = 0; z < prims.length; z++) {
				testResult = Math.round(x / prims[z]);
				if (p(testResult))
					result = testResult;
			}

			return result;
		}
		var result = 0;
		if (!p(param)) {
			throw ("Invalid call to ddmin, it is not allowed to call it with an object "
					+ "that do not pass the predicate");
		} else {
			if (p(0))
				return 0;
			if (p(1))
				return 1;
			if (p(-1))
				return -1;
			if (p(2))
				return 2;
			if (p(-2))
				return -2;
			if (param < 0) {
				result = param - (2 * param);
				if (p(result))
					return p_ddmin(p, result, 2);
			}
			result = divideByPrims(p, param);
			if (result !== 0)
				return p_ddmin(p, result, 2);
			if (!P.check.isInt(param)) {
				var floatResult = param - Math.floor(param);
				var roundedResult = Math.round(param);
				if (p(floatResult))
					return p_ddmin(p, floatResult, 2);
				if (p(roundedResult))
					return p_ddmin(p, roundedResult, 2);
			}
			if (param > 0) {
				result = param - 1;
				if (p(result))
					return p_ddmin(p, result, 2);
			}
			if (param < 0) {
				result = param + 1;
				if (p(result))
					return p_ddmin(p, result, 2);
			}
		}
		return param;
	}
	

	/** ddmin_obj_prop: obj -> boolean, obj	-> obj
			ddmin_obj_prop(p,o) does:
			p: the predicate
			o: an object, that should be minimized. The function
			calls ddmin for each property of the object o.
			
			Therefore a new predicate is generated for each
			property, such that it is ensured that the
			result from o[key] = ddmin(o[key]) does not
			modify o in a way, that p(o) does not holds after
			the assignment.
	*/
	function p_ddmin_obj_array_prop(p, o) {
		var osik, i, key;
		
		if (P.check.isSArray(o)) {
			osik = [];
			for (i = 0; i < o.length; i += 1) {
				osik.push(o[i]);
			}
		} else {
			osik = { };
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					osik[key] = o[key];					
				}
			}
		}
		function createPred(k, o) {
			return function (kprop) {
				var propsik, result;
				
				if (osik.hasOwnProperty(k)) {
					if (kprop === o[k]) {
						return true;
					} else {
						propsik = osik[k];
						osik[k] = kprop;
						result = p(osik);
						osik[k] = propsik;
						return result;
					}
				} else {
					osik[k] = kprop;
					result = p(osik);
					delete osik[k];
				}
			};
		}
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				osik[key] = p_ddmin(createPred(key, o), osik[key], 2);				
			}
		}
		return osik;
	}

	P.ddmin.ddmin = ddmin;
}(JSConTest));
