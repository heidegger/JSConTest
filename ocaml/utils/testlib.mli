open AST

type varname
val get_var_name : varname -> 'a expression
val gen_lib_var_name : unit -> varname
val set_var : 'a identifier -> varname -> 'a expression -> 'a source_element
val get_var : 'a identifier -> varname -> 'a expression    
