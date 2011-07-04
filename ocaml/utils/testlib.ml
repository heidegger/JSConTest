open AST
open ASTUtil

type varname = string
    
let var_name_to_string_exp vn = s_to_e vn
let var_name_to_identifier vn = s_to_i vn  
let gen_lib_var_name : unit -> string = gen_var_name "c_"
let gen_fun_var_name : string -> string = 
	fun f -> gen_var_name ("f_" ^ f) ()

  
let set_var : 'c expression -> varname -> 'c expression -> 'c expression =
  fun test_prefix var e ->
    do_mcalle_el 
    	test_prefix
        "setVar" 
        [c_to_e (s_to_c var);e]
      
let get_var : 'c expression -> string -> 'c expression =
  fun test_prefix var ->
    do_mcalle_el test_prefix "getVar" [c_to_e (s_to_c var)]
