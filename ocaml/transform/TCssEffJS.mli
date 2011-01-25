(** Module that transforms CssEffects into JavaScript *)

(** Complies an Css effect into a JavaScript expression *)
val js_of_t : Testlib.varname -> Csseff.t -> 'a AST.expression
