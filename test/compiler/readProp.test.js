var f = (function  () {
      function f_own (i, o, p)  {
            if ((i == 0. )) {
                return o;
              }
              else {
                return f((i - 1. ), o[p], p);
              };
          };
        return JSConTest.tests.overrideToStringOfFunction(JSConTest.tests.enableAsserts(f_own, ["c_7", "c_6", "c_5", "c_4"], "f"), (function  () {
          function f (i, o, p)  {
                if ((i == 0. )) {
                    return o;
                  }
                  else {
                    return f((i - 1. ), o[p], p);
                  };
              };
            return f;
        })(), true);
    })();
  (function  () {
    var g20f5aebd514f4217abcd3ad2664cf2163 = JSConTest.contracts.Function([JSConTest.contracts.SingletonContract(0. , "0"), JSConTest.contracts.Top, JSConTest.contracts.Top], JSConTest.contracts.Top, [], "f");
      JSConTest.tests.add("f", f, g20f5aebd514f4217abcd3ad2664cf2163, 1000. );
      JSConTest.tests.setVar("c_7", g20f5aebd514f4217abcd3ad2664cf2163);
  })();
  (function  () {
    var g20f5aebd514f4217abcd3ad2664cf2162 = JSConTest.contracts.Function([JSConTest.contracts.IIntervall(0. , 1. ), JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.Top}]), JSConTest.contracts.Singleton("p")], JSConTest.contracts.Top, [], "f");
      JSConTest.tests.add("f", f, g20f5aebd514f4217abcd3ad2664cf2162, 1000. );
      JSConTest.tests.setVar("c_6", g20f5aebd514f4217abcd3ad2664cf2162);
  })();
  (function  () {
    var g20f5aebd514f4217abcd3ad2664cf2161 = JSConTest.contracts.Function([JSConTest.contracts.IIntervall(0. , 2. ), JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.Top}])}]), JSConTest.contracts.Singleton("p")], JSConTest.contracts.Top, [], "f");
      JSConTest.tests.add("f", f, g20f5aebd514f4217abcd3ad2664cf2161, 1000. );
      JSConTest.tests.setVar("c_5", g20f5aebd514f4217abcd3ad2664cf2161);
  })();
  (function  () {
    var g20f5aebd514f4217abcd3ad2664cf2160 = JSConTest.contracts.Function([JSConTest.contracts.IIntervall(0. , 3. ), JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.EObject([{name : "p", contract : JSConTest.contracts.Top}])}])}]), JSConTest.contracts.Singleton("p")], JSConTest.contracts.Top, [], "f");
      JSConTest.tests.add("f", f, g20f5aebd514f4217abcd3ad2664cf2160, 1000. );
      JSConTest.tests.setVar("c_4", g20f5aebd514f4217abcd3ad2664cf2160);
  })();