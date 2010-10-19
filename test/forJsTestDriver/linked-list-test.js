var LinkedList = (function  () {
      function LinkedList_own ()  {
            JSConTest.tests.setVar("c_6", JSConTest.tests.assertParams(["c_1"], arguments, LinkedList_own, "LinkedList"));
            trans.propAss(this, "_length", 0. , undefined);
            trans.propAss(this, "_head", null, undefined);
          };
        (function  () {
          function LinkedList () /* with lv: */ {
                this._length = 0. ;
                this._head = null;
              };
            JSConTest.tests.overrideToStringOfFunction(LinkedList_own, LinkedList);
        })();
        return LinkedList_own;
    })();
  var size = (function  () {
      function size_own ()  {
            JSConTest.tests.setVar("c_9", JSConTest.tests.assertParams(["c_8"], arguments, size_own, "size"));
            return JSConTest.tests.getVar("c_9").assertReturn(this._length);
          };
        (function  () {
          function size () /* with lv: */ {
                return this._length;
              };
            JSConTest.tests.overrideToStringOfFunction(size_own, size);
        })();
        return size_own;
    })();
  var toArray = (function  () {
      function toArray_own ()  {
            JSConTest.tests.setVar("c_13", JSConTest.tests.assertParams(["c_11"], arguments, toArray_own, "toArray"));
            var result = [],
                current = this._head;
            while (current) {
                trans.mCall(result, "push", [current.data]);
                (function  () {
                trans.pushUndo((function  () {
                    var g0351d1f5864066f3a52a042545e3315712 = current;
                      return (function  () {
                        current = g0351d1f5864066f3a52a042545e3315712;
                      });
                  })());
                  return current = current.next;
              })();
              }
            return JSConTest.tests.getVar("c_13").assertReturn(result);
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
  var toString = (function  () {
      function toString_own ()  {
            JSConTest.tests.setVar("c_16", JSConTest.tests.assertParams(["c_15"], arguments, toString_own, "toString"));
            return JSConTest.tests.getVar("c_16").assertReturn(trans.mCall(trans.mCall(this, "toArray", []), "toString", []));
          };
        (function  () {
          function toString () /* with lv: */ {
                return this.toArray().toString();
              };
            JSConTest.tests.overrideToStringOfFunction(toString_own, toString);
        })();
        return toString_own;
    })();
  (function  () {
    var g0351d1f5864066f3a52a042545e331570 = JSConTest.contracts.Function([], JSConTest.contracts.Top, []);
      JSConTest.tests.add("LinkedList", LinkedList, g0351d1f5864066f3a52a042545e331570, 1000. );
      JSConTest.tests.setVar("c_1", g0351d1f5864066f3a52a042545e331570);
  })();
  (function  () {
    var g0351d1f5864066f3a52a042545e331577 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}]), [], JSConTest.contracts.Integer, []);
      JSConTest.tests.add("size", size, g0351d1f5864066f3a52a042545e331577, 1000. );
      JSConTest.tests.setVar("c_8", g0351d1f5864066f3a52a042545e331577);
  })();
  (function  () {
    var g0351d1f5864066f3a52a042545e3315710 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), []);
      JSConTest.tests.add("toArray", toArray, g0351d1f5864066f3a52a042545e3315710, 1000. );
      JSConTest.tests.setVar("c_11", g0351d1f5864066f3a52a042545e3315710);
  })();
  (function  () {
    var g0351d1f5864066f3a52a042545e3315714 = JSConTest.contracts.Method(JSConTest.contracts.EObject([]), [], JSConTest.contracts.String, []);
      JSConTest.tests.add("toString", toString, g0351d1f5864066f3a52a042545e3315714, 1000. );
      JSConTest.tests.setVar("c_15", g0351d1f5864066f3a52a042545e3315714);
  })();
  LinkedList.prototype = {constructor : LinkedList, size : size, toArray : toArray, toString : toString};