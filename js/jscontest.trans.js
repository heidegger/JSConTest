/** version 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function (P) {
  // Effect Paths
  var PARAMETER = 1;
  var VARIABLE = 2;
  var PROP = 3;
  var QUESTIONMARK = 4;
  var STAR = 5;
  var aLL = 6;

  
  // PRIVATE VARS
  var checkEffect = false;
  
  var undoLog = new Array();
  //var undoLogEffects = new Array();
  
  // array 
  //    ( { proto:   object the method is assigned by the browser 
  //        undo:    undo factory method for the method m
  //        doApply: used instead of m.apply(object,params) if spezified
  //        method:  the method itself
  //      } )
  var undoFactory = [];
  
  // store which effects we are checking right now
  var effect_store = {};
  
  function cfire() {
    var slice = Array.prototype.slice,
        args  = slice.apply( arguments);
    
    if (P.events && P.events.create_fire_function 
        && (typeof P.events.create_fire_function === 'function')) {
      return P.events.create_fire_function.apply(this, args );
    }
  }

  }
  
  function collectMethodsPlain(methods) {
    // if the object contains the method itself,
    // we are at the correct prototype, which we should
    // store in our global undoFactory. This will allow
    // us later to use instanceof togehter with the 
    // object and the prototype to check if we need to
    // register an undo entry in the undoLog.
    
    // === verwenden um functionen zu vergleichen
    for (mname in methods) {
      if (this.hasOwnProperty(mname) && this[mname] && 
          typeof this[mname] === 'function') {
        var undoObj = { proto: this, 
                        undo: methods[mname], 
                        method: this[mname],
        };
        undoFactory.push(undoObj);
      };
    };
  };
  
  function collectMethodsDeep(methods) {
    collectMethodsPlain.apply(this,[methods]);
    // the property is part of an parent object, so we will
    // secure it in a recursive call
    
    // if (e.__proto__ != e.constructor.prototype) {
    // This will hopefully never happen. If it does,
    // this means the not standard property __proto__ 
    // behaves not equal to the constructor.prototype
    // This can happen, if the programmer changes the
    // prototype property of functions after use them
    // as constructors. :(((
    // In this case, there is no way to detect for sure
    // the prototype of the object, so maybe we should
    // then raise an error here??
    // } else {
    if ((this.__proto__) && (this.__proto__ != this)) {
      collectMethodsDeep.apply(this.__proto__,[methods]);
    }
    // }
  };
  
  function getUndoFactoryForMethod(m) {
    if (undoFactory) {
      for (var i = 0; i < undoFactory.length; ++i) {
        if (undoFactory[i].method === m) {
          return undoFactory[i].undo;
        }
      }
    }
    return false;
  }
  
  function getUndoFactoryForObject(obj,mname) {
    return getUndoFactoryForMethod(obj[mname]);
  };
  
  function init() {
    undoLog = new Array();      
    undoLogEffects = new Array();
    effect_store = {};
  };
  
  function initLibrary() {
    // PRIVATE variables 
    // ELEMENTS
    var elements = { 
      ul: { 
        appendChild: function(node) { 
          function undo() {
            if (oldParent) {
              oldParent.insertBefore(node,oldnS);
            } else {
              parent.removeChild(node);
            }
          }
          var parent = this;
          var oldParent = node.parent;
          var oldnS = node.nextSibling;
          return undo;
        },
        removeChild: function(node) {
          function undo() {
            if (parent) {
              parent.insertBefore(node,next);          
            }
          }
          var parent = this;
          var next = node.nextSibling;
          return undo; 
        },
        insertBefore: function(node,next) {
          function undo() {
            if (oldParent) {
              oldParent.insertBefore(node,oldnS);
            } else {
              parent.removeChild(node);
            }
          }
          var parent = this;
          var oldParent = node.parent;
          var oldnS = node.nextSibling;
          return undo;
        },
      },
    };
    
    for (p in elements) {
      var sampleObject = document.createElement(p);
      collectMethodsDeep.apply(sampleObject,[elements[p]]);
    };  
    
    init();
  }
  
  function revert() {
    for (var i = undoLog.length - 1; i > -1; --i) {
      undoLog[i]();
    };
    init();
  };
  
  function doPropAssignment(object,prop,righthandside,operator_lambda) {
    function createUndoProp(object,prop,value) {
      return (function () { object[prop] = value });
    };
    var old_value = object[prop];
    var new_value = righthandside;
    if (operator_lambda) {
      new_value = operator_lambda(old_value,righthandside);
    }
    undoLog.push(createUndoProp(object,prop,old_value));
    object[prop] = new_value;
    
    // TODO: put correct event handler here
    return checkObj(object, prop, undefined, checkWrite,
                    cfire('assertEffectsWrite'));
  };
  
  function doMCall(method,object,params) {
    
    // if method is equal to the call method,
    // remove one indirection
    if (method === Function.call) {
      var nparams = [];
      for (var i = 1; i < params.length; ++i) {
        nparams.push(params[i]);
      };
      return doMCall(object,params[0],nparams);
    }
    
    // if method is the apply method, remove one
    // indirection
    if (method === Function.apply) {
      return doMCall(object,params[0],params[1]);
    };
    
    // the method is a usual method, so test for
    // undo and call it afterwards
    var undoFactory = getUndoFactoryForMethod(method);
    if (undoFactory) {
      var undoFunction = undoFactory.apply(object,params);
      if (undoFunction) undoLog.push(undoFunction);
    };
    return method.apply(object,params);
    
  }
  
  function doMethodCall(object,methodname,params) {
    return doMCall(object[methodname],object,params);
  }
  function pushUndo(undoLambda) {
    undoLog.push(undoLambda);
  };
  
  // eff is an entry of an entry in the effect store
  // context_for_uid is the first path to the object, 
  // that was used to read it for the corresponding context
  // our task here is, to check if a read access is valid here
  function isAllowedEff(context,eff) {
    switch (eff.type) {
    case PARAMETER:
      return ((context.type === PARAMETER) 
              && (eff.number === context.number));
    case VARIABLE:
      alert("Not yet implemented");
      return false;
    case PROP:
      if ((context.type === PROP) && 
          (context.property === eff.property)) {
        return isAllowedEff(context.effect,eff.effect);
      } else {
        return false;
      };
    case QUESTIONMARK:
      if (context.type === PROP) {
        return isAllowedEff(context.effect,eff.effect);
      } else {
        return false;
      };
    case STAR: 
      if (context.type === PROP) {
        if (isAllowedEff(context.effect,eff.effect)) {
          return true;
        };
        return isAllowedEff(context.effect,eff);
      }
    default: return false;
    };
  };
  function isAllowedEffAllPrefixes(context,eff) {
    if (isAllowedEff(context,eff)) {
      return true;
    } else {
      if (eff.effect) {
        return isAllowedEffAllPrefixes(context,eff.effect);
      } else {
        return false;
      };
    };
  };
  function isAllowedEffl(uid,context,effl,isAlow) {
    // each entry in the effect store, that is 
    // not younger then the object itself, is allowed
    if (context && (context.alloc >= uid))
      return true;
    if ((typeof effl === 'object') && (effl.type === ALL))
      return true;
    
    // if the object is older then the entry in the effect store
    // check the access. Here, one of them must allow the access
    for (var i = 0; i < effl.length; ++i) {
      var eff = effl[i];
      if (isAlow(context,eff)) return true;
    };
    return false;
  };
  
  function checkReadWrite(uid,context,isAllow) {
    if (!checkEffect) return true;
    var effl = effect_store[uid];
    if (effl && (!isAllowedEffl(uid,context,effl,isAllow))) {
      return false;
    };
    return true;
  };
  function checkRead(uid,context) { 
    return checkReadWrite(uid,context,isAllowedEffAllPrefixes);
  };
  function checkWrite(uid,context) { 
    return checkReadWrite(uid,context,isAllowedEff);
  };
  function getContexts(value) {
    if (typeof value === 'object' && value !== null) {
      if (typeof (value.__contexts__) !== 'object') {
        // create the object, in which we store our
        // context information
        var context = {};
        value.__contexts__ = context;
        return context;
      } else {
        return value.__contexts__;
      };
    } else {
      return {};
    };
  };
  function checkObj(obj,prop,value,check,eventHandler) {
    if (!checkEffect) return value;
    if (obj && (obj.__contexts__)) {
      var value_contexts = getContexts(value);
      for (var unique_id in obj.__contexts__) {
        // compute access path from the context of obj and the property name
        var context = obj.__contexts__[unique_id];
        var new_context = 
          { type : PROP,
            property : prop,
            effect : context
          }
        value_contexts[unique_id] = new_context;
        if (!check(unique_id,new_context)) {
          eventHandler(obj,prop,
                       effect_store, 
                       effect_store[unique_id]);
        };
        return value;
      }
    } else {
      if (!obj.__contexts__) eventHandler(obj,prop,
                                          effect_store,
                                          false);
      return value;
    }
  };
  function doPropRead(obj,prop) {
    return checkObj(obj, prop, obj[prop], checkRead, 
                    cfire('assertEffectsRead'));
  };
  
  // This method is called at the beginning of a function
  // The effect (eff) stores the css effect attached to
  // the contract of the function. 
  // The array pl stores the parameters.
  // The method does the following:
  // - It creates a new unique id for the effect
  // - Using the uid the parameters are taged with $1, .., $n
  // - The uid is returned, such that the unregisterEffect
  //   method later can delete the effect
  var getUid = function () { return undefined; };
  var registerEffect = 
    (function () {
      var i = 0;
      function getGlobalObject() { return this };
      function registerEffect(effl,pl,fname) {
        var uid = i;
        ++i;
        var gO = getGlobalObject();
        var contexts = getContexts(gO);
        contexts[uid] = 
          { type: PARAMETER,
            number: 0,
            fname: fname
          };
        for (var j = 0; j < pl.length; ++j) {
          if (typeof(pl[j]) === 'object') {
            contexts = getContexts(pl[j]);
            contexts[uid] = 
              { type: PARAMETER,
                number: j + 1,
                fname: fname
              };
          };
        }
        effect_store[uid] = effl;
        return uid;
      };
      getUid = function () { return uid };
      return registerEffect;
    })();
  function unregisterEffect(uid) {
    delete effect_store[uid];
  };
  function newObj(o) {
    o.__contexts__.alloc = getUid();
  };
  
  function effToString(eff) {
    if (!eff) return "NO VALID EFFECT";
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
    default: return "NO KNOWN EFFECT TYPE";
    };
  };
  function efflToString(effl) {
    if ((typeof effl === 'object') && (effl.type === ALL)) {
      return "*";
    };
    var a = new Array();
    for (var i = 0; i < effl.length; ++i) {
      a.push(effToString(effl[i]));
    };
    return a;
  }
  function effStoreToString(eff_store) {
    var obj = {};
    for (var uid in eff_store) {
      if (eff_store[uid]) {
        obj[uid] = efflToString(eff_store[uid]);
      };
    };
    return obj;
  };
  function checkEffects(b) {
    checkEffect = b;
  };
  
  var trans = 
    { initLibrary: initLibrary, 
      init: init,
      commit: init,
      revert: revert,
      
      doPropAssignment: doPropAssignment,
      doPropRead: doPropRead,
      doMethodCall: doMethodCall,
      newObj: newObj,
      
      pushUndo: pushUndo,
      registerEffect: registerEffect,
      unregisterEffect: unregisterEffect,
      getUid: getUid,
      effToString: effToString,
      efflToString: efflToString,
      effStoreToString: effStoreToString,
      checkEffects: checkEffects
    };
  P.trans = trans;
  P.tests.callback.registerEffect = registerEffect;
  P.tests.callback.unregisterEffect = unregisterEffect;
  
})(JSConTest);
