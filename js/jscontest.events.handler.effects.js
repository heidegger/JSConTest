// from JSConTest / js / jscontest.effects.js
"use strict";
(function (JSConTest) {
	var SELF = {};
	JSConTest.events.handler.gen = SELF;
	
	
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
	// {type: PARAMETER, number: anInt}
	// {type: VARIABLE, name: "aString"}

	function acpToPath(acp) {
		var r;
		if (acp.type === PROP) {
			r = acpToPath(acp.effect);
			r.push(acp.property);
			return r;
		}
	  if (acp.type === PARAMETER) {
	    return ['$' + acp.number];
	  }
	  if (acp.type === PARAMETER) {
	    return [acp.name];
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
	
	// an access effect <ace> extends this by
	// {type: QUESTIONMARK, effect: <ace>}
	// {type: STAR, effect: <ace>}
	// {type: noPROP}
	
	/////////////////////////////////////////////////////////////////
	
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
	  for (var p in ht)
	    if (ht.hasOwnProperty (p)) {
	      subsize += ht[p].n;
	      sublength = Math.min (sublength, 1 + lengthOfStrictPrefixes (ht[p]));
	    }
	  if (subsize != localsize || sublength == Infinity) {
	    return 0;
	  } else {
	    return sublength;
	  }
	}
	  
	  
	
	// merge a new path into an effect structure
	function addPath (es, path) {
	  es.n++;
	  var ht = es.succ;
	  for (var i=0; i<path.length; i++) {
	    var pathstep = path[i];
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
	      for (var pathstep in ht)
		if (ht.hasOwnProperty (pathstep)) {
		  sofar.push (pathstep);
		  h (ht[pathstep], i+1, sofar);
		  sofar.pop();
		  nsucc++;
		}
	      if (nsucc == 0) 
		collect.push (cloneArray (sofar));
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
	
	// overall procedure
	function permissionsFromES (es, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac) {
	
	  prefix_depth = prefix_depth || lengthOfCommonPrefix (es);
	
	  // compute prefixes
	  var prefixes = getInterestingPrefixes (es, prefix_depth, prefix_globalfrac);
	
	  // for each prefix, compute the corresponding permissions
	  var permissions = [];
	  for (var i=0; i<prefixes.length; i++) {
	    var prefix = prefixes[i];
	    print (objectToString (["considering prefix", prefix]));
	    var esOfPrefix = getQuotient (es, prefix);
	    var rev_suffixesOfES = getSuffixes (esOfPrefix);
	    var rev_es = createESfromPaths (rev_suffixesOfES);
	    var local_suffix_depth = suffix_depth || lengthOfStrictPrefixes (rev_es);
	    var rev_suffixes = getInterestingPrefixes (rev_es, local_suffix_depth, suffix_globalfrac);
	    print (objectToString (["local_suffix_depth=", local_suffix_depth,
				    "rev_es=", rev_es,
				    "rev_suffixes =", rev_suffixes]));
	
	    // create an access permission from prefix and suffixes
	    for (var j=0; j<rev_suffixes.length; j++) {
	      // get a permission for each suffix
	      var rev_suffix = rev_suffixes[j];
	      var rev_suffix_es = getQuotient (rev_es, rev_suffix);
	      permissions.push (createAPString (prefix, rev_suffix, rev_suffix_es));
	    }
	  }
	  return permissions;
	}
	
	// entry point for anchored paths
	function main (anchored_paths, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac) {
	  // create and fill the effect structure
	  var es = createESfromPaths (paths);
	  return mainES(es, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac);
	}
	
	function mainES(es, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac) {
	  var ht = es.succ;
	
	  var anchored_permissions = [];
	  // anchors have to be distinguished, anyway
	  for (var anchor in ht)
	    if (ht.hasOwnProperty (anchor)) {
	      var es_anchor = ht[anchor];
	      var permissions = permissionsFromES (es_anchor, prefix_depth, prefix_globalfrac, suffix_depth, suffix_globalfrac);
	      for (var i=0; i<permissions.length; i++)
		anchored_permissions.push (anchor + '.' + permissions[i]);
	    }
	
	  return anchored_permissions;
	}
	
	// examples
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
	EX3.anchored_paths = [["$1", "l"], ["$1", "h", "n", "v"], ["$1", "h", "n", "n", "v"], ["$1", "h", "v"], ["$2", "p"]];
	EX3.result = main (EX3.anchored_paths);

	
	function create(divId) {
		return { statistic: stat, 
			assertEffectsRead: EffRead, 
			assertEffectsWrite: EffWrite,
		};
	}
	SELF.create = create;
	
}(JSConTest));