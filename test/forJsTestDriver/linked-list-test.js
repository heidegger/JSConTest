var LinkedList = (function  () {
      function LinkedList_own ()  {
            JSConTest.tests.setVar("c_2", JSConTest.tests.assertParams(["c_1"], arguments, LinkedList_own, "LinkedList"));
            JSConTest.effects.propAss(this, "_length", 0. );
            JSConTest.effects.propAss(this, "_head", null);
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
  var remove = (function  () {
      function remove_own (index)  {
            JSConTest.tests.setVar("c_5", JSConTest.tests.assertParams(["c_4"], arguments, remove_own, "remove"));
            var index = arguments[0. ];
            if (((JSConTest.effects.unbox(index) > 1. ) && (JSConTest.effects.unbox(index) < JSConTest.effects.unbox(JSConTest.effects.propAcc(this, "_length"))))) {
                var current = JSConTest.effects.box("current", JSConTest.effects.propAcc(this, "_head")),
                  previous,
                  i = 0. ;
                if ((JSConTest.effects.unbox(index) === 0. )) {
                  JSConTest.effects.propAss(this, "_head", JSConTest.effects.propAcc(current, "next"));
                }
                else {
                  while ((JSConTest.effects.unbox(index) > JSConTest.effects.unbox(i++ ))) {
                    previous = current;
                    current = JSConTest.effects.propAcc(current, "next");
                  }
                  JSConTest.effects.propAss(previous, "next", JSConTest.effects.propAcc(current, "next"));
                };
                JSConTest.effects.unOp("-- ", this, "_length");
                return JSConTest.tests.getVar("c_5").assertReturn(JSConTest.effects.propAcc(current, "data"));
              }
              else {
                return JSConTest.tests.getVar("c_5").assertReturn(null);
              };
          };
        (function  () {
          function remove (index) /* with lv: current,previous,i*/ {
                if (((index >  -1. ) && (index < this._length))) {
                    var current = this._head,
                      previous,
                      i = 0. ;
                    if ((index === 0. )) {
                      this._head = current.next;
                    }
                    else {
                      while ((index > i++ )) {
                        previous = current;
                        current = current.next;
                      }
                      previous.next = current.next;
                    };
                    this._length-- ;
                    return current.data;
                  }
                  else {
                    return null;
                  };
              };
            JSConTest.tests.overrideToStringOfFunction(remove_own, remove);
        })();
        return remove_own;
    })();
  var size = (function  () {
      function size_own ()  {
            JSConTest.tests.setVar("c_8", JSConTest.tests.assertParams(["c_7"], arguments, size_own, "size"));
            return JSConTest.tests.getVar("c_8").assertReturn(JSConTest.effects.propAcc(this, "_length"));
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
            JSConTest.tests.setVar("c_11", JSConTest.tests.assertParams(["c_10"], arguments, toArray_own, "toArray"));
            var result = JSConTest.effects.box("result", []),
                current = JSConTest.effects.box("current", JSConTest.effects.propAcc(this, "_head"));
            while (current) {
                JSConTest.effects.mCall(result, "push", [JSConTest.effects.propAcc(current, "data")]);
                current = JSConTest.effects.propAcc(current, "next");
              }
            return JSConTest.tests.getVar("c_11").assertReturn(result);
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
            JSConTest.tests.setVar("c_15", JSConTest.tests.assertParams(["c_14"], arguments, toString_own, "toString"));
            return JSConTest.tests.getVar("c_15").assertReturn(JSConTest.effects.mCall(JSConTest.effects.mCall(this, "toArray", []), "toString", []));
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
    var ga092b4d174279154970ebda754f729160 = JSConTest.contracts.Function([], JSConTest.contracts.Top, [], "LinkedList");
      JSConTest.tests.add("LinkedList", LinkedList, ga092b4d174279154970ebda754f729160, 1000. );
      JSConTest.tests.setVar("c_1", ga092b4d174279154970ebda754f729160);
  })();
  (function  () {
    var ga092b4d174279154970ebda754f729163 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}, {name : "_head", contract : JSConTest.contracts.EObject([])}]), [JSConTest.contracts.Integer], JSConTest.contracts.Top, [], "remove");
      JSConTest.tests.add("remove", remove, ga092b4d174279154970ebda754f729163, 1000. );
      JSConTest.tests.setVar("c_4", ga092b4d174279154970ebda754f729163);
  })();
  (function  () {
    var ga092b4d174279154970ebda754f729166 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}]), [], JSConTest.contracts.Integer, [{type : 7. , effect : {type : 3. , property : "_length", effect : {type : 8. , fname : "size"}}}], "size");
      JSConTest.tests.add("size", size, ga092b4d174279154970ebda754f729166, 1000. );
      JSConTest.tests.setVar("c_7", ga092b4d174279154970ebda754f729166);
  })();
  (function  () {
    var ga092b4d174279154970ebda754f729169 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), [{type : 7. , effect : {type : 5. , effect : {type : 8. , fname : "toArray"}}}], "toArray");
      JSConTest.tests.add("toArray", toArray, ga092b4d174279154970ebda754f729169, 1000. );
      JSConTest.tests.setVar("c_10", ga092b4d174279154970ebda754f729169);
  })();
  (function  () {
    var ga092b4d174279154970ebda754f7291612 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), [], "toString");
      var ga092b4d174279154970ebda754f7291613 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "toArray", contract : ga092b4d174279154970ebda754f7291612}]), [], JSConTest.contracts.String, [{type : 7. , effect : {type : 5. , effect : {type : 8. , fname : "toString"}}}], "toString");
      JSConTest.tests.add("toString", toString, ga092b4d174279154970ebda754f7291613, 1000. );
      JSConTest.tests.setVar("c_14", ga092b4d174279154970ebda754f7291613);
  })();
  LinkedList.prototype = {constructor : LinkedList, size : size, toArray : toArray, toString : toString};