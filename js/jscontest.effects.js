/* Version: 0.2.0 */
/* author: Phillip Heidegger */

/* This library will not change the global namespace in any sense. 
	 But it assumes that the global variable JSConTest exists and 
	 register all its methods in JSConTest.effects.
	 
	 In order to change this behavior, please go to the end of the
	 file and pass another object to the function. 
*/

"use strict";
(function (JSConTest) {
	// Effect Paths
	var PARAMETER = 1,
		VARIABLE = 2,
		PROP = 3,
		QUESTIONMARK = 4,
		STAR = 5,
		ALL = 6,
		noPROP = 7,
		regExProp = 8,
		regExVar = 9,
		PURE = 10,
		METASTAR = 11,
		METAregEx = 12,
		
		globalObj = (function () { 
			return this; 
		}()),
		unOpINCPost = 1,
		unOpDECPost = 2,
		unOpINCPre = 3,
		unOpDECPre = 4,
		unOpDELETE = 5,
		E = {},
		// Formal: uid -> (Read,Write)
		// Implementation: uid -> effect attached to function
		// Initially the empty map
		effect_store = {},	
		checkEffect = true,	// should effects be checked?
		getUid,
		getActiveFunName,
		registerEffect, incrementUid,
		fCall, mCall, getParams, getThis, putReturnBox, newCall,
		isWrapperObj;
	
	/* use the new object E and register it in the
		 namespace JSConTest */
	JSConTest.effects = E;

	function cfire() {
		var slice = Array.prototype.slice,
			args = slice.apply(arguments);
		
		if (JSConTest.events && JSConTest.events.create_fire_function &&
				(typeof JSConTest.events.create_fire_function === 'function')) {
			return JSConTest.events.create_fire_function.apply(this, args);
		}
	}

	getUid = function () { 
		return 0; 
	};
	getActiveFunName = function () {
		return undefined;
	};

	(function () {
		var uid = 0;
		
		function incrementUidPrivate() {
			var i = uid;
			uid += 1;
			getUid = (function (i) {
				return (function () { 
					return i; 
				});
			}(i));			
		}
		function registerEffectPrivate(effl, pl, thisC, fname) {
			var i = getUid();
			if (JSConTest.check.isSArray(effl)) {
				// If the effect list effl is an array,
				// it contains a list of positiv permissions
				effect_store[i] = {pos: effl };
			} else {
				// otherwise, the object is expected
				effect_store[i] = effl;
			}
			getActiveFunName = (function (fname) {
				return (function () {
					return fname;
				});
			}(fname));
			return i;
		}

		registerEffect = registerEffectPrivate;
		incrementUid = incrementUidPrivate;
	}());
	function unregisterEffect(uid) {
		delete effect_store[uid];
	}
	
	// eff is an entry of an entry in the effect store
	// context_for_uid is the first path to the object, 
	// that was used to read it for the corresponding context
	// our task here is, to check if a read access is valid here
	function isAllowedEff(access_path, eff) {
		switch (eff.type) {
		case PURE: 
			return false;
		case PARAMETER:
			return ((access_path.type === PARAMETER) && 
							(eff.number === access_path.number));
		case VARIABLE:
			return ((access_path.type === VARIABLE) &&
							(eff.name === access_path.name) &&
							(eff.type === VARIABLE));
		case PROP:
			if ((access_path.type === PROP) && 
					(access_path.property === eff.property) &&
					(eff.type === PROP)) {
				return isAllowedEff(access_path.effect, eff.effect);
			} else {
				return false;
			}
			break;
		case QUESTIONMARK:
			if ((access_path.type === PROP) && (eff.type === PROP)) {
				return isAllowedEff(access_path.effect, eff.effect);
			} else {
				return false;
			}
			break;
		case STAR: 
			// if * is nothing, just return true 
			if (isAllowedEff(access_path,eff.effect)) {
				return true;
			}
			if (access_path.type === PROP) {
				if (isAllowedEff(access_path.effect, eff.effect)) {
					// * == ? works, so just return true
					return true;
				}
				// remove the property, but keep the *
				return isAllowedEff(access_path.effect, eff);
			}
			break;
		case regExProp:
			if ((access_path.type === PROP) && eff.regEx) {
				if (eff.regEx.test(access_path.property)) {
					return isAllowedEff(access_path.effect, eff.effect);
				}
			}
			return false;
		case regExVar:
			if ((access_path.type === VARIABLE) && eff.regEx) {
				if (eff.regEx.test(access_path.name)) {
					return true;
				}
			}
			return false;
		case noPROP: 
			return false;
		case METASTAR:			
			// if match works with (regEx)* = nothing, just return true 
			if (isAllowedEff(access_path,eff.effect)) {
				return true;
			}
			// here the METSTAR has to consume something
			// it is only allowed to consume properties, hence
			// at least a property must be consumed
			if (access_path.type === PROP) {
				// the check is a regular expression on properties
				if (eff.regEx) {
					if (eff.regEx.test(access_path.property)) {
						// the property matches, hence remove it
						return isAllowedEff(access_path.effect, eff);
					}					
				}
				// the check is a property name
				if (eff.property) {
					if (eff.property === access_path.property) {
						// the property matches, hence remove it
						return isAllowedEff(access_path.effect, eff);
					}						
				}
			}
			return false;
		case METAregEx:
			return eff.regEx.test(apToString(access_path));
		default: 
			return false;
		}
	}

	function isAllowedEffAllPrefixes(access_path, eff) {
		if (isAllowedEff(access_path, eff)) {
			return true;
		} else {
			if (eff.effect) {
				return isAllowedEffAllPrefixes(access_path, eff.effect);
			} else {
				return false;
			}
		}
	}


	function isAllowedEffl(uid, access_pathl, effl, isAllow) {
		function isAllowedEffl_priv(access_path) {
			var i, eff, perm = false;
			// each entry in the effect store, that is 
			// not younger then the object itself, is allowed
			if (access_path && (access_path.alloc >= uid)) {
				return true;
			}
			if ((typeof effl === 'object') && (effl.type === ALL)) {
				return true;
			}
			// if the object is older then the entry in the effect store
			// check the access. Here, one of them must allow the access

			// an effl, that is an array is a list of positive effects
			if (JSConTest.check.isSArray(effl)) {
				for (i = 0; i < effl.length; i += 1) {
					eff = effl[i];
					if (isAllow(access_path, eff)) {
						return true;
					}
				}				
			}

			// if effl is an object without tupe === ALL, it is an
			// object storing a list of positive effects in the property
			// pos as an array, and maybe a list of negative permissions
			// in the property neg.
			if ((typeof effl === 'object') && effl.pos) {
				// first check, if there is a permission granting the access
				i = 0;
				while (perm === false && i < effl.pos.length) {
					eff = effl.pos[i];
					if (isAllow(access_path, eff)) {
						perm = true;
					}
				}
				// if perm is false, there was no positive permission for
				// this access, hence we only have to worry, if perm is
				// positive.
				
				if (perm && effl.neg && JSConTest.check.isSArray(effl.neg)) {
					// If we have a permission, and a negative list of permissions,
					// now lets check, if a negative permission matches
					i = 0;
					while (perm === true && i < effl.neg.length) {
						eff = effl.pos[i];
						if (isAllow(access_path, eff)) {
							// permisssion is rejected, hence quit with false
							return false;
						}
					}					
				}
				// return the permission
				return perm;
			}
			return false;			
		}
		var j;
		// if one access path is valid, the access is allowed
		for (j = 0; j < access_pathl.length; j += 1) {
			if (isAllowedEffl_priv(access_pathl[j])) {
				return true;
			}
		}
		return false;
	}
	
	function checkReadWrite(uid, access_pathl, isAllow) {
		if (!checkEffect) {
			return true;
		}
		var effl = effect_store[uid];
		// if there exists no entry for this uid, access is allowed
		if (!effl) {
			return true;
		}
		// there exists an entry for the uid, hence check if access is
		// forbidden.
		return isAllowedEffl(uid, access_pathl, effl, isAllow);
	}

	function checkRead(uid, access_pathl) { 
		return checkReadWrite(uid, access_pathl, isAllowedEffAllPrefixes);
	}

	function checkWrite(uid, access_pathl) { 
		return checkReadWrite(uid, access_pathl, isAllowedEff);
	}

	/** { obj: object,
				object_pmap: uid -> access_path,
				property: string,
				check: ... -> ..., 
				eventHandler: ... -> void } -> void */
	function check_obj_access(param) {
		var o						= param.obj,
				opm					= param.object_pmap,
				p						= param.property,
				check				= param.check,
				eventHandler = param.eventHandler,
				obj_context, new_context, uid, j;
		for (uid in opm) {
			if (opm.hasOwnProperty(uid)) {
				obj_context = opm[uid];
				new_context = [];
				for (j = 0; j < obj_context.length; j += 1) {
					new_context.push({ type : PROP,
						property : p,
						effect : obj_context[j]
					}); 
				}
				if (!check(uid, new_context)) {
					setFunNameEffl(new_context,getFunNameEffl(effect_store[uid]))
          eventHandler(o, p,
					             JSConTest.utils.valueToString(effStoreToString(effect_store)), 
					             JSConTest.utils.valueToString(efflToStringArray(effect_store[uid])),
					             new_context);
				}				
			}
		}
	}

	function propAcc(wo, wp) {
		function read(o, p, apo, app) {
			// checks if read is allowed using apo
			check_obj_access({ obj: o,
												 object_pmap: apo,
												 property: p, 
												 check: checkRead, 
												 eventHandler: cfire('assertEffectsRead')
											 });
			
			// box the result, and add the new access path
			// to the wrapper.
			// uses informations stored in o.__infos__ to
			// create correct box, if needed.
			var result = o[p], napo;
			if (result && result.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
				// the property value is already boxed
				return result;
			} else {
				if (apo) {
					// information found in the wrapper of o
					// TODO: extend apo with p, create new wrapper
					// return the new wrapper
					napo = extend_path(apo, p);
					return new Create_wrapper_with_pmap(result, napo);
				} else {
					if (o && (o.__infos__) && (o.__infos__)[p]) {
						// information is found in host object
						return new Create_wrapper_with_pmap(result, (o.__infos__)[p]);
					} else {
						// no information in the property and in the host object,
						// and no wrapper ==> this should never happen
						throw "No box info for property value!";
					}
				}
			}
		}
		return doWithUnwrap2(wo, wp, read);		
	}

	function propAss(wo, wp, wv) {
		function write(o, p, v, apo, app, apv) {
			// checks if read is allowed using apo
			check_obj_access({ obj: o,
												 object_pmap: apo,
												 property: p, 
												 check: checkWrite, 
												 eventHandler: cfire('assertEffectsWrite')
											 });

			// store unboxed value in the object
			o[p] = v;
			
			if (apv) {
				// store in o the information about the access
				// path of the property p (which is apv)
				// reading will extract the access path and
				// create a correct box for the value if needed
				if (!(o.__infos__)) {
					o.__infos__ = { };
				}
				o.__infos__[p] = apv;			
			}
			return undefined;
		}
		return doWithUnwrap3(wo, wp, wv, write);
	}

	(function () {
		var wrapper_exits = false,
			fmCall,
			getReturnBox, putThisParams, deleteThisParams,
			global_obj = (function () { 
				return this; 
			}());

		(function () {
			var that = false, pl = false;
			getParams = (function () {
				var tmp = pl;
				pl = false;
				return tmp;
			});
			getThis = (function () {
				var tmp = that;
				that = false;
				return tmp;
			});
			putThisParams = (function (thatp, plp) {
				that = thatp;
				pl = plp;
			});			
			deleteThisParams = (function () {
				that = false;
				pl = false;
			});
		}());

		(function () {
			var return_box = false;
			putReturnBox = (function (rv) {
				if (rv && rv.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
					return_box = { box: rv };
					return unbox(rv);
				} else {
					return_box = false;
					return rv;
				}
			});			
			getReturnBox = (function (rv) {
				var b = rv;
				if (return_box) {
					b = return_box.box;
					return_box = false;
				}
				return b;
			});
		}());
		
		fmCall = (function fCall(f, that, pl) {
			var i, plub = [], rv, that_ub, result;

			// store original params 
			if (JSConTest.check.isSArray(pl)) {
				putThisParams(that, pl);				
			} else {
				throw "you have to call fCall and mCall with an array to pass the function parameters."; 
			}
			for (i = 0; i < pl.length; i += 1) {
				plub.push(unbox(pl[i]));
			}
			that_ub = unbox(that);
			
			// now every original parameter is stored inside of boxes, 
			// hence we can do the call with the values (not with the boxes)
			// transformed functions will ask for the boxes of their own
			// by unsing enableWrapper, and native functions will work correctly 
			// with the original unboxed value
			// the return value of the function is always the unboxed return value.
			// Native functions will of cause return unboxed values,
			// and tranformed functions does also return unboxed value and
			// stores the box of the return value inside the return_box object.
			// Hence fCall will find the box there, and can the return the box instead
			// of the unboxed result.

			
			// if we called a tranformed function with mcall, the transformed function
			// stores the box of the return value using putReturnBox. If that's the case, 
			// we should return the boxed value, not the unboxed one.
			
			// but before we can call the function, we have to incremnt the
			// uid, to be able to distinguish effects registers by the method 
			// and new objects created

			incrementUid();
			result = f.apply(that_ub, plub);
			deleteThisParams();
			return getReturnBox(result);
		});

		fCall = (function fCall(f, pl) {
			return fmCall(f, global_obj, pl);
		});
		
		mCall = (function mCall(o, m, pl) {
			// FIXME: deal with the situation, that m is also a box
			//			 take the value of m, convert it to a string, do
			//			 the method call with this string
			// unbox the mothod itself, but not the this value, and the paremter,
			// since this is done in fmcall.
			if (o && o.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
				return fmCall((o.reference)[m], o, pl);
			} else {
				return fmCall(o[m], o, pl);
			}			
		});

		newCall = function (f, pl) {
			function Dummy() { }
			Dummy.prototype = f.prototype;
			var newObj = new Dummy(),
				result = fmCall(f, newObj, pl);
			// a constructor returns the value return by a
			// return statement, if that was != undefined
			// If the return value is === undefined, the new
			// created object is returned.

			// the result might be a wrapper
			if (result && result.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
				if (!result.reference) {
					result.reference = newObj;
					return result;
				} else {
					return result;
				}
			}

			// the result was not a wrapper
			if (!result) {
				return newObj;
			} else {
				return result;
			}
		};
	}());

	
	isWrapperObj = {
		THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685: true
	};
	function Create_wrapper_with_pmap(value, pmap) {
		this.reference = value;
		if (pmap) {
			this.p_map = pmap;
		} else {
			this.p_map = {};
		}
	}
	Create_wrapper_with_pmap.prototype = isWrapperObj;

	function extend_path(p_map, property) {
		var result = {}, uid, j;
		for (uid in p_map) {
			if (p_map.hasOwnProperty(uid)) {
				result[uid] = [];
				for (j = 0; j < p_map[uid].length; j += 1) {
					result[uid].push({
						effect: p_map[uid][j],
						type: PROP,
						property: property
					});
				}				
			}
		}
		return result;
	}

	function add_access_path(b, prop) {
		var uid	 = getUid(),
				fname = getActiveFunName(),
				p,
				path;
		if (b && b.p_map) {
			path = { fname : fname };
			for (p in prop) {
				if (prop.hasOwnProperty(p)) {
					path[p] = prop[p];					
				}
			}
			if (!b.p_map[uid]) {
				b.p_map[uid] = [path];
			} else {
				b.p_map[uid].push(path);
			}
		} else {
			throw "Internal box error";
		}
		return b;
	}

	function with_box(value) {
		if (value && value.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			return value;
		} else {
			return new Create_wrapper_with_pmap(value);
		}
	}

	function isBox(value) {
		return (value && value.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685);
	}
	
	function box_this(value) {
		var b = with_box(value);
		return add_access_path(b, { name: "this", type: VARIABLE });
	}
	
	function box(vname, value) {
		var b = with_box(value);
		return add_access_path(b, { name: vname, type: VARIABLE});
	}

	function box_param(index, value) {
		var b = with_box(value);
		return add_access_path(b, { number: index, type: PARAMETER });
	}

	function unbox(value) {
		if (value && value.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			return unbox(value.reference);
		} else {
			return value;
		}
	}

	function doWithUnwrap(w, f) {
		var v, ap;
		if (w && w.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v = w.reference;
			ap = w.p_map;
		} else {
			v = w;
		}
		return f(v, ap);
	}
	function doWithUnwrap2(w1, w2, f) {
		var v1, v2, ap1, ap2;
		if (w1 && w1.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v1 = w1.reference;
			ap1 = w1.p_map;
		} else {
			v1 = w1;
		}
		if (w2 && w2.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v2 = w2.reference;
			ap2 = w2.p_map;
		} else {
			v2 = w2;
		}
		return f(v1, v2, ap1, ap2);
	}
	function doWithUnwrap3(w1, w2, w3, f) {
		var v1, v2, v3, ap1, ap2, ap3;
		if (w1 && w1.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v1 = w1.reference;
			ap1 = w1.p_map;
		} else {
			v1 = w1;
		}
		if (w2 && w2.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v2 = w2.reference;
			ap2 = w2.p_map;
		} else {
			v2 = w2;
		}
		if (w3 && w3.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
			v3 = w3.reference;
			ap3 = w3.p_map;
		} else {
			v3 = w3;
		}
		return f(v1, v2, v3, ap1, ap2, ap3);
	}

	function apToString(ap) {
		if (!ap) {
			return "NO VALID EFFECT";
		}
		switch (ap.type) {
		case PARAMETER:
			return (ap.fname + ": $" + ap.number);
		case VARIABLE:
			if (ap.fname) {
				return (ap.fname + ": " + ap.name);
			} else {
				return ap.name;				
			}
			break;
		case PROP:
			return apToString(ap.effect) + "." + JSON.stringify(ap.property);
		}
	}
	
	function effToString(eff) {
		if (!eff) {
			return "NO VALID EFFECT";
		}
		switch (eff.type) {
		case PARAMETER:
			return (eff.fname + ": $" + eff.number);
		case VARIABLE:
			if (eff.fname) {
				return (eff.fname + ": " + eff.name);
			} else {
				return eff.name;				
			}
			break;
		case PROP:
			return effToString(eff.effect) + "." + JSON.stringify(eff.property);
		case QUESTIONMARK:
			return effToString(eff.effect) + ".?";
		case STAR: 
			return effToString(eff.effect) + ".*";
		case noPROP:
			return effToString(eff.effect) + ".@";
		case PURE:
			return eff.fname + "@";
		default: 
			return "NO KNOWN EFFECT TYPE: " + JSConTest.utils.valueToString(eff);
		}
	}

	function efflToStringArray(effl) {
		var a, b, i;
		if ((typeof effl === 'object') && (effl.type === ALL)) {
			return "*";
		}
		if (JSConTest.check.isSArray(effl)) {
			a = [];
			for (i = 0; i < effl.length; i += 1) {
				a.push(effToString(effl[i]));
			}
			return a;			
		}

		if ((typeof effl === 'object') && effl.pos && !effl.neg) {
			a = [];
			for (i = 0; i < effl.pos.length; i += 1) {
				a.push(effToString(effl[i]));
			}	
			return a;
		}

		if ((typeof effl === 'object') && effl.pos && effl.neg) {
			a = [];
			for (i = 0; i < effl.pos.length; i += 1) {
				a.push(effToString(effl[i]));
			}
			b = [];
			for (i = 0; i < effl.neg.length; i += 1) {
				b.push(effToString(effl[i]));
			}			
			return {pos: a, neg: b};
		}
	}
	function effStoreToString(eff_store) {
		var obj = {}, uid;
		for (uid in eff_store) {
			if (eff_store.hasOwnProperty(uid)) {
				obj[uid] = efflToStringArray(eff_store[uid]);
			}
		}
		return obj;
	}
	function getFunNameEff(eff) {
		if (!eff) {
			return "NO VALID EFFECT";
		}
		switch (eff.type) {
		case PARAMETER:
			return eff.fname;
		case VARIABLE:
			return eff.fname;
		case PURE: 
			return eff.fname;
		case PROP:
			return getFunNameEff(eff.effect);
		case QUESTIONMARK:
			return getFunNameEff(eff.effect);
		case STAR: 
			return getFunNameEff(eff.effect);
		case noPROP:
			return getFunNameEff(eff.effect);
		default: 
			return "NO KNOWN EFFECT TYPE: " + JSConTest.utils.valueToString(eff);
		}		
	}
	function getFunNameEffl(effl) {
		if (typeof effl === 'object' && effl.pos) {
			return getFunNameEff(effl.pos[0]);
		}
		if (!effl || effl.length < 1) {
			return getActiveFunName();
		}
		return getFunNameEff(effl[0]);
	}
	
	function setFunNameEff(eff, fname) {
		if (!eff) {
			return "NO VALID EFFECT";
		}
		switch (eff.type) {
		case PARAMETER:
			eff.fname = fname;
			break;
		case VARIABLE:
			eff.fname = fname;
			break;
		case PROP: 
			setFunNameEff(eff.effect, fname); 
			break;
		case QUESTIONMARK: 
			setFunNameEff(eff.effect, fname);
			break;
		case STAR: 
			setFunNameEff(eff.effect, fname);
			break;
		case noPROP: 
			setFunNameEff(eff.effect, fname);
			break;
		case PURE: 
			eff.fname = fname;
			break;
		}
	}
	function setFunNameEffl(effl, fname) {
		var i;
		if (typeof effl === 'object' && effl.pos) {
			for (i = 0; i < effl.pos.length; i += 1) {
				setFunNameEff(effl.pos[i], fname);			
			}
			if (effl.neg) {
				for (i = 0; i < effl.neg.length; i += 1) {
					setFunNameEff(effl.neg[i], fname);			
				}				
			}
		} else {
			for (i = 0; i < effl.length; i += 1) {
				setFunNameEff(effl[i], fname);			
			}			
		}
		
	}
	
	// enableWrapper sorounds f with a wrapper, such that
	// the resulting function can handle wrappers.
	// There we have to respect the following two things:
	// 1. We would like to call f with wrappers
	// 2. Our function is called with native values, and
	//		the corresponding wrappers might be stored by fmCall for us.
	// Hence we have to look up for the wrappers, and if they exists, 
	// we have to extend them. If they do not exists, we do not have
	// effect to respect from outside, so we will create new wrappers for
	// ourself.
	// As next step we call the original f with the wrapped arguments.
	// The return value of the function might be a wrapper, too.
	// If that is the case, we have to remove it, since our function
	// may be called from untransformed code that does not use 
	// mCall or fCall.
	// But to allow mCall and fCall to restore the wrapper for us, 
	// we will save the result wrapper using the function 
	// return_box for them. 
	function enableWrapper(f, pnames) {
		return (function () {
			var i, 
				pl = [],

				// we should have a look at the boxes stored for us to pass aditional
				// informations about the parameters
				// If these boxes does not exits, use the parameters passed to us
				plorg = getParams() || arguments,
				// Analogious for this
				that = box_this(getThis() || this);
				
			// mark parameters with names and numbers
			for (i = 0; i < pnames.length; i += 1) {
				pl.push(box_param(i + 1, box(pnames[i], plorg[i])));
			}
			// mark the rest of the parameters with numbers, only,
			// since there does not exists any name for them
			for (; i < plorg.length; i += 1) {
				pl.push(box_param(i, plorg[i]));
			}
			
			// return_box will store a wrapper (if it exists) in
			// the return_box store, such that fmCall can pick it up.
			// But the function itself will return the nativ unboxed value.
			// This is needed, our function may be a callback function,
			// that was called from untransfered code.
			return putReturnBox(f.apply(that, pl));
		});
	}

	function unOp(op, o, p) {
		function doOp(o, p, apo, app) {
			check_obj_access({ obj: o,
				object_pmap: apo,
				property: p, 
				check: checkWrite, 
				eventHandler: cfire('assertEffectsWrite') // FIXME: we also need to fire Read!
			});
			if (op === unOpINCPost) {
				return o[p]++;
			}
			if (op === unOpDECPost) {
				return o[p]--;
			}
			if (op === unOpINCPre) {
				return ++o[p];
			}
			if (op === unOpDECPre) {
				return --o[p];
			}
			if (op === unOpDELETE) {
				return delete o[p];
			}
		}
		return doWithUnwrap2(o, p, doOp);
	}
	
	function fixObjectLiteral(o) {
		var pw, p;
		for (p in o) {
			if (o.hasOwnProperty(p)) {
				pw = o[p];
				if (pw && pw.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
					if (!(o.__infos__)) {
						o.__infos__ = { };					
					}
					o.__infos__[p] = pw;
					o[p] = unbox(o[p]);
				}				
			}
		}
		return o;
	}
	function toPure(effl, fname) {
		if (typeof effl === 'object' && effl.pos && effl.pos.length > 0) {
			return effl;
		}		
		if (!effl || effl.length < 1) {
			return [{type: PURE, fname: fname}];
		} else {
			return effl;
		}
	}
	
	E.toPure = toPure;
	E.isBox = isBox;
	E.unbox = unbox;
	E.mCall = mCall;
	E.fCall = fCall;
	E.propAss = propAss;
	E.propAcc = propAcc;
	E.enableWrapper = enableWrapper;
	E.unOp = unOp;
	E.fixObjectLiteral = fixObjectLiteral;
	E.newCall = newCall;
	//E.box = box;
	//E.box_param = box_param;
	//E.box_this = box_this;
	//E.returnBox = returnBox;
	//E.getBoxes = getBoxes;
	
	if (JSConTest.tests && JSConTest.tests.callback) {
		JSConTest.tests.callback.registerEffect = registerEffect;
		JSConTest.tests.callback.unregisterEffect = unregisterEffect;
	}

 })(JSConTest);
