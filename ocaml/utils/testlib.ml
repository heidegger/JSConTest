open AST
open ASTUtil

type varname = string
    
let get_var_name vn = s_to_e vn
  
let gen_lib_var_name : unit -> string = gen_var_name "c_"
  
let set_var : 'c expression -> varname -> 'c expression -> 'c source_element =
  fun test_prefix var e ->
    g_se_s (g_s_e (do_mcalle_el 
                     test_prefix
                     "setVar" 
                     [c_to_e (s_to_c var);e]))
      
let get_var : 'c expression -> string -> 'c expression =
  fun test_prefix var ->
    do_mcalle_el test_prefix "getVar" [c_to_e (s_to_c var)]
