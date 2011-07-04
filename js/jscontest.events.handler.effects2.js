// from JSConTest / js / jscontest.effects.js
"use strict";
(function (JSConTest) {
	var SELF = {},
		// the local config data
		gconfig,
        sliderControl,
        sliderControlNamed, 
        Math = JSConTest.math;
	JSConTest.events.handler.effects = SELF;

	// initialize global config default values
	gconfig = { gdef: { HIGH_DEGREE: 20 }, 
	            def : {	  
	            	prefix_length: 1,
	          	  prefix_degree: 1,
	          	  prefix_maxlength: 1,
	          	  suffix_length: 1,
	          	  suffix_degree: 0,
	          	  suffix_maxlength: 1
	            } 
	};


	var readEffects, writeEffects;

	var HIGH_DEGREE = 20;	// make this parameterizable
	
	var PARAMETER = 1,
		VARIABLE = 2,
		PROP = 3,
		QUESTIONMARK = 4,
		STAR = 5,
		ALL = 6,
		noPROP = 7,
		regExProp = 8,
		regExVar = 9;

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
	  r.push ("@");
	  return r;
	}
	
	function writePath (acp) {
	  return acpToPath (acp);
	}
	
	// NOT USED:
	// an access effect <ace> extends this by
	// {type: QUESTIONMARK, effect: <ace>}
	// {type: STAR, effect: <ace>}
	// {type: noPROP}
	
	////////////////////////////////////////////////////////////////
	// printing
	function innerObjectToString (o) {
	  var acc = [];
	  for (var p in o)
	    if (o.hasOwnProperty (p)) {
	      acc.push ('"' + p + '": ' + objectToString (o[p]));
	    }
	  return acc.join(", ");
	}
	
	
	function innerArrayToString (a) {
	  var acc = [];
	  for (var i=0; i<a.length; i++) {
	    acc.push (objectToString (a[i]));
	  }
	  return acc.join (", ");
	}
	
	function objectToString (o) {
	  if (typeof o == "object") {
	    if (o === null) {
	      return "null";
	    } else if (o.constructor === Array) {
	      return '[' + innerArrayToString(o) + ']';
	    } else {
	      return '{' + innerObjectToString(o) + '}';
	    }
	  } else if (typeof o == "string") {
	    return '"' + o + '"';
	  } else if (typeof o == "undefined") {
	    return "undefined";
	  } else {
	    return o.toString();
	  }
	}

	////////////////////////////////////////////////////////////
	// An effect structure <es> is an object of the following form
	// <es> ::= {n: NUMBER, succ: <hash>}
	// <hash> ::= an object where each property is an <es>
	function emptyES () {
	  return {n: 0, succ: {}};
	}
	
	// test emptiness of effect structure
	function isEmptyES (es) {
	  return es.n == 0;
	}

	// collect all property names in effect structure
	function propertyNamesOfES (es) {

	  function h (es, acc) {
	    var ht = es.succ;
	    for (var p in ht)
	      if (ht.hasOwnProperty (p)) {
		if (acc.indexOf (p) < 0) acc.push(p);
		h (ht[p], acc);
	      }
	    return acc;
	  }

	  return h (es, []);
	}
	
	// length of longest string in es
	function greatestLengthOfES (es) {
	  if (es.n == 0) return -Infinity;
	  var localsize = 0;
	  var ht = es.succ;
	  for (var pathstep in ht)
	    if (ht.hasOwnProperty (pathstep)) {
	      localsize = Math.max (localsize, 1+greatestLengthOfES (ht[pathstep]));
	    }
	  return localsize;
	}
	
	// length of shortest string in es
	function shortestLengthOfES (es) {
	  var globalnumber = es.n;
	  if (globalnumber == 0) return Infinity;
	  var ht = es.succ;
	  var localnumber = 0;
	  var localsize = Infinity;
	  for (var pathstep in ht)
	    if (ht.hasOwnProperty (pathstep)) {
	      var esOfPathstep = ht[pathstep];
	      localnumber += esOfPathstep.n;
	      localsize = Math.min (localsize, 1 + shortestLengthOfES (esOfPathstep));
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
	function lengthOfCommonPrefix (es, strict) {
	  var localsize = es.n;
	  if (localsize == 0) return 0;
	  var ht = es.succ;
	  var count = 0;
	  var pathstep;
	  for (var p in ht)
	    if (ht.hasOwnProperty (p)) {
	      count++;
	      pathstep = p;
	    }
	  if (count != 1) return 0;
	  if (strict && localsize != ht[pathstep].n) return 0;
	  return 1 + lengthOfCommonPrefix (ht[pathstep], strict);
	}
	
	// number l such that no element of es is a proper prefix of the
	// set of l-prefixes of es
	function lengthOfStrictPrefixes (es) {
	  var localsize = es.n;
	  if (localsize == 0) return 0;
	  var ht = es.succ;
	  var subsize = 0;
	  var sublength = Infinity;
	  // var subgreatestlength = -Infinity;
	  for (var p in ht)
	    if (ht.hasOwnProperty (p)) {
	      // var greatestLength = greatestLengthOfES (ht[p]);
	      var losp = lengthOfStrictPrefixes (ht[p]);
	      subsize += ht[p].n;
	      sublength = Math.min (sublength, 1 + losp);
	    }
	  if (subsize != localsize || sublength == Infinity) {
	    return 0;
	  } else {
	    return sublength;
	  }
	}

	var positivenum = /^[0-9][0-9]*$/;
	  
	// merge a new path into an effect structure
	function addPath (es, path) {
	  es.n++;
	  var ht = es.succ;
	  for (var i=0; i<path.length; i++) {
	    var pathstep = path[i];
	    if (positivenum.exec (pathstep)) { // array access
	      pathstep = '#'; 
	    }
	    if (ht.hasOwnProperty (pathstep)) {
	      es = ht[pathstep];
	      es.n++;
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
	function collapseHighDegree (es, depth, degree) {
	  var subtrie;
	  var subtries = [];
	  var ht = es.succ;
	  var newht = {};
	  for (var p in ht)
	    if (ht.hasOwnProperty (p)) {
	      subtries.push (ht[p]);
	    }
	  
	  if (subtries.length <= degree || depth > 0) {
	    // no merge, but recursively collapse subtries
	    for (var p in ht)
	      if (ht.hasOwnProperty (p)) {
		subtrie = collapseHighDegree (ht[p], depth-1, degree);
		newht[p] = subtrie;
	      }
	    return {n: es.n, succ: newht};
	  } else {
	    // need to merge the tries
	    subtrie = emptyES();
	    subtries.forEach (function (es1) {
				subtrie = merge (subtrie, es1);
			      });
	    subtrie = collapseHighDegree (subtrie, depth-1, degree);
	    return {n: es.n, succ: {"?": subtrie}};
	  }
	}

	// merge two tries
	function merge (es1, es2) {
	  var nrOfEntries = es1.n + es2.n;
	  var succ1 = es1.succ;
	  var succ2 = es2.succ;
	  var newsucc = {};

	  // collect all property names
	  var props1 = [];
	  var props2 = [];
	  var props12 = [];	// common props
	  for (var p in succ1)
	    if (succ1.hasOwnProperty (p))
	      if (succ2.hasOwnProperty (p))
		props12.push (p);
	      else
		props1.push (p);
	  for (var p in succ2)
	    if (succ2.hasOwnProperty (p) && props12.indexOf (p) < 0)
	      props2.push (p);

	  // copy independent properties, merge common properties
	  props1.forEach (function (p) { newsucc[p] = succ1[p]; });
	  props2.forEach (function (p) { newsucc[p] = succ2[p]; });
	  props12.forEach (function (p) { newsucc[p] = merge (succ1[p], succ2[p]); });

	  return {n: nrOfEntries, succ: newsucc}
	}

	// remove subsumed reads (non destructive)
	// i.e. hashtable entries for @ that have non-@ siblings
	// (currently not needed anymore)
	function cleanReads (es) {
	  var ht = es.succ;
	  var nrOfEntries = es.n;
	  var newht = {};
	  var newNrOfEntries = 0;
	  var subsize = 0;
	  var readFlag = 0;
	  for (var p in ht)
	    if (ht.hasOwnProperty (p)) {
	      subsize += ht[p].n;
	      if (p==='@') {
		readFlag = ht[p].n;
	      } else {
		newht[p] = cleanReads (ht[p]);
		newNrOfEntries += newht[p].n;
	      }
	    }
	  if (readFlag > 0 && newNrOfEntries == 0) {
	    newht['@'] = ht['@'];
	    newNrOfEntries = readFlag;
	  }
	  newNrOfEntries += nrOfEntries - subsize; // writes ending here

	  return {n: newNrOfEntries, succ: newht};
	}

	// create an effect structure from a list of paths
	function createESfromPaths (paths) {
	  var es = emptyES ();
	  for (var i=0; i<paths.length; i++) {
	    addPath (es, paths[i]);
	  }
	  return es;
	}
	
	// dereference a path in an effect structure
	function getQuotient (es, path) {
	  var ht = es.succ;
	  for (var i=0; i<path.length; i++) {
	    es = ht[path[i]];
	    if (!es) return emptyES (); // non existing path
	    ht = es.succ;
	  }
	  return es;
	}
	
	// get all quotients 
	function getQuotients (es, paths) {
	  var ess = [];
	  for (var i=0; i< paths.length; i++) {
	    ess.push (getQuotient (es, paths[i]))
	  }
	  return ess;
	}
	
	// get all (reversed) suffixes from an effect structure
	function getSuffixes (es) {
	  var collect = [];
	  
	  var globalsize = es.n;
	  var ht = es.succ;
	  var subsizes = 0;
	  for (var i in ht)
	    if (ht.hasOwnProperty (i)) {
	      subsizes += ht[i].n;
	    }
	  if (subsizes < globalsize)
	    collect.push ([]);
	
	  for (var pathstep in ht)
	    if (ht.hasOwnProperty (pathstep)) {
	      var subSuffixes = getSuffixes (ht[pathstep]);
	      for (var i=0; i<subSuffixes.length; i++) {
		var subSuffix = subSuffixes[i];
		subSuffix.push (pathstep);
		collect.push (subSuffix);
	      }
	    }
	
	  return collect;
	}
	
	// obtain the set of interesting prefixes of an effect structure
	// * all returned prefixes are shorter than depth
	// * the prefixes end in a node that is reached by more than
	//   globalfrac * globalsize paths 
	function getInterestingPrefixes (es, /*int*/ depth, /*double*/ globalfrac) {
	  depth = depth || 1;
	  globalfrac = globalfrac || 0;
	
	  var collect = [];
	  var globalsize = es.n;
	    
	  function computeWeights (es) {
	    var weights = {};
	    var min_weight = +Infinity;
	    var max_weight = -Infinity;
	    for (var pathstep in ht)
	      if (ht.hasOwnProperty (pathstep)) {
		var w = ht[pathstep].n / localsize;
		min_weight = Math.min (min_weight, w);
		max_weight = Math.max (max_weight, w);
		weights[pathstep] = w;
	      }
	    // what to do with this information?
	  }
	
	  function cutoff (es) {
	    var localsize = es.n;
	    return (localsize <= globalfrac*globalsize);	// branch empty or too unlikely?
	  }
	
	  function h (es, i, sofar) {
	    if (i == depth) {
	
	      collect.push (cloneArray (sofar));
	
	    } else {
	
	      var ht = es.succ;
	      for (var pathstep in ht)
		if (ht.hasOwnProperty (pathstep)) {
		  if (cutoff (ht[pathstep])) {
		    collect.push (cloneArray (sofar));
		    return;
		  }
		}
	
	      var nsucc = 0;
	      var subsizes = 0;
	      var lastprop = '';
	      for (var pathstep in ht)
		if (ht.hasOwnProperty (pathstep)) {
		  sofar.push (pathstep);
		  h (ht[pathstep], i+1, sofar);
		  sofar.pop();
		  lastprop = pathstep;
		  subsizes += ht[pathstep].n;
		  nsucc++;
		}
	      if (nsucc == 0 || (subsizes < es.n && lastprop === '@')) {
		// second part means that we have a path that is read and written
		collect.push (cloneArray (sofar));
	      }
	    }
	  }
	
	  h (es, 0, []);
	  return collect;
	}
	
	// shallow copy of an array
	function cloneArray (a) {
	  var r = [];
	  for (var i=0; i<a.length; i++) {
	    r[i] = a[i];
	  }
	  return r;
	}
	
	// create an access permission from a prefix
	function createAPStringfromPrefix (prefix) {
	  var perm = [];
	  for (var k=0; k<prefix.length; k++) {
	    perm.push (prefix[k]);
	  }
	  return perm.join (".");
	}
	
	// create an access permission from a prefix, a reversed suffix,
	// and the ES of the reversed suffix
	function createAPString (prefix, rev_suffix, rev_suffix_es) {
	  var suffix = cloneArray (rev_suffix).reverse();
	  var prefixString = createAPStringfromPrefix (prefix);
	  var suffixString = createAPStringfromPrefix (suffix);
	  var result = prefixString;
	  // print (objectToString(["createAPStringfromPrefix", prefix, rev_suffix, rev_suffix_es]));
	  if (greatestLengthOfES (rev_suffix_es) > 0) {
	    result += ".*";
	  }
	  if (suffix.length > 0) {
	    result += '.' + createAPStringfromPrefix (suffix);
	  }
	  return result;
	}

	// access permission
	// <ap> ::= [<ap_entry>,...]
	// <ap_entry> ::= {type: PROP, name: "propertyname"}
	// <ap_entry> ::= {type: STAR, properties: ["propertyname", ...]}

	// append converted array of property names to access permission
	function appendAsAP(properties, ap) {
	  for (var i=0; i<properties.length; i++) {
	    ap.push ({type: PROP, name: properties[i]});
	  }
	}

	// create an access permission from a prefix, a reversed suffix,
	// and the ES of the reversed suffix
	function createAP (prefix, rev_suffix, rev_suffix_es) {
	  var suffix = cloneArray (rev_suffix).reverse();
	  var middleProperties = propertyNamesOfES (rev_suffix_es);
	  var result = [];
	  appendAsAP (prefix, result);
	  if (middleProperties.length > 0) {
	    result.push ({type: STAR, properties: middleProperties})
	  }
	  appendAsAP (suffix, result);
	  return result;
	}

	// convert access permission entry to string
	function apeToString (ape) {
	  if (ape.type === PROP)
	    return ape.name;
	  if (ape.type === STAR)
	    return "("+ape.properties+")*";
	  return "??? ILLEGAL APE ???";
	}

	// convert access permission to string
	function apToString (ap) {
	  var result = [];
	  for (var i=0; i<ap.length; i++) {
	    result.push (apeToString (ap[i]));
	  }
	  return result.join (".");
	}
	
	// overall procedure
	function permissionsFromES (es, config) {
	  var prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac;
	  config = config || {};
	  prefix_depth = config.prefix_depth || lengthOfCommonPrefix (es);
	  prefix_globalfrac = config.prefix_globalfrac;
	  suffix_depth = config.suffix_depth;
	  suffix_globalfrac = config.suffix_globalfrac;
	
	  // compute prefixes
	  var prefixes = getInterestingPrefixes (es, prefix_depth, prefix_globalfrac);
	  // console.log ("prefixes: ", es, prefixes);
	
	  // for each prefix, compute the corresponding permissions
	  var permissions = [];
	  for (var i=0; i<prefixes.length; i++) {
	    var prefix = prefixes[i];
	    if (prefix.length < prefix_depth) {
	      permissions.push (createAP (prefix, [], emptyES ()));
	      continue;
	    }
	    // print (objectToString (["considering prefix", prefix]));
	    var esOfPrefix = getQuotient (es, prefix);
	    var rev_suffixesOfES = getSuffixes (esOfPrefix);
	    var rev_es = createESfromPaths (rev_suffixesOfES);
	    var local_suffix_depth = suffix_depth || lengthOfStrictPrefixes (rev_es);
	    var rev_suffixes = getInterestingPrefixes (rev_es, local_suffix_depth, suffix_globalfrac);
	    // print (objectToString (["local_suffix_depth=", local_suffix_depth, "rev_es=", rev_es, "rev_suffixes =", rev_suffixes]));
	
	    // create an access permission from prefix and suffixes
	    for (var j=0; j<rev_suffixes.length; j++) {
	      // get a permission for each suffix
	      var rev_suffix = rev_suffixes[j];
	      var rev_suffix_es = getQuotient (rev_es, rev_suffix);
	      if (rev_suffix.length==1 && rev_suffix[0]==="@") {
		var extra_rev_suffixes = getInterestingPrefixes (rev_suffix_es, 1, suffix_globalfrac);
		for (var k=0; k<extra_rev_suffixes.length; k++) {
		  var ers = extra_rev_suffixes[k];
		  var eers = ["@"].concat (ers);
		  var extra_rev_suffixes_es = getQuotient (rev_suffix_es, ers);
		  permissions.push (createAP (prefix, eers, extra_rev_suffixes_es));
		}
	      } else {
		permissions.push (createAP (prefix, rev_suffix, rev_suffix_es));
	      }
	    }
	  }

	  return simplify(permissions);
	}


	// simplifies permissions by trying to match read paths with write paths
	// @returns array of permissions
	function simplify(permissions) {
	  var result = [];
	  var todrop = [];
	  var len = permissions.length;
	  for (var i=0; i<len; i++)
	    for (var j=i+1; j<len; j++) {
	      var s = subsume (permissions[i], permissions[j]);
	      // console.log ("subsume: ", permissions[i], permissions[j], s);
	      if (s > 0) todrop.push (i); // i is subsumed
	      if (s < 0) todrop.push (j); // j is subsumed
	    }
	  permissions.forEach (function (perm, i) {
				 if (todrop.indexOf (i) < 0)
				   result.push (perm);
			       });
	  // console.log ("simplify: ", permissions, result);
	  return result;
	}

	// @returns  1 if permission < candidate
	// @returns  0 if permission == candidate
	// @returns -1 if permission > candidate
	// @returns NaN otherwise
	function subsume (permission, candidate) {
	  var INCOMPARABLE= NaN, EQUAL= 0, LESS= 1, GREATER= -1;
	  var i = 0;
	  var pi, ci;
	  var plen = permission.length;
	  var clen = candidate.length;
	  while (i < plen && i < clen) {
	    pi = permission[i];
	    ci = candidate[i];
	    if (pi.type === PROP) {
	      if (ci.type === PROP && pi.name === ci.name) {
		i++; continue;
	      } else {
		return INCOMPARABLE;
	      }
	    } else if (pi.type === STAR && ci.type === STAR) {
	      i++; continue;
	    } else {
	      return INCOMPARABLE;
	    }
	  }
	  if (i < plen) {
	    // candidate is proper prefix of permission
	    return GREATER;
	  } else if (i < clen) {
	    // permission is prefix of candidate
	    return LESS;
	  } else {
	    // permissions are equal
	    return EQUAL;
	  }
	}
	
	////////////////////////////////// TBC /////////////////////////////

	// @returns true if exists path' in pathes such that path is proper prefix of path'
	// TESTED
	function isProperPrefixOfAny (path, pathes) {
	  var l = path.length;
	outer: for (var i=0; i<pathes.length; i++) {
	    var pathi = pathes[i];
	    if (pathi.length <= l)
	      continue;
	    for (var j=0; j<l; j++)
	      if (path[j] !== pathi[j])
		continue outer;
	    return true;		
	  }
	  return false;
	}

	// TESTED
	function buildPermissions (result, prefix, esOfPrefix, config) {
	  var rev_suffixesOfES = getSuffixes (esOfPrefix);
	  var rev_es = createESfromPaths (rev_suffixesOfES);
	  var rev_suffixes = computePrefixes (rev_es, config.suffix_length, config.suffix_degree, config.suffix_maxlength);
	  // print ("prefix", objectToString (prefix), "rev_es", objectToString (rev_es), "rev_suffixes", objectToString (rev_suffixes));
	  for (var i=0; i<rev_suffixes.length; i++) {
	    var rev_suffix = rev_suffixes[i];
	    // is this a proper prefix of an element of rev_suffixes?
	    if (isProperPrefixOfAny (rev_suffix, rev_suffixes)) {
	      if (isElement (rev_suffix, rev_es)) {
		result.push (createAP (prefix, rev_suffix, emptyES ()));
	      }
	      // ignore otherwise
	    } else {
	      var middle_es = getQuotient (rev_es, rev_suffix);
	      result.push (createAP (prefix, rev_suffix, middle_es));
	    }
	  }
	}

	// TESTED
	function computePermissionsFromPathSet (prefixes, es, config) {
	  var result = [];
	  for (var i=0; i<prefixes.length; i++) {
	    var prefix = prefixes[i];
	    buildPermissions (result, prefix, getQuotient(es, prefix), config);
	  }
	  return result;
	}

	// TESTED
	function computePrefixes (es0, prefix_length, prefix_degree, prefix_maxlength) {
	  var result = [];
	  prefix_maxlength = Math.max (prefix_length, prefix_maxlength);

	  function comp (parentdegree, path, es) {
	    var ht = es.succ;
	    var degree = 0;
	    for (var p in ht) 
	      if (ht.hasOwnProperty(p)) 
		degree++;
	    
	    if (path.length <= prefix_length ||
		(parentdegree <= prefix_degree && path.length <= prefix_maxlength)) {
	      result.push (cloneArray (path));
	      for (var pathstep in ht) 
		if (ht.hasOwnProperty (pathstep)) {
		  path.push (pathstep);
		  comp (degree, path, ht[pathstep]);
		  path.pop ();
		}
	    }
	  }
	  
	  comp (0, [], es0);
	  return result;
	}

	// accumulates the own properties of obj in dom
	// TESTED
	function accumulateDomain (dom, obj) {
	  for (var p in obj) 
	    if (obj.hasOwnProperty(p))
	      dom[p] = true;
	}

	// @returns readPermissions with @ appended + writePermissions
	// TESTED
	function mergePermissions (readPermissions, writePermissions) {
	  var result = [];
	  for (var i=0; i<readPermissions.length; i++) {
	    var perm = readPermissions[i];
	    perm.push ({ type: PROP, name: '@' });
	    result.push (perm);
	  }
	  for (var j=0; j<writePermissions.length; j++) {
	    result.push (writePermissions[j]);
	  }
	  return result;
	}

	// simplify permissions by erasing subsumed ones
	// TESTED
	function simplifyPermissions (readPermissions, writePermissions) {
	  var result = [];
	  var todrop = [];
	  var rlen = readPermissions.length;
	  var wlen = writePermissions.length;
	  for (var i=0; i<rlen; i++) {
	    for (var j=i+1; j<rlen; j++) {
	      var s = subsume (readPermissions[i], readPermissions[j]);
	      // console.log ("subsume (read): ", readPermissions[i], readPermissions[j], s);
	      if (s >= 0) todrop.push (i); // i is subsumed
	      if (s <  0) todrop.push (j); // j is subsumed
	    }
	    for (var k=0; k<wlen; k++) {
	      var sw = subsume (readPermissions[i], writePermissions[k]);
	      // console.log ("subsume (write): ", readPermissions[i], writePermissions[k], sw);
	      if (sw >= 0) todrop.push (i); // read permission i is subsumed
	    }
	  }
	  readPermissions.forEach (function (perm, i) {
				     if (todrop.indexOf (i) < 0)
				       result.push (perm);
				   });
	  // clear duplicated write permissions
	  var writeResult = [];
	  todrop = [];
	  for (var m=0; m<wlen; m++) {
	    for (var n=m+1; n<wlen; n++) {
	      var ww = subsume(writePermissions[m], writePermissions[n]);
	      if (ww == 0) todrop.push(m);
	    }
	  }
	  writePermissions.forEach (function (perm, i) {
				      if (todrop.indexOf(i) <0)
					writeResult.push (perm);
				    });
	  // console.log ("simplify: ", permissions, result);
	  return {read: result, write: writeResult};
	}

	// compute prefixes, apply reduction, and extract permissions
	// @returns array of access permissions
	// TESTED
	function computePermissions (es, reduce, config) {
	  var prefixes = computePrefixes (es, config.prefix_length, config.prefix_degree, config.prefix_maxlength);
	  var reducedPrefixes = reduce (prefixes, es);
	  return computePermissionsFromPathSet (reducedPrefixes, es, config);
	}

	// remove all paths that are proper prefixes of other paths
	// unless they are elements of pathtrie
	// TESTED
	function reduce (pathtrie) {
	  return function (prefixes) {
	    var pres = emptyES ();
	    for (var i=0; i<prefixes.length; i++) {
	      addPath (pres, prefixes[i]);
	    }
	    return extractLeafPathes (pres, pathtrie);
	  };
	}

	// @returns pathes in es which lead to leaves or which are in pathtrie
	// TESTED
	function extractLeafPathes (es, pathtrie) {
	  var result = [];
	  
	  function extract (path, es) {
	    var ht = es.succ;
	    var nrOfSuccessors = 0;
	    for (var p in ht)
	      if (ht.hasOwnProperty(p)) {
		path.push(p);
		extract (path, ht[p]);
		path.pop();
		nrOfSuccessors++;
	      }
	    if (nrOfSuccessors === 0 || (pathtrie && isElement (path, pathtrie)))
	      result.push (cloneArray (path));
	  }

	  extract ([], es);
	  return result;
	}

	// @returns whether a path can be realized in a trie
	// TESTED
	function isElement (path, es) {
	  var ht = es.succ;
	  for (var i=0; i<path.length; i++) {
	    var pathstep = path[i];
	    if (!ht.hasOwnProperty(pathstep))
	      return false;
	    es = ht[pathstep];
	    ht = es.succ;
	  }
	  // end of path reached. check whether it's an element of current es
	  var subsizes = 0;
	  for (var p in ht)
	    if (ht.hasOwnProperty(p)) {
	      subsizes += ht[p].n;
	    }
	  return subsizes < es.n;
	}
	
	// processes the effects on one variable
	// @returns an array of access permissions
	function computeEffects (es_read0, es_write0, config0) {
	  var es_read = es_read0 || emptyES ();
	  var es_write = es_write0 || emptyES ();
	  var config = config0 || {};

	  var readPermissions = computePermissions (es_read, reduce (), config);
	  var writePermissions = computePermissions (es_write, reduce (es_write), config);
	  var simplified = simplifyPermissions (readPermissions, writePermissions);
	  readPermissions = simplified.read;
	  writePermissions = simplified.write;
	  return mergePermissions (readPermissions, writePermissions);
	}

	// assumes that top level index of es identifies the anchor
	// @returns a hashmap of permissions
	function computeEffectsByVariable(es_read, es_write, config) {
	  var ht_read  = (es_read || emptyES()).succ;
	  var ht_write = (es_write || emptyES()).succ;
	  var result = {};

	  // compute union of domains of ht_read and ht_write
	  var domain = {};
	  accumulateDomain (domain, ht_read);
	  accumulateDomain (domain, ht_write);
	  // console.log ("computeEffectsByVariable:", domain, es_read, ht_read, es_write, ht_write);
	  
	  // anchors have to be distinguished, anyway
	  for (var anchor in domain)
	    if (domain.hasOwnProperty (anchor)) {
	      var es_read_anchor = readOwn(ht_read,anchor);
	      var es_write_anchor = readOwn(ht_write,anchor);
	      var permissions = computeEffects (es_read_anchor, es_write_anchor, config);
	      result[anchor] = permissions;
	    }
	
	  return result;
	}

	// @returns local property of object disregarding prototypes
	function readOwn (obj, p) {
	  if (obj.hasOwnProperty(p)) {
	    return obj[p];
	  } else {
	    return undefined;
	  }
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
	function computeEffectsByFunction(es_read, es_write, gconfig) {
		var ht_read = (es_read || emptyES ()).succ,
	  	ht_write = (es_write || emptyES()).succ,
	  	result = {},
	  	fname,
	  	fconfig,
	  	cpn,
	  	domain = {};
	  
	  accumulateDomain (domain, ht_read);
	  accumulateDomain (domain, ht_write);

	  for (fname in domain) {
			if (domain.hasOwnProperty(fname)) {
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
				result[fname] = 
					computeEffectsByVariable (readOwn(ht_read,fname),
					              					  readOwn(ht_write,fname),
					              					  fconfig);
			}			
		}	  
		return result;
	}

	
	function forTesting() {
	  // examples
	  var paths = [["l"], ["h"], ["h","d"], ["h", "n"], ["h", "n", "d"], ["h", "n", "n"], ["h", "n", "n", "d"]];
	  var paths = [["a", "b"], ["a", "c"]];
	  var es = createESfromPaths (paths);
	  var prefixes1 = getInterestingPrefixes (es);
	  var esOfPrefix1 = getQuotient (es, prefixes1[0]);
	  
	  var prefixes2 = getInterestingPrefixes (es, 2);
	  var esOfPrefix2_0 = getQuotient (es, prefixes2[0]);
	  var esOfPrefix2_1 = getQuotient (es, prefixes2[1]);
	  
	  var prefixes3 = getInterestingPrefixes (es, 3);
	  // same as prefixes2
	  
	  
	  var EX2 = {};
	  EX2.paths = [["a", "b"], ["a", "c"], ["a"], ["b"]];
	  EX2.es = createESfromPaths (EX2.paths);
	  EX2.prefixes1 = getInterestingPrefixes (EX2.es);
	  EX2.esOfPrefix1_0 = getQuotient (EX2.es, EX2.prefixes1[0]);
	  EX2.esOfPrefix1_1 = getQuotient (EX2.es, EX2.prefixes1[1]);
	  
	  EX2.suffixes1_0 = getSuffixes (EX2.esOfPrefix1_0);
	  EX2.suffixes1_1 = getSuffixes (EX2.esOfPrefix1_1);
	  EX2.rev_es_0 = createESfromPaths (EX2.suffixes1_0);
	  EX2.rev_es_1 = createESfromPaths (EX2.suffixes1_1);
	  
	  
	  var EX3 = {};
	  EX3.anchored_paths = [["$1", "l"],
				["$1", "h", "n", "v"],
				["$1", "h", "n", "n", "v"],
				["$1", "h", "v"],
				["$2", "p"]];
	  EX3.result = main (EX3.anchored_paths);
	}

	////////////////////////////////////////////////////////////
	// convert results to HTML (the hard way)
	function divFromFunctionAndEffects (fn, anchored_permissions) {
	  var div = document.createElement('div');
	  var node = document.createElement ('h3');
	  node.appendChild (document.createTextNode ("Effects for Function " +  fn));
	  div.appendChild (node);
	  node = document.createElement ('table');
	  div.appendChild (node);
	  var node_tr = document.createElement ('tr');
	  node.appendChild (node_tr);
	  node_tr.innerHTML = '<th>Anchor</th><th>Permissions</th>';
	  for (var anchor in anchored_permissions)
	    if (anchored_permissions.hasOwnProperty(anchor)) {
	      node_tr = document.createElement ('tr');
	      node.appendChild (node_tr);
	      var node_td = document.createElement ('td');
	      node_tr.appendChild (node_td);
	      node_td.appendChild (document.createTextNode (anchor));
	      appendFromPermissions (node_tr, anchor, anchored_permissions[anchor]);
	    }
	  return div;
	}

	function appendFromPermissions (elem, anchor, permissions) {
	  for (var i=0; i<permissions.length; i++) {
	    appendFromPermission (elem, anchor, permissions[i]);
	  }
	}

	function appendFromPermission (node, anchor, ap) {
	  if (ap.length === 0) return;
	  // alert ("appendFromPermission: " + objectToString (ap));
	  var elem = document.createElement ('td');
	  node.appendChild (elem);
	  var text = document.createTextNode (anchor+".");
	  elem.appendChild (text);
	  appendFromPermissionEntry (elem, ap[0]);
	  for (var i=1; i<ap.length; i++) {
	    elem.appendChild (document.createTextNode ("."));
	    appendFromPermissionEntry (elem, ap[i]);
	  }
	  // append an invisible comma
	  elem = document.createElement ('td');
	  node.appendChild (elem);
	  elem.appendChild (document.createTextNode (','));
	  elem.style.padding=0;
	  elem.style.border='none';
	  elem.style.fontSize=0;
	  elem.style.color='transparent';
	}
	
	function appendFromPermissionEntry (elem, ape) {
	  // alert ("appendFromPermissionEntry: " + objectToString (ape));
	  switch (ape.type) {
	  case PROP:
	    elem.appendChild (document.createTextNode (ape.name));
	    break;
	  case STAR:
	    var node = document.createElement ('span');
	    node.title = "" + ape.properties;
	    node.appendChild (document.createTextNode ('*'));
	    elem.appendChild (node);
	    break;
	  default:
	  }
	}

	////////////////////////////////////////////////////////////////////
	// implementation of the effect handler interface

	readEffects = emptyES ();
	writeEffects = emptyES ();

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

			if (defv === undefined) {
				defv = Math.floor((max - min) / 2);
			}
			if (steps === undefined) {
				steps = Math.floor((max - min) / 10) || 1;
			}

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
				cleanedReadEffects = readEffects,
				cleanedWriteEffects = writeEffects,
				effectsByFunction,
				fn, HIGH_DEGREE;
			
			console.log("compute effects");
			HIGH_DEGREE = (gconfig && gconfig.gdef && gconfig.gdef.HIGH_DEGREE) || 20;
			
			cleanedReadEffects = collapseHighDegree(cleanedReadEffects, 2, HIGH_DEGREE);
			cleanedWriteEffects = collapseHighDegree(cleanedWriteEffects, 2, HIGH_DEGREE);


			// TODO: pass config to library here as second parameter
			effectsByFunction = computeEffectsByFunction(cleanedReadEffects, cleanedWriteEffects, gconfig);

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
		
		var cvs = ["prefix_length", "prefix_degree", "prefix_maxlength",
		          "suffix_length", "suffix_degree", "suffix_maxlength"];
		for (var cv in cvs) {
			divNode.appendChild(config_control(cvs[cv], gconfig.def, cvs[cv], doStat, -1, 25, gconfig.def[cvs[cv]], 1));
		}
		divNode.appendChild(divChild);
		divNode = divChild;
				
		return doStat;
	}


	function registerEffect (mkPath, effects) {
	  return function(o, p, effl_str, eff_str, context) {
	    for (var i=0; i<context.length; i++) {
	      var path = acpToPath(context[i]);
	      addPath (effects, path);
	    }
	  };
	}

	function fromFile (record) {
	  if (record[0] == "read")
	    registerEffect (readPath, readEffects) (0,0,0,0,record[1]);
	  else if (record[0] == "write")
	    registerEffect (writePath, writeEffects) (0,0,0,0,record[1]);
	  else
	    return "illegalRecordInFile";
	}

	function create(divNode) {
	  return { statistic: stat (divNode),
	      assertEffectsRead:  registerEffect (readPath, readEffects), 
	      assertEffectsWrite: registerEffect (writePath, writeEffects)
	      };
	}
	SELF.create = create;
	
}(JSConTest));
