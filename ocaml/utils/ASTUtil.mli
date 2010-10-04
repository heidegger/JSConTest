(** Modul that contains some simple to use shortcuts, that
    allows to generate ASTs of JavaScript Code.

    @author: Phillip Heidegger 
*)

val extend_i : 'a AST.identifier -> string -> 'a AST.identifier option
(* val gen_new_var : unit -> 'a AST.identifier *)
val s_to_i : string -> 'a AST.identifier
val s_to_c : string -> AST.constant
val n_to_c : float -> AST.constant
val b_to_c : bool -> AST.constant

val i_to_s : 'a AST.identifier -> string
val c_to_e : AST.constant -> 'a AST.expression
val i_to_e : 'a AST.identifier -> 'a AST.expression
val s_to_e : string -> 'a AST.expression
val s_to_vare : string -> 'a AST.expression
val g_se_s : 'a AST.statement -> 'a AST.source_element
val g_s_e : 'a AST.expression -> 'a AST.statement
val g_e_sel : 'a AST.source_element list -> 'a AST.expression
val g_fun_xs_sel : 'a AST.identifier list -> 'a AST.source_element list -> 'a AST.expression
val float_to_exp : float -> 'a AST.expression
val int_to_exp : int -> 'a AST.expression
val gen_run_anonym_fun : 'a AST.source_element list -> 'a AST.source_element
val set_jsvar :
  'a AST.identifier -> 'a AST.expression -> 'a AST.statement

val new_array : 'a AST.expression list -> 'a AST.expression

val read_prop : 'a AST.identifier -> string -> 'a AST.expression
val do_mcall_el :
  'a AST.identifier -> string -> 'a AST.expression list -> 'a AST.expression
val do_mcalle_el :
  'a AST.expression -> string -> 'a AST.expression list -> 'a AST.expression

val do_mcall :
  'a AST.identifier -> string -> 'a AST.identifier list -> 'a AST.expression
val do_fcall :
  'a AST.identifier -> 'a AST.expression list -> 'a AST.expression
val g_return : 'a AST.expression -> 'a AST.source_element
val sel_to_p : 'a AST.source_element list -> 'a AST.program

val new_object : (string * 'a AST.expression) list -> 'a AST.expression




val gen_var_name : string -> unit -> string
val gen_new_var : string -> 'a AST.identifier
val new_var : string -> 'a AST.expression -> 'a AST.identifier * 'a AST.source_element list
val init_var : string -> 'a AST.expression -> 'a AST.source_element


val undef_e : 'a AST.expression
