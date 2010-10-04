var z = 111;
var t=3;

/** ~effects */
function test() {
  var localz = 56;
 
  
  alert("t="+ t++);
  
  localz = 89;
 
 
  
  // test code
  var ul = document.getElementById("#nav");
  var fn = document.getElementById("#fn");
  var sn = document.getElementById("#sn");


  var o = {};
  o.x = 5;
  o.x *= 7;
  
  z = 6;
  o["x"] = 8; 
  delete o["x"];

  //    doPropAssignment : object * property name * value * operator_lambda
  // or doPropAssignment : object * property name * value
  
  // simple property assignment: 
     sn.textContent = "the only item";
  // transformed code
  //  TRANS.doPropAssignment(sn,"textContent","the only Item");
  
  // simple method call rewrite:
  
     var rC = ul["removeChild"];
     rC.apply(ul,[fn]);
     
     //ul.removeChild(fn);


  
  // transformed code:
  //TRANS.doMethodCall(ul,"removeChild",[fn]);


  //alert("start revert");
  //TRANS.revert();
}
