/* Version: 0.2.0 */
/* author: Phillip Heidegger */


"use strict";
(function (P) {
  
  /* Array with all the log observers */
  var handler = [],
    E = {};

  P.events = E;
  
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
