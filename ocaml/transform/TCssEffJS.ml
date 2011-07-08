open Csseff

let pARAMETER_TYPE = 1
let vAR_TYPE = 2
let pROP_TYPE = 3
let qUESTION = 4
let sTAR_TYPE = 5
let aLL = 6
let nOPROP_TYPE = 7
let rEGEXPROP = 8
let rEGEXVAR = 9
let rEGEXMETA = 11
let rMETAREGEX = 12
let rMETAJS = 13

let js_of_effect fname = 
  let rec js_of_effect = function
    | Parameter i ->
        ASTUtil.new_object 
          [("type", ASTUtil.int_to_exp pARAMETER_TYPE); 
           ("number", ASTUtil.int_to_exp i);
           ("fname", Testlib.var_name_to_string_exp fname);
          ]
    | This -> 
          ASTUtil.new_object
            [("type", ASTUtil.int_to_exp vAR_TYPE);
             ("name", ASTUtil.c_to_e (ASTUtil.s_to_c "this"));
             ("fname", Testlib.var_name_to_string_exp fname)
            ]
    | Var s ->
        ASTUtil.new_object
          [("type", ASTUtil.int_to_exp vAR_TYPE);
           ("name", ASTUtil.c_to_e (ASTUtil.s_to_c s));
           ("fname", Testlib.var_name_to_string_exp fname);
          ]
    | Prop (e,s) -> 
        ASTUtil.new_object
          [("type", ASTUtil.int_to_exp pROP_TYPE);
           ("property", ASTUtil.s_to_e s);
           ("effect",js_of_effect e)]
    | Question e ->
        ASTUtil.new_object
          ["type",ASTUtil.int_to_exp qUESTION;
           "effect",js_of_effect e]
    | Star e ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp sTAR_TYPE;
           "effect",js_of_effect e
          ]
    | NoProp e ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp nOPROP_TYPE;
           "effect",js_of_effect e
          ]
    | RegExProp (e,s) ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp rEGEXPROP;
           "effect", js_of_effect e;
           "regEx", ASTUtil.i_to_e (ASTUtil.s_to_i s)]
    | RegExVar s ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp rEGEXVAR;
           "regEx", ASTUtil.i_to_e (ASTUtil.s_to_i s)]
    | StarProp (e,s) ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp rEGEXMETA;
           "effect", js_of_effect e;
           "property", ASTUtil.i_to_e (ASTUtil.s_to_i s)]
    | StarRegExProp (e,s) ->
        ASTUtil.new_object
          ["type", ASTUtil.int_to_exp rEGEXMETA;
           "effect", js_of_effect e;
           "regex", ASTUtil.i_to_e (ASTUtil.s_to_i s)]
    | Js s -> 
       ASTUtil.new_object
          ["type",ASTUtil.int_to_exp rMETAJS;
           "f",ASTUtil.i_to_e (ASTUtil.s_to_i s)]
    | RegEx s -> 
       ASTUtil.new_object
          ["type",ASTUtil.int_to_exp rMETAREGEX;
           "regEx",ASTUtil.c_to_e (ASTUtil.s_to_c s)]
  in
    js_of_effect

let js_of_t fname t = 
  match (Csseff.map 
           (js_of_effect fname)
	   (js_of_effect fname) 
           (fun () -> ASTUtil.new_object ["type", ASTUtil.int_to_exp aLL; "fname", Testlib.var_name_to_string_exp fname])
           t) with
    | Left (pl,nl) -> 
	ASTUtil.new_object 
		["pos",ASTUtil.new_array pl;
		 "neg",ASTUtil.new_array nl;
		 "fname",  Testlib.var_name_to_string_exp fname]      
    | Right e -> e
        

module Test = struct
  let pARAMETER_TYPE = false
  let vAR_TYPE = false
  let pROP_TYPE = false
  let qUESTION = false
  let sTAR_TYPE = false
  let aLL = false

  open ProglangUtils
  open Test

  let init () =
    let t2 () = 
      let t = Csseff.create_effect_list [Parameter 1] in
      let fname = Testlib.gen_fun_var_name "f" in
      let te = js_of_t fname t in
      let te_exp = 
	ASTUtil.new_object
		["pos", ASTUtil.new_array 
	          [ASTUtil.new_object 
        	    ["type",ASTUtil.int_to_exp 1;
        	     "number", ASTUtil.int_to_exp 1;
	             "fname", Testlib.var_name_to_string_exp fname]];
		 "neg",ASTUtil.new_array [];
		 "fname", Testlib.var_name_to_string_exp fname]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in
    let t3 () = 
      let t = Csseff.create_effect_list [Prop (Parameter 1,"a")] in
      let fname = Testlib.gen_fun_var_name "f" in
      let te = js_of_t fname t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", Testlib.var_name_to_string_exp fname]
      in
      let te_exp = 
	ASTUtil.new_object
		["pos", ASTUtil.new_array 
		        [ASTUtil.new_object
		           ["type", ASTUtil.int_to_exp 3;
	        	    "property", ASTUtil.s_to_e "a";
		            "effect", base_exp
		           ]];
		"neg", ASTUtil.new_array [];
		"fname", Testlib.var_name_to_string_exp fname]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in
    let t4 () = 
      let t = Csseff.create_effect_list [Star (Parameter 1)] in
      let fname = Testlib.gen_fun_var_name "h" in
      let te = js_of_t fname t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", Testlib.var_name_to_string_exp fname]
      in
      let te_exp = 
	ASTUtil.new_object
		["pos", ASTUtil.new_array 
		        [ASTUtil.new_object
		           ["type", ASTUtil.int_to_exp 5;
		            "effect", base_exp
		           ]];
		"neg", ASTUtil.new_array [];
		"fname", Testlib.var_name_to_string_exp fname]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in

    let t5 () = 
      let t = Csseff.create_effect_list 
        [Prop (Question (Parameter 1), "cde")] 
      in
      let fname = Testlib.gen_fun_var_name "h" in
      let te = js_of_t fname t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", Testlib.var_name_to_string_exp fname]
      in
      let te_exp = 
	ASTUtil.new_object
		["pos", ASTUtil.new_array 
		        [ASTUtil.new_object
		           ["type", ASTUtil.int_to_exp 3;
		            "property", ASTUtil.s_to_e "cde";
		            ("effect", 
		             ASTUtil.new_object
		               ["type", ASTUtil.int_to_exp 4;
		                "effect", base_exp])
		           ]];
		"neg", ASTUtil.new_array [];
		"fname", Testlib.var_name_to_string_exp fname]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in

    let t6 () =
      let t = Csseff.create_all () in
      let fname = Testlib.gen_fun_var_name "h" in
      let te = js_of_t fname t in
      let te_exp = ASTUtil.new_object 
        ["type", ASTUtil.int_to_exp 6;
	"fname",  Testlib.var_name_to_string_exp fname] 
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in

      ["param: $1 test",t2;
       "prop and param test: $1.a ",t3;
       "param and * test: $1.*",t4;
       "two prop test: $1.prop.cde",t5;
       "all test: *",t6;
    ]

  let _ = 
    install_tests
      "Css effect transformation  tests"
      init

end
