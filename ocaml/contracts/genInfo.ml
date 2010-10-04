type t = {
  mutable tests: bool;
  mutable asserts: bool;
  mutable testnr: int;
  mutable effects : bool;
}
    
    
let create () = 
  { tests = true; 
    asserts = true; 
    testnr = Etc.get_test_count (); 
    effects = false;
  }

let noAsserts t = t.asserts <- false
let noTests t = t.tests <- false
let setTestNumber t nr = 
  if nr > 0 then t.testnr <- nr
let setTestNumberAllowZero t nr = t.testnr <- nr
let setEffects t e = t.effects <- e

let getAsserts t = t.asserts
let getTests t = t.tests
let getTestNumber t = if (t.tests) then t.testnr else 0
let getEffects t = t.effects

let string_of t =
  let s1 = if t.asserts then "" else " ~noAsserts" in
  let s2 = if t.tests then "" else " ~noTests" in
  let s3 = 
    if ((t.testnr != Etc.get_test_count ()) && t.tests)
    then "#Tests:"^(string_of_int t.testnr) 
    else "" 
  in
    s1 ^ s2 ^ s3
      

module Test = struct
  open ProglangUtils
  open Test    


  let init () =
    let test1 () =
      let t1 = create () in
      let t2 = create () in
      let _ = noAsserts t1 in
      let _ = noTests t2 in
      let _ = setTestNumber t1 100 in
        assert_bool
          "t1 should be false by asserts"
          (not (getAsserts t1));
        assert_bool 
          "t1 should be true by tests" 
          (getTests t1);
        assert_bool
          "should be true by asserts"
          (getAsserts t2);
        assert_bool 
          "t2 should be false by tests"
          (not (getTests t2));
        assert_equal
          ~msg:"t1 should have 100 test cases"
          ~printer:(string_of_int)
          100
          (getTestNumber t1)
    in
        
      ["",test1]

  let _ = 
    install_tests
      "GenInfo"
      init

end
