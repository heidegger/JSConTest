/* Version: 0.2.0 */
/* author: Phillip Heidegger */

/* This library will not change the global namespace in any sense. 
   But it assumes that the global variable PROGLANG exists and 
   register all its methods in PROGALNG.tests.
   
   In order to change this behaviour, please go to the end of the
   file and pass another object to the function. 
*/

"use strict";
(function (P) {
  var DEBUG = false;

  /* create a new object, and register it in the
     namespace PROGLANG */
  var T = {};
  P.tests = T;

  /* private variabels */
  /* collects all the tests that are added by TESTS.add(v,c,t); */
  var tests = {};
  /* collects counterexamples */
  var counterexp = {};
  var cexpuid = 0;
  /* the actual module */
  var module = "";
  /* Number of tests after which events in the browser are handled */
  var testCountPerStep = 5000;
  
  /* Contract Types */
  /* Each contract must have a type that is 
   * one of these.
   * They will be used in a further version to implenent 
   * rewriting of complex contracts, e.g. intersections.
   */
  /* No type is given */
  var ctNoType = 0;
  /* Basic Contracts: Singletons, String, Bool, Number, ...*/
  var ctBasic = 1; 
  /* Objects */
  var ctObject = 2;
  /* Arrays */
  var ctArray = 3;
  /* Functions */
  var ctFunction = 4;
  /* Union, Intersection, ... */
  var ctComplex = 5;
  /* Names */
  var ctName = 6;
  function makeContractType(ct) {
    if (P.check.isInt(ct) && (ct >= 0) && (ct < 7)) {
      return ct;
    } else {
      return 0;
    }
  }
  

  var testContracts = 0;
  var verifyContracts = 0;
  var testCount = 0;
  var failCount = 0;
  var errorContract = 0;
  var wellTestedCount = 0;
  /********** test interface **********/
  function fire(msg) {
    var slice = Array.prototype.slice,
        args  = slice.apply( arguments );
    if (P.events && P.events.fire && (typeof P.events.fire === 'function')) {
      P.events.fire.apply(this, args);
    }
  }
  function logTest(v, c, test, anz) {
    if (test) {
      fire('success', v, c, anz);
    } else {
      fire('fail', v, c, anz);
    }
  }

  function run(afterRun) {
    function logCExp() {
      fire('CExpStart');
      for (var m in counterexp) {
        var cm = counterexp[m];
        for (var i in cm) {
          fire('CExp',cm[i]);
        }
      }
      fire('stat', testContracts, testCount, failCount, verifyContracts,
           errorContract, wellTestedCount);
    }

    /* List of all moduls */
    var toDoM = [];

    /* List that stores all tests we are going to check in this
       module. */
    var toDoT = [];


    /* object that stores information about the 
       actual test contract. It contains:
       - c is the contract
       - v is the value that is tested against the contract
    */
    var test;

    /* Some numbers */
    var anz = 0;
    var toDoMax = 0;
    var toDoCount = 0;

    for (var m in tests) {
      toDoM.push({mname: m, m: tests[m]});
    }
    toDoM.reverse();

    /* run handler */
    function min(a,b) {
      if (a < b) {
        return a; 
      } else {
        return b;
      }
    }
    function withTry(flag,f,handler) {
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
      var t = min(toDoCount + testCountPerStep,toDoMax);
      function performCheck() {
        function check_ddresult(p) {
          // return boolean value
          var r = !(test.c.checkWithParams(test.v,p));
          if (r) {
            collectCounterExample(test.c.getCExp());
          }
          return r;
        }
        var b = true;
        for (; toDoCount < t; toDoCount = toDoCount + 1) {
          P.gen.initGen();
          /* this notation results in searching one counterexample
             per each contract, and then stop */
          testCount = testCount + 1;
          b = b && test.c.check(test.v);
          if (!b) {
            var ce = test.c.getCExp();
            if (ce.isCExp && (ce.isCExp())) {              
              cexpuid = cexpuid + 1;
              if (P.ddmin) {
                collectCounterExample(ce);
                P.ddmin.ddmin(check_ddresult, ce.params);
                ce = test.c.getCExp();
              }

              /* We have to think about the event interface for
                 the minimization, since this may lead into 
                 infinite loops (if the value is a function),
                 that we can not stop or detect in advance.
              */
              collectCounterExample(ce);
            }
            break;
          }
          /* Use this notation to continue searching counterexamples
             for a contract, even if an other counterexampe is found. */
          //b = c.check(v) && b;
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
          logTest(test.v, test.c, b, toDoCount);
        }
      }
      function errHandler(e) {
        if ((test.c) && test.c.get_last_created_values) {
          var params = test.c.get_last_created_values();
          errorContract = errorContract + 1;
          fire('error', e, test.c, params);
          toDoMax = toDoCount;
        } else {
          errorContract = errorContract + 1;
          fire('error', e);
          toDoMax = toDoCount;
        }
      }
      withTry(!DEBUG, performCheck, errHandler);
      resetMarked();
      fire('stat', testContracts, testCount, failCount, verifyContracts,
           errorContract, wellTestedCount);
    }
    function runTest() {
      test = toDoT.pop();
      ++testContracts;
      function performTestRun() {
        if (test.c.genNeeded && (test.c.genNeeded(test.v))) {
          toDoCount = 0;
          toDoMax = test.t;
          return ;
        } else {
          /* check contract without test it */
          toDoCount = 0; toDoMax = 0;
          var b = test.c.check(test.v);
          if (b) {
            ++verifyContracts;
          } else {
            ++failCount;
          }
          logTest(test.v, test.c, b);
        }
      }
      function errorHandler(e) {
        if ((test.c) && test.c.get_last_created_values) {
          var params = test.c.get_last_created_values();
          ++errorContract;
          fire('error', e, test.c, params);
          toDoMax = toDoCount;
        } else {
          ++errorContract;
          fire('error', e, test.c);
          toDoMax = toDoCount;
        }
      }
      return withTry(!DEBUG,performTestRun,errorHandler);
    }   
    /* select next modul */
    function runModul() {
      var modul = toDoM.pop();
      var m = modul.mname;
      fire('moduleChange',m);
      var tm = modul.m;
      for (var i in tm) {
        toDoT.push(tm[i]);
      }
    }
    function resetAM() {
      if (cancelAM) {
        logTest(test.v, test.c, true, toDoCount);          
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
        logTest(test.v, test.c, true, toDoCount);          
        cancelAC = false;
        toDoCount = 0;
        toDoMax = 0;
        return true;
      } else {
        return false;
      }
    }
    /* function which is called in regular intervalls */
    var cancel = false;
    var cancelAC = false;
    var cancelAM = false;
    doCancel = function() { 
      cancel = true; 
    };
    doCancelAC = function() { cancelAC = true; };
    doCancelAM = function() { cancelAM = true; };
    T.doCancel = doCancel;
    T.doCancelAC = doCancelAC;
    T.doCancelAM = doCancelAM;

    (function() {
      fire('stat', testContracts, testCount, failCount, verifyContracts,
           errorContract, wellTestedCount);
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
        setTimeout(arguments.callee, 0);
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

  function add(m,v,c,t) {
    if (!(tests[m])) {
      tests[m]= [];
    }
    tests[m].push({v: v, c: c, t: t});
  }
  function collectCounterExample(ce) {
    if (!(counterexp[module])) {
      counterexp[module] = [];
    }
    var cem = counterexp[module];
    for (var i in cem) {
      if (cem[i].compare(ce)) {
        return;
      }
    }
    ce.uid = cexpuid;
    counterexp[module].push(ce);
  }


  /********** contracts **********/
  function Contract(p) {
    var ct = makeContractType(p.contractType),
      cdes = p.initcdes,     
      gen = P.utils.getFun(p.generate,function() { return p.generate; }),
      check = P.utils.getFun(p.check, 
                             function(v) { 
                               if (p.check === v) { 
                                 return true; 
                               } else { 
                                 return false;
                               } 
                             }),
      sv = P.utils.getFun(simplValue,function(v) { return v; }),
      ce;
    
    this.check = function() {
      return check.apply(this,arguments);
    };
    this.gen = function() {
      var i;
      var g = gen.apply(this,arguments);
      var args = [];
      args.push(g);
      for (i = 0;i < arguments.length; i = i + 1) {
        args.push(arguments[i]);
      }
      if (this.check.apply(this,args)) {
        return g;
      } else {
        throw ("Implemenation of Generator is not valid. Please ensure " +
               "that each value that is generated by the " + 
               "do_generate function passes the do_check function.");
      }
    };
    this.simpl = function(v) {
      var r = sv.call(this,v);
    };
    this.failToString = function(v) {
      var r = ("Contract '" + this.getcdes() +
               "' is <em>not</em> fulfilled by the value: " +
               v + ".");
      return r;
    };
    this.okToString = function(v) {
      var r = "Contract '" + this.getcdes() + 
              "' is fulfilled by value: " + v + ".";
      return r;
    };
    this.getcdes = P.utils.getFun(p.getcdes,function() { return cdes; });
    this.setcdes = P.utils.getFun(p.setcdes,function(s) { cdes = s; });
    this.genNeeded = P.utils.getFun(p.genNeeded,
                                    function (v) { return false; });
    this.getCExp = function() { return ce; };
    this.registerCExp = function(setce) { 
      ce = setce; 
    };
    this.toString = this.getcdes;
    this.getContractType = function() { 
      return ct; 
    };
  }
  function SContract(check,generate,cdes,ct,genNeeded) {
    return Contract.call(this,ct,check,generate,null,null,genNeeded,cdes);
  }
  function PContract(ct,check,pl,p,gen,cdes,genNeeded) {
    if (!p) {
      p = 0.5;
    }
    if (P.check.isSArray(pl)) {
      return Contract.call(this,ct,check,
                           function() { return pickOrF(pl,p,gen); },
                           null,null,
                           genNeeded,
                           cdes);
    } else {
      throw "PContract needs array as parameter";
    }
  }
  function SingletonContract(value,cdes,genNeeded) {
    return Contract.call(this,ctBasic,value,value,null,null,genNeeded,cdes);
  }

  /* Interface of counterexamples : {
       isCExp: void -> true;
       value: value;
       contract: contract;
       ? (params: value array; )
       ? (result: value; )
       module: string;
       valueToString: void -> string;
       contrToString: void -> string;
       paramToString: void -> string;
       resultToString: void -> string;
       moduleToString: void -> string;
     }
  */
  function CExp(value, contract, params, result, module) {
    var tparams = params.slice(0);

    function contrToString(nextLine) {
      return contract.getcdes();
    }

    /*** TODO: parameter to String sollte durch ein TreeView 
         Steuerelement ersetzt werden */
    /*** paramToTreeView(parent) parent = html eltern element */
    
    function paramToString(nextLine) {
      return P.utils.valueToString(tparams, nextLine );
    }
    function resultToString(nextLine) {
      return P.utils.valueToString(result, nextLine);
    }
    this.compare = function(that) {
      return ((value === that.value) && 
              (contract === that.contract) && 
              P.utils.compareArray(tparams, that.params) && 
              (result === that.result));
    };
    this.isCExp = function() { 
      return true; 
    };
    this.value = value;
    this.contract = contract;
    this.params = tparams;
    this.result = result;
    this.module = module;
    this.valueToString = function() { 
      return P.utils.valueToString(value); 
    };
    this.contrToString = contrToString;

    /*** this.f = f (paramToTreeView) */
    this.paramToString = paramToString;
    this.resultToString = resultToString;    
    this.moduleToString = function() { return module; };
  }
  function CExpUnion(c,ce1,ce2,module) {
    this.isCExp = function() { 
      return true; 
    };
    this.value = ce1.value;
    this.contract = c;
    this.valueToString = function () { 
      return P.utils.valueToString(ce1.value) 
    };
    this.contrToString = function () { 
      return (c.getcdes()); 
    };
    this.paramToString = function () {
      return ("first: " + ce1.paramToString() +
              "second: " + ce2.paramToString());
    };
    this.resultToString = function () {
      return ("first: " + ce1.resultToString() + 
              "second: " + ce2.resultToString());
    };
    this.module = module;
    this.moduleToString = function() { 
      return module; 
    };
  }


  /********** Null, Undefined, Boolean, String, Number **********/
  T.Top = new SContract(function() { return true; }, P.gen.genTop, "top");
  T.TopOUndef = new SContract(function(v) { return (v !== undefined); }, 
                              P.gen.genTopOUndef, "utop");
  T.PTop = function(a,p) { 
    return new PContract(ctNoType,
                         function() { 
                           return true; 
                         }, 
                         a, 
                         p, 
                         P.gen.genTop, 
                         "top"); 
  };
  T.SingletonContract = function (v,s) { 
    return new SingletonContract(v,s) 
  };
  T.Null = new SingletonContract(null, "null");
  T.Undefined = new SingletonContract(undefined, "undefined");
  T.Boolean = new SContract(P.check.isBoolean, P.gen.genBoolean,
                            "boolean", ctBasic);
  T.True = new SingletonContract(true, 'true');
  T.False = new SingletonContract(false, 'false');
  T.String = new SContract(P.check.isString, P.gen.genString, 
                           'string', ctBasic);
  T.Number = new SContract(P.check.isNumber, P.gen.genNumber,
                           "number", ctBasic);
  T.Integer = new SContract(P.check.isInt, P.gen.genInt,
                            "integer", ctBasic);
  T.PInteger = function (iA,p) {
    return new PContract(ctBasic,P.check.isInt,iA,p,P.gen.genInt,
                         "PInteger{" + P.utils.valueToString(iA) + "}");
  };
  T.AInteger = function(iList,fList) {
    if (!iList) {
      iList = [0,1];
    }
    iList = sadd(0,iList);
    iList = sadd(1,iList);
    if (!fList) {
      fList = T.ABasicFuns;
    }
    return new SContract(P.check.isInt,
                         function() { 
                           return P.gen.genAInt(iList,fList); 
                         },
                         "AInteger{" + P.utils.valueToString(iList) 
                         + "; " + P.utils.valueToString(fList) + "}",
                         ctBasic);
  };
  T.Id = new SContract(function (x,y) { return x === y; },
                       function (x) { return x; },
                       "Id",
                       ctBasic);
  T.ABasicFuns = [
    { getcdes: function() { return "+"; }, 
      arity: 2, 
      f: function (x,y) { return x + y; }},
    { getcdes: function() { return "-"; }, 
      arity: 2, 
      f: function (x,y) { return x - y; }},
    { getcdes: function() { return "*"; }, 
      arity: 2, 
      f: function (x,y) { return x * y; }},
    { getcdes: function() { return "/"; }, 
      arity: 2, 
      f: function (x,y) { return x / y; }}
    ];
  T.IIntervall = function(low,high) {
    if (P.check.isInt(low) && P.check.isInt(high)) {
      var o = new SContract(function(v) { return P.check.isIInt(low,high,v); },
                            function() { return P.gen.genIInt(low,high); },
                            "[" + low + "..." + high + "]",
                            ctBasic);
      return o;
    } else {
      if ((!isNumber(low)) || (!isNumber(high))) {
        throw "Intervall needs numbers as bounds";
      } else {
        throw "An Integer Intervall needs Integers as bounds, not floats.";
      }
    }
  }
  T.NIntervall = function(low,high) {
    if (P.check.isNumber(low) && P.check.isNumber(high)) {
      var o = new SContract(function (v) { 
                              return P.check.isNInt(low,high,v); 
                            },
                            function() { return P.gen.genNInt(low,high); },
                            "[/" + low + "..." + high + "]",
                            ctBasic);
      return o;
    } else {
      throw "Invervall needs number as bounds";
    }
  };
  
  /********** Objects **********/
  // Object without additional informations 
  T.Object = new SContract(P.check.isObject,P.gen.genObject,"object",ctObject);
  /* Object with properties, that are simple. Property names 
   * only contains characters and digits. 
   */ 
  T.SObject = new SContract(P.check.isObject,P.gen.genSObject,"sobject",ctObject);
  /* Object like "Object", but with additional information about
   * properties that are important. 
   * If a property name is generated randomly, p is the probability
   * that a name from the list pl of property names is choose. 
   * If no name is choose from pl, a simple property, only containing
   * characters and digits is generated. 
   */
  T.PObject = function(pl,p) {
    return new SContract(P.check.isObject,
                            function() { return P.gen.genPObject(pl,p); },
                            "pobject{" + P.utils.valueToString(pl) + "}",
                            ctObject);
  };
  /* Objects with an exact property list. pl is a list of objects 
   * which contains property names (as name) and contracts (as contract).
   * The checker ensures that each property given by pl exists and that
   * the value of the property fulfills the suitable contract. 
   * The generator creates objects randomly with exactly the given set
   * of properties, calling gen() for each contract given in pl for each
   * property. 
   */
  T.EObject = function(pl) {
    var o = new Contract(ctObject,
                         function (v) { return P.check.isObject(v,pl); },
                         function () { return P.gen.genObject(pl); },
                         function () { 
                           var s = "eobject{";
                           var pls = [];
                           var random = false;
                           for (j in pl) {
                             var p = pl[j];
                             if (p.name && p.contract) {
                               pls.push(p.name + ":" + p.contract.getcdes());
                             } else {
                               if (p.random) { 
                                 random = true;
                               } else { 
                                 pls.push(P.utils.valueToString(p));
                               };
                             };
                           };
                           s += concat(pls,",","","",false);
                           if (random) {
                             s += ",...";
                           };
                           return s + "}";
                         });
    return o;
  };
  /* An Array. t is the type of the elements. */
  T.Array = function(t) { 
    return (new Contract(ctArray,
                         function (v) { return P.check.isArray(v,t); }, 
                         function () { return P.gen.genArray(t); },
                         function () { return "array[" + t.getcdes() + "]"; } ));
  }
  
  /*********** FUNCTION **********/
  /* A function contract. pl is a list of contracts for the
   * parameters of the function, while rt describes the result
   * value of the function. eff is an array representing the 
   * effects of a function. The effect can be omited. 
   * T.Function([T.Boolean,T.String], T.String) states:
   *   (boolean, string) -> string
   * The check for a function is done by generating a value for
   * each parameter, then call the function and checking, if the
   * result value fulfills rt.
   */
  T.Function = function(pl,rt,eff) {
    function check(v) {
      var pvl = [];
      for (var i in pl) {
        pvl[i] = pl[i].gen();
      };
      return this.checkWithParams(v,pvl);
    }
    function checkWithParams(v,pvl) {
      var t = typeof(v),
        res, cres, lcvc;
      if (t !== 'function') {
        return false;
      }
      lcvs =  P.utils.valueToString(pvl);
      res = v.apply(null,pvl);
      cres = rt.check(res);
      if (!cres) {
        /* collect counterexample */
        this.registerCExp(new CExp(v,this,pvl,res));
        return false;
      } else {
        return true;
      }
    }
    function getcdes() {
      return pldes + "->" + rt.getcdes();
    }
    function setcdes() {
      throw "Setting description for function contract not supported";
    }

    var lcvs;
    var pldes = "";
    for (var i in pl) {
      if (i > 0) pldes += ", ";
      pldes += pl[i].getcdes();
    };
    var c = new Contract(ctFunction, check, gen, getcdes, setcdes,
                            P.check.isFunction);
    function gen() {
      return function () {
        if (c.checkParams(arguments)) return rt.gen();
        
        // TODO: What should happen, if the arguments 
        // did not pass the check?
      };
    }
    c.checkWithParams = checkWithParams;
    c.checkParams = function (plv) {
      var v, c;
      for (var i in pl) {
        v = plv[i];
        c = pl[i];
        if (!(c.check(v))) {
          return false;
        }
      }
      return true;
    };
    c.checkReturn = function(v) {
      var ok = rt.check(v);
      if (!ok) {
        fire('assertReturn', c, v);
      }
    };
    c.get_last_created_values = function() {
      return lcvs;
    };
    c.registerEffects = function(pl,fname) {
      if (T.callback.registerEffect) {
        // call registerEffect, which will return a uid
        // create new object, that has a method called
        // unregisterEffect, that is able to call 
        // the callback function unregisterEffect with
        // the uid gernerated by registerEffect.
        var uid = T.callback.registerEffect(eff,pl,fname);
        if (T.callback.unregisterEffect) {
          var o = {
            unregisterEffect: function () {
              T.callback.unregisterEffect(uid);
              return c;
            }
          }
          return o;
        }
      }
      return c;  
    };
    return c;
  }
  
  T.Depend = function(order,dl) {
    var dparam = {};
    function getDepend(i) {
      if (i < dl.length - 1) return dl[i];
    };
    function getDependResult() {
      return dl[dl.length - 1];
    };
    function getOrder() {
      return order;
    };
    dparam.getDepend = getDepend;
    dparam.getDependResult = getDependResult;
    dparam.getOrder = getOrder;
    return dparam;
  }
  T.DFunction = function(pl,rt,dparam) {
    function DValues () {
      var scope = [[]];
      var as = 0;
      this.getValue = function(s,p) {
        return scope[s-1][p-1];
      };
      this.setValue = function(param,value) {
        scope[as][param] = value;
      };
    };
    var lsvs = "";
    var pldes = "";
    for (var i in pl) {
      if (i > 0) {
        pldes += ", ";
      }
      pldes += pl[i].getcdes();
    };
    function getValues(dvalues,dpl) {
      var dvl = [];
      for (var i in dpl) {
        dvl.push(dvalues.getValue.apply(dvalues,dpl[i]));
      }
      return dvl;
    };
    function check(v,dvalues) {
      var t = typeof(v);
      if (t !== 'function') {
        return false;
      }
      if (dvalues === undefined) {
        dvalues = new DValues();
      }
      var pvl = [];
      
      var order = dparam.getOrder();
      for (var i in order) {
        /* index of parameter, that should be generated */
        var p = order[i];
        
        /* list of ($,anz) tuppels, from which the parameter depends */
        var dpl = dparam.getDepend(p);
        
        /* collected values, corresponding to the ($,anz) list */
        var dvl = getValues(dvalues,dpl);
        
        /* call the generator, this = pl[p], other parameters dvl */
        var value = pl[p].gen.apply(pl[p],dvl);
        pvl[p] = value;
        
        dvalues.setValue(p,value);
      }
      lcvs =  P.utils.valueToString(pvl);
      var res = v.apply(null,pvl);
      var cres = rt.check(res);
      if (!cres) {
        /* collect counterexample */
        this.registerCExp(new CExp(v,this,pvl,res));
        return false;
      } else {
        return true;
      };
    };
    function getcdes() {
      return pldes + "-D>" + rt.getcdes();
    };
    function setcdes() {
      throw "Setting description for function contract not supported";
    };
    var c = new Contract(ctFunction,check,{},getcdes,setcdes,
                         P.check.isFunction);
    c.checkParams = function (plv) {
      for (var i in pl) {
        v = plv[i];
        c = pl[i];
        if (!(c.check(v))) {
          return false;
        }
      };
      return true;
    };
    c.checkReturn = function(v) {
      var ok = rt.check(v);
      if (!ok) {
        fire('assertReturn', c, v);
      };
    };
    c.get_last_created_values = function() {
      return lcvs;
    };
    return c;
  };
  


  /*********** UNION **********/
  var Union, UnionAddSimplRule;
  (function () {
    var simplRules = [];
    function addSimpl(sr) {
      if (P.check.isFunction(sr)) {
        simplRules.push(sr);
      }
    };
    function createUnion(c1,c2) {
      function check(v) {
        var c1r = c1.check(v);
        if (c1r) {
          return true;  
        } else {
          var c2r = c2.check(v);
          if (!c2r) {
            // TODO: Is this the intended semantics?
            var ce1 = c1.getCExp();
            var ce2 = c2.getCExp();
            if (ce1 && ce2) {
              this.registerCExp(new CExpUnion(this,ce1,ce2));
            } else {
              if (ce1) {
                this.registerCExp(ce1);
              } else {
                if (ce2) {
                  this.registerCExp(ce2);
                };
              };
            };
            return false;
          } else {
            return true;
          };
        }
      };
      function generate() {
        var r = Math.random();
        if (r < 0.5) {
          return c1.gen();
        } else {
          return c2.gen();
        }
      };
      function getcdes() {
        return ("(" + c1.getcdes() + " or " + c2.getcdes() + ")");
      };
      for (var i in simplRules) {
        var sr = simplRules[i];
        var c = sr(c1,c2);
        if (c) return c;
      };
      return new Contract(ctComplex,check,generate,getcdes);
    };
    Union =  createUnion;
    UnionAddSimplRule = addSimpl;
    
    function simplTrueFalseBool(c1,c2) {
      if (((c1 === T.True) && (c2 === T.Boolean))
          || ((c1 === T.Boolean) && (c2 === T.True))
          || ((c1 === T.False) && (c2 === T.Boolean))
          || ((c1 === T.Boolean) && (c2 === T.False))) {
        return T.Boolean;
      } else {
        return false;
      };
    };
    function simplIntervall(c1,c2) {
      
      
    };
    
    addSimpl(simplTrueFalseBool);
  })();

  
  /********** Intersection **********/
  T.Intersection = function(c1,c2) {
    if (c1.getContractType 
        && (c1.getContractType() == ctFunction)
        && c2.getContractType 
        && (c2.getContractType() == ctFunction)) {
      
    } else {
      throw "Intersections are only allowed for two function contracts";
    }
  };
  
  /********** NAMES **********/
  var resetMarked, Name, Let;
  (function () {
    var ntable = {};
    var cnames = [];
    var testTable = function(name,f,g,err) {
      var c = ntable[name];
      if (c) {
        if (!(c.marked)) {
          c.marked = true;
          var r = f(c.contract);
          c.marked = false;
          return r;
        } else {
          return g(c.contract);
        }
      } else {
        throw ("Invalid contract! There exists no contract with name: '" 
               + name + "'. " + err);
      };
      
    };
    Name = function(name) {
      var gcdes = function(i) {
        return "Name: " + name + ", Image: " + i;
      };
      function throwRecError(cstr) {
        throw ("Invalid Contract '"
               + cstr 
               + "'! Recursion, but no function contract visted");
      };
      function check(v) {
        var r = testTable(name,
                          function(c) { var tmp = c.check(v); return tmp; },
                          function(c) { throwRecError(gcdes(c.getcdes())); },
                          "Invalid call of check.");
        return r;
      };
      function generate() {
        var r = testTable(name,
                          function(c) { var tmp = c.gen(); return tmp; },
                          function(c) { throwRecError(gcdes(c.getcdes())); },
                          "Invalid call of generate.");
        
        return r;
      };
      function getcdes() {
        var r = testTable(name,
                          function(c) { 
                            var tmp = c.getcdes(); 
                            return gcdes(tmp); 
                          },
                          function(c) { 
                            return "Name: " + name;
                          },
                          "Name: " + name + "(no Image)");
        return r;
      };
      var o = new Contract(ctName,check,generate,getcdes);
      cnames.push({name: name, contract: o, marked: false});
      return o;
    };
    
    Let = function (name,c) {
      ntable[name] = {name: name, contract: c};
    };
    resetMarked = function() {
      for (var i in ntable) {
        var o = ntable[i];
        o.marked = false;
      }
    };
  })();
  
 
  /**********************************/
  /*            Interface           */
  /**********************************/

  /* Contract */
  /** Contract Interface:
      { Checks if the parameter fulfills the value.
        * check: value -> boolean;
       
        generate parameters for functions
        * gen: void -> vlaue;

         simplify counterexamples
         * simpl: value -> value;

         Tests if we need to generate value to check function
         This will be true if value is a function, or an
         object that does provide methods. Otherwise we can
         do the check without generating examples.
         * genNeeded : value -> boolean

         Returns the counterexample that breaks the contraint
         if a test find a counterexample.        
         * getCExp: void -> CExp
       
         Register a counterexample for a contract
         * registerCExp: CExp -> void
  
         String methods, to generate logging infos
         * failToString: value -> string;
         * okToString: value -> string;
         * getcdes: void -> string;
         * setcdes: string -> void;
         * toString: void -> string;
       }
  */
  T.Name = Name;
  T.Let = Let;
  T.Union = Union;
  
  /** TODO: needs type signature and docu */
  T.Contract = Contract;
  
  /* Tests */
  T.run = run;
  T.add = add;
  T.setStepCount = function(ns) { testCountPerStep = ns; };
  
  /** newSContract: (check, generate, cdes, ctype, genNeeded) -> Contract
      The function newSContract creates a new Contract. It 
      takes 5 parameters, but you can omit the last two 
      of them.
      check is a predicate for the contract,
      generate is a generator and 
      cdes is a string representation for a contract.
  */
  T.SContract = SContract;
  
  (function () {
    var vars = {};
    T.setVar = function(vname,value) {
      vars[vname] = value;
    };
    T.getVar = function(vname) {
      return vars[vname];
    };
    T.pushVar = function(vname,value) {
      if (!P.check.isSArray(vars[vname])) {
        vars[vname] = [];
      };
      vars[vname].push(value);
    };
    T.popVar = function(vname) {
      if (!P.check.isSArray(vars[vname])) {
        // something strange happens...
      } else {
        return vars[vname].pop();
      };
    };
  })();
  
  var testmode =
    (function () {
      var inTestMode = false;
      function intoTest() { inTestMode = true };
      function leafTest() { inTestMode = false };
      function getTestMode() { return inTestMode; };
      return { iT: intoTest, lT: leafTest, gT: getTestMode };
    })();
  var intoTest = testmode.iT;
  var leafTest = testmode.lT;
  var getTestMode = testmode.gT;
  
  T.assertParams = function (cl,pl,str,fname) {
    var clreal = [];
    // TODO: Why does this work with for (var in ...)?
    // If cl is an array, this will not work
    for (var i in cl) {
      clreal.push(T.getVar(cl[i]));
    };
    var ret = [];
    if (getTestMode()) {
      ret = clreal;
    } else {
      ret = [];
      for (var i in cl) {
        var c = T.getVar(cl[i]);
        if (c.checkParams(pl)) {
          if (c.registerEffects) {
            ret.push(c.registerEffects(pl,fname));
          } else {
            ret.push(c);
          }
        }
      }
      if (ret.length < 1) {
        var pla = [];
        for (var i = 0; i < pl.length; i++) pla.push(pl[i]);
        fire('assertParam', clreal, pla, str);
      }
    }
    ret.assertReturn = function(v) {
      if (getTestMode()) {
        return v;
      }
      for (var i = 0; i < this.length; i++) {
        var c;
        if (this[i] && this[i].unregisterEffect) {
          c = this[i].unregisterEffect();
        } else {
          c = this[i];
        }
        c.checkReturn(v);
      }
      return v;
    }
    return ret;
  }
  T.overrideToStringOfFunction = function (f,fstr) {
    f.toString = function () { 
      return "" + fstr;
    };
  };
  T.callback = {};
  
 })(PROGLANG);


