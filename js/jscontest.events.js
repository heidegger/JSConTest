/* Version: 0.2.0 */
/* author: Phillip Heidegger */


"use strict";
(function (P) {
  
  /* Array with all the log observers */
  var handler = [],
    E = {};

  P.events = E;
  

  
  /********** logger **********/
//   function logFail(v, c, anz) {
//     var l;
//     for (l in handler) {
//       if (handler[l].fail) {
//         handler[l].fail(v, c, anz);
//       }
//     }
//   }

//   function logSuccess(v, c, anz) {
//     var l;
//     for (l in handler) {
//       if (handler[l].success) {
//         handler[l].success(v, c, anz);
//       }
//     }
//   }

//   function logError(e, c, params) {
//     var l;
//     for (l in handler) {
//       if (handler[l].error) {
//         handler[l].error(e, c, params);
//       }
//     }
//   }

//   function logTest(v, c, test, anz) {
//     if (test) {
//       logSuccess(v, c, anz);
//     } else {
//       logFail(v, c, anz);
//     }
//   }
  
//   function logModuleChange(m) {
//     var l;
//     module = m;
//     for (l in handler) {
//       if (handler[l].moduleChange) {
//         handler[l].moduleChange(m);
//       }
//     }
//   }
  
//   function logCounterExpStart() {
//     var l;
//     for (l in handler) {
//       if (handler[l].CExpStart) {
//         handler[l].CExpStart();
//       }
//     }
//   }
  
//   function logCounterExp(ce) {
//     var l;
//     for (l in handler) {
//       if (handler[l].CExp) {
//         handler[l].CExp(ce);
//       }
//     }
//   }
  
//   function logStat() {
//     var l;
//     for (l in handler) {
//       if (handler[l].stat) {
//         handler[l].stat(testContracts,
//                        testCount,
//                        failCount,
//                        verifyContracts,
//                        errorContract,
//                        wellTestedCount);
//       }
//     }
//   }
  
//   function logAssertParam(cl,pl,str) {
//     var l;
//     for (l in handler) {
//       if (handler[l].assertParam) {
//         handler[l].assertParam(cl,pl,str);
//       }
//     }
//   }
  
//   function logAssertReturn(c,pv) {
//     var l;
//     for (l in handler) {
//       if (handler[l].assertReturn) {
//         handler[l].assertReturn(c,pv);
//       }
//     }
//   }
  
//   function logAssertEffectsRead(obj, prop, effl, eff) {
//     var l;
//     for (l in handler) {
//       if (handler[l].assertEffectsRead) {
//         handler[l].assertEffectsRead(obj, prop, effl, eff);
//       }
//     }
//   }
  
//   function logAssertEffectsWrite(obj, prop, effl, eff) {
//     var l;
//     for (l in handler) {
//       if (handler[l].assertEffectsWrite) {
//         handler[l].assertEffectsWrite(obj, prop, effl, eff);
//       }
//     }
//   }

  function fire(msg) {
    var l, // key
      h;   // handler itself

    for (l in handler) {
      h = handler[l];
      if (h) {
        if ((h[msg]) && (typeof h[msg] === 'function')) {
          // convert arguments into array, removing the first element
          // pass P as this object ==> never pass the global object
          h[msg].apply(P, Array.prototype.slice.call( arguments, 1 ));
        } else {
          if ((h['default']) && (typeof h['default'] === 'function')) {
            // convert arguments into real array
            var args = Array.prototype.slice.call( arguments );
            // default handler get the msg message as first argument
            h['default'].call(P, args );
          }
        }
      }
    }
  }
  
  function register(o) {
    handler.push(o);
  }

  function create_fire_function(msg) {
    return (function () {
              // turn arguments into real array 
              var args = Array.prototype.slice.call( arguments );
              // add msg at the beginning
              args.unshift( msg );
              // call fire function
              fire.apply( this, args)
            });
  }

  /** INTERFACE */
  E.create_fire_function = create_fire_function;
  E.register = register;
  E.fire = fire;
  
})(JSConTest);
