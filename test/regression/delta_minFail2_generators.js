var c =
     (function () {
        function gen() {             
               return new BinaryConstraint(new Variable);    
        }
        function test(x) {
            return (x instanceof Constraint);  
        }
        return new JSConTest.contracts.SContract(test,gen,"Constraint");
     })();

var s =
     (function () {
        function gen() {
            return Strength.REQUIRED;
        }
        function test(x) {
            return (x === Strength.REQUIRED);  
        }
        return new JSConTest.contracts.SContract(test,gen,"Strength.Required");
     })();
var StrengthClass = JSConTest.contracts.SContract(function (x) { return x === Strength }, 
						  function () { return Strength },
						  "StrengthClass");
