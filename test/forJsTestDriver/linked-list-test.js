var LinkedList = (function  () {
      function LinkedList_own ()  {
            JSConTest.tests.setVar("c_2", JSConTest.tests.assertParams(["c_1"], arguments, LinkedList_own, "LinkedList"));
            if (JSConTest.effects.isBox(this)) {
                JSConTest.effects.propAss(this, "_length", 0. );
                JSConTest.effects.propAss(this, "_head", null);
              }
              else return JSConTest.tests.getVar("c_2").assertReturn(LinkedList_own.apply(JSConTest.effects.box_this(this), arguments));;
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
  var add = (function  () {
      function add_own (data)  {
            JSConTest.tests.setVar("c_5", JSConTest.tests.assertParams(["c_4"], arguments, add_own, "add"));
            if (JSConTest.effects.isBox(this)) {
                var data = JSConTest.effects.box_param(1. , arguments[0. ]);
                var node = JSConTest.effects.box("node", {data : JSConTest.effects.unbox(data), next : null}),
                  current;
                if ((JSConTest.effects.unbox(JSConTest.effects.propAcc(this, "_head")) === null)) {
                  JSConTest.effects.propAss(this, "_head", node);
                }
                else {
                  current = JSConTest.effects.propAcc(this, "_head");
                  while (JSConTest.effects.propAcc(current, "next")) {
                    current = JSConTest.effects.propAcc(current, "next");
                  }
                  JSConTest.effects.propAss(current, "next", node);
                };
                JSConTest.effects.unOp("++ ", this, "_length");
              }
              else return JSConTest.tests.getVar("c_5").assertReturn(add_own.apply(JSConTest.effects.box_this(this), arguments));;
          };
        (function  () {
          function add (data) /* with lv: node,current*/ {
                var node = {data : data, next : null},
                    current;
                if ((this._head === null)) {
                    this._head = node;
                  }
                  else {
                    current = this._head;
                    while (current.next) {
                      current = current.next;
                    }
                    current.next = node;
                  };
                this._length++ ;
              };
            JSConTest.tests.overrideToStringOfFunction(add_own, add);
        })();
        return add_own;
    })();
  var size = (function  () {
      function size_own ()  {
            JSConTest.tests.setVar("c_8", JSConTest.tests.assertParams(["c_7"], arguments, size_own, "size"));
            if (JSConTest.effects.isBox(this)) {
                return JSConTest.tests.getVar("c_8").assertReturn(JSConTest.effects.unbox(JSConTest.effects.propAcc(this, "_length")));
              }
              else return JSConTest.tests.getVar("c_8").assertReturn(size_own.apply(JSConTest.effects.box_this(this), arguments));;
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
  var toString = (function  () {
      function toString_own ()  {
            JSConTest.tests.setVar("c_15", JSConTest.tests.assertParams(["c_14"], arguments, toString_own, "toString"));
            if (JSConTest.effects.isBox(this)) {
                return JSConTest.tests.getVar("c_15").assertReturn(JSConTest.effects.unbox(JSConTest.effects.mCall(JSConTest.effects.mCall(this, "toArray", []), "toString", [])));
              }
              else return JSConTest.tests.getVar("c_15").assertReturn(toString_own.apply(JSConTest.effects.box_this(this), arguments));;
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
    var gcd3a176cfa0b5f3a5e6e4df18d73ba790 = JSConTest.contracts.Function([], JSConTest.contracts.Top, [], "LinkedList");
      JSConTest.tests.add("LinkedList", LinkedList, gcd3a176cfa0b5f3a5e6e4df18d73ba790, 1000. );
      JSConTest.tests.setVar("c_1", gcd3a176cfa0b5f3a5e6e4df18d73ba790);
  })();
  (function  () {
    var gcd3a176cfa0b5f3a5e6e4df18d73ba793 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}, {name : "_head", contract : JSConTest.contracts.EObject([])}]), [JSConTest.contracts.Integer], JSConTest.contracts.Undefined, [], "add");
      JSConTest.tests.add("add", add, gcd3a176cfa0b5f3a5e6e4df18d73ba793, 1000. );
      JSConTest.tests.setVar("c_4", gcd3a176cfa0b5f3a5e6e4df18d73ba793);
  })();
  (function  () {
    var gcd3a176cfa0b5f3a5e6e4df18d73ba796 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}]), [], JSConTest.contracts.Integer, [], "size");
      JSConTest.tests.add("size", size, gcd3a176cfa0b5f3a5e6e4df18d73ba796, 1000. );
      JSConTest.tests.setVar("c_7", gcd3a176cfa0b5f3a5e6e4df18d73ba796);
  })();
  (function  () {
    var gcd3a176cfa0b5f3a5e6e4df18d73ba799 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), [{type : 7. , effect : {type : 5. , effect : {type : 2. , name : "this", fname : "toArray"}}}], "toArray");
      JSConTest.tests.add("toArray", toArray, gcd3a176cfa0b5f3a5e6e4df18d73ba799, 1000. );
      JSConTest.tests.setVar("c_10", gcd3a176cfa0b5f3a5e6e4df18d73ba799);
  })();
  (function  () {
    var gcd3a176cfa0b5f3a5e6e4df18d73ba7912 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), [], "toString");
      var gcd3a176cfa0b5f3a5e6e4df18d73ba7913 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "toArray", contract : gcd3a176cfa0b5f3a5e6e4df18d73ba7912}]), [], JSConTest.contracts.String, [], "toString");
      JSConTest.tests.add("toString", toString, gcd3a176cfa0b5f3a5e6e4df18d73ba7913, 1000. );
      JSConTest.tests.setVar("c_14", gcd3a176cfa0b5f3a5e6e4df18d73ba7913);
  })();
  LinkedList.prototype = {constructor : LinkedList, add : add, size : size, toArray : toArray, toString : toString};