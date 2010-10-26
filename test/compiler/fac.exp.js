var f = (function  () {
      function f_own (x)  {
            if ((JSConTest.effects.unbox(x) === 0. )) {
                return 0. ;
              };
            if ((JSConTest.effects.unbox(x) === 1. )) {
                return 1. ;
              };
            return (JSConTest.effects.unbox(x) * JSConTest.effects.unbox(JSConTest.effects.fCall(f, [JSConTest.effects.unbox((JSConTest.effects.unbox(x) - 1. ))])));
          };
        return JSConTest.tests.overrideToStringOfFunction(JSConTest.tests.enableAsserts(JSConTest.effects.enableWrapper(f_own, ["x"]), ["c_1"], "f"), (function  () {
          function f (x)  {
                if ((x === 0. )) {
                    return 0. ;
                  };
                if ((x === 1. )) {
                    return 1. ;
                  };
                return (x * f((x - 1. )));
              };
            return f;
        })(), true);
    })();
  (function  () {
    var gf7b8d42de3f00043e02b43d15cdd71b40 = JSConTest.contracts.Function([JSConTest.contracts.IIntervall(0. , 50. )], JSConTest.contracts.Integer, [], "f");
      JSConTest.tests.add("f", f, gf7b8d42de3f00043e02b43d15cdd71b40, 1000. );
      JSConTest.tests.setVar("c_1", gf7b8d42de3f00043e02b43d15cdd71b40);
  })();