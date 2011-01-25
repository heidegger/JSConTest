open AST

type varname
val var_name_to_string_exp : varname -> 'a expression
val gen_lib_var_name : unit -> varname
val gen_fun_var_name : string -> varname

val set_var : 'a expression -> varname -> 'a expression -> 'a expression
val get_var : 'a expression -> varname -> 'a expression    



