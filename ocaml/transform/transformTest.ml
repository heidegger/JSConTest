module Test = struct
  let p1 = 
"while (i++ < 1) { 
  true; 
}"

  let p2 = 
"/*c int -> int */
function f(x) {  
  return {}; 
}"

  let p3 =
"/*c int -> int */
function f(x) {
  f(x.a);
}"

  open Etc
  open AST
  open Annotation
  open ProglangUtils
  open ExtList
  open Contract
  open BaseContract
  open Test    
  open JSParseInterface
  open Helper
  module H = Helper.Make(struct let print_endline _ = () end)
  open H

  let init () =
    let get_prog s = 
      JSParseInterface.parse_program_str 
	s
	(Regular Ulexing.Utf8) 
    in
    let na = null_annotation in
    
    let t1 () = 
      let p = get_prog p1 in
      let p,np = parse_c p in
      let tp = gen_js_of_c_effects np in
      let _ = 
	assert_equal
	  (string_of_program np)
	  (string_of_program 
	     (Program 
		(na, 
		 [Statement 
		     (na,
		      While (na,
			     Binop (na, 
				    Unop (na, 
					  Variable (na, Identifier (na, "i")), 
					  Incr_postfix na),
				 Less na,
				    Constant (na, Number (na, 1.))),
			     Block (na, [Expression (na,Constant (na,True na))])
		      )
		     )])))
      in
      ()	
    in
    
    let t2 () = 
      let p = get_prog p2 in
      let p,np = parse_c p in
      let tp = gen_js_of_c_effects np in 
      ()
    in
    let t3 () = 
      let p = get_prog p3 in
      let p,np = parse_c p in
      let tp = gen_js_of_c_effects np in
      let s = "
var f = JSConTest.tests.addContracts(\"f_f7\", JSConTest.tests.setVar(\"f_f7\", JSConTest.tests.overrideToStringOfFunction(JSConTest.tests.enableAsserts(JSConTest.effects.enableWrapper((function  (x) {
      JSConTest.effects.fCall(f, [JSConTest.effects.propAcc(x, \"a\")]);
    }), [\"x\"]), [\"c_8\"], \"f_f7\"), (function f (x) {
      f(x.a);
    }), true)), [{contract : JSConTest.tests.setVar(\"c_8\", JSConTest.contracts.Function([JSConTest.contracts.Integer], JSConTest.contracts.Integer, {pos : [], neg : [], fname : \"f_f7\"}, \"f_f7\")), count : 1000. }], []);"
      in
      assert_equal 
	~printer:(fun s -> s)
	(AST.string_of_ast (fun _ -> "") tp)
	s
    in

    ["while (i++ < 1) { true; }", t1;
     "", t2;
     "", t3]
	
  let _ = 
    install_tests
      "Tranformation Test"
      init



end
