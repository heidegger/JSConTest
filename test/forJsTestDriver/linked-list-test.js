var LinkedList = (function  () {
      function LinkedList_own ()  {
            JSConTest.tests.setVar("c_2", JSConTest.tests.assertParams(["c_1"], arguments, LinkedList_own, "LinkedList"));
            this._length = 0. ;
            this._head = null;
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
            JSConTest.tests.setVar("c_5", JSConTest.tests.assertParams(["c_4"], arguments, size_own, "size"));
            return JSConTest.tests.getVar("c_5").assertReturn(this._length);
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
            JSConTest.tests.setVar("c_8", JSConTest.tests.assertParams(["c_7"], arguments, toArray_own, "toArray"));
            var result = [],
                current = this._head;
            while (current) {
                result.push(current.data);
                current = current.next;
              }
            return JSConTest.tests.getVar("c_8").assertReturn(result);
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
            JSConTest.tests.setVar("c_12", JSConTest.tests.assertParams(["c_11"], arguments, toString_own, "toString"));
            return JSConTest.tests.getVar("c_12").assertReturn(this.toArray().toString());
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
    var g6819aaf9022347d7ed9a5885ce9feb440 = JSConTest.contracts.Function([], JSConTest.contracts.Top, []);
      JSConTest.tests.add("LinkedList", LinkedList, g6819aaf9022347d7ed9a5885ce9feb440, 1000. );
      JSConTest.tests.setVar("c_1", g6819aaf9022347d7ed9a5885ce9feb440);
  })();
  (function  () {
    var g6819aaf9022347d7ed9a5885ce9feb443 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_length", contract : JSConTest.contracts.Integer}]), [], JSConTest.contracts.Integer, []);
      JSConTest.tests.add("size", size, g6819aaf9022347d7ed9a5885ce9feb443, 1000. );
      JSConTest.tests.setVar("c_4", g6819aaf9022347d7ed9a5885ce9feb443);
  })();
  (function  () {
    var g6819aaf9022347d7ed9a5885ce9feb446 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), []);
      JSConTest.tests.add("toArray", toArray, g6819aaf9022347d7ed9a5885ce9feb446, 1000. );
      JSConTest.tests.setVar("c_7", g6819aaf9022347d7ed9a5885ce9feb446);
  })();
  (function  () {

var g6819aaf9022347d7ed9a5885ce9feb449 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "_head", contract : JSConTest.contracts.EObject([])}]), [], JSConTest.contracts.Array(JSConTest.contracts.Top), []);
    var g6819aaf9022347d7ed9a5885ce9feb4410 = JSConTest.contracts.Method(JSConTest.contracts.EObject([{name : "toArray", contract : g6819aaf9022347d7ed9a5885ce9feb449}]), [], JSConTest.contracts.String, []);
      
      JSConTest.tests.add("toString", toString, g6819aaf9022347d7ed9a5885ce9feb4410, 1000. );
      JSConTest.tests.setVar("c_11", g6819aaf9022347d7ed9a5885ce9feb4410);
  })();
  LinkedList.prototype = {constructor : LinkedList, size : size, toArray : toArray, toString : toString};
