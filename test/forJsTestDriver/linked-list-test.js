  var toArray = (function  () {
      function toArray_own ()  {
            JSConTest.tests.setVar("c_11", JSConTest.tests.assertParams(["c_10"], arguments, toArray_own, "toArray"));
            if (JSConTest.effects.isBox(this)) {
                var result = JSConTest.effects.box("result", []),
                  current = JSConTest.effects.box("current", JSConTest.effects.propAcc(this, "_head"));
                while (current) {
                  JSConTest.effects.mCall(result, "push", [JSConTest.effects.propAcc(current, "data")]);
                  current = JSConTest.effects.propAcc(current, "next");
                }
                return JSConTest.tests.getVar("c_11").assertReturn(JSConTest.effects.unbox(result));
              }
              else return JSConTest.tests.getVar("c_11").assertReturn(toArray_own.apply(JSConTest.effects.box_this(this), arguments));;
          };
        (function  () {
          function toArray () /* with lv: result,current*/ {
                var result = [],
                    current = this._head;
                while (current) {
                    result.push(current.data);
                    current = current.next;
                  }
                return result;
              };
            JSConTest.tests.overrideToStringOfFunction(toArray_own, toArray);
        })();
        return toArray_own;
    })();
  (function  () {
    var g3a84f4c183d052f8bb3bd9116623cd8a9 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), [{type : 5. , effect : {type : 2. , name : "this", fname : "toArray"}}], "toArray");
      JSConTest.tests.add("toArray", toArray, g3a84f4c183d052f8bb3bd9116623cd8a9, 1000. );
      JSConTest.tests.setVar("c_10", g3a84f4c183d052f8bb3bd9116623cd8a9);
  })();
  LinkedList.prototype = {constructor : LinkedList, add : add, size : size, toArray : toArray, toString : toString};
