/* Version: 0.1.1 */
/* author: Peter Thiemann, Phillip Heidegger */

"use strict";
(function (JSConTest) {
	var 
		//the namespace itself
		SELF = {}, 

	// TODO: what's this?
		myEffects,
	
		// types of effects, 
		// TODO: since jscontest.effects.js and this module share
		//       these, put them in one place!
		PARAMETER = 1,                 
		VARIABLE = 2,
		PROP = 3,
		QUESTIONMARK = 4,
		STAR = 5,
		ALL = 6,
		noPROP = 7,
		regExProp = 8,
		regExVar = 9,
		
		// regular expression for positiv integers
		positivenum = /^[0-9][0-9]*$/, 
		
		// the local config data
		gconfig,
		
		// function with state variable
		sliderControl,
		sliderControlNamed;

	// register the self object in the JSConTest event handler namespace
	JSConTest.events.handler.effects = SELF;

	// initialize global config default values
	gconfig = { gdef: { HIGH_DEGREE: 20 }, def : {} };
	

	// an access path <acp> is
	// {type: PROP, property: "name", effect: <acp>}
	// {type: PARAMETER, number: anInt, fname: "fun_identifier"}
	// {type: VARIABLE, name: "var_identifier", }

	function acpToPath(acp) {
		var r;
		if (acp.type === PROP) {
			r = acpToPath(acp.effect);
			r.push(acp.property);
			return r;
		}
		if (acp.type === PARAMETER) {
			return [acp.fname, '$' + acp.number];
		}
		if (acp.type === VARIABLE) {
			return [acp.fname, acp.name];
		}
	}
	
	function readPath(acp) {
		var r = acpToPath(acp);
		r.push("@");
		return r;
	}
	
	function writePath(acp) {
		return acpToPath(acp);
	}
	
	// NOT USED:
	// an access effect <ace> extends this by
	// {type: QUESTIONMARK, effect: <ace>}
	// {type: STAR, effect: <ace>}
	// {type: noPROP}
	
	////////////////////////////////////////////////////////////////
	// printing
	function innerObjectToString(o) {
		var acc = [], 
			p;
		for (p in o) {
			if (o.hasOwnProperty(p)) {
				acc.push('"' + p + '": ' + objectToString(o[p]));
			}
		}
		return acc.join(", ");
	}	
	
	function innerArrayToString(a) {
		var acc = [], 
	  	i;
		for (i = 0; i < a.length; i += 1) {
			acc.push(objectToString(a[i]));
		}
		return acc.join(", ");
	}
	
	function objectToString(o) {
		if (typeof o === "object") {
			if (o === null) {
				return "null";
			} else if (o.constructor === Array) {
				return '[' + innerArrayToString(o) + ']';
			} else {
				return '{' + innerObjectToString(o) + '}';
			}
		} else if (typeof o === "string") {
			return '"' + o + '"';
		} else if (typeof o === "undefined") {
			return "undefined";
		} else {
			return o.toString();
		}
	}

	////////////////////////////////////////////////////////////
	// An effect structure <es> is an object of the following form
	// <es> ::= {n: NUMBER, succ: <hash>}
	// <hash> ::= an object where each property is an <es>
	function emptyES() {
		return {n: 0, succ: {}};
	}
	
	// test emptiness of effect structure
	function isEmptyES(es) {
		return (es.n == 0);      // TODO: really ==, if possible use === ???
	}

	// collect all property names in effect structure
	function propertyNamesOfES(es) {

		function h(es, acc) {
			var ht = es.succ,
				p;
			for (p in ht) {
				if (ht.hasOwnProperty(p)) {
					if (acc.indexOf(p) < 0) {
						acc.push(p);
					}
					h(ht[p], acc);
				}
			}
			return acc;
		}

		return h(es, []);
	}
	
	// length of longest string in es
	function greatestLengthOfES(es) {
		if (es.n == 0) {    // TODO: really ==? why not ===?
			return -Infinity;
		}
		var localsize = 0,
			ht = es.succ,
			pathstep;
		for (pathstep in ht) {
			if (ht.hasOwnProperty(pathstep)) {
				localsize = Math.max(localsize, 1 + greatestLengthOfES(ht[pathstep]));
			}			
		}
		return localsize;
	}
	
	// length of shortest string in es
	function shortestLengthOfES(es) {
		var globalnumber = es.n,
	  	ht,
	  	localnumber,
	  	localsize,
	  	pathstep,
	  	esOfPathstep;

		if (globalnumber == 0) {  // TODO: ==? why not ===
			return Infinity;
		}
		ht = es.succ;
		localnumber = 0;
		localsize = Infinity;
		for (pathstep in ht) {			
			if (ht.hasOwnProperty(pathstep)) {
				esOfPathstep = ht[pathstep];
				localnumber += esOfPathstep.n;
				localsize = Math.min(localsize, 1 + shortestLengthOfES(esOfPathstep));
			}
		}
		if (localnumber < globalnumber) {
			return 0;
		} else {
			return localsize;
		}
	}
	
	// length of prefix common to all elements of es
	// strict means we are looking for the common prefix of all elements of es
	// non-strict means that we are looking for the prefix of the first branch point
	function lengthOfCommonPrefix(es, strict) {
		var localsize = es.n,
	  	ht,
	  	count,
	  	pathstep,
	  	p;
	  
		if (localsize == 0) {
			return 0;
		}
		ht = es.succ;
		count = 0;
		for (p in ht) {
			if (ht.hasOwnProperty(p)) {
				count += 1;
				pathstep = p;
			}
		}
		if (count != 1) { //TODO: why !=, and not !==?
			return 0;
		}
		if (strict && localsize != ht[pathstep].n) { //TODO: why !=, and not !==?
			return 0;
		}
		return 1 + lengthOfCommonPrefix(ht[pathstep], strict);
	}
	
	// number l such that no element of es is a proper prefix of the
	// set of l-prefixes of es
	function lengthOfStrictPrefixes(es) {
		var localsize = es.n,
			ht,
			subsize,
			sublength,
			p,
			losp;
		
		if (localsize == 0) {  // TODO: why ==, and not ===?
			return 0;
		}
		ht = es.succ;
		subsize = 0;
		sublength = Infinity;
	  // var subgreatestlength = -Infinity;
		for (p in ht) {
			if (ht.hasOwnProperty(p)) {
	      // var greatestLength = greatestLengthOfES (ht[p]);
				losp = lengthOfStrictPrefixes(ht[p]);
				subsize += ht[p].n;
				sublength = Math.min(sublength, 1 + losp);
			}			
		}
		
		// TODO: why !=, ==, and not !==, ===?
		if (subsize != localsize || sublength == Infinity) { 
			return 0;
		} else {
			return sublength;
		}
	}

	// put variable declaration at top of source element list,
	// otherwise overview, whats in scope is lost in large files!
	//var positivenum = /^[0-9][0-9]*$/;
	  
	// merge a new path into an effect structure
	function addPath(es, path) {
		var ht, 
			i,
			pathstep;
		
		es.n += 1;
		ht = es.succ;
		for (i = 0; i < path.length; i += 1) {
			pathstep = path[i];
			if (positivenum.exec(pathstep)) { // array access
				pathstep = '#'; 
			}
			if (ht.hasOwnProperty(pathstep)) {
				es = ht[pathstep];
				es.n += 1;
			} else {
				es = {n: 1, succ: {}};
				ht[pathstep] = es;
			}
			ht = es.succ;
		}
	}
	
	// collapses sub-tries of nodes with high outdegree
	// start collapsing below depth
	// it's a bit of a pity that we forget which properties we collapse
	function collapseHighDegree(es, depth, degree) {
		var subtrie,
			subtries = [],
			ht = es.succ,
			newht = {},
			p;
	  
		for (p in ht) {
			if (ht.hasOwnProperty(p)) {
				subtries.push(ht[p]);
			}			
		}
	  
		if (subtries.length <= degree || depth > 0) {
	    // no merge, but recursively collapse subtries
			for (p in ht) {				
				if (ht.hasOwnProperty(p)) {
					subtrie = collapseHighDegree(ht[p], depth - 1, degree);
					newht[p] = subtrie;
				}
			}
			return {n: es.n, succ: newht};
		} else {
	    // need to merge the tries
			subtrie = emptyES();
			subtries.forEach(function (es1) {
				subtrie = merge(subtrie, es1);
			});
			subtrie = collapseHighDegree(subtrie, depth - 1, degree);
			return {n: es.n, succ: {"?": subtrie}};
		}
	}

	// merge two tries
	function merge(es1, es2) {
		var nrOfEntries = es1.n + es2.n,
			succ1 = es1.succ,
			succ2 = es2.succ,
			newsucc = {},
		  // collect all property names
			props1 = [],
			props2 = [],
			props12 = [], // common props
			p; 

		for (p in succ1) {
			if (succ1.hasOwnProperty(p)) {
				if (succ2.hasOwnProperty(p)) {
					props12.push(p);	      	
				} else {
					props1.push(p);      	
				}
			}
	    /* TODO: or was that the intention?
	    if (succ1.hasOwnProperty (p)) {
	      if (succ2.hasOwnProperty (p)) {
	      	props12.push (p);	      	
	      } 
	    } else {
      	props1.push (p);      	
      } */
		}
		for (p in succ2) {
			if (succ2.hasOwnProperty(p) && props12.indexOf(p) < 0) {
				props2.push(p);	  		
			}
		}

	  // copy independent properties, merge common properties
		props1.forEach(function (p) { 
			newsucc[p] = succ1[p]; 
		});
		props2.forEach(function (p) { 
			newsucc[p] = succ2[p]; 
		});
		props12.forEach(function (p) { 
			newsucc[p] = merge(succ1[p], succ2[p]); 
		});

		return {n: nrOfEntries, succ: newsucc};
	}

	// remove subsumed reads (non destructive)
	// i.e. hashtable entries for @ that have non-@ siblings
	// (currently not needed anymore)
	function cleanReads(es) {
		var ht = es.succ,
	  	nrOfEntries = es.n,
	  	newht = {},
	  	newNrOfEntries = 0,
	  	subsize = 0,
	  	readFlag = 0,
	  	p;

		for (p in ht) {
			if (ht.hasOwnProperty(p)) {
				subsize += ht[p].n;
				if (p === '@') {
					readFlag = ht[p].n;
				} else {
					newht[p] = cleanReads(ht[p]);
					newNrOfEntries += newht[p].n;
				}
			}			
		}		
		if (readFlag > 0 && newNrOfEntries == 0) { // TODO: why ==?
			newht['@'] = ht['@'];
			newNrOfEntries = readFlag;
		}
		newNrOfEntries += nrOfEntries - subsize; // writes ending here

		return {n: newNrOfEntries, succ: newht};
	}

	// create an effect structure from a list of paths
	function createESfromPaths(paths) {
		var es = emptyES(),
			i;
		
		for (i = 0; i < paths.length; i += 1) {
			addPath(es, paths[i]);
		}
		return es;
	}
	
	// dereference a path in an effect structure
	function getQuotient(es, path) {
		var ht = es.succ,
			i;
		
		for (i = 0; i < path.length; i += 1) {
			es = ht[path[i]];
			if (!es) {
				return emptyES(); // non existing path
			}
			ht = es.succ;
		}
		return es;
	}
	
	// get all quotients 
	function getQuotients(es, paths) {
		var ess = [],
	  	i;
	  
		for (i = 0; i < paths.length; i += 1) {
			ess.push(getQuotient(es, paths[i]));
		}
		return ess;
	}
	
	// get all (reversed) suffixes from an effect structure
	function getSuffixes(es) {
		var collect = [],
			globalsize = es.n,
			ht = es.succ,
			subsizes = 0,
			i,
			pathstep,
			subSuffixes,
			subSuffix;
	  
		for (i in ht) {
			if (ht.hasOwnProperty(i)) {
				subsizes += ht[i].n;
			}	  	
		}
		if (subsizes < globalsize) {
			collect.push([]);			
		}
	
		for (pathstep in ht) {
			if (ht.hasOwnProperty(pathstep)) {
				subSuffixes = getSuffixes(ht[pathstep]);
				for (i = 0; i < subSuffixes.length; i += 1) {
					subSuffix = subSuffixes[i];
					subSuffix.push(pathstep);
					collect.push(subSuffix);
				}
			}			
		}
	
		return collect;
	}
	
	// obtain the set of interesting prefixes of an effect structure
	// * all returned prefixes are shorter than depth
	// * the prefixes end in a node that is reached by more than
	//   globalfrac * globalsize paths 
	function getInterestingPrefixes(es, /*int*/ depth, /*double*/ globalfrac) {
		depth = depth || 1;
		globalfrac = globalfrac || 0;
	
		var collect = [],
	  	globalsize = es.n;
	    
		function computeWeights(es) {
			var weights = {},
				min_weight = +Infinity,
				max_weight = -Infinity,
				pathstep,
				w;
			
			// TODO: where does ht come from? 
			for (pathstep in ht) {
				if (ht.hasOwnProperty(pathstep)) {
					w = ht[pathstep].n / localsize;
					min_weight = Math.min(min_weight, w);
					max_weight = Math.max(max_weight, w);
					weights[pathstep] = w;
				}	    	
			}
			// what to do with this information?
		}
	
		function cutoff(es) {
			var localsize = es.n;
			return (localsize <= globalfrac * globalsize);	// branch empty or too unlikely?
		}
	
		function h(es, i, sofar) {
			var ht,
				pathstep,
				nsucc = 0,
				subsizes = 0,
				lastprop = '';
			
			if (i == depth) { // TODO: why ==, instead of ===?	
				collect.push(cloneArray(sofar));
			} else {	
				ht = es.succ;
				for (pathstep in ht) {
					if (ht.hasOwnProperty(pathstep)) {
						if (cutoff(ht[pathstep])) {
							collect.push(cloneArray(sofar));
							return;
						}
					}	      	
				}
	
				for (pathstep in ht) {
					if (ht.hasOwnProperty(pathstep)) {
						sofar.push(pathstep);
						h(ht[pathstep], i + 1, sofar);
						sofar.pop();
						lastprop = pathstep;
						subsizes += ht[pathstep].n;
						nsucc += 1;
					}	      	
				}
				// TODO: why == instead of === ?
				if (nsucc == 0 || (subsizes < es.n && lastprop === '@')) {
	      	// second part means that we have a path that is read and written
					collect.push(cloneArray(sofar));
				}
			}
		}
	
		h(es, 0, []);
		return collect;
	}
	
	// shallow copy of an array
	function cloneArray(a) {
		var r = [],
			i;
		for (i = 0; i < a.length; i += 1) {
			r[i] = a[i];
		}
		return r;
	}
	
	// create an access permission from a prefix
	function createAPStringfromPrefix(prefix) {
		var perm = [],
			k;
		for (k = 0; k < prefix.length; k += 1) {
			perm.push(prefix[k]);
		}
		return perm.join(".");
	}
	
	// create an access permission from a prefix, a reversed suffix,
	// and the ES of the reversed suffix
	function createAPString(prefix, rev_suffix, rev_suffix_es) {
		var suffix = cloneArray(rev_suffix).reverse(),
	  	prefixString = createAPStringfromPrefix(prefix),
	  	suffixString = createAPStringfromPrefix(suffix),
	  	result = prefixString;
	  // print (objectToString(["createAPStringfromPrefix", prefix, rev_suffix, rev_suffix_es]));
		if (greatestLengthOfES(rev_suffix_es) > 0) {
			result += ".*";
		}
		if (suffix.length > 0) {
			result += '.' + createAPStringfromPrefix(suffix);
		}
		return result;
	}

	// access permission
	// <ap> ::= [<ap_entry>,...]
	// <ap_entry> ::= {type: PROP, name: "propertyname"}
	// <ap_entry> ::= {type: STAR, properties: ["propertyname", ...]}

	// append converted array of property names to access permission
	function appendAsAP(properties, ap) {
		var i;
		
		for (i = 0; i < properties.length; i += 1) {
			ap.push({type: PROP, name: properties[i]});
		}
	}

	// create an access permission from a prefix, a reversed suffix,
	// and the ES of the reversed suffix
	function createAP(prefix, rev_suffix, rev_suffix_es) {
		var suffix = cloneArray(rev_suffix).reverse(),
			middleProperties = propertyNamesOfES(rev_suffix_es),
			result = [];

		appendAsAP(prefix, result);
		if (middleProperties.length > 0) {
			result.push({type: STAR, properties: middleProperties});
		}
		appendAsAP(suffix, result);
		return result;
	}

	// convert access permission entry to string
	function apeToString(ape) {
		if (ape.type === PROP) {
			return ape.name;			
		}
		if (ape.type === STAR) {
			return "(" + ape.properties + ")*";	  	
		}
		return "??? ILLEGAL APE ???";
	}

	// convert access permission to string
	function apToString(ap) {
		var result = [],
			i;
		
		for (i = 0; i < ap.length; i += 1) {
			result.push(apeToString(ap[i]));
		}
		return result.join(".");
	}
	
	// overall procedure
	function permissionsFromES(es, config) {
		var 
			esOfPrefix,
			eers,
			ers,
			extra_rev_suffixes,
			extra_rev_suffixes_es,
			i, j, k,
			local_suffix_depth,
			permissions,
			prefix,
			prefix_depth, 
			prefix_globalfrac, 
			prefixes,
			suffix_depth, 
			suffix_globalfrac,
			rev_es,
			rev_suffix,
			rev_suffix_es,
			rev_suffixes,
			rev_suffixesOfES;
	  
		config = config || {};
		prefix_depth = config.prefix_depth || lengthOfCommonPrefix(es);
		prefix_globalfrac = config.prefix_globalfrac;
		suffix_depth = config.suffix_depth;
		suffix_globalfrac = config.suffix_globalfrac;
	
	  // compute prefixes
		prefixes = getInterestingPrefixes(es, prefix_depth, prefix_globalfrac);
	  // console.log ("prefixes: ", es, prefixes);
	
	  // for each prefix, compute the corresponding permissions
		permissions = [];
		for (i = 0; i < prefixes.length; i += 1) {
			prefix = prefixes[i];
			if (prefix.length < prefix_depth) {
				permissions.push(createAP(prefix, [], emptyES()));
				continue;
			}
	    // print (objectToString (["considering prefix", prefix]));
			esOfPrefix = getQuotient(es, prefix);
			rev_suffixesOfES = getSuffixes(esOfPrefix);
			rev_es = createESfromPaths(rev_suffixesOfES);
			local_suffix_depth = suffix_depth || lengthOfStrictPrefixes(rev_es);
			rev_suffixes = getInterestingPrefixes(rev_es, local_suffix_depth, suffix_globalfrac);
	    // print (objectToString (["local_suffix_depth=", local_suffix_depth, "rev_es=", rev_es, "rev_suffixes =", rev_suffixes]));
	
	    // create an access permission from prefix and suffixes
			for (j = 0; j < rev_suffixes.length; j += 1) {
	      // get a permission for each suffix
				rev_suffix = rev_suffixes[j];
				rev_suffix_es = getQuotient(rev_es, rev_suffix);
				// TODO: why ==?
				if (rev_suffix.length == 1 && rev_suffix[0] === "@") {
					extra_rev_suffixes = getInterestingPrefixes(rev_suffix_es, 1, suffix_globalfrac);
					for (k = 0; k < extra_rev_suffixes.length; k += 1) {
						ers = extra_rev_suffixes[k];
						eers = ["@"].concat(ers);
						extra_rev_suffixes_es = getQuotient(rev_suffix_es, ers);
						permissions.push(createAP(prefix, eers, extra_rev_suffixes_es));
					}
				} else {
					permissions.push(createAP(prefix, rev_suffix, rev_suffix_es));
				}
			}
		}

		return simplify(permissions);
	}


	// simplifies permissions by trying to match read paths with write paths
	// @returns array of permissions
	function simplify(permissions) {
		var result = [],
			todrop = [],
			len = permissions.length,
			i, j, s;
		
		for (i = 0; i < len; i += 1) {
			for (j = i + 1; j < len; j += 1) {
				s = subsume(permissions[i], permissions[j]);
				//console.log("subsume: ", permissions[i], permissions[j], s);
				if (s > 0) {
					todrop.push(i); // i is subsumed
				}
				if (s < 0) {
					todrop.push(j); // j is subsumed
				}
			}
		}
		permissions.forEach(function (perm, i) {
			if (todrop.indexOf(i) < 0) {
				result.push(perm);
			}
		});
	  // console.log ("simplify: ", permissions, result);
		return result;
	}

	// @returns  1 if permission <= candidate
	// @returns -1 if permission >= candidate
	function subsume(permission, candidate) {
		var i = 0,
			starindex,
			pi, ci;
		while (i < permission.length && i < candidate.length) {
			pi = permission[i];
			ci = candidate[i];
			if (pi.type === PROP) {
				if (ci.type === PROP && pi.name === ci.name) {
					i += 1; 
					continue;
				} else {
					return 0;
				}
			} else if (pi.type === STAR && ci.type === STAR) {
				starindex = i;
				i += 1; 
				continue;
			} else {
				return 0;
			}
		}
	  // TODO: something about matching @ against @*
		if (i < permission.length) {
			pi = permission[i];
			if (pi.type === PROP && pi.name === '@') {
				return 1;
			}
			return 0;
		} else if (i < candidate.length) {
			ci = permission[i];
			if (ci.type === PROP && ci.name === '@') {
				return -1;
			}
			return 0;
		} else {
			return 1;
		}
	}
	
	// entry point for testing with anchored paths
	function main(anchored_paths, config) {
	  // create and fill the effect structure
		var es = createESfromPaths(paths);
		// TODO: the call to mainES is not correct with 
		// respect to the signature of mainES.
		return mainES(es, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac);
	}

	// assumes that top level index of es identifies the anchor
	// @returns a hashmap of permissions
	function mainES(es, config) {
		var ht = es.succ,
	  	anchored_permissions = {},
	  	anchor,
	  	es_anchor,
	  	permissions;

		// anchors have to be distinguished, anyway
		for (anchor in ht) {
			if (ht.hasOwnProperty(anchor)) {
				es_anchor = ht[anchor];
				permissions = permissionsFromES(es_anchor, config);
				anchored_permissions[anchor] = permissions;
			}			
		}
	
		return anchored_permissions;
	}

	function mixin(o1, o2) {
		var p, result = {};		
		
		for (p in o1) {
			if (o1.hasOwnProperty(p)) {
				result[p] = o1[p];
			}
		}
		for (p in o2) {
			if (o2.hasOwnProperty(p) && !result.hasOwnProperty(p)) {
				result[p] = o2[p];
			}
		}
		return result;
	}
	
	// assumes that top level index of es is function name
	// the config is an object of the form:
	//   { def: conf, fun: #(string -> conf) }
	// where dconfig is the default config, and
	// fconfig is a hash table containing spezific config informations
	// stored for a function
	// @returns a function-name indexed table of anchored permissions
	function computeEffectsByFunction(es, gconfig) {
		var ht = es.succ,
	  	result = {},
	  	fname,
	  	fconfig,
	  	cpn;
	  
		for (fname in ht) {
			if (ht.hasOwnProperty(fname)) {
				// default is, there is no config availible
				fconfig = undefined;
				// if there is config data availible, 
				if (gconfig) {
					// is there function specific data?
					if (gconfig.fun && gconfig.fun[fname]) {
						fconfig = mixin({}, gconfig.fun[fname]);
					}
					// for everything, that is not specified by
					// the function specific values, use the def
					// data
					if (gconfig.def) {
						fconfig = mixin(fconfig, gconfig.def);
					}
				}
				result[fname] = mainES(ht[fname], fconfig);
			}			
		}
	  
		return result;
	}
	
	function forTesting() {
	  // examples
		var paths = [["a", "b"], ["a", "c"]],
			es = createESfromPaths(paths),
	  	prefixes1 = getInterestingPrefixes(es),
	  	esOfPrefix1 = getQuotient(es, prefixes1[0]),
	  
	  	prefixes2 = getInterestingPrefixes(es, 2),
	  	esOfPrefix2_0 = getQuotient(es, prefixes2[0]),
	  	esOfPrefix2_1 = getQuotient(es, prefixes2[1]),
	  
	  	prefixes3 = getInterestingPrefixes(es, 3),
	  // same as prefixes2
	  
	  
	  	EX2 = {},
	  	EX3 = {};

		EX2.paths = [["a", "b"], ["a", "c"], ["a"], ["b"]];
		EX2.es = createESfromPaths(EX2.paths);
		EX2.prefixes1 = getInterestingPrefixes(EX2.es);
		EX2.esOfPrefix1_0 = getQuotient(EX2.es, EX2.prefixes1[0]);
		EX2.esOfPrefix1_1 = getQuotient(EX2.es, EX2.prefixes1[1]);
	  
		EX2.suffixes1_0 = getSuffixes(EX2.esOfPrefix1_0);
		EX2.suffixes1_1 = getSuffixes(EX2.esOfPrefix1_1);
		EX2.rev_es_0 = createESfromPaths(EX2.suffixes1_0);
		EX2.rev_es_1 = createESfromPaths(EX2.suffixes1_1);
	  
	  
		EX3.anchored_paths = [["$1", "l"],
				["$1", "h", "n", "v"],
				["$1", "h", "n", "n", "v"],
				["$1", "h", "v"],
				["$2", "p"]];
		EX3.result = main(EX3.anchored_paths);
	}

	////////////////////////////////////////////////////////////

	function escapeHTML(str) {
		var div, text;	  
		div = document.createElement('div');
		text = document.createTextNode(str);
		div.appendChild(text);
		return div.innerHTML;
	}

	// convert results to HTML (the hard way)
	function divFromFunctionAndEffects(fn, anchored_permissions) {
		var div, node, node_tr, node_td, anchor;
		
		div = document.createElement('div');
		node = document.createElement('h3');
		node.appendChild(document.createTextNode("Effects for Function " +  fn));
		div.appendChild(node);
		node = document.createElement('table');
		div.appendChild(node);
		node_tr = document.createElement('tr');
		node.appendChild(node_tr);
		node_tr.innerHTML = '<th>Anchor</th><th>Permissions</th>';
		for (anchor in anchored_permissions) {
			if (anchored_permissions.hasOwnProperty(anchor)) {
				node_tr = document.createElement('tr');
				node.appendChild(node_tr);
				node_td = document.createElement('td');
				node_tr.appendChild(node_td);
				node_td.appendChild(document.createTextNode(anchor));
				appendFromPermissions(node_tr, anchor, anchored_permissions[anchor]);
			}
		}
		return div;
	}

	function appendFromPermissions(elem, anchor, permissions) {
		var i;
		
		for (i = 0; i < permissions.length; i += 1) {
			appendFromPermission(elem, anchor, permissions[i]);
		}
	}

	function appendFromPermission(node, anchor, ap) {
		var elem, i, text;
		
		// alert ("appendFromPermission: " + objectToString (ap));
		elem = document.createElement('td');
		node.appendChild(elem);
		text = document.createTextNode(anchor + ".");
		elem.appendChild(text);
		appendFromPermissionEntry(elem, ap[0]);
		for (i = 1; i < ap.length; i += 1) {
			elem.appendChild(document.createTextNode("."));
			appendFromPermissionEntry(elem, ap[i]);
		}
	  // append an invisible comma
		elem = document.createElement('td');
		node.appendChild(elem);
		elem.appendChild(document.createTextNode(','));
		elem.style.padding = 0;
		elem.style.border = 'none';
		elem.style.fontSize = 0;
		elem.style.color = 'transparent';
	}
	
	function appendFromPermissionEntry(elem, ape) {
		var node;
	  
		// alert ("appendFromPermissionEntry: " + objectToString (ape));
		switch (ape.type) {
		case PROP:
			elem.appendChild(document.createTextNode(ape.name));
			break;
		case STAR:
			node = document.createElement('span');
			node.title = "" + ape.properties;
			node.appendChild(document.createTextNode('*'));
			elem.appendChild(node);
			break;
		default:
		}
	}

	////////////////////////////////////////////////////////////////////
	// implementation of the effect handler interface

	myEffects = emptyES();

	(function () { 
		var uid;
		
		function namedControl(f) {
			return (function (namenode) {
				var slice = Array.prototype.slice,
					tr, td, params;
				
				tr = document.createElement("tr");
				tr.style.border = "none";
				td = document.createElement("td");
				td.style.border = "none";
				tr.appendChild(td);
				td.appendChild(namenode);
				td = document.createElement("td");
				td.style.border = "none";
				tr.appendChild(td);
				params = slice.call(arguments, 1);
				params.unshift(td);
				f.apply(this, params);
				return tr;
			});
		}

		function sliderControlP(parent, min, max, handler, defv, steps) {
			var slider, span, parent;
			
			defv = defv || Math.floor((max - min) / 2);
			steps = steps || Math.floor((max - min) / 10) || 1;

			uid += 1;

			span = document.createElement("span");
			span.innerHTML = defv;			
			slider = document.createElement("input");
			slider.setAttribute("type", "range");
			slider.setAttribute("min", min);
			slider.setAttribute("max", max);
			slider.setAttribute("step", steps);
			slider.value = defv;
			slider.onchange = function () {
				span.innerHTML = this.value;
				return handler(this.value, slider, span, parent);
			};

			parent.appendChild(slider);
			parent.appendChild(span);
			
			return parent;
		}
		sliderControl = sliderControlP;
		sliderControlNamed = namedControl(sliderControlP);
	}());

	function config_control(name, obj, prop, after, min, max, def, steps) {
		function handler(newValue) {
			if (newValue < 0) {
				obj[prop] = undefined;
			} else {
				obj[prop] = newValue;				
			}
			return after();
		}
		return sliderControlNamed(document.createTextNode(name), 
		                          min, max,
		                          handler,
		                          def, steps);
	}
	
	function stat(divNode) {
		var heading = document.createElement("h2"),
			divChild = document.createElement("div");

		function doStat(not_used_statistic) {
			var noeffects = true,
				cleanedEffects = myEffects,
				effectsByFunction,
				fn, HIGH_DEGREE;
			
			console.log("compute effects");
			HIGH_DEGREE = (gconfig && gconfig.gdef && gconfig.gdef.HIGH_DEGREE) || 20;
			
			cleanedEffects = collapseHighDegree(cleanedEffects, 2, HIGH_DEGREE);
	    // cleanedEffects = cleanReads(cleanedEffects);
	    // console.log ("stat: ", cleanedEffects);

			// TODO: pass config to library here as second parameter
			effectsByFunction = computeEffectsByFunction(cleanedEffects, gconfig);

			// create output
			divNode.innerHTML =  '';
			// heading.text = "Staring Up";

			//subdiv = divNode.childNodes[0];
			for (fn in effectsByFunction) {
				if (effectsByFunction.hasOwnProperty(fn)) {
					divNode.appendChild(divFromFunctionAndEffects(fn, effectsByFunction[fn]));
					noeffects = false;
				}				
			}
			if (noeffects) {
				divNode.appendChild(document.createTextNode("No effects registered"));				
			}
		}
		
		heading.innerHTML = "Effect Inference";
		divNode.appendChild(heading);
		divNode.appendChild(config_control("HIGH_DEGREE", gconfig.gdef, "HIGH_DEGREE", doStat, -1, 100, 20, 1));

		divNode.appendChild(config_control("prefix depth", gconfig.def, "prefix_depth", doStat, -1, 25, -1, 1));
		//divNode.appendChild(config_control("prefix global frac", gconfig.def, "prefix_globalfrac", doStat, -1, 25, -1, 1));
		divNode.appendChild(config_control("suffix_depth", gconfig.def, "suffix_depth", doStat, -1, 25, -1, 1));
		//divNode.appendChild(config_control("suffix_globalfrac", gconfig.def, "suffix_globalfrac", doStat, -1, 25, -1, 1));

		divNode.appendChild(divChild);
		divNode = divChild;
				
		return doStat;
	}

	function registerEffect(mkPath) {
		return function (o, p, effl_str, eff_str, context) {
			var i, path;
	  	
			for (i = 0; i < context.length; i += 1) {
				path = mkPath(context[i]);
				addPath(myEffects, path);
			}
		};
	}

	function fromFile(record) {
		if (record[0] === "read") {
			registerEffect(readPath)(0, 0, 0, 0, record[1]);			
		} else if (record[0] === "write") {
			registerEffect(writePath)(0, 0, 0, 0, record[1]);			
		} else {
			return "illegalRecordInFile";			
		}
	}

	function create(divNode) {
		return { statistic: stat(divNode),
	      assertEffectsRead: registerEffect(readPath), 
	      assertEffectsWrite: registerEffect(writePath)
	      };
	}
	SELF.create = create;
	
}(JSConTest));