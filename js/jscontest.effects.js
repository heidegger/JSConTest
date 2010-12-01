/* Version: 0.2.0 */
/* author: Phillip Heidegger */

/* This library will not change the global namespace in any sense. 
	 But it assumes that the global variable JSConTest exists and 
	 register all its methods in JSConTest.effects.
	 
	 In order to change this behavior, please go to the end of the
	 file and pass another object to the function. 
*/

"use strict";
(function (P) {
	// Effect Paths
	var PARAMETER = 1,
		VARIABLE = 2,
		PROP = 3,
		QUESTIONMARK = 4,
		STAR = 5,
		ALL = 6,
		noPROP = 7,
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
		registerEffect,
		fCall, mCall, getParams, getThis, putReturnBox, newCall,
		isWrapperObj;
	
	/* use the new object E and register it in the
		 namespace JSConTest */
	P.effects = E;

	function cfire() {
		var slice = Array.prototype.slice,
			args = slice.apply(arguments);
		
		if (P.events && P.events.create_fire_function &&
				(typeof P.events.create_fire_function === 'function')) {
			return P.events.create_fire_function.apply(this, args);
		}
	}

	getUid = function () { 
		return undefined; 
	};
	getActiveFunName = function () {
		return undefined;
	};
	registerEffect = (function () {
		var i = 0;
		function getGlobalObject() { 
			return this;
		}
		function registerEffect(effl, pl, thisC, fname) {
			var uid = i;
			i += 1;
			effect_store[uid] = effl;
			getUid = (function (uid) {
				return (function () { 
					return uid; 
				});
			}(uid));
			getActiveFunName = (function (fname) {
				return (function () {
					return fname;
				});
			}(fname));
			return uid;
		}
		return registerEffect;
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
		case PARAMETER:
			return ((access_path.type === PARAMETER) && 
							(eff.number === access_path.number) &&
							(eff.type = PARAMETER));
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
			if (access_path.type === PROP) {
				if (isAllowedEff(access_path.effect, eff.effect)) {
					// * == ? works, so just return true
					return true;
				}
				// if * is nothing, just return true 
				if (isAllowedEff(access_path,eff.effect)) {
					return true;
				}
				return isAllowedEff(access_path.effect, eff);
			}
			break;
		case noPROP: 
			return false;
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
			var i, eff;
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
			for (i = 0; i < effl.length; i += 1) {
				eff = effl[i];
				if (isAllow(access_path, eff)) {
					return true;
				}
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
		// if there exists not entry for this uid, access is allowed
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
					eventHandler(o, p,
											 P.utils.valueToString(effStoreToString(effect_store)), 
											 P.utils.valueToString(efflToString(effect_store[uid])));
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
			var i, plub = [], rv, that_ub;

			// store original params 
			if (P.check.isSArray(pl)) {
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
			var result = f.apply(that_ub, plub);
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
			// unbox everything, and put the boxes into the global box space
			if (o && o.THIS_IS_A_WAPPER_b3006670bc29b646dc0d6f2975f3d685) {
				return fmCall((o.reference)[m], o.reference, pl);
			} else {
				return fmCall(o[m], o, pl);
			}			
		});
	}());

	newCall = function(f, pl) {
		function Dummy() {}
		Dummy.prototype = f.prototype;
		var newObj = new Dummy();
		return f.apply(newObj, pl);
	};
	
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

	function effToString(eff) {
		if (!eff) {
			return "NO VALID EFFECT";
		}
		switch (eff.type) {
		case PARAMETER:
			return (eff.fname + ": $" + eff.number);
		case VARIABLE:
			return eff.name;
		case PROP:
			return effToString(eff.effect) + "." + eff.property;
		case QUESTIONMARK:
			return effToString(eff.effect) + ".?";
		case STAR: 
			return effToString(eff.effect) + ".*";
		default: 
			return "NO KNOWN EFFECT TYPE";
		}
	}

	function efflToString(effl) {
		var a, i;
		if ((typeof effl === 'object') && (effl.type === ALL)) {
			return "*";
		}
		a = [];
		for (i = 0; i < effl.length; i += 1) {
			a.push(effToString(effl[i]));
		}
		return a;
	}
	function effStoreToString(eff_store) {
		var obj = {}, uid;
		for (uid in eff_store) {
			if (eff_store.hasOwnProperty(uid)) {
				obj[uid] = efflToString(eff_store[uid]);
			}
		}
		return obj;
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
	
	if (P.tests && P.tests.callback) {
		P.tests.callback.registerEffect = registerEffect;
		P.tests.callback.unregisterEffect = unregisterEffect;
	}

 })(JSConTest);
