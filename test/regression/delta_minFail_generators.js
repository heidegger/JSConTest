var c =
     (function () {
        function gen() {             
                     return new Constraint();
        }
        function test(x) {
            return (x instanceof Constraint);  
        }
        return new JSConTest.contracts.SContract(test,gen,"Constraint");
     })();
   

