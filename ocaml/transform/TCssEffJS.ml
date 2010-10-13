open Csseff

let pARAMETER_TYPE = 1
let vAR_TYPE = 2
let pROP_TYPE = 3
let qUESTION = 4
let sTAR_TYPE = 5
let aLL = 6
let nOPROP_TYPE = 7
let tHIS_TYPE = 8
      
let js_of_effect fname = 
  let rec js_of_effect = function
    | Parameter i ->
        ASTUtil.new_object 
          [("type", ASTUtil.int_to_exp pARAMETER_TYPE); 
           ("number", ASTUtil.int_to_exp i);
           ("fname", ASTUtil.c_to_e (ASTUtil.s_to_c fname));
          ]
    | This -> 
          ASTUtil.new_object
            [("type", ASTUtil.int_to_exp tHIS_TYPE);
             ("fname", ASTUtil.c_to_e (ASTUtil.s_to_c fname))
            ]
    | Var s ->
        ASTUtil.new_object
          [("type", ASTUtil.int_to_exp vAR_TYPE);
           ("fname", ASTUtil.c_to_e (ASTUtil.s_to_c fname));
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
  in
    js_of_effect

let js_of_t fname t = 
  match (Csseff.map 
           (js_of_effect fname) 
           (fun () -> ASTUtil.new_object ["type", ASTUtil.int_to_exp aLL])
           t) with
    | Left el -> 
        ASTUtil.new_array el
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
      let te = js_of_t "f" t in
      let te_exp = ASTUtil.new_array 
        [ASTUtil.new_object 
           ["type",ASTUtil.int_to_exp 1;
            "number", ASTUtil.int_to_exp 1;
            "fname", ASTUtil.s_to_e "f"]]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in
    let t3 () = 
      let t = Csseff.create_effect_list [Prop (Parameter 1,"a")] in
      let te = js_of_t "f" t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", ASTUtil.s_to_e "f"]
      in
      let te_exp = ASTUtil.new_array 
        [ASTUtil.new_object
           ["type", ASTUtil.int_to_exp 3;
            "property", ASTUtil.s_to_e "a";
            "effect", base_exp
           ]]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in
    let t4 () = 
      let t = Csseff.create_effect_list [Star (Parameter 1)] in
      let te = js_of_t "g" t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", ASTUtil.s_to_e "g"]
      in
      let te_exp = ASTUtil.new_array 
        [ASTUtil.new_object
           ["type", ASTUtil.int_to_exp 5;
            "effect", base_exp
           ]]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in

    let t5 () = 
      let t = Csseff.create_effect_list 
        [Prop (Question (Parameter 1), "cde")] in
      let te = js_of_t "h" t in
      let base_exp = 
        ASTUtil.new_object 
          ["type",ASTUtil.int_to_exp 1;
           "number", ASTUtil.int_to_exp 1;
           "fname", ASTUtil.s_to_e "h"]
      in
      let te_exp = ASTUtil.new_array 
        [ASTUtil.new_object
           ["type", ASTUtil.int_to_exp 3;
            "property", ASTUtil.s_to_e "cde";
            ("effect", 
             ASTUtil.new_object
               ["type", ASTUtil.int_to_exp 4;
                "effect", base_exp])
           ]]
      in
        assert_equal
          ~printer:(AST.string_of_expression (fun () -> ""))
          te_exp
          te
    in

    let t6 () =
      let t = Csseff.create_all () in
      let te = js_of_t "h" t in
      let te_exp = ASTUtil.new_object 
        ["type", ASTUtil.int_to_exp 6] 
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
