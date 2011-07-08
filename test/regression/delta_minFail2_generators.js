var c =
     (function () {
        function gen() {             
               return new BinaryConstraint(new Variable);    
        }
        function test(x) {
            return (x instanceof BinaryConstraint);  
        }
        return new JSConTest.contracts.SContract(test,gen,"Constraint");
     })();

var s =
     (function () {
        function gen() {
            return 5;
        }
        function test(x) {
            return (x === 5);
        }
        return new JSConTest.contracts.SContract(test,gen,"Strength.Required");
     })();