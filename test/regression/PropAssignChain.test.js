var f = JSConTest.tests.addContracts("f_f0", JSConTest.tests.setVar("f_f0", JSConTest.tests.overrideToStringOfFunction(JSConTest.tests.enableAsserts((function  () {
      var o = {};
        o.x = o.y = "bla";
        if ((o.x !== "bla")) {
            throw "Should not happen x"
          };
        if ((o.y !== "bla")) {
            throw "Should not happen y"
          };
    }), ["c_1"], "f_f0"), (function f () {
      var o = {};
        o.x = o.y = "bla";
        if ((o.x !== "bla")) {
            throw "Should not happen x"
          };
        if ((o.y !== "bla")) {
            throw "Should not happen y"
          };
    }), true)), [{contract : JSConTest.tests.setVar("c_1", JSConTest.contracts.Function([], JSConTest.contracts.Undefined, {pos : [], neg : []}, "f_f0")), count : 1000. }], []);